/**
 * api/_lib/resolveMatch.js — Helper compartido
 *
 * resolveMatchPoints: actualiza partido a 'finalizado' y distribuye puntos en quinielas.
 * Importado por api/admin/resolve-match.js y por api/live.js (auto-resolve FT).
 *
 * Sistema de puntos:
 *   3 pts → resultado exacto (local y visitante coinciden)
 *   1 pt  → tendencia correcta (mismo ganador o ambos empatan)
 *   0 pts → fallo total
 */

function outcome(local, visitante) {
  return local > visitante ? 'home' : local < visitante ? 'away' : 'draw'
}

function calcPoints(pick, realLocal, realVisitante) {
  if (pick.h === realLocal && pick.a === realVisitante) return 3
  if (outcome(pick.h, pick.a) === outcome(realLocal, realVisitante)) return 1
  return 0
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db   service_role client
 * @param {number} matchNumero
 * @param {number} resultadoLocal
 * @param {number} resultadoVisitante
 * @returns {Promise<{
 *   ok: boolean,
 *   alreadyFinalizado?: boolean,
 *   partido?: { local: string, visitante: string },
 *   updated?: number,
 *   breakdown?: { exactos: number, tendencia: number, fallidos: number },
 *   error?: string,
 * }>}
 */
export async function resolveMatchPoints(db, matchNumero, resultadoLocal, resultadoVisitante) {
  // 1. Verificar que el partido existe y no está ya finalizado (idempotencia)
  const { data: partido, error: partidoErr } = await db
    .from('partidos')
    .select('id, estado, local, visitante')
    .eq('numero', matchNumero)
    .maybeSingle()

  if (partidoErr) return { ok: false, error: partidoErr.message }
  if (!partido)   return { ok: false, error: `Partido ${matchNumero} no encontrado` }
  if (partido.estado === 'finalizado') return { ok: true, alreadyFinalizado: true }

  // 2. Actualizar el partido a 'finalizado' con el resultado real
  const { error: updateErr } = await db
    .from('partidos')
    .update({
      estado:              'finalizado',
      resultado_local:     resultadoLocal,
      resultado_visitante: resultadoVisitante,
    })
    .eq('numero', matchNumero)

  if (updateErr) return { ok: false, error: updateErr.message }

  // 3. Traer todas las quinielas y distribuir puntos
  const { data: quinielas, error: quinielasErr } = await db
    .from('quinielas')
    .select('id, picks, puntos')

  if (quinielasErr) return { ok: false, error: quinielasErr.message }

  const key = String(matchNumero)
  let updated = 0
  const breakdown = { exactos: 0, tendencia: 0, fallidos: 0 }

  for (const q of quinielas) {
    const pick = q.picks?.[key]
    if (!pick || pick.h == null || pick.a == null) continue

    const pts = calcPoints(pick, resultadoLocal, resultadoVisitante)

    if (pts === 0) { breakdown.fallidos++; continue }

    const { error: ptsErr } = await db
      .from('quinielas')
      .update({ puntos: (q.puntos ?? 0) + pts })
      .eq('id', q.id)

    if (ptsErr) {
      console.error(`[resolveMatchPoints] Error updating quiniela ${q.id}:`, ptsErr.message)
    } else {
      updated++
      if (pts === 3) breakdown.exactos++
      else           breakdown.tendencia++
    }
  }

  return {
    ok: true,
    alreadyFinalizado: false,
    partido: { local: partido.local, visitante: partido.visitante },
    updated,
    breakdown,
  }
}
