import { useState, useEffect } from 'react'
import { getFixture } from '../services/partidos.js'
import { getLiveMatches } from '../services/matches.js'
import { flagCode } from '../utils/flags.js'

const formatLocalDate = (iso) =>
  new Date(iso).toLocaleString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

// ── Cruce con /api/live ───────────────────────────────────────────────
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
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
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
  const [openFin,     setOpenFin]     = useState(false)  // colapsado por defecto
  const [openProx,    setOpenProx]    = useState(true)   // expandido por defecto

  useEffect(() => {
    Promise.all([getFixture(), getLiveMatches()])
      .then(([{ data: fix }, { data: live }]) => {
        setPartidos(fix)
        setLiveMatches(live)
        setLoading(false)
      })
  }, [])

  // Finalizados: orden cronológico tal como vienen de getFixture()
  const finalizados = partidos.filter(p => p.estado === 'finalizado')

  // Próximos: live siempre primero, luego cronológico
  const proximos = partidos
    .filter(p => p.estado !== 'finalizado')
    .sort((a, b) => {
      const aLive = !!findLiveMatch(a, liveMatches) || a.estado === 'en_curso'
      const bLive = !!findLiveMatch(b, liveMatches) || b.estado === 'en_curso'
      if (aLive && !bLive) return -1
      if (!aLive && bLive) return 1
      return new Date(a.fecha) - new Date(b.fecha)
    })

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

      {/* Acordeón */}
      {loading ? (
        <SkeletonList />
      ) : partidos.length === 0 ? (
        <div className="sticker-card bg-white p-6 text-center">
          <p className="font-display text-lg">Sin partidos cargados</p>
        </div>
      ) : (
        <div className="space-y-3">

          {/* Sección Próximos */}
          <AccordionSection
            title="Próximos"
            count={proximos.length}
            open={openProx}
            onToggle={() => setOpenProx(v => !v)}
          >
            {proximos.map(p => (
              <MatchCard
                key={p.numero}
                partido={p}
                liveMatch={findLiveMatch(p, liveMatches)}
              />
            ))}
          </AccordionSection>

          {/* Sección Finalizados */}
          <AccordionSection
            title="Finalizados"
            count={finalizados.length}
            open={openFin}
            onToggle={() => setOpenFin(v => !v)}
          >
            {finalizados.map(p => (
              <MatchCard
                key={p.numero}
                partido={p}
                liveMatch={findLiveMatch(p, liveMatches)}
              />
            ))}
          </AccordionSection>

        </div>
      )}

    </div>
  )
}

// ── AccordionSection ──────────────────────────────────────────────────

function AccordionSection({ title, count, open, onToggle, children }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="sticker-card w-full bg-brand-purple text-white p-3 flex items-center justify-between active:translate-y-0.5 transition-transform"
      >
        <span className="font-display text-sm tracking-wide">
          {title}
          <span className="ml-2 font-sans text-white/60 text-xs font-normal">({count})</span>
        </span>
        <span
          className="text-lg leading-none transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
        >
          ▾
        </span>
      </button>

      {/* Grid trick: anima suavemente sin JS de altura */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.32s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="space-y-2 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MatchCard ─────────────────────────────────────────────────────────

function MatchCard({ partido, liveMatch }) {
  const { local, visitante, grupo, estado, fecha, resultado_local, resultado_visitante } = partido

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
    <div className="space-y-3">
      {/* Skeleton de sección */}
      {[6, 4].map((count, si) => (
        <div key={si}>
          <div className="sticker-card bg-brand-purple/30 p-3 h-11 animate-pulse" />
          <div className="space-y-2 pt-2">
            {[...Array(count)].map((_, i) => (
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
        </div>
      ))}
    </div>
  )
}
