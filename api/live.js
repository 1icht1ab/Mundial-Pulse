/**
 * api/live.js — Vercel Serverless Function
 *
 * Proxy de partidos del Mundial 2026 con caché en Supabase.
 *
 * Env vars requeridas (cargar con `vercel env add`):
 *   LIVE_API_KEY              → API key de v3.football.api-sports.io
 *   SUPABASE_URL              → https://dsplubxtterpmvkdbthd.supabase.co
 *   SUPABASE_ANON_KEY         → anon key (solo lectura; política SELECT pública)
 *   SUPABASE_SERVICE_ROLE_KEY → service role key (bypasea RLS; solo para escritura)
 *
 * Flujo:
 *   1. Lee live_cache de Supabase
 *   2. Si tiene < 60s → devuelve cache (sin llamar a la API externa)
 *   3. Si está vencido → llama a API-Football, transforma, guarda y devuelve
 *   4. Si la API externa falla → devuelve el cache vencido (nunca 500)
 *   5. Si no hay cache en absoluto → devuelve [] (nunca 500)
 */

import { createClient } from '@supabase/supabase-js'

// ── Constantes ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60_000                             // 60 s
const WC_LEAGUE    = 1                                  // FIFA World Cup en API-Football
const WC_SEASON    = 2026
const API_BASE     = 'https://v3.football.api-sports.io'

const LIVE_STATUSES     = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT'])
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

// ── Clientes Supabase (principio de mínimo privilegio) ───────────────
// READ  — anon key. RLS permite SELECT público en live_cache.
// WRITE — service_role key. Bypasea RLS; es el único que puede UPSERT.
//         Nunca sale al cliente: solo existe en el entorno de Vercel.
function getReadClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_URL / SUPABASE_ANON_KEY')
  return createClient(url, key)
}

function getWriteClient() {
  const url        = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Transformar fixture de API-Football al shape de matches.js ────────
function transform(f) {
  const status = f.fixture.status.short
  const goalsKnown = f.goals.home !== null || f.goals.away !== null
  return {
    n:      f.fixture.id,
    home:   f.teams.home.name,
    away:   f.teams.away.name,
    time:   new Date(f.fixture.date).toLocaleTimeString('es-AR', {
              timeZone: 'America/Argentina/Buenos_Aires',
              hour: '2-digit', minute: '2-digit',
            }),
    date:   f.fixture.date.slice(0, 10),
    group:  f.league.round ?? 'Grupo',
    live:   LIVE_STATUSES.has(status),
    minute: f.fixture.status.elapsed != null ? `${f.fixture.status.elapsed}'` : null,
    result: goalsKnown ? { h: f.goals.home ?? 0, a: f.goals.away ?? 0 } : null,
    status: LIVE_STATUSES.has(status)     ? 'live'
          : FINISHED_STATUSES.has(status) ? 'finished'
          : 'upcoming',
  }
}

// ── Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const readDb  = getReadClient()
  const writeDb = getWriteClient()

  // 1. Leer cache (anon key — política SELECT pública) ─────────────────
  const { data: cacheRow, error: cacheErr } = await readDb
    .from('live_cache')
    .select('payload, updated_at')
    .eq('id', 1)
    .maybeSingle()

  if (cacheErr) {
    console.error('[api/live] Supabase cache read error:', cacheErr.message)
  }

  const cacheAgeMs = cacheRow
    ? Date.now() - new Date(cacheRow.updated_at).getTime()
    : Infinity

  // 2. Cache fresco → servir directamente ─────────────────────────────
  if (!cacheErr && cacheRow && cacheAgeMs < CACHE_TTL_MS) {
    return res.status(200).json(cacheRow.payload)
  }

  // 3. Cache vencido → llamar a API-Football ──────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  let freshMatches = null

  if (!process.env.LIVE_API_KEY) {
    console.warn('[api/live] LIVE_API_KEY not set — skipping API call')
  } else {
    try {
      const apiRes = await fetch(
        `${API_BASE}/fixtures?league=${WC_LEAGUE}&season=${WC_SEASON}&date=${today}`,
        { headers: { 'x-apisports-key': process.env.LIVE_API_KEY } },
      )

      if (!apiRes.ok) throw new Error(`API-Football HTTP ${apiRes.status}`)

      const json = await apiRes.json()
      if (!Array.isArray(json.response)) {
        throw new Error(`Unexpected shape: ${JSON.stringify(json).slice(0, 80)}`)
      }

      freshMatches = json.response.map(transform)

      // 4. Guardar cache (service_role — bypasea RLS) ───────────────
      const { error: upsertErr } = await writeDb
        .from('live_cache')
        .upsert({ id: 1, payload: freshMatches, updated_at: new Date().toISOString() })

      if (upsertErr) {
        console.error('[api/live] Cache upsert failed:', upsertErr.message)
      }

      return res.status(200).json(freshMatches)
    } catch (err) {
      console.error('[api/live] API-Football fetch failed:', err.message)
    }
  }

  // 5. API falló → devolver cache vencido si existe (nunca 500) ───────
  if (cacheRow?.payload) {
    console.warn('[api/live] Serving stale cache due to API failure or missing key')
    return res.status(200).json(cacheRow.payload)
  }

  // 6. Sin cache y sin API → [] ────────────────────────────────────────
  console.error('[api/live] No cache and no API data available — returning []')
  return res.status(200).json([])
}
