/**
 * Step1Discover — Paso 1: Buscar y seleccionar noticia.
 */

import { useState }   from 'react'
import useNews        from '@/hooks/useNews'
import NewsCard       from '@/components/news/NewsCard'
import Button         from '@/components/ui/Button'
import LoadingScreen  from '@/components/ui/LoadingScreen'
import ErrorBanner    from '@/components/ui/ErrorBanner'
import EmptyState     from '@/components/ui/EmptyState'
import ManualNewsInput from '@/components/news/ManualNewsInput'

const LOADING_PHASES = [
  'Conectando con NewsData.io',
  'Obteniendo noticias financieras de Perú',
  'Obteniendo noticias financieras de LATAM',
  'Filtrando artículos relevantes',
  'Eliminando duplicados',
  'Enviando noticias al Agente Curador',
  'Evaluando relevancia para FINLAT',
  'Priorizando las 3 mejores noticias',
  'Preparando tarjetas de resumen',
]

/**
 * @param {{ onNewsSelected: () => void }} props
 */
function Step1Discover({ onNewsSelected }) {
  const {
    topNews,
    selectedNewsId,
    windowExpanded,
    isLoadingNews,
    newsError,
    fetchAndAnalyzeNews,
    analyzeManualArticle,
    selectNews,
  } = useNews()

  // Si el servidor señaliza modo manual (key no configurada o NewsData.io caído)
  // el formulario manual se abre automáticamente
  const isManualMode = newsError === '__manual_mode__'
  const [showManual, setShowManual] = useState(false)
  const showManualForm = showManual || isManualMode

  const handleContinue = () => {
    if (selectedNewsId) onNewsSelected()
  }

  // ── Pantalla de carga ──────────────────────────────────────────────────────
  if (isLoadingNews) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-smoke">Buscar noticias del día</h2>
            <p className="text-sm text-smoke-muted mt-0.5">
              La IA analiza las noticias financieras más recientes.
            </p>
          </div>
          <Button variant="ghost" size="md" disabled>
            Buscando…
          </Button>
        </div>

        <div className="rounded-card border border-oxford-light/20 bg-oxford/20">
          <LoadingScreen
            title="Agente 1 — Curador de Noticias"
            phases={LOADING_PHASES}
            estimatedSeconds={30}
          />
        </div>
      </div>
    )
  }

  // ── Render normal ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-smoke">Buscar noticias del día</h2>
          <p className="text-sm text-smoke-muted mt-0.5">
            La IA analiza las noticias financieras más recientes y selecciona las 3 más relevantes para FINLAT.
          </p>
        </div>
        
        {/* Contenedor de botones: en mobile ocupan el 100% y se apilan */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={fetchAndAnalyzeNews}
            className="w-full sm:w-auto"
          >
            {topNews.length > 0 ? '↺ Actualizar' : 'Buscar Noticias'}
          </Button>
          <Button 
            variant="secondary" 
            size="md" 
            onClick={() => setShowManual(v => !v)} 
            className="w-full sm:w-auto"
          >
            {showManual ? '← Volver' : 'Ingresar manualmente'}
          </Button>
        </div>
      </div>

      {/* Aviso ventana ampliada */}
      {windowExpanded && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/30">
          <span className="text-warning text-sm">⚠</span>
          <p className="text-xs text-warning">
            Pocas noticias recientes — se amplió la búsqueda a 72 horas.
          </p>
        </div>
      )}

      {/* Error real (no modo manual) */}
      {newsError && !isManualMode && (
        <ErrorBanner
          message={newsError}
          onRetry={fetchAndAnalyzeNews}
        />
      )}

      {/* Aviso modo manual automático */}
      {isManualMode && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-warning/10 border border-warning/30">
          <span className="text-warning text-base shrink-0">⚠</span>
          <div>
            <p className="text-sm font-medium text-smoke">Búsqueda automática no disponible</p>
            <p className="text-xs text-smoke-muted mt-0.5">
              El servicio de noticias no está configurado. Ingresa la noticia manualmente para continuar.
            </p>
          </div>
        </div>
      )}

      {/* Entrada manual */}
      {showManualForm && (
        <ManualNewsInput onSubmit={analyzeManualArticle} isLoading={isLoadingNews} />
      )}

      {/* Noticias */}
      {topNews.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topNews.map(news => (
              <NewsCard
                key={news.id}
                news={news}
                selected={news.id === selectedNewsId}
                onSelect={selectNews}
              />
            ))}
          </div>
          {selectedNewsId && (
            <div className="flex justify-end pt-2 animate-fade-in">
              <Button variant="primary" size="lg" onClick={handleContinue}>
                Continuar con esta noticia →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Estado vacío inicial */}
      {topNews.length === 0 && !newsError && (
        <EmptyState
          icon="📰"
          title="No hay noticias aún"
          description="Presiona «Buscar Noticias» para que la IA analice las fuentes financieras y seleccione las 3 más relevantes para FINLAT."
        />
      )}

    </div>
  )
}

export default Step1Discover