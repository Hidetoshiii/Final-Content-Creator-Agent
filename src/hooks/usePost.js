/**
 * usePost.js — Orquesta la generación, análisis y guardado del post.
 *
 * Flujo paso 2→3: generatePost  (Agente 2) → setCurrentPost
 * Flujo paso 3→4: analyzeAndImprove (Agente 3) → setAnalysisResult
 * Flujo paso 5:   savePost → historial localStorage
 *
 * NOTA: flushSync en cada acción async garantiza que React 18 renderice
 * la pantalla de carga ANTES de iniciar la llamada a la API de Claude.
 */

import { useCallback } from 'react'
import { flushSync }   from 'react-dom'
import usePostStore    from '@/stores/postStore'
import useAppStore     from '@/stores/appStore'
import { generatePost, analyzeAndImprove, ClaudeServiceError } from '@/services/claudeService'
import useStorage      from './useStorage'

function usePost() {
  const store = usePostStore()
  const { apiKeys, addNotification, completeCurrentStep } = useAppStore()
  const { savePost, getHistoryForAgents } = useStorage()

  // ─── Mapeo de errores ─────────────────────────────────────────────────────
  const mapClaudeError = (err) => {
    if (!(err instanceof ClaudeServiceError)) return err.message ?? 'Error desconocido.'
    switch (err.type) {
      case 'INVALID_API_KEY':   return 'API key de Anthropic inválida. Revisa tu configuración.'
      case 'RATE_LIMIT':        return 'Límite de solicitudes alcanzado. Espera unos segundos.'
      case 'JSON_PARSE_FAILED': return 'Error al interpretar la respuesta. Intenta nuevamente.'
      case 'NETWORK_ERROR':     return 'Sin conexión. Verifica tu red e intenta nuevamente.'
      default:                  return err.message
    }
  }

  // ─── Acción: Generar Post (Paso 2 → 3) ────────────────────────────────────
  const generatePostAction = useCallback(async (newsItem) => {
    if (!newsItem) return

    // flushSync: garantiza que la pantalla de carga se renderice antes del await
    flushSync(() => {
      store.setGenerateError(null)
      store.setGeneratingPost(true)
    })

    try {
      const recentHistory = getHistoryForAgents(7)

      const result = await generatePost(
        {
          newsItem,
          format:      store.format,
          lengthTier:  store.lengthTier ?? 'medio',
          recentHistory,
        },
        apiKeys.anthropic,
      )

      store.setCurrentPost(result)
      completeCurrentStep()

      if (result.format_recommendation) {
        addNotification({
          type:    'info',
          message: `Formato sugerido automáticamente: ${result.format_recommendation}`,
        })
      }

    } catch (err) {
      store.setGenerateError(mapClaudeError(err))
    } finally {
      store.setGeneratingPost(false)
    }
  }, [store, apiKeys.anthropic, getHistoryForAgents, addNotification, completeCurrentStep])

  // ─── Acción: Analizar y Mejorar Post (Paso 3 → 4) ─────────────────────────
  const analyzePostAction = useCallback(async () => {
    const { currentPost, format, lengthTier } = store
    if (!currentPost?.full_post) return

    // flushSync: garantiza que la pantalla de carga se renderice antes del await
    flushSync(() => {
      store.setAnalyzeError(null)
      store.setAnalyzing(true)
    })

    try {
      const result = await analyzeAndImprove(
        {
          postText:       currentPost.full_post,
          format:         format ?? 'informativo',
          lengthTier:     lengthTier ?? 'medio',
          characterCount: currentPost.character_count ?? currentPost.full_post.length,
        },
        apiKeys.anthropic,
      )

      store.setAnalysisResult(result)
      completeCurrentStep()

    } catch (err) {
      store.setAnalyzeError(mapClaudeError(err))
    } finally {
      store.setAnalyzing(false)
    }
  }, [store, apiKeys.anthropic, completeCurrentStep])

  // ─── Acción: Guardar post en historial (Paso 5) ───────────────────────────
  const saveCurrentPost = useCallback((newsItem) => {
    const { currentPost, format, lengthTier, getFinalPostText } = store
    if (!currentPost || !newsItem) return

    const postRecord = {
      id:             crypto.randomUUID(),
      date:           new Date().toISOString().split('T')[0],
      newsTitle:      newsItem.title,
      format:         format ?? 'informativo',
      length_tier:    lengthTier ?? 'medio',
      full_post:      getFinalPostText(),
      angle:          currentPost.editor_note ?? '',
      topics_covered: [newsItem.title, ...(newsItem.key_data ? [newsItem.key_data] : [])],
    }

    savePost(postRecord)

    addNotification({
      type:    'success',
      message: 'Post guardado en el historial. ✓',
    })
  }, [store, savePost, addNotification])

  return {
    // Estado
    format:           store.format,
    lengthTier:       store.lengthTier,
    currentPost:      store.currentPost,
    analysisResult:   store.analysisResult,
    diffMode:         store.diffMode,
    visualConcept:    store.visualConcept,
    imagePrompt:      store.imagePrompt,
    isGeneratingPost: store.isGeneratingPost,
    isAnalyzing:      store.isAnalyzing,
    generateError:    store.generateError,
    analyzeError:     store.analyzeError,

    // Acciones
    setFormat:          store.setFormat,
    setLengthTier:      store.setLengthTier,
    generatePostAction,
    analyzePostAction,
    activateDiffMode:   store.activateDiffMode,
    acceptImprovement:  store.acceptImprovement,
    revertImprovement:  store.revertImprovement,
    updateSection:      store.updateSection,
    updateFullPost:     store.updateFullPost,
    toggleHashtag:      store.toggleHashtag,
    saveCurrentPost,
    getFinalPostText:   store.getFinalPostText,
    resetPost:          store.resetPost,
  }
}

export default usePost
