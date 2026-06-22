/**
 * src/services/reacciones.js
 *
 * Reacciones emoji en tiempo real para partidos en vivo.
 * Usa el cliente anon (lectura pública + INSERT público).
 * Rate limiting client-side: 1 reacción por emoji por partido por sesión.
 */

import { supabase } from '../lib/supabaseClient.js'

export const REACTION_EMOJIS = ['🔥', '😱', '💔', '🤣', '⚽', '❤️', '😢', '😤']

const ZERO_REACTIONS = REACTION_EMOJIS.map(emoji => ({ emoji, total: 0 }))

// ── LocalStorage helpers (rate limit client-side) ─────────────────────

const lsKey = (fixtureId) => `mpulse_rx_${fixtureId}`

export function getUsedEmojis(fixtureId) {
  try {
    return JSON.parse(localStorage.getItem(lsKey(fixtureId)) ?? '[]')
  } catch {
    return []
  }
}

function markUsed(fixtureId, emoji) {
  const used = getUsedEmojis(fixtureId)
  if (!used.includes(emoji)) {
    localStorage.setItem(lsKey(fixtureId), JSON.stringify([...used, emoji]))
  }
}

// ── API ───────────────────────────────────────────────────────────────

/**
 * Trae los conteos agrupados por emoji para un fixture.
 * Emojis sin reacciones aparecen con total=0.
 *
 * @param {number} fixtureId — campo `n` del partido en /api/live
 * @returns {Promise<{ data: Array<{emoji:string, total:number}>, error: Error|null }>}
 */
export async function getReacciones(fixtureId) {
  const { data, error } = await supabase.rpc('get_reacciones', {
    p_fixture_id: fixtureId,
  })

  if (error) {
    console.error('[reacciones] getReacciones error:', error.message)
    return { data: ZERO_REACTIONS, error }
  }

  // Normalizar: asegurar que los 8 emojis siempre estén presentes con su total
  const map = new Map(data.map(r => [r.emoji, Number(r.total)]))
  return {
    data: REACTION_EMOJIS.map(emoji => ({ emoji, total: map.get(emoji) ?? 0 })),
    error: null,
  }
}

/**
 * Inserta una reacción. Bloquea si el usuario ya reaccionó con ese
 * emoji en este partido durante esta sesión de navegador.
 *
 * @param {number} fixtureId
 * @param {string} emoji
 * @returns {Promise<{ error: Error|null }>}
 */
export async function addReaccion(fixtureId, emoji) {
  if (getUsedEmojis(fixtureId).includes(emoji)) {
    return { error: new Error('rate-limited') }
  }

  const { error } = await supabase
    .from('reacciones')
    .insert({ fixture_id: fixtureId, emoji })

  if (error) {
    console.error('[reacciones] addReaccion error:', error.message)
    return { error }
  }

  markUsed(fixtureId, emoji)
  return { error: null }
}
