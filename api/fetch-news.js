/**
 * api/fetch-news.js — Obtiene noticias financieras desde NewsData.io
 *
 * Serverless function (Vercel / Node.js 18+).
 */

function normalizeArticle(a) {
  return {
    title:        a.title        ?? '',
    source:       a.source_name  ?? a.source_id ?? 'NewsData',
    url:          a.link         ?? '',
    published_at: a.pubDate      ?? new Date().toISOString(),
    description:  a.description  ?? (a.content?.substring(0, 400) ?? ''),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.NEWSDATA_API_KEY
  if (!apiKey) {
    return res.status(200).json([]) // Sin llave, modo manual
  }

  const results = []
  let lastErrorMessage = null

  // ── Llamada 1: Noticias de Perú ──────────────────────────────────────────
  try {
    // 💡 SOLUCIÓN: Se eliminó &timeframe=48 porque NewsData bloquea eso en cuentas gratis.
    const r1 = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&country=pe&language=es&category=business&size=10`
    )
    const d1 = await r1.json()

    if (d1.status === 'success') {
      results.push(...(d1.results ?? []).map(normalizeArticle))
    } else {
      lastErrorMessage = d1.results?.message || d1.message || 'Error desconocido'
      console.error('[fetch-news] Perú Error:', lastErrorMessage)
    }
  } catch (e) {
    lastErrorMessage = e.message
    console.error('[fetch-news] Perú falló:', e.message)
  }

  // ── Llamada 2: Noticias financieras LATAM ────────────────────────────────
  try {
    const q  = encodeURIComponent('economía OR finanzas OR inversión OR mercados OR banco')
    const r2 = await fetch(
      `https://newsdata.io/api/1/news?apikey=${apiKey}&language=es&category=business&q=${q}&size=10`
    )
    const d2 = await r2.json()

    if (d2.status === 'success') {
      const seen  = new Set(results.map(a => a.url))
      const fresh = (d2.results ?? []).map(normalizeArticle).filter(a => !seen.has(a.url))
      results.push(...fresh)
    } else {
      const err = d2.results?.message || d2.message || 'Error desconocido'
      lastErrorMessage = lastErrorMessage || err
      console.error('[fetch-news] LATAM Error:', err)
    }
  } catch (e) {
    lastErrorMessage = lastErrorMessage || e.message
    console.error('[fetch-news] LATAM falló:', e.message)
  }

  // 💡 Si NewsData nos devuelve un error (ej. límite de cuota o llave inválida), se lo pasamos al Frontend
  if (results.length === 0 && lastErrorMessage) {
    return res.status(500).json({ error: `NewsData.io API Error: ${lastErrorMessage}` })
  }

  if (results.length === 0) {
    return res.status(200).json([]) // Fallback
  }

  const valid    = results.filter(a => a.title?.trim().length > 5 && a.url?.startsWith('http'))
  const shuffled = valid.sort(() => Math.random() - 0.5).slice(0, 20)
  return res.status(200).json(shuffled)
}