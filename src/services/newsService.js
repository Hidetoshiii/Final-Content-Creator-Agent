/**
 * newsService.js — Obtiene noticias financieras via la API Route /api/fetch-news.
 */

export async function fetchNews() {
  let res

  try {
    res = await fetch('/api/fetch-news')
  } catch {
    throw new Error('Sin conexión. Verifica tu red e intenta nuevamente.')
  }

  // 💡 Si falla, ahora sí extraemos el error exacto que nos envía el backend
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || 'Error del servidor al obtener noticias.')
  }

  const articles   = await res.json()
  const manualMode = !Array.isArray(articles) || articles.length === 0

  return {
    articles:   Array.isArray(articles) ? articles : [],
    manualMode,
  }
}