import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/',               label: 'Inicio',            icon: '🏠' },
  { to: '/banco-noticias', label: 'Banco de Noticias',  icon: '📰' },
  { to: '/historial',      label: 'Historial',          icon: '📋' },
  { to: '/configuracion',  label: 'Configuración',      icon: '⚙️'  },
]

/**
 * Sidebar — Navegación lateral fija.
 * Usa colores FINLAT dark hardcodeados para mantener la identidad de marca
 * independientemente del tema del área de contenido.
 */
function Sidebar() {
  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0"
      style={{ backgroundColor: '#101c26' }}
    >
      {/* Logo FINLAT */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="font-extrabold text-lg tracking-wide leading-tight block" style={{ color: '#FFFFFF' }}>
          FINLAT
        </span>
        <span className="font-medium text-sm block mt-0.5" style={{ color: '#9baab8' }}>
          Content Studio
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textDecoration: 'none',
              transition: 'background 150ms, color 150ms',
              backgroundColor: isActive ? '#224469' : 'transparent',
              color: isActive ? '#FFFFFF' : '#9baab8',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.backgroundColor = 'rgba(34,68,105,0.35)'
                e.currentTarget.style.color = '#FFFFFF'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.getAttribute('aria-current')) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#9baab8'
              }
            }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-xs" style={{ color: '#9baab8' }}>FINLAT CAPITAL © 2026</p>
      </div>
    </aside>
  )
}

export default Sidebar
