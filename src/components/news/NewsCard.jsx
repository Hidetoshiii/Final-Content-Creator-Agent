/**
 * NewsCard — Tarjeta visual de noticia curada por el Agente 1.
 * Muestra título, fuente, resumen, dato clave y relevancia para FINLAT.
 */

import Badge          from '@/components/ui/Badge'
import NewsSourceBadge from './NewsSourceBadge'
import { formatDateShort } from '@/utils/formatters'

/**
 * @param {{
 *   news: object,
 *   selected: boolean,
 *   onSelect: (id: string) => void
 * }} props
 */
function NewsCard({ news, selected, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(news.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(news.id)}
      className={[
        'rounded-card border p-5 cursor-pointer transition-all duration-150 space-y-3 animate-fade-in',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxford-light',
        selected
          ? 'bg-oxford border-smoke/50 shadow-glow'
          : 'bg-oxford border-oxford-light/20 hover:border-oxford-light/50 hover:bg-oxford-light/20',
      ].join(' ')}
    >
      {/* Fila superior — badges + fecha */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge preset={news.origin} />
        <Badge preset={news.priority} label={news.priority === 'alta' ? 'Alta' : 'Media'} />
        <NewsSourceBadge source={news.source} />
        <span className="ml-auto text-xs text-smoke-muted shrink-0">
          {formatDateShort(news.date)}
        </span>
      </div>

      {/* Título */}
      <h3 className="text-sm font-semibold text-smoke leading-snug line-clamp-3">
        {news.title}
      </h3>

      {/* Resumen */}
      <p className="text-xs text-smoke-muted leading-relaxed line-clamp-3">
        {news.summary}
      </p>

      {/* Dato clave */}
      {news.key_data && (
        <div className="bg-gunmetal rounded-lg px-3 py-2 border border-oxford-light/20">
          <p className="text-xs text-smoke-muted mb-0.5 uppercase tracking-wide font-medium">
            Dato clave
          </p>
          <p className="text-sm text-smoke font-medium leading-snug">
            {news.key_data}
          </p>
        </div>
      )}

      {/* Relevancia FINLAT */}
      {news.finlat_relevance && (
        <div className="pt-1 border-t border-oxford-light/20">
          <p className="text-xs text-smoke-muted mb-0.5 uppercase tracking-wide font-medium">
            Por qué importa
          </p>
          <p className="text-xs text-smoke leading-relaxed">
            {news.finlat_relevance}
          </p>
        </div>
      )}

      {news.url && (
        <div className="pt-1">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Esto evita que se seleccione la tarjeta al darle clic al link
            className="inline-block text-xs font-medium text-oxford-light hover:text-smoke transition-colors underline underline-offset-2"
          >
            Leer noticia original ↗
          </a>
        </div>
      )}

      {/* Indicador de selección */}
      {selected && (
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-xs text-success font-medium">Seleccionada</span>
        </div>
      )}
    </div>
  )
}

export default NewsCard
