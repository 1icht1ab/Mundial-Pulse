import { useState, useEffect } from 'react'
import { getFixture } from '../services/partidos.js'
import { getLiveMatches } from '../services/matches.js'
import { flagCode } from '../utils/flags.js'

// NOTA: el campo `estado` de cada partido es manual — lo actualiza el admin
// al resolver partidos con /api/admin/resolve-match. No se actualiza
// automáticamente cuando un partido arranca en la realidad. Un partido puede
// aparecer como 'programado' aunque esté en curso en ese momento. Esto es una
// limitación conocida; el cruce con /api/live (abajo) compensa este gap.

const formatLocalDate = (iso) =>
  new Date(iso).toLocaleString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

// ── Cruce con /api/live ───────────────────────────────────────────────
// La API devuelve nombres en inglés; la DB los tiene en español.
// Se normalizan quitando tildes/mayúsculas y se aplica un diccionario
// de sinónimos ES→EN para los casos que no coinciden por transliteración.

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

const normalizeTeam = (s) => {
  const n = s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, ' ')
  return SYNONYMS[n] ?? n
}

function findLiveMatch(partido, liveMatches) {
  const ln = normalizeTeam(partido.local)
  const vn = normalizeTeam(partido.visitante)
  return liveMatches.find(m =>
    normalizeTeam(m.home) === ln && normalizeTeam(m.away) === vn
  ) ?? null
}

// ── Componente principal ─────────────────────────────────────────────

export default function FixtureView({ onNavigate }) {
  const [partidos,    setPartidos]    = useState([])
  const [liveMatches, setLiveMatches] = useState([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getFixture(), getLiveMatches()])
      .then(([{ data: fix }, { data: live }]) => {
        setPartidos(fix)
        setLiveMatches(live)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="sticker-card bg-brand-purple p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onNavigate?.('hoy')}
            className="text-sm text-white/70 hover:text-white font-sans transition-colors"
          >
            ← Volver
          </button>
          <span className="text-2xl">📅</span>
          <span className="font-sans text-sm text-white/70">
            {partidos.length} partidos
          </span>
        </div>
        <h1 className="font-display text-xl tracking-wide text-center">FIXTURE</h1>
        <p className="mt-1 text-xs text-white/60 font-sans text-center normal-case tracking-normal">
          Orden cronológico · Hora local de tu navegador
        </p>
      </div>

      {/* Match list */}
      {loading ? (
        <SkeletonList />
      ) : partidos.length === 0 ? (
        <div className="sticker-card bg-white p-6 text-center">
          <p className="font-display text-lg">Sin partidos cargados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {partidos.map(p => (
            <MatchCard
              key={p.numero}
              partido={p}
              liveMatch={findLiveMatch(p, liveMatches)}
            />
          ))}
        </div>
      )}

    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────

function MatchCard({ partido, liveMatch }) {
  const { local, visitante, grupo, estado, fecha, resultado_local, resultado_visitante } = partido

  // liveMatch tiene precedencia: permite EN VIVO aunque partidos.estado
  // todavía diga 'programado' (el campo estado es manual, no auto-actualizado).
  const isFinal    = !liveMatch && estado === 'finalizado'
  const isLive     = !!liveMatch || estado === 'en_curso'
  const scoreH     = liveMatch ? (liveMatch.result?.h ?? '?') : resultado_local
  const scoreA     = liveMatch ? (liveMatch.result?.a ?? '?') : resultado_visitante
  const liveMinute = liveMatch?.minute ?? null
  const localCode     = flagCode(local)
  const visitanteCode = flagCode(visitante)

  return (
    <div className={`sticker-card p-3 ${isLive ? 'bg-brand-coral/5' : 'bg-white'}`}>

      {/* Grupo + status/time */}
      <div className="flex items-center justify-between mb-2">
        <span className="pop-tag bg-brand-purple text-white border-brand-purple text-[10px]">
          Grupo {grupo}
        </span>

        {isLive ? (
          <span className="pop-tag bg-brand-coral text-white border-brand-coral text-[10px] animate-pulse">
            🔴 EN VIVO{liveMinute ? ` · ${liveMinute}` : ''}
          </span>
        ) : isFinal ? (
          <span className="pop-tag bg-ink/10 text-ink/50 border-ink/10 text-[10px]">
            Finalizado
          </span>
        ) : (
          <span className="font-sans text-[10px] text-ink/50">
            {formatLocalDate(fecha)}
          </span>
        )}
      </div>

      {/* Teams + score or "vs" */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center justify-end gap-1.5">
          <span className="font-display text-sm leading-tight text-right">{local}</span>
          {localCode && (
            <span className={`fi fi-${localCode}`} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
          )}
        </div>

        {isFinal || isLive ? (
          <>
            <span className="w-7 text-center font-display text-xl font-bold leading-none">
              {scoreH ?? '?'}
            </span>
            <span className="font-display text-base text-ink/20">·</span>
            <span className="w-7 text-center font-display text-xl font-bold leading-none">
              {scoreA ?? '?'}
            </span>
          </>
        ) : (
          <span className="w-12 text-center font-sans text-xs text-ink/30">vs</span>
        )}

        <div className="flex flex-1 items-center gap-1.5">
          {visitanteCode && (
            <span className={`fi fi-${visitanteCode}`} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
          )}
          <span className="font-display text-sm leading-tight">{visitante}</span>
        </div>
      </div>

      {/* Finished matches: show date below */}
      {isFinal && (
        <p className="mt-1.5 text-center font-sans text-[10px] text-ink/30">
          {formatLocalDate(fecha)}
        </p>
      )}
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="sticker-card bg-white/60 p-3 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-16 rounded-full bg-ink/10" />
            <div className="h-4 w-24 rounded-full bg-ink/10" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 flex-1 rounded bg-ink/10" />
            <div className="h-6 w-12 rounded bg-ink/10" />
            <div className="h-4 flex-1 rounded bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
