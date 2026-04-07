/**
 * LoadingScreen — Pantalla de carga animada para operaciones largas con IA.
 *
 * Muestra un panel centrado con:
 *   - Spinner giratorio
 *   - Título de la operación
 *   - Fases que rotan automáticamente (simula progreso)
 *   - Nota de tiempo estimado
 */

import { useState, useEffect } from 'react'

/**
 * @param {{
 *   title: string,
 *   phases: string[],          // Mensajes que rotan cada ~2.5s
 *   estimatedSeconds?: number, // Tiempo estimado para mostrar al usuario
 *   className?: string
 * }} props
 */
function LoadingScreen({ title, phases = [], estimatedSeconds, className = '' }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [dots, setDots]             = useState('')

  // Rota entre las fases cada 2.8 segundos
  useEffect(() => {
    if (phases.length <= 1) return
    const id = setInterval(() => {
      setPhaseIndex(i => (i + 1) % phases.length)
    }, 2800)
    return () => clearInterval(id)
  }, [phases.length])

  // Anima los puntos suspensivos
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(id)
  }, [])

  const currentPhase = phases[phaseIndex] ?? ''

  return (
    <div className={[
      'flex flex-col items-center justify-center py-16 px-6 text-center space-y-6',
      className,
    ].join(' ')}>

      {/* Spinner triple */}
      <div className="relative w-16 h-16">
        <span className="absolute inset-0 rounded-full border-4 border-oxford-light/15" />
        <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-oxford-light animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-oxford-light animate-pulse" />
        </span>
      </div>

      {/* Título */}
      <div className="space-y-1">
        <h3 className="text-base font-bold text-smoke">{title}</h3>
        {estimatedSeconds && (
          <p className="text-xs text-smoke-muted">
            Tiempo estimado: ~{estimatedSeconds} segundos
          </p>
        )}
      </div>

      {/* Fase actual */}
      {phases.length > 0 && (
        <div className="min-h-[2.5rem] flex items-center">
          <p className="text-sm text-oxford-light font-semibold animate-fade-in" key={phaseIndex}>
            {currentPhase}{dots}
          </p>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="w-64 h-1.5 bg-oxford-light/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-oxford-light rounded-full"
          style={{ animation: 'loading-bar 2s ease-in-out infinite' }}
        />
      </div>

      {/* Nota */}
      <p className="text-xs text-smoke-muted max-w-xs leading-relaxed">
        La IA está trabajando. No cierres ni recargues la página.
      </p>

      {/* Keyframe inline para la barra (no rompe Tailwind) */}
      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); width: 60%; }
          50%  { transform: translateX(60%);  width: 60%; }
          100% { transform: translateX(200%); width: 60%; }
        }
      `}</style>

    </div>
  )
}

export default LoadingScreen
