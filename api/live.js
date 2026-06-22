/**
 * api/live.js — Vercel Serverless Function
 *
 * Proxy de partidos del Mundial 2026 con caché en Supabase.
 * Además detecta partidos con status FT en la respuesta de API-Football
 * y los resuelve automáticamente (estado → 'finalizado' + puntos quiniela).
 *
 * Env vars requeridas:
 *   LIVE_API_KEY              → API key de v3.football.api-sports.io
 *   SUPABASE_URL              → https://dsplubxtterpmvkdbthd.supabase.co
 *   SUPABASE_ANON_KEY         → anon key (lectura de live_cache)
 *   SUPABASE_SERVICE_ROLE_KEY → service role key (escritura + auto-resolve)
 *   ADMIN_SECRET              → secret para el endpoint de test ?_ft_test=1
 *
 * Flujo:
 *   1. Lee live_cache de Supabase
 *   2. Si tiene < 60s → devuelve cache (sin llamar a la API ni detectar FT)
 *   3. Si está vencido → llama ?live=all, filtra league.id=1
 *      a) Separa en liveNow (en curso) y justFinished (FT/AET/PEN)
 *      b) Para cada justFinished → auto-resolve (side effect, no afecta respuesta)
 *      c) Guarda cache con liveNow y devuelve liveNow
 *   4. Si la API falla → devuelve cache si tiene < 10min; si no, []
 */

import { createClient } from '@supabase/supabase-js'
import { resolveMatchPoints } from './_lib/resolveMatch.js'

// ── Constantes ────────────────────────────────────────────────────────
const CACHE_TTL_MS  = 60_000
const STALE_MAX_MS  = 10 * 60_000
const WC_LEAGUE     = 1
const API_BASE      = 'https://v3.football.api-sports.io'

// Statuses que se consideran "partido en curso" → se devuelven al cliente
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT'])

// Statuses que significan partido terminado → disparan auto-resolve
const FT_STATUSES   = new Set(['FT', 'AET', 'PEN'])

// ── Cruce de nombres ES↔EN (mismo SYNONYMS que FixtureView.jsx) ──────
// La API devuelve nombres en inglés; la DB los tiene en español.
const SYNONYMS = {
  'espana':         'spain',
  'belgica':        'belgium',
  'irak':           'iraq',
  'noruega':        'norway',
  'jordania':       'jordan',
  'argelia':        'algeria',
  'arabia saudita': 'saudi arabia',
  'cabo verde':     'cape verde',
  'uzbekistan':     'uzbekistan',
  'inglaterra':     'england',
  'panama':         'panama',
  'croacia':        'croatia',
  'rd congo':       'dr congo',
  'francia':        'france',
}

function normalizeTeam(s) {
  const n = s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, ' ')
  return SYNONYMS[n] ?? n
}

// ── Clientes Supabase (principio de mínimo privilegio) ───────────────
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

// ── Transformar fixture al shape que consume el cliente ───────────────
function transform(f) {
  const status    = f.fixture.status.short
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
    status: LIVE_STATUSES.has(status) ? 'live' : FT_STATUSES.has(status) ? 'finished' : 'upcoming',
  }
}

// ── Auto-resolve de partidos FT ───────────────────────────────────────
// Recibe los fixtures con status FT/AET/PEN de la respuesta de API-Football,
// los cruza con la tabla `partidos` (nombres ES↔EN) y resuelve los que
// todavía no están 'finalizado'. Silencioso si ya estaban resueltos.
async function autoResolveFinished(db, fixtures) {
  // Trae solo partidos aún no finalizados (volumen pequeño, < 100 filas)
  const { data: pending, error } = await db
    .from('partidos')
    .select('numero, local, visitante')
    .in('estado', ['programado', 'en_curso'])

  if (error) {
    console.error('[AUTO-RESOLVE] DB fetch error:', error.message)
    return
  }

  if (!pending?.length) return

  for (const f of fixtures) {
    const homeApi = f.teams.home.name
    const awayApi = f.teams.away.name
    const goalsH  = f.goals?.home ?? 0
    const goalsA  = f.goals?.away ?? 0

    const partido = pending.find(p =>
      normalizeTeam(p.local)     === normalizeTeam(homeApi) &&
      normalizeTeam(p.visitante) === normalizeTeam(awayApi),
    )

    if (!partido) continue  // ya resuelto o no existe en partidos

    const result = await resolveMatchPoints(db, partido.numero, goalsH, goalsA)

    if (!result.ok) {
      console.error('[AUTO-RESOLVE] Error:', homeApi, 'vs', awayApi, '—', result.error)
    } else if (!result.alreadyFinalizado) {
      console.log(
        '[AUTO-RESOLVE]',
        `${homeApi} vs ${awayApi}`,
        `→ ${goalsH}-${goalsA}`,
        `| partido #${partido.numero}`,
        `| quinielas actualizadas: ${result.updated}`,
        result.breakdown,
      )
    }
  }
}

// ── Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const readDb  = getReadClient()
  const writeDb = getWriteClient()

  // ── Modo test: ?_ft_test=1 — inyecta un fixture FT sintético ─────────
  // Requiere x-admin-secret para evitar abuso. Solo para verificar que
  // auto-resolve funciona en producción sin esperar un partido real.
  // Ejemplo: GET /api/live?_ft_test=1&home=Argentina&away=Austria&gh=2&ga=1
  if (req.query._ft_test === '1') {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const home = req.query.home ?? 'New Zealand'
    const away = req.query.away ?? 'Egypt'
    const gh   = parseInt(req.query.gh ?? '1', 10)
    const ga   = parseInt(req.query.ga ?? '0', 10)

    await autoResolveFinished(writeDb, [{
      fixture: { id: 0, status: { short: 'FT', elapsed: 90 } },
      league:  { id: WC_LEAGUE },
      teams:   { home: { name: home }, away: { name: away } },
      goals:   { home: gh, away: ga },
    }])

    return res.status(200).json({ ok: true, test: true, home, away, gh, ga })
  }

  // 1. Leer cache ────────────────────────────────────────────────────────
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

  // 2. Cache fresco → servir sin detección FT (el próximo request lo hará) ─
  if (!cacheErr && cacheRow && cacheAgeMs < CACHE_TTL_MS) {
    return res.status(200).json(cacheRow.payload)
  }

  // 3. Cache vencido → llamar a API-Football ────────────────────────────
  let freshMatches = null

  if (!process.env.LIVE_API_KEY) {
    console.warn('[api/live] LIVE_API_KEY not set — skipping API call')
  } else {
    try {
      const apiRes = await fetch(
        `${API_BASE}/fixtures?live=all`,
        { headers: { 'x-apisports-key': process.env.LIVE_API_KEY } },
      )

      if (!apiRes.ok) throw new Error(`API-Football HTTP ${apiRes.status}`)

      const json = await apiRes.json()
      if (!Array.isArray(json.response)) {
        throw new Error(`Unexpected shape: ${JSON.stringify(json).slice(0, 80)}`)
      }

      // Filtrar solo World Cup (id=1)
      const allWc = json.response.filter(f => f.league.id === WC_LEAGUE)

      // Separar en curso vs recién terminados
      const justFinished = allWc.filter(f => FT_STATUSES.has(f.fixture.status.short))
      const liveNow      = allWc.filter(f => LIVE_STATUSES.has(f.fixture.status.short))

      // Auto-resolve como side effect (no bloquea la respuesta si hay error)
      if (justFinished.length > 0) {
        await autoResolveFinished(writeDb, justFinished)
      }

      freshMatches = liveNow.map(transform)

      // Guardar cache con solo los partidos en curso
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

  // 4. API falló → cache reciente como fallback seguro ──────────────────
  if (cacheRow?.payload && cacheAgeMs < STALE_MAX_MS) {
    console.warn(`[api/live] API unavailable — serving ${Math.round(cacheAgeMs / 1000)}s stale cache`)
    return res.status(200).json(cacheRow.payload)
  }

  // 5. Cache ausente o muy vencido → [] (evita partidos fantasma)
  console.warn('[api/live] Stale cache too old or absent — returning []')
  return res.status(200).json([])
}
