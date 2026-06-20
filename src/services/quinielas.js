/**
 * src/services/quinielas.js
 *
 * Capa de acceso a la tabla `quinielas` en Supabase.
 *
 * Schema confirmado (MCP):
 *   id         uuid PK  gen_random_uuid()
 *   alias      text     NOT NULL
 *   contacto   text     nullable
 *   picks      jsonb    { [matchNum]: { h: number, a: number } }
 *   puntos     integer  default 0
 *   created_at timestamptz default now()
 *
 * RLS (rol anon):
 *   ✅ INSERT  — política `anon_insert_quinielas` (with_check: true)
 *   ❌ SELECT  — sin política; requiere service_role para lecturas admin
 *   ❌ UPDATE / DELETE — sin política
 */

import { supabase } from '../lib/supabaseClient.js'

const TABLE = 'quinielas'

// ── Escritura (anon ✅) ──────────────────────────────────────────────

/**
 * Guarda el set completo de predicciones de un usuario.
 *
 * @param {{ alias: string, contacto?: string, picks: Record<string|number, {h:number, a:number}> }} payload
 * @returns {Promise<{ data: { id: string } | null, error: Error | null }>}
 */
export async function submitPrediction({ alias, contacto = null, picks }) {
  try {
    // No encadenamos .select() porque el rol anon no tiene política SELECT;
    // RETURNING quedaría vacío. Verificamos error === null como indicador de éxito.
    const { error } = await supabase
      .from(TABLE)
      .insert({ alias, contacto, picks })

    if (error) throw error

    return { data: { submitted: true }, error: null }
  } catch (error) {
    console.error('[quinielas] submitPrediction failed:', error.message)
    return { data: null, error }
  }
}

// ── Lectura (requiere service_role — falla con anon key) ─────────────

/**
 * Devuelve el ranking público ordenado por puntos descendente.
 *
 * ⚠️  Requiere política SELECT. Con el anon key actual retorna [] por RLS.
 *     Usar desde un endpoint server-side con SUPABASE_SERVICE_ROLE_KEY.
 *
 * @param {{ limit?: number }} options
 * @returns {Promise<{ data: Array, error: Error | null }>}
 */
export async function getRanking({ limit = 50 } = {}) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, alias, puntos, created_at')
      .order('puntos', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data ?? [], error: null }
  } catch (error) {
    console.error('[quinielas] getRanking failed:', error.message)
    return { data: [], error }
  }
}

/**
 * Busca la quiniela de un alias exacto (primera coincidencia).
 *
 * ⚠️  Misma restricción RLS que getRanking.
 *
 * @param {string} alias
 * @returns {Promise<{ data: object | null, error: Error | null }>}
 */
export async function getPredictionByAlias(alias) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, alias, picks, puntos, created_at')
      .eq('alias', alias)
      .maybeSingle()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('[quinielas] getPredictionByAlias failed:', error.message)
    return { data: null, error }
  }
}
