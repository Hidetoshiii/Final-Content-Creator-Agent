/**
 * Badge — Etiqueta visual rediseñada para tema claro.
 */

const PRESETS = {
  // Origen geográfico
  peru:           'bg-oxford-light/10 text-oxford-light border border-oxford-light/25',
  internacional:  'bg-neutral text-smoke-muted border border-oxford-light/15',

  // Prioridad editorial
  alta:           'bg-success/10 text-success border border-success/25',
  media:          'bg-warning/10 text-warning border border-warning/25',

  // Formatos de post
  informativo:    'bg-oxford-light/10 text-oxford-light border border-oxford-light/25',
  educativo:      'bg-success/10 text-success border border-success/25',
  polemico:       'bg-danger/10 text-danger border border-danger/25',

  // Estados del analizador
  ok:             'bg-success/10 text-success border border-success/25',
  warning:        'bg-warning/10 text-warning border border-warning/25',
  fail:           'bg-danger/10 text-danger border border-danger/25',

  // Genérico
  default:        'bg-neutral text-smoke-muted border border-oxford-light/15',
}

const LABEL_MAP = {
  peru:          '🇵🇪 Perú',
  internacional: '🌍 Internacional',
  alta:          'Alta',
  media:         'Media',
  informativo:   'Informativo',
  educativo:     'Educativo',
  polemico:      'Polémico',
  ok:            '✓',
  warning:       '⚠',
  fail:          '✗',
}

function Badge({ preset = 'default', label, size = 'sm', className = '' }) {
  const displayLabel = label ?? LABEL_MAP[preset] ?? preset

  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        PRESETS[preset] ?? PRESETS.default,
        className,
      ].filter(Boolean).join(' ')}
    >
      {displayLabel}
    </span>
  )
}

export default Badge
