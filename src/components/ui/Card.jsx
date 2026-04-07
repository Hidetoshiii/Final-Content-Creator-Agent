/**
 * Card — Contenedor base para tema claro.
 * Fondo blanco, borde sutil, sombra ligera.
 */

const PADDING = {
  none: '',
  sm:   'p-3',
  md:   'p-5',
  lg:   'p-6',
}

function Card({
  selected  = false,
  hoverable = false,
  padding   = 'md',
  onClick,
  className = '',
  children,
}) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'rounded-card bg-oxford border transition-all duration-150',
        selected
          ? 'border-oxford-light shadow-glow'
          : 'border-black/8 shadow-card',
        hoverable && !selected
          ? 'hover:border-oxford-light/50 hover:shadow-card-lg cursor-pointer'
          : '',
        onClick
          ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxford-light'
          : '',
        PADDING[padding] ?? PADDING.md,
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

export default Card
