import { supabase } from '../lib/supabaseClient.js'

export const DUELO_ID = '2026-06-22'

export const OPCIONES = {
  delantero: { label: 'El Delantero Killer', numero: '9', fill: '#CCFF00' },
  arquero:   { label: 'El Arquero Muralla',  numero: '1', fill: '#FF6B6B' },
}

const lsKey = (dueloId) => `mp_crack_${dueloId}`

export function getVotoGuardado(dueloId) {
  return localStorage.getItem(lsKey(dueloId))  // 'delantero' | 'arquero' | null
}

export async function getDuelo(dueloId) {
  const { data, error } = await supabase
    .from('votos_crack')
    .select('opcion')
    .eq('duelo_id', dueloId)

  if (error) {
    console.error('[cracks] getDuelo error:', error.message)
    return { data: null, error }
  }

  const counts = Object.fromEntries(Object.keys(OPCIONES).map(k => [k, 0]))
  for (const row of data) {
    if (counts[row.opcion] !== undefined) counts[row.opcion]++
  }
  return { data: counts, error: null }
}

export async function votarCrack(dueloId, opcion) {
  if (getVotoGuardado(dueloId)) {
    return { error: new Error('ya-votado') }
  }

  const { error } = await supabase
    .from('votos_crack')
    .insert({ duelo_id: dueloId, opcion })

  if (!error) {
    localStorage.setItem(lsKey(dueloId), opcion)
  } else {
    console.error('[cracks] votarCrack error:', error.message)
  }

  return { error: error ?? null }
}
