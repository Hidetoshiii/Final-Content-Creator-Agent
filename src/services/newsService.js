/**
 * newsService.js — Obtiene noticias financieras via NewsData.io
 *
 * Fuente primaria: NewsData.io (https://newsdata.io)
 *   - Filtra por país PE, idioma español, categoría business
 *   - Segunda llamada para noticias internacionales de finanzas
 *   - Vite proxy: /newsdata → https://newsdata.io
 *
 * Sin NewsData key: devuelve array vacío (se usa fallback manual en UI)
 */

import axios from 'axios'
import { NEWS_WINDOW_HOURS } from '@/config/constants'

// ─── Tipo interno ─────────────────────────────────────────────────────────────
/**
 * @typedef {{ title: string, source: string, url: string, published_at: string, description: string }} RawArticle
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** @param {object} article - NewsData.io result item */
function normalizeNewsData(article) {
  return {
    title:        article.title        ?? '',
    source:       article.source_name  ?? article.source_id ?? 'NewsData',
    url:          article.link         ?? '',
    published_at: article.pubDate      ?? new Date().toISOString(),
    description:  article.description  ?? article.content?.substring(0, 400) ?? '',
  }
}

function filterValid(articles) {
  return articles.filter(a =>
    typeof a.title === 'string' && a.title.trim().length > 5 &&
    typeof a.url   === 'string' && a.url.startsWith('http'),
  )
}

// ─── NewsData.io ──────────────────────────────────────────────────────────────

/**
 * fetchFromNewsData — Llama a NewsData.io via proxy Vite /newsdata
 * @param {string} apiKey - NewsData.io key (starts with pub_)
 * @returns {Promise<RawArticle[]>}
 */
async function fetchFromNewsData(apiKey) {
  const results = []

  // ── Llamada 1: Noticias de Perú (business + top) ──────────────────────────
  try {
    const res = await axios.get('/newsdata/api/1/news', {
      params: {
        apikey:    apiKey,
        country:   'pe',
        language:  'es',
        category:  'business',
        //timeframe: 48,
        size:      10,
      },
      timeout: 12000,
    })

    if (res.data?.status === 'success') {
      const articles = (res.data.results ?? []).map(normalizeNewsData)
      results.push(...articles)
      console.info(`[newsService] NewsData.io Perú: ${articles.length} artículos`)
    }
  } catch (err) {
    console.warn('[newsService] NewsData.io Perú falló:', err.message)
  }

  // ── Llamada 2: Noticias financieras en español (LATAM) ────────────────────
  try {
    const res = await axios.get('/newsdata/api/1/news', {
      params: {
        apikey:    apiKey,
        language:  'es',
        category:  'business',
        q:         'economía OR finanzas OR inversión OR mercados OR banco',
        //timeframe: 48,
        size:      10,
      },
      timeout: 12000,
    })

    if (res.data?.status === 'success') {
      const seen = new Set(results.map(a => a.url))
      const fresh = (res.data.results ?? [])
        .map(normalizeNewsData)
        .filter(a => !seen.has(a.url))
      results.push(...fresh)
      console.info(`[newsService] NewsData.io LATAM: ${fresh.length} artículos nuevos`)
    }
  } catch (err) {
    console.warn('[newsService] NewsData.io LATAM falló:', err.message)
  }

  return filterValid(results)
}

// ─── Función principal exportada ─────────────────────────────────────────────

/**
 * fetchNews — Obtiene artículos crudos para el Agente 1.
 *
 * @param {string} [newsDataKey] - NewsData.io key. Si no se pasa → devuelve []
 * @returns {Promise<RawArticle[]>}
 * @throws {Error} Si la key existe pero la API falla completamente
 */
export async function fetchNews(newsDataKey) {
  if (!newsDataKey) {
    // Sin key → el usuario usará el modo manual
    return []
  }

  const articles = await fetchFromNewsData(newsDataKey)

  if (articles.length === 0) {
    throw new Error(
      'No se obtuvieron noticias de NewsData.io. Verifica tu API key y tu conexión.',
    )
  }

  // Mezcla aleatoria + límite de 50 artículos para darle al Agente 1 un pool amplio
  const shuffled = articles.sort(() => Math.random() - 0.5).slice(0, 20)
  console.info(`[newsService] Total para Agente 1: ${shuffled.length} artículos`)
  return shuffled
}
