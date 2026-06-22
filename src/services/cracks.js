import { supabase } from '../lib/supabaseClient.js'

// ── Fecha de hoy en UTC (YYYY-MM-DD) — sirve como duelo_id diario ─────
function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

// ── Mapa de duelos temáticos por partido ──────────────────────────────
// Clave: 'local-visitante' tal cual está en la tabla partidos.
// Sin nombres de jugadores reales — solo arquetipos del fútbol.
const DUELO_MAP = {
  'Argentina-Austria': {
    pregunta: '¿Quién domina el partido?',
    opciones: [
      { id: 'campeon',   numero: 10, color: '#75AADB', nombre: 'El Campeón Defensor 🏆'    },
      { id: 'aspirante', numero: 9,  color: '#ED2939', nombre: 'El Aspirante Hambriento ⚡' },
    ],
  },
  'Francia-Irak': {
    pregunta: '¿Qué estilo gana hoy?',
    opciones: [
      { id: 'colectivo', numero: 8, color: '#002395', nombre: 'El Colectivo Elegante 🎨' },
      { id: 'guerrero',  numero: 7, color: '#CE1126', nombre: 'El Guerrero Sorpresa 🔥'  },
    ],
  },
  'Portugal-Uzbekistán': {
    pregunta: '¿Quién decide el partido?',
    opciones: [
      { id: 'estrella', numero: 7,  color: '#006600', nombre: 'La Estrella Individual ⭐' },
      { id: 'equipo',   numero: 11, color: '#1C86EE', nombre: 'El Equipo Unido 💪'        },
    ],
  },
  'Inglaterra-Ghana': {
    pregunta: '¿Qué gana hoy?',
    opciones: [
      { id: 'poderio', numero: 9,  color: '#CF081F', nombre: 'El Poderío Físico 💥' },
      { id: 'magia',   numero: 10, color: '#006B3F', nombre: 'La Magia Africana ✨'  },
    ],
  },
}

const FALLBACK_DUELO = {
  pregunta: '¿Qué decide un partido?',
  opciones: [
    { id: 'gol',     numero: 9, color: '#4ade80', nombre: 'El Gol Salvador ⚽'    },
    { id: 'defensa', numero: 1, color: '#f87171', nombre: 'La Defensa Heroica 🧤' },
  ],
}

// ── localStorage ───────────────────────────────────────────────────────
const lsKey = (dueloId) => `mp_crack_${dueloId}`

export function getVotoGuardado(dueloId) {
  return localStorage.getItem(lsKey(dueloId))  // opcionId | null
}

// ── Selección dinámica del duelo del día ──────────────────────────────
// Trae el primer partido NO finalizado de hoy (UTC) y busca el duelo
// temático correspondiente. Si no hay partido o no está en el mapa,
// usa el fallback genérico.
export async function getDueloDelDia() {
  const hoy = hoyISO()

  const { data, error } = await supabase
    .from('partidos')
    .select('local, visitante')
    .gte('fecha', `${hoy}T00:00:00+00:00`)
    .lt('fecha', `${hoy}T24:00:00+00:00`)
    .neq('estado', 'finalizado')
    .order('fecha', { ascending: true })
    .limit(1)

  if (error) console.error('[cracks] getDueloDelDia error:', error.message)

  const partido = data?.[0]
  const duelo   = partido
    ? (DUELO_MAP[`${partido.local}-${partido.visitante}`] ?? FALLBACK_DUELO)
    : FALLBACK_DUELO

  return { dueloId: hoy, duelo }
}

// ── Conteo de votos agrupados por opcionId ────────────────────────────
export async function getDuelo(dueloId) {
  const { data, error } = await supabase
    .from('votos_crack')
    .select('opcion')
    .eq('duelo_id', dueloId)

  if (error) {
    console.error('[cracks] getDuelo error:', error.message)
    return { data: null, error }
  }

  const counts = {}
  for (const row of data) {
    counts[row.opcion] = (counts[row.opcion] ?? 0) + 1
  }
  return { data: counts, error: null }
}

// ── Votar ──────────────────────────────────────────────────────────────
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
