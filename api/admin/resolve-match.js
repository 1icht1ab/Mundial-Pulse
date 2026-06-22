/**
 * api/admin/resolve-match.js — Vercel Serverless Function (admin-only)
 *
 * Resuelve un partido manualmente: actualiza resultado en 'partidos' y
 * distribuye puntos en todas las filas de 'quinielas'.
 *
 * La lógica de puntos vive en api/_lib/resolveMatch.js — este handler
 * solo se encarga de auth, validación HTTP y formato de respuesta.
 *
 * Seguridad:
 *   - Requiere header x-admin-secret === process.env.ADMIN_SECRET
 *   - Todas las escrituras usan SUPABASE_SERVICE_ROLE_KEY (bypasea RLS)
 *   - Idempotente: devuelve 409 si el partido ya está 'finalizado'
 *
 * Body esperado (JSON POST):
 *   { matchNumero: number, resultadoLocal: number, resultadoVisitante: number }
 */

import { createClient } from '@supabase/supabase-js'
import { resolveMatchPoints } from '../_lib/resolveMatch.js'

function getAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

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

  const db     = getAdminClient()
  const result = await resolveMatchPoints(db, matchNumero, resultadoLocal, resultadoVisitante)

  if (!result.ok) {
    return res.status(500).json({ error: result.error })
  }

  if (result.alreadyFinalizado) {
    return res.status(409).json({
      error: 'El partido ya está finalizado — no se recalculan puntos para evitar doble conteo',
    })
  }

  return res.status(200).json({
    ok:      true,
    partido: `${result.partido.local} vs ${result.partido.visitante}`,
    result:  { local: resultadoLocal, visitante: resultadoVisitante },
    puntos:  result.breakdown,
    updated: result.updated,
  })
}
