/**
 * constants.js — Constantes globales de la aplicación.
 * Un solo lugar para cambiar modelos, keywords, timeouts, etc.
 */

// ─── Modelos de Claude ────────────────────────────────────────────────────
export const CLAUDE_MODELS = {
  /** Análisis de noticias — rápido y económico */
  CURATOR:  'claude-3-haiku-20240307',
  /** Redacción de posts — máxima calidad */
  WRITER:   'claude-3-5-sonnet-20241022',
  /** Análisis de engagement — equilibrio calidad/costo */
  ANALYZER: 'claude-3-5-sonnet-20241022',
}

// ─── Límites de tokens por llamada ───────────────────────────────────────
export const MAX_TOKENS = {
  CURATOR:  4000,
  WRITER:   3000,
  ANALYZER: 4000,
}

// ─── Ventana temporal de noticias (horas) ────────────────────────────────
export const NEWS_WINDOW_HOURS    = 48
export const NEWS_WINDOW_FALLBACK = 72  // Si no hay suficiente contenido fresco

// ─── Keywords para NewsAPI ────────────────────────────────────────────────
export const NEWS_KEYWORDS = [
  'Peru economia',
  'Peru finanzas',
  'BCRP tipo de cambio',
  'Peru inversion',
  'mercados emergentes latinoamerica',
  'Peru PBI inflacion',
  'banca Peru',
  'fintech latinoamerica',
  'finanzas corporativas Peru',
  'LATAM fusiones adquisiciones',
]

// ─── Parámetros NewsAPI ───────────────────────────────────────────────────
export const NEWSAPI_CONFIG = {
  PAGE_SIZE: 20,
  LANGUAGES: 'es,en',
  SORT_BY:   'relevancy',
}

// ─── Formatos de post disponibles ────────────────────────────────────────
export const POST_FORMATS = {
  INFORMATIVO: 'informativo',
  EDUCATIVO:   'educativo',
  POLEMICO:    'polemico',
}

// ─── Tiers de longitud con rangos de caracteres ──────────────────────────
export const LENGTH_TIERS = {
  corto: { label: 'Corto',  min: 500,  max: 700  },
  medio: { label: 'Medio',  min: 800,  max: 1100 },
  largo: { label: 'Largo',  min: 1200, max: 1600 },
}

// ─── Keys de localStorage ─────────────────────────────────────────────────
export const STORAGE_KEYS = {
  NEWS_BANK:    'finlat_news_bank',
  POST_HISTORY: 'finlat_post_history',
  API_KEYS:     'finlat_api_keys',
}

// ─── Historial — cuántos posts recientes se pasan a los agentes ───────────
export const HISTORY_CONTEXT_LIMIT = 7   // Últimos N posts para evitar repetición
export const HISTORY_DAYS_LIMIT    = 14  // Días hacia atrás para revisar ángulos

// ─── Número de noticias que va al banco de noticias ──────────────────────
export const NEWS_BANK_MAX_ITEMS = 8
