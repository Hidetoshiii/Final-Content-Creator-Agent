/**
 * useNews.js — Orquesta la búsqueda y curación de noticias.
 *
 * Flujo:
 *   1. fetchNews (/api/fetch-news via newsService) — artículos crudos
 *   2. analyzeNews (/api/analyze-news via claudeService — Agente 1)
 *   3. Actualiza newsStore con el top 3
 *   4. Persiste el banco de noticias en Supabase via useStorage
 *
 * Las API keys ya no se pasan desde el frontend — las gestiona el servidor.
 *
 * NOTA: flushSync garantiza que React renderice la pantalla de carga
 * ANTES de iniciar operaciones async (React 18 automatic batching fix).
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

  const { addNotification } = useAppStore()
  const { appendNewsBank, getHistoryForAgents } = useStorage()

  /**
   * fetchAndAnalyzeNews — Pipeline completo del paso 1.
   * flushSync fuerza render del estado de carga antes de cualquier await.
   */
  const fetchAndAnalyzeNews = useCallback(async () => {
    flushSync(() => {
      setNewsError(null)
      setLoadingNews(true)
    })

    try {
      // 1. Obtener artículos crudos desde el servidor
      const { articles: rawArticles, manualMode } = await fetchNews()

      // Sin artículos (key no configurada o NewsData.io no disponible)
      // → señalizar al store para que la UI abra el formulario manual
      if (manualMode) {
        setNewsError('__manual_mode__')
        return
      }

      // 2. Agente 1 — curación con Claude (server-side)
      const currentDate   = new Date().toISOString().split('T')[0]
      const recentHistory = getHistoryForAgents(7)

      const result = await analyzeNews({ rawArticles, currentDate, recentHistory })

      // 3. Actualizar store con el top 3 curado
      setTopNews(result.top_news ?? [])
      setWindowExpanded(result.ventana_ampliada ?? false)

      // 4. Persistir banco de noticias en Supabase
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
            errorMessage = 'Error de configuración del servidor. Contacta al administrador.'
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
  }, [appendNewsBank, getHistoryForAgents, setTopNews, setWindowExpanded, setLoadingNews, setNewsError, addNotification])

  /**
   * analyzeManualArticle — Procesa un artículo ingresado manualmente.
   * Omite el fetch y envía el artículo directo al Agente 1.
   * @param {object[]} articles
   */
  const analyzeManualArticle = useCallback(async (articles) => {
    if (!articles?.length) return

    flushSync(() => {
      setLoadingNews(true)
      setNewsError(null)
    })

    try {
      const currentDate   = new Date().toISOString().split('T')[0]
      const recentHistory = getHistoryForAgents(7)

      const result = await analyzeNews({ rawArticles: articles, currentDate, recentHistory })

      setTopNews(result.top_news ?? [])
      setWindowExpanded(result.ventana_ampliada ?? false)

      if (result.news_bank?.length > 0) {
        appendNewsBank(result.news_bank)
      }
    } catch (err) {
      let errorMessage = 'Error al procesar la noticia. Intenta nuevamente.'
      if (err instanceof ClaudeServiceError) {
        errorMessage = err.message
      } else if (err?.message) {
        errorMessage = err.message
      }
      setNewsError(errorMessage)
    } finally {
      setLoadingNews(false)
    }
  }, [getHistoryForAgents, setTopNews, setWindowExpanded, appendNewsBank, setLoadingNews, setNewsError])

  return {
    topNews,
    selectedNewsId,
    windowExpanded,
    isLoadingNews,
    newsError,
    fetchAndAnalyzeNews,
    analyzeManualArticle,
    selectNews,
    clearTopNews,
    getSelectedNews,
  }
}

export default useNews
