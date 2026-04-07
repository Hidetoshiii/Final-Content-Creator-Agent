/**
 * claudeService.js — Wrapper de la Claude API (Anthropic SDK).
 *
 * Implementa las 3 llamadas del pipeline:
 *   1. analyzeNews   → Agente 1 (Haiku)  — Curador de noticias
 *   2. generatePost  → Agente 2 (Sonnet) — Redactor de posts (con Web Search)
 *   3. analyzeAndImprove → Agente 3 (Sonnet) — Analizador de engagement
 *
 * Diseño:
 *   - Las API keys llegan como parámetro (nunca hardcodeadas)
 *   - Todas las respuestas se parsean como JSON con jsonParser
 *   - Los errores se tipan con ClaudeServiceError para manejo granular en la UI
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  AGENT_1_CURATOR_PROMPT,
  AGENT_2_WRITER_PROMPT,
  AGENT_3_ANALYZER_PROMPT,
} from '@/config/prompts'
import {
  CLAUDE_MODELS,
  MAX_TOKENS,
  HISTORY_CONTEXT_LIMIT,
} from '@/config/constants'
import { parseClaudeResponse, ClaudeParseError } from '@/utils/jsonParser'

// ─── Tipos de error tipados ───────────────────────────────────────────────────

export class ClaudeServiceError extends Error {
  /**
   * @param {string} type
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(type, message, details) {
    super(message)
    this.name    = 'ClaudeServiceError'
    this.type    = type
    this.details = details
  }
}

export const CLAUDE_ERROR_TYPES = {
  INVALID_API_KEY:   'INVALID_API_KEY',
  RATE_LIMIT:        'RATE_LIMIT',
  JSON_PARSE_FAILED: 'JSON_PARSE_FAILED',
  CONTENT_FILTERED:  'CONTENT_FILTERED',
  NETWORK_ERROR:     'NETWORK_ERROR',
  UNKNOWN:           'UNKNOWN',
}

// ─── Helpers internos ────────────────────────────────────────────────────────

/**
 * Crea un cliente Anthropic con la API key del usuario.
 * dangerouslyAllowBrowser: true es necesario en apps web sin backend.
 * Las keys se guardan en localStorage y nunca se exponen en código fuente.
 *
 * @param {string} apiKey
 * @param {Record<string, string>} [extraHeaders]
 * @returns {Anthropic}
 */
function createClient(apiKey, extraHeaders = {}) {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    defaultHeaders: extraHeaders,
  })
}

/**
 * Mapea los errores de red / SDK a ClaudeServiceError tipados.
 * Reutilizado por ambos helpers de llamada.
 *
 * @param {unknown} err
 * @param {string} rawText
 */
function mapError(err, rawText) {
  if (err instanceof ClaudeParseError) {
    throw new ClaudeServiceError(
      CLAUDE_ERROR_TYPES.JSON_PARSE_FAILED,
      'La respuesta de Claude no pudo interpretarse como JSON.',
      { rawResponse: err.rawResponse ?? rawText },
    )
  }
  if (err?.status === 401) {
    throw new ClaudeServiceError(
      CLAUDE_ERROR_TYPES.INVALID_API_KEY,
      'La API key de Anthropic no es válida. Verifica tu configuración.',
    )
  }
  if (err?.status === 429) {
    throw new ClaudeServiceError(
      CLAUDE_ERROR_TYPES.RATE_LIMIT,
      'Límite de solicitudes alcanzado. Espera unos segundos e intenta nuevamente.',
    )
  }
  if (err?.status === 400 && err?.error?.type === 'invalid_request_error') {
    throw new ClaudeServiceError(
      CLAUDE_ERROR_TYPES.CONTENT_FILTERED,
      'El contenido fue rechazado por los filtros de seguridad de Claude.',
      { error: err.error },
    )
  }
  if (err instanceof TypeError && err.message.includes('fetch')) {
    throw new ClaudeServiceError(
      CLAUDE_ERROR_TYPES.NETWORK_ERROR,
      'Sin conexión a internet. Verifica tu red e intenta nuevamente.',
    )
  }
  throw new ClaudeServiceError(
    CLAUDE_ERROR_TYPES.UNKNOWN,
    err?.message ?? 'Error desconocido al llamar a la API de Claude.',
    { originalError: err },
  )
}

/**
 * Hace la llamada estándar a la API y parsea el JSON de la respuesta.
 *
 * @param {{ systemPrompt: string, userMessage: string, model: string, maxTokens: number, apiKey: string }} params
 * @returns {Promise<object>}
 * @throws {ClaudeServiceError}
 */
async function callClaude({ systemPrompt, userMessage, model, maxTokens, apiKey }) {
  let rawText = ''

  try {
    const client  = createClient(apiKey)
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    })

    rawText = message.content[0]?.text ?? ''
    return parseClaudeResponse(rawText)

  } catch (err) {
    mapError(err, rawText)
  }
}

/**
 * Igual que callClaude pero habilita la herramienta nativa de Web Search de
 * Anthropic (beta: web-search-2025-03-05).
 *
 * Anthropic ejecuta las búsquedas en sus servidores — el cliente no necesita
 * resolver el ciclo tool_use manualmente. La respuesta puede incluir bloques
 * tool_use (búsquedas realizadas) y bloques text (respuesta final con JSON).
 * Solo se pasan los bloques text al parser para no romper la extracción de JSON.
 *
 * @param {{ systemPrompt: string, userMessage: string, model: string, maxTokens: number, apiKey: string }} params
 * @returns {Promise<object>}
 * @throws {ClaudeServiceError}
 */
async function callClaudeWithWebSearch({ systemPrompt, userMessage, model, maxTokens, apiKey }) {
  let rawText = ''

  try {
    const client = createClient(apiKey, {
      'anthropic-beta': 'web-search-2025-03-05',
    })

    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
    })

    // Filtrar solo bloques de texto — descartar bloques tool_use intermedios
    // para no romper el parser JSON con contenido de búsqueda
    const textBlocks = message.content.filter(block => block.type === 'text')
    rawText = textBlocks.map(block => block.text).join('')

    return parseClaudeResponse(rawText)

  } catch (err) {
    mapError(err, rawText)
  }
}

// ─── Llamada 1: Curador de Noticias (Agente 1) ───────────────────────────────

/**
 * analyzeNews — Evalúa y curada las noticias crudas de NewsAPI.
 *
 * @param {{
 *   rawArticles: { title: string, source: string, url: string, published_at: string, description: string }[],
 *   currentDate: string,
 *   recentHistory: object[]
 * }} params
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<{ top_news: object[], news_bank: object[], ventana_ampliada: boolean }>}
 */
export async function analyzeNews({ rawArticles, currentDate, recentHistory }, apiKey) {
  const userMessage = JSON.stringify({
    fecha_actual:        currentDate,
    noticias_encontradas: rawArticles,
    historial_reciente:  recentHistory.slice(0, HISTORY_CONTEXT_LIMIT),
  })

  return callClaude({
    systemPrompt: AGENT_1_CURATOR_PROMPT,
    userMessage,
    model:        CLAUDE_MODELS.CURATOR,
    maxTokens:    MAX_TOKENS.CURATOR,
    apiKey,
  })
}

// ─── Llamada 2: Redactor de Posts (Agente 2) ─────────────────────────────────

/**
 * generatePost — Redacta un post completo a partir de la noticia seleccionada.
 * Usa la herramienta nativa de Web Search de Anthropic para enriquecer el post
 * con contexto de mercado, reacciones de analistas y datos complementarios
 * en tiempo real antes de redactar.
 *
 * @param {{
 *   newsItem: object,
 *   format: string | null,
 *   lengthTier: string,
 *   recentHistory: object[]
 * }} params
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<{ sections: object[], full_post: string, hashtags: string[], editor_note: string }>}
 */
export async function generatePost({ newsItem, format, lengthTier, recentHistory }, apiKey) {
  const userMessage = JSON.stringify({
    noticia: {
      title:            newsItem.title,
      source:           newsItem.source,
      url:              newsItem.url,
      date:             newsItem.date,
      summary:          newsItem.summary,
      key_data:         newsItem.key_data,
      finlat_relevance: newsItem.finlat_relevance,
    },
    formato:            format ?? null,
    longitud:           lengthTier,
    historial_reciente: recentHistory.slice(0, HISTORY_CONTEXT_LIMIT),
  })

  return callClaudeWithWebSearch({
    systemPrompt: AGENT_2_WRITER_PROMPT,
    userMessage,
    model:        CLAUDE_MODELS.WRITER,
    maxTokens:    MAX_TOKENS.WRITER,
    apiKey,
  })
}

// ─── Llamada 3: Analizador de Engagement (Agente 3) ──────────────────────────

/**
 * analyzeAndImprove — Evalúa el post, genera recomendaciones y el post mejorado.
 * Todo en una sola llamada para minimizar costos.
 *
 * @param {{
 *   postText: string,
 *   format: string,
 *   lengthTier: string,
 *   characterCount: number
 * }} params
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<{
 *   evaluation_summary: string,
 *   dimensions: object[],
 *   recommendations: object[],
 *   improved_post: string,
 *   visual_concept: string,
 *   image_prompt: string,
 *   post_publication_tip: string
 * }>}
 */
export async function analyzeAndImprove({ postText, format, lengthTier, characterCount }, apiKey) {
  const userMessage = JSON.stringify({
    post_actual:     postText,
    formato:         format,
    length_tier:     lengthTier,
    character_count: characterCount,
  })

  return callClaude({
    systemPrompt: AGENT_3_ANALYZER_PROMPT,
    userMessage,
    model:        CLAUDE_MODELS.ANALYZER,
    maxTokens:    MAX_TOKENS.ANALYZER,
    apiKey,
  })
}
