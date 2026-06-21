/**
 * api/admin/resolve-match.js — Vercel Serverless Function (admin-only)
 *
 * Resuelve un partido: actualiza resultado en 'partidos' y distribuye
 * puntos en todas las filas de 'quinielas'.
 *
 * Seguridad:
 *   - Requiere header x-admin-secret === process.env.ADMIN_SECRET (server-side, nunca expuesto)
 *   - Todas las escrituras usan SUPABASE_SERVICE_ROLE_KEY (bypasea RLS)
 *   - Idempotente: devuelve 409 si el partido ya está 'finalizado'
 *
 * Body esperado (JSON POST):
 *   { matchNumero: number, resultadoLocal: number, resultadoVisitante: number }
 *
 * Formato de picks en quinielas.picks:
 *   { "34": { "h": 0, "a": 0 }, "35": { "h": 1, "a": 2 }, ... }
 *   h = goles local, a = goles visitante. Clave = numero de partido como string.
 *
 * Sistema de puntos:
 *   3 pts → resultado exacto (local y visitante coinciden)
 *   1 pt  → tendencia correcta (mismo ganador o ambos predicen empate)
 *   0 pts → fallo total
 */

import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function outcome(local, visitante) {
  return local > visitante ? 'home' : local < visitante ? 'away' : 'draw'
}

function calcPoints(pick, realLocal, realVisitante) {
  if (pick.h === realLocal && pick.a === realVisitante) return 3
  if (outcome(pick.h, pick.a) === outcome(realLocal, realVisitante)) return 1
  return 0
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  // 1. Verificar admin secret — primer check, antes de cualquier otra operación
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { matchNumero, resultadoLocal, resultadoVisitante } = req.body ?? {}

  if (matchNumero == null || resultadoLocal == null || resultadoVisitante == null) {
    return res.status(400).json({
      error: 'Faltan campos requeridos: matchNumero, resultadoLocal, resultadoVisitante',
    })
  }

  const db = getAdminClient()

  // 2. Verificar que el partido existe y no está ya finalizado (idempotencia)
  const { data: partido, error: partidoErr } = await db
    .from('partidos')
    .select('id, estado, local, visitante')
    .eq('numero', matchNumero)
    .maybeSingle()

  if (partidoErr) return res.status(500).json({ error: partidoErr.message })
  if (!partido)   return res.status(404).json({ error: `Partido ${matchNumero} no encontrado` })

  if (partido.estado === 'finalizado') {
    return res.status(409).json({
      error: 'El partido ya está finalizado — no se recalculan puntos para evitar doble conteo',
    })
  }

  // 3. Actualizar el partido a 'finalizado' con resultado real
  const { error: updatePartidoErr } = await db
    .from('partidos')
    .update({
      estado:              'finalizado',
      resultado_local:     resultadoLocal,
      resultado_visitante: resultadoVisitante,
    })
    .eq('numero', matchNumero)

  if (updatePartidoErr) return res.status(500).json({ error: updatePartidoErr.message })

  // 4. Traer todas las quinielas y calcular puntos por pick
  const { data: quinielas, error: quinielasErr } = await db
    .from('quinielas')
    .select('id, picks, puntos')

  if (quinielasErr) return res.status(500).json({ error: quinielasErr.message })

  const key = String(matchNumero)
  let updated = 0
  const breakdown = { exactos: 0, tendencia: 0, fallidos: 0 }

  for (const q of quinielas) {
    const pick = q.picks?.[key]
    if (!pick || pick.h == null || pick.a == null) continue

    const pts = calcPoints(pick, resultadoLocal, resultadoVisitante)

    if (pts === 0) {
      breakdown.fallidos++
      continue
    }

    const { error: ptsErr } = await db
      .from('quinielas')
      .update({ puntos: (q.puntos ?? 0) + pts })
      .eq('id', q.id)

    if (ptsErr) {
      console.error(`[resolve-match] Error updating quiniela ${q.id}:`, ptsErr.message)
    } else {
      updated++
      if (pts === 3) breakdown.exactos++
      else           breakdown.tendencia++
    }
  }

  return res.status(200).json({
    ok:      true,
    partido: `${partido.local} vs ${partido.visitante}`,
    result:  { local: resultadoLocal, visitante: resultadoVisitante },
    puntos:  breakdown,
    updated,
  })
}
