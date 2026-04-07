/**
 * Button — Botón base rediseñado para tema claro FINLAT.
 *
 * primary   → Oxford Blue sólido con texto blanco (acción principal)
 * secondary → Borde Oxford Blue, fondo transparente (acción secundaria)
 * ghost     → Solo texto, fondo transparente (acción terciaria)
 * danger    → Rojo suave (acciones destructivas)
 * success   → Verde suave (confirmaciones)
 */

import { forwardRef } from 'react'
import Spinner from './Spinner'

const VARIANTS = {
  primary:   'bg-oxford-light hover:bg-[#1a3555] text-white border border-oxford-light',
  secondary: 'bg-white hover:bg-oxford-light/10 text-oxford-light border border-oxford-light',
  ghost:     'bg-transparent hover:bg-oxford-light/8 text-smoke-muted hover:text-smoke border border-transparent',
  danger:    'bg-danger/8 hover:bg-danger/15 text-danger border border-danger/30',
  success:   'bg-success/8 hover:bg-success/15 text-success border border-success/30',
}

const SIZES = {
  sm:  'px-3 py-1.5 text-sm gap-1.5',
  md:  'px-4 py-2   text-sm gap-2',
  lg:  'px-6 py-2.5 text-base gap-2',
}

const Button = forwardRef(({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  disabled  = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxford-light focus-visible:ring-offset-1 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]        ?? SIZES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading
        ? <Spinner size="sm" className="shrink-0" />
        : leftIcon && <span className="shrink-0">{leftIcon}</span>
      }
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
