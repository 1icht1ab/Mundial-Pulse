/**
 * src/services/partidos.js
 *
 * Acceso de lectura a la tabla `partidos`.
 * RLS: SELECT pública — se puede usar con el cliente anon normal.
 */

import { supabase } from '../lib/supabaseClient.js'

/**
 * Devuelve los partidos filtrados por estado, ordenados por fecha.
 *
 * @param {{ estado?: 'programado' | 'en_curso' | 'finalizado' }} options
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getPartidos({ estado = 'programado' } = {}) {
  try {
    const { data, error } = await supabase
      .from('partidos')
      .select('numero, local, visitante, grupo, fecha')
      .eq('estado', estado)
      .order('fecha', { ascending: true })

    if (error) throw error
    return { data: data ?? [], error: null }
  } catch (error) {
    console.error('[partidos] getPartidos failed:', error.message)
    return { data: [], error }
  }
}
