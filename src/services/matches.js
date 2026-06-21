/**
 * src/services/matches.js
 *
 * Servicio de partidos en vivo.
 *
 * ⚠️  No existe tabla `matches` en Supabase (confirmado vía MCP).
 *     Los datos provienen de una Vercel Function que proxea worldcup26.ir/get/games.
 *
 * Fuente provisional: el endpoint del proyecto vanilla en producción
 *   → https://mundial-pulse.vercel.app/api/live
 *
 * Cuando el proyecto React tenga su propia función Vercel (api/live.js),
 * añadir VITE_LIVE_API_URL al .env.local para apuntar a ese endpoint propio.
 *
 * Shape normalizada de cada partido (del proxy vanilla):
 *   {
 *     n:        number       // número de partido
 *     home:     string       // nombre equipo local
 *     away:     string       // nombre equipo visitante
 *     time:     string       // hora local (HH:MM)
 *     date:     string       // fecha ISO
 *     group:    string       // 'Grupo A' | 'Octavos' | …
 *     live:     boolean
 *     minute:   string|null  // "45'" | null
 *     result:   { h: number, a: number } | null
 *     status:   'upcoming' | 'live' | 'finished'
 *   }
 */

const LIVE_API_URL =
  import.meta.env.VITE_LIVE_API_URL ??
  'https://mundial-pulse.vercel.app/api/live'

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchMatches() {
  const res = await fetch(LIVE_API_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${LIVE_API_URL}`)
  const data = await res.json()
  // API returns either a single match object or an array — normalize to array
  return Array.isArray(data) ? data : (data ? [data] : [])
}

// ── Exports ──────────────────────────────────────────────────────────

/**
 * Devuelve todos los partidos (live + próximos + finalizados).
 *
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getLiveMatches() {
  try {
    const data = await fetchMatches()
    return { data: data ?? [], error: null }
  } catch (error) {
    console.error('[matches] getLiveMatches failed:', error.message)
    return { data: [], error }
  }
}

/**
 * Devuelve solo los partidos actualmente en juego.
 *
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getCurrentMatches() {
  const { data, error } = await getLiveMatches()
  if (error) return { data: [], error }
  return {
    data: data.filter((m) => m.live === true || m.status === 'live'),
    error: null,
  }
}

/**
 * Devuelve los próximos partidos (aún no comenzados).
 *
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getUpcomingMatches() {
  const { data, error } = await getLiveMatches()
  if (error) return { data: [], error }
  return {
    data: data.filter((m) => m.status === 'upcoming' || (!m.live && !m.result)),
    error: null,
  }
}

/**
 * Devuelve un partido por número de partido.
 *
 * @param {number} matchNumber
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function getMatchByNumber(matchNumber) {
  const { data, error } = await getLiveMatches()
  if (error) return { data: null, error }
  return {
    data: data.find((m) => m.n === matchNumber) ?? null,
    error: null,
  }
}
