import { useState, useEffect } from 'react'
import { getFixture } from '../services/partidos.js'
import { flag } from '../utils/flags.js'

// NOTA: el campo `estado` de cada partido es manual — lo actualiza el admin
// al resolver partidos con /api/admin/resolve-match. No se actualiza
// automáticamente cuando un partido arranca en la realidad. Un partido puede
// aparecer como 'programado' aunque esté en curso en ese momento. Esto es una
// limitación conocida; la resolución automática vía live-cache queda pendiente.

const formatLocalDate = (iso) =>
  new Date(iso).toLocaleString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function FixtureView({ onNavigate }) {
  const [partidos, setPartidos] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    getFixture().then(({ data }) => {
      setPartidos(data)
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
            <MatchCard key={p.numero} partido={p} />
          ))}
        </div>
      )}

    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────

function MatchCard({ partido }) {
  const { local, visitante, grupo, estado, fecha, resultado_local, resultado_visitante } = partido
  const isFinal = estado === 'finalizado'
  const isLive  = estado === 'en_curso'

  return (
    <div className={`sticker-card p-3 ${isLive ? 'bg-brand-coral/5' : 'bg-white'}`}>

      {/* Grupo + status/time */}
      <div className="flex items-center justify-between mb-2">
        <span className="pop-tag bg-brand-purple text-white border-brand-purple text-[10px]">
          Grupo {grupo}
        </span>

        {isLive ? (
          <span className="pop-tag bg-brand-coral text-white border-brand-coral text-[10px] animate-pulse">
            🔴 EN VIVO
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
          <span className="text-lg leading-none">{flag(local)}</span>
        </div>

        {isFinal || isLive ? (
          <>
            <span className="w-7 text-center font-display text-xl font-bold leading-none">
              {resultado_local ?? '?'}
            </span>
            <span className="font-display text-base text-ink/20">·</span>
            <span className="w-7 text-center font-display text-xl font-bold leading-none">
              {resultado_visitante ?? '?'}
            </span>
          </>
        ) : (
          <span className="w-12 text-center font-sans text-xs text-ink/30">vs</span>
        )}

        <div className="flex flex-1 items-center gap-1.5">
          <span className="text-lg leading-none">{flag(visitante)}</span>
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
