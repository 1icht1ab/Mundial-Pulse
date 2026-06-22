import { supabase } from '../lib/supabaseClient.js'

// ── localStorage keys ──────────────────────────────────────────────────
const LS_USER_ID       = 'mp_usuario_id'
const LS_PACK_COUNT    = 'mp_packs'
const LS_PACK_DAILY    = 'mp_pack_daily'
const LS_PACK_QUINIELA = 'mp_pack_quiniela'
const LS_PACK_ARCADE   = 'mp_pack_arcade'

function hoy() {
  return new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
}

// ── UUID anónimo ───────────────────────────────────────────────────────
// Identifica a este navegador/dispositivo. No está ligado a auth real.
export function getOrCreateUserId() {
  let id = localStorage.getItem(LS_USER_ID)
  if (!id) {
    id = crypto.randomUUID?.() ?? `u-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(LS_USER_ID, id)
  }
  return id
}

// ── Pack count ─────────────────────────────────────────────────────────
export function getPackCount() {
  return Math.max(0, Number(localStorage.getItem(LS_PACK_COUNT) ?? 0))
}

function addPacks(n) {
  localStorage.setItem(LS_PACK_COUNT, String(getPackCount() + n))
}

function consumePack() {
  const n = getPackCount()
  if (n <= 0) return false
  localStorage.setItem(LS_PACK_COUNT, String(n - 1))
  return true
}

// ── Grant helpers (idempotentes por día calendario) ────────────────────

// Llamar al montar StickersView — 1 sobre gratis por día
export function grantDailyPack() {
  if (localStorage.getItem(LS_PACK_DAILY) !== hoy()) {
    localStorage.setItem(LS_PACK_DAILY, hoy())
    addPacks(1)
    return true
  }
  return false
}

// Llamar tras enviar una quiniela exitosamente
export function grantQuinielaPack() {
  if (localStorage.getItem(LS_PACK_QUINIELA) !== hoy()) {
    localStorage.setItem(LS_PACK_QUINIELA, hoy())
    addPacks(1)
    return true
  }
  return false
}

// Llamar tras jugar el Arcade (primer pop del día)
export function grantArcadePack() {
  if (localStorage.getItem(LS_PACK_ARCADE) !== hoy()) {
    localStorage.setItem(LS_PACK_ARCADE, hoy())
    addPacks(1)
    return true
  }
  return false
}

// ── Supabase queries ───────────────────────────────────────────────────
export async function getCatalogo() {
  const { data, error } = await supabase
    .from('figuritas')
    .select('*')
  if (error) throw error
  return data ?? []
}

// Devuelve [{ figurita_id, cantidad }] del usuario
export async function getColeccion(usuarioId) {
  const { data, error } = await supabase
    .from('coleccion')
    .select('figurita_id, cantidad')
    .eq('usuario_id', usuarioId)
  if (error) throw error
  return data ?? []
}

// ── Abrir sobre ────────────────────────────────────────────────────────
const PESOS = { comun: 60, rara: 30, epica: 10 }

function weightedPick(catalogo) {
  const totalW = catalogo.reduce((s, f) => s + (PESOS[f.rareza] ?? 10), 0)
  let r = Math.random() * totalW
  for (const f of catalogo) {
    r -= PESOS[f.rareza] ?? 10
    if (r <= 0) return f
  }
  return catalogo[catalogo.length - 1]
}

// Elige 5 figuritas ponderadas por rareza, hace upsert en coleccion,
// devuelve las 5 para mostrar la animación de apertura.
export async function abrirSobre(usuarioId) {
  if (!consumePack()) throw new Error('No hay sobres disponibles')

  const catalogo = await getCatalogo()

  // dato_inutil solo aparece si el usuario ya envió al menos una quiniela
  const hasQuiniela = localStorage.getItem('mp_quiniela') !== null
  const pool = hasQuiniela ? catalogo : catalogo.filter(f => f.ilustracion !== 'dato_inutil')

  const picks    = Array.from({ length: 5 }, () => weightedPick(pool))
  const ids      = picks.map(p => p.id)

  const { error } = await supabase.rpc('upsert_coleccion', {
    p_usuario_id: usuarioId,
    p_ids:        ids,
  })

  if (error) {
    addPacks(1) // revertir si falla el write
    throw error
  }

  return picks
}
