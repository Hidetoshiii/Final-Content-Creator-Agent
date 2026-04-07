/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // ─── Paleta FINLAT — Tema Claro ─────────────────────────────────────
      colors: {
        // Fondos de contenido (antes oscuros, ahora claros)
        gunmetal:       '#F1F5F9',   // Fondo de página — gris frío suave
        oxford:         '#FFFFFF',   // Cards y superficies — blanco puro
        'oxford-light': '#224469',   // Oxford Blue — acento de marca FINLAT
        'oxford-dark':  '#101c26',   // Gunmetal FINLAT — solo sidebar / dark badges
        neutral:        '#EEF2F7',   // Fondos neutros para badges y secciones sutiles

        // Texto (ahora oscuro sobre fondo blanco)
        smoke:          '#0F1C2A',   // Texto principal — casi negro
        'smoke-muted':  '#5E7A93',   // Texto secundario — azul-gris medio

        // Estados semánticos
        success:        '#16a34a',
        warning:        '#d97706',
        danger:         '#dc2626',
        'danger-soft':  'rgba(220,38,38,0.10)',
        'success-soft': 'rgba(22,163,74,0.10)',
      },

      // ─── Tipografía oficial FINLAT ──────────────────────────────────────
      fontFamily: {
        sans: ['"Roboto Condensed"', 'system-ui', 'sans-serif'],
      },

      fontWeight: {
        light:     '300',
        regular:   '400',
        medium:    '500',
        semibold:  '600',
        extrabold: '800',
      },

      // ─── Geometría ──────────────────────────────────────────────────────
      borderRadius: {
        card: '12px',
      },

      // ─── Sombras para tema claro ────────────────────────────────────────
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)',
        'card-lg': '0 4px 16px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        glow:  '0 0 0 3px rgba(34,68,105,0.25)',
        focus: '0 0 0 3px rgba(34,68,105,0.30)',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [],
}
