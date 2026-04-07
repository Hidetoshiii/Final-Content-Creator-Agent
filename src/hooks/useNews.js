/**
 * useNews.js — Orquesta la búsqueda y curación de noticias.
 *
 * Flujo:
 *   1. fetchNews (newsService) — obtiene artículos crudos de NewsAPI / RSS
 *   2. analyzeNews (claudeService / Agente 1) — selecciona top 3 + banco
 *   3. Actualiza newsStore con el top 3
 *   4. Persiste el banco de noticias en localStorage via useStorage
 *
 * NOTA: Se usa flushSync para garantizar que React renderice el estado de
 * carga ANTES de iniciar el fetch. Sin esto, React 18 automatic batching
 * puede agrupar setLoadingNews(true) + setLoadingNews(false) en un solo
 * render si la operación falla muy rápido, haciendo invisible la pantalla
 * de carga.
 */

import { useCallback }  from 'react'
import { flushSync }    from 'react-dom'
import useNewsStore     from '@/stores/newsStore'
import useAppStore      from '@/stores/appStore'
import { fetchNews }           from '@/services/newsService'
import { analyzeNews, ClaudeServiceError } from '@/services/claudeService'
import useStorage       from './useStorage'

function useNews() {
  const {
    topNews,
    selectedNewsId,
    windowExpanded,
    isLoadingNews,
    newsError,
    setTopNews,
    setWindowExpanded,
    selectNews,
    setLoadingNews,
    setNewsError,
    clearTopNews,
    getSelectedNews,
  } = useNewsStore()

  const { apiKeys, addNotification } = useAppStore()
  const { appendNewsBank, getHistoryForAgents } = useStorage()

  /**
   * fetchAndAnalyzeNews — Pipeline completo del paso 1.
   *
   * flushSync fuerza a React a renderizar la pantalla de carga de inmediato,
   * antes de que empiece cualquier operación async (fetch / Claude).
   */
  const fetchAndAnalyzeNews = useCallback(async () => {
    // ── Forzar render del estado de carga ANTES de cualquier await ──────────
    flushSync(() => {
      setNewsError(null)
      setLoadingNews(true)
    })

    try {
      // 1. Obtener artículos crudos (RSS + NewsAPI opcional)
      const rawArticles = await fetchNews(apiKeys.newsapi)

      if (rawArticles.length === 0) {
        throw new Error('No se encontraron noticias disponibles en este momento.')
      }

      // 2. Agente 1 — curación con Claude
      const currentDate   = new Date().toISOString().split('T')[0]
      const recentHistory = getHistoryForAgents(7)

      const result = await analyzeNews(
        { rawArticles, currentDate, recentHistory },
        apiKeys.anthropic,
      )

      // 3. Actualizar store con el top 3 curado
      setTopNews(result.top_news ?? [])
      setWindowExpanded(result.ventana_ampliada ?? false)

      // 4. Persistir banco de noticias en localStorage
      if (result.news_bank?.length > 0) {
        appendNewsBank(result.news_bank)
      }

      if (result.ventana_ampliada) {
        addNotification({
          type:    'warning',
          message: 'Pocas noticias recientes. Se amplió la búsqueda a 72 horas.',
        })
      }

    } catch (err) {
      let errorMessage = 'Error al buscar noticias. Intenta nuevamente.'

      if (err instanceof ClaudeServiceError) {
        switch (err.type) {
          case 'INVALID_API_KEY':
            errorMessage = 'API key de Anthropic inválida. Revisa Configuración.'
            break
          case 'RATE_LIMIT':
            errorMessage = 'Límite de solicitudes alcanzado. Espera unos segundos.'
            break
          case 'JSON_PARSE_FAILED':
            errorMessage = 'Error al interpretar la respuesta de Claude. Intenta nuevamente.'
            break
          case 'NETWORK_ERROR':
            errorMessage = 'Sin conexión. Verifica tu red e intenta nuevamente.'
            break
          default:
            errorMessage = err.message
        }
      } else if (err?.message) {
        errorMessage = err.message
      }

      setNewsError(errorMessage)
    } finally {
      setLoadingNews(false)
    }
  }, [apiKeys, appendNewsBank, getHistoryForAgents, setTopNews, setWindowExpanded, setLoadingNews, setNewsError, addNotification])

  return {
    topNews,
    selectedNewsId,
    windowExpanded,
    isLoadingNews,
    newsError,
    fetchAndAnalyzeNews,
    selectNews,
    clearTopNews,
    getSelectedNews,
  }
}

export default useNews
