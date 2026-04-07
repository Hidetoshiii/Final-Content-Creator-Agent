/**
 * Login.jsx — Pantalla de inicio de sesión.
 *
 * Herramienta interna de FINLAT CAPITAL.
 * No hay registro público — las credenciales son compartidas por el equipo.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email.trim(), password)

    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    navigate('/', { replace: true })
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6"
      style={{ backgroundColor: '#F1F5F9' }}
    >
      <div className="w-full max-w-sm">

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white text-2xl font-black mb-4"
            style={{ backgroundColor: '#224469' }}
          >
            F
          </div>
          <h1 className="text-2xl font-extrabold text-smoke tracking-tight">
            FINLAT Content Studio
          </h1>
          <p className="text-sm text-smoke-muted mt-1">
            Herramienta interna — acceso restringido
          </p>
        </div>

        {/* Card de login */}
        <div
          className="bg-white rounded-2xl shadow-card p-8 space-y-5"
          style={{ border: '1px solid rgba(0,0,0,0.08)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-smoke">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@finlatcapital.com"
                required
                autoComplete="email"
                className="w-full bg-gunmetal border border-oxford-light/30 rounded-lg px-4 py-2.5 text-sm text-smoke placeholder:text-smoke-muted/50 focus:outline-none focus:ring-2 focus:ring-oxford-light transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-smoke">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-gunmetal border border-oxford-light/30 rounded-lg px-4 py-2.5 text-sm text-smoke placeholder:text-smoke-muted/50 focus:outline-none focus:ring-2 focus:ring-oxford-light transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-danger bg-danger/8 rounded-lg px-3 py-2 leading-relaxed">
                {error}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#224469' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-smoke-muted mt-6">
          FINLAT CAPITAL © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default Login
