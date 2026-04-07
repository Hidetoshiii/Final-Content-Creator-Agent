/**
 * api/generate-post.js — Agente 2: Redactor de Posts
 *
 * Serverless function (Vercel / Node.js 18+).
 * Habilita la herramienta nativa de Web Search de Anthropic
 * (beta: web-search-2025-03-05) para que el modelo investigue
 * contexto de mercado en tiempo real antes de redactar.
 *
 * Anthropic ejecuta las búsquedas server-side; el handler
 * solo filtra los bloques text de la respuesta para extraer el JSON final.
 */

import Anthropic from '@anthropic-ai/sdk'
import { AGENT_2_WRITER_PROMPT }            from '../src/config/prompts.js'
import { CLAUDE_MODELS, MAX_TOKENS, HISTORY_CONTEXT_LIMIT } from '../src/config/constants.js'
import { parseClaudeResponse }              from '../src/utils/jsonParser.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { newsItem, format, lengthTier, recentHistory } = req.body

    const client = new Anthropic({
      apiKey:         process.env.ANTHROPIC_API_KEY,
      defaultHeaders: { 'anthropic-beta': 'web-search-2025-03-05' },
    })

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
      historial_reciente: (recentHistory ?? []).slice(0, HISTORY_CONTEXT_LIMIT),
    })

    const message = await client.messages.create({
      model:      CLAUDE_MODELS.WRITER,
      max_tokens: MAX_TOKENS.WRITER,
      system:     AGENT_2_WRITER_PROMPT,
      messages:   [{ role: 'user', content: userMessage }],
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
    })

// Filtrar solo bloques text — los bloques tool_use son las búsquedas intermedias
    const textBlocks = message.content.filter(b => b.type === 'text')
    let rawText      = textBlocks.map(b => b.text).join('')
    
    // 💡 LIMPIEZA: Elimina las etiquetas <cite> y </cite> inyectadas automáticamente por Anthropic, dejando el texto intacto
    rawText = rawText.replace(/<\/?cite[^>]*>/g, '')

    const result     = parseClaudeResponse(rawText)
    return res.status(200).json(result)
  } catch (err) {
    if (err?.status === 401) return res.status(401).json({ error: 'API key inválida' })
    if (err?.status === 429) return res.status(429).json({ error: 'Rate limit alcanzado' })
    if (err?.status === 400) return res.status(400).json({ error: 'Contenido rechazado por filtros' })
    console.error('[generate-post]', err)
    return res.status(500).json({ error: err.message ?? 'Error interno del servidor' })
  }
}
