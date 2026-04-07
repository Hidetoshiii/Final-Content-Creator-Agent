import { Outlet } from 'react-router-dom'
import Sidebar            from './Sidebar'
import NotificationStack  from '@/components/ui/NotificationStack'

/**
 * MainLayout — Estructura visual raíz de la app.
 *
 * Layout:
 *   ┌──────────┬────────────────────────────────────┐
 *   │ Sidebar  │  Área de contenido (<Outlet />)     │
 *   │ (240px)  │  (flex-1, scroll independiente)     │
 *   └──────────┴────────────────────────────────────┘
 *
 * NotificationStack se monta aquí una sola vez para toda la app.
 */
function MainLayout() {
  return (
    <div className="flex w-full min-h-screen" style={{ backgroundColor: '#F1F5F9' }}>
      <Sidebar />

      {/* Contenido principal — scroll independiente del sidebar */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Notificaciones globales — posición fija bottom-right */}
      <NotificationStack />
    </div>
  )
}

export default MainLayout
