import { supabase } from '../lib/supabaseClient.js'

// ── Fecha de hoy en UTC (YYYY-MM-DD) — sirve como duelo_id diario ─────
function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

// ── Colores oficiales de camiseta por selección ────────────────────────
// Clave: nombre exacto tal cual aparece en la columna local/visitante de partidos.
const TEAM_COLORS = {
  'Argentina':            { primary: '#75AADB', secondary: '#FFFFFF' },
  'Austria':              { primary: '#ED2939', secondary: '#FFFFFF' },
  'Francia':              { primary: '#002395', secondary: '#FFFFFF' },
  'Irak':                 { primary: '#007A3D', secondary: '#FFFFFF' },
  'Noruega':              { primary: '#EF2B2D', secondary: '#003087' },
  'Senegal':              { primary: '#00853F', secondary: '#FFFFFF' },
  'Jordania':             { primary: '#007A3D', secondary: '#FFFFFF' },
  'Argelia':              { primary: '#006233', secondary: '#FFFFFF' },
  'Portugal':             { primary: '#006600', secondary: '#FF0000' },
  'Uzbekistán':           { primary: '#1EB53A', secondary: '#FFFFFF' },
  'Inglaterra':           { primary: '#FFFFFF', secondary: '#CF081F' },
  'Ghana':                { primary: '#006B3F', secondary: '#FCD116' },
  'Panamá':               { primary: '#D21034', secondary: '#FFFFFF' },
  'Croacia':              { primary: '#FF0000', secondary: '#FFFFFF' },
  'Colombia':             { primary: '#FCD116', secondary: '#003087' },
  'RD Congo':             { primary: '#007FFF', secondary: '#F7D618' },
  'España':               { primary: '#FF0000', secondary: '#FFC400' },
  'Arabia Saudita':       { primary: '#006C35', secondary: '#FFFFFF' },
  'Bélgica':              { primary: '#000000', secondary: '#EF3340' },
  'Irán':                 { primary: '#239F40', secondary: '#FFFFFF' },
  'Uruguay':              { primary: '#5EB6E4', secondary: '#FFFFFF' },
  'Cabo Verde':           { primary: '#003893', secondary: '#CF2027' },
  'Ecuador':              { primary: '#FFD100', secondary: '#003087' },
  'Curaçao':              { primary: '#003087', secondary: '#F7D618' },
  'Nueva Zelanda':        { primary: '#000000', secondary: '#FFFFFF' },
  'Egipto':               { primary: '#CE1126', secondary: '#FFFFFF' },
  'Suiza':                { primary: '#FF0000', secondary: '#FFFFFF' },
  'Canadá':               { primary: '#FF0000', secondary: '#FFFFFF' },
  'Bosnia y Herzegovina': { primary: '#002395', secondary: '#FFC400' },
  'Catar':                { primary: '#8D1B3D', secondary: '#FFFFFF' },
}

const teamColor = (name) => TEAM_COLORS[name]?.primary ?? '#CCFF00'

const FALLBACK_DUELO = {
  pregunta: '¿Cuál es tu equipo favorito?',
  opciones: [
    { id: 'equipo_local',     nombre: 'Equipo Local',     numero: 9, color: '#CCFF00' },
    { id: 'equipo_visitante', nombre: 'Equipo Visitante', numero: 1, color: '#FF6B6B' },
  ],
}

// ── localStorage ───────────────────────────────────────────────────────
const lsKey = (dueloId) => `mp_crack_${dueloId}`

export function getVotoGuardado(dueloId) {
  return localStorage.getItem(lsKey(dueloId))  // opcionId | null
}

// ── Selección dinámica del duelo del día ──────────────────────────────
// Trae el primer partido NO finalizado de hoy (UTC) y construye las
// dos opciones con colores de camiseta del equipo.
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
  const duelo = partido
    ? {
        pregunta: '¿Quién va a ganar hoy?',
        opciones: [
          { id: partido.local,     nombre: partido.local,     numero: 9, color: teamColor(partido.local)     },
          { id: partido.visitante, nombre: partido.visitante, numero: 1, color: teamColor(partido.visitante) },
        ],
      }
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
