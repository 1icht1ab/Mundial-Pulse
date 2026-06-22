import { useState, useEffect } from 'react'
import { getDueloDelDia, getDuelo, votarCrack, getVotoGuardado } from '../services/cracks.js'
import { flagEmoji } from '../utils/flags.js'

const POLL_MS = 30_000

export default function CracksModal({ onClose }) {
  const [dueloId, setDueloId] = useState(null)
  const [duelo,   setDuelo]   = useState(null)   // { pregunta, opciones[] }
  const [votes,   setVotes]   = useState({})
  const [voted,   setVoted]   = useState(null)
  const [voting,  setVoting]  = useState(false)
  const [loading, setLoading] = useState(true)

  // Init: resolve today's match → duelo temático → vote counts
  useEffect(() => {
    async function init() {
      const { dueloId: id, duelo: d } = await getDueloDelDia()
      setDueloId(id)
      setDuelo(d)
      setVoted(getVotoGuardado(id))
      const { data } = await getDuelo(id)
      if (data) setVotes(data)
      setLoading(false)
    }
    init()
  }, [])

  // 30s polling — starts once dueloId is resolved
  useEffect(() => {
    if (!dueloId) return
    const t = setInterval(async () => {
      const { data } = await getDuelo(dueloId)
      if (data) setVotes(data)
    }, POLL_MS)
    return () => clearInterval(t)
  }, [dueloId])

  async function handleVote(opcionId) {
    if (voted || voting || !dueloId) return
    setVoting(true)
    // Optimistic
    setVotes(prev => ({ ...prev, [opcionId]: (prev[opcionId] ?? 0) + 1 }))
    setVoted(opcionId)
    const { error } = await votarCrack(dueloId, opcionId)
    if (error && error.message !== 'ya-votado') {
      // Rollback
      setVotes(prev => ({ ...prev, [opcionId]: Math.max(0, (prev[opcionId] ?? 1) - 1) }))
      setVoted(null)
    } else {
      const { data } = await getDuelo(dueloId)
      if (data) setVotes(data)
    }
    setVoting(false)
  }

  if (loading || !duelo) return <CracksSkeleton onClose={onClose} />

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-ink/60" onClick={onClose} />

      {/* Modal card */}
      <div
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2
                   rounded-sticker border-[4px] border-ink bg-main-cream
                   shadow-sticker-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b-[3px] border-ink bg-brand-lime px-4 pb-3 pt-4">
          <div>
            <h2 className="font-display text-xl tracking-wide text-ink">
              ¿Quién gana hoy? ⚽
            </h2>
            <p className="mt-0.5 font-sans text-xs text-ink/70">{duelo.pregunta}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-3 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full
                       border-[3px] border-ink bg-white font-bold leading-none text-ink
                       shadow-sticker-sm transition-all active:translate-y-px active:shadow-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          {/* Jersey duel */}
          <div className="grid grid-cols-2 gap-3">
            {duelo.opciones.map(opcion => (
              <JerseyCard
                key={opcion.id}
                id={opcion.id}
                opcion={opcion}
                voted={voted}
                voting={voting}
                onVote={handleVote}
              />
            ))}
          </div>

          {/* Vote bar */}
          <VoteBar opciones={duelo.opciones} votes={votes} />

          {voted && (
            <p className="text-center font-sans text-[11px] text-ink/50">
              Votaste por{' '}
              <strong>{duelo.opciones.find(o => o.id === voted)?.nombre}</strong>
              {' '}· se actualiza cada 30s
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// ── Skeleton (mientras getDueloDelDia() resuelve) ───────────────────────
function CracksSkeleton({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/60" onClick={onClose} />
      <div
        className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2
                   rounded-sticker border-[4px] border-ink bg-main-cream
                   shadow-sticker-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b-[3px] border-ink bg-brand-lime px-4 pb-3 pt-4">
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 animate-pulse rounded-full bg-ink/20" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-ink/10" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-3 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full
                       border-[3px] border-ink bg-white font-bold leading-none text-ink
                       shadow-sticker-sm transition-all active:translate-y-px active:shadow-none"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="aspect-square w-full animate-pulse rounded-sticker border-[3px] border-ink bg-ink/10" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-ink/10" />
                <div className="h-9 w-full animate-pulse rounded-full border-[3px] border-ink bg-ink/10" />
              </div>
            ))}
          </div>
          <div className="h-6 animate-pulse rounded-full border-[3px] border-ink bg-ink/10" />
        </div>
      </div>
    </>
  )
}

// ── VoteBar — genérico para cualquier par de opciones ───────────────────
function VoteBar({ opciones, votes }) {
  const [a, b] = opciones
  const ca    = votes[a.id] ?? 0
  const cb    = votes[b.id] ?? 0
  const total = ca + cb
  const pctA  = total === 0 ? 50 : Math.round((ca / total) * 100)
  const pctB  = 100 - pctA

  return (
    <div className="space-y-1.5">
      <div className="flex h-6 w-full overflow-hidden rounded-full border-[3px] border-ink">
        <div
          className="transition-all duration-700 ease-out"
          style={{ width: `${pctA}%`, backgroundColor: a.color }}
        />
        <div className="flex-1" style={{ backgroundColor: b.color }} />
      </div>
      <div className="flex justify-between font-sans text-[11px] font-bold text-ink/70">
        <span>{pctA}% <span className="font-normal opacity-70">({ca})</span></span>
        <span><span className="font-normal opacity-70">({cb})</span> {pctB}%</span>
      </div>
    </div>
  )
}

// ── JerseyCard ──────────────────────────────────────────────────────────
function JerseyCard({ id, opcion, voted, voting, onVote }) {
  const isVoted  = voted === id
  const hasVoted = voted !== null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Jersey */}
      <div
        className={`w-full aspect-square rounded-sticker border-[3px] border-ink overflow-hidden
                    shadow-sticker-sm transition-all duration-200
                    ${isVoted ? 'scale-[1.04] shadow-sticker' : hasVoted ? 'opacity-55' : ''}`}
      >
        <JerseySvg fill={opcion.color} numero={opcion.numero} />
      </div>

      {/* Nombre del equipo + bandera */}
      <p className={`text-center leading-tight ${isVoted ? 'text-brand-purple' : 'text-ink/70'}`}>
        <span className="block text-lg">{flagEmoji(opcion.nombre)}</span>
        <span className="font-display text-[11px] tracking-wide">{opcion.nombre}</span>
      </p>

      {/* Botón de voto */}
      <button
        type="button"
        disabled={hasVoted || voting}
        onClick={() => onVote(id)}
        className={`w-full rounded-full border-[3px] border-ink py-1.5 font-display
                    text-xs tracking-wide transition-all
                    shadow-[3px_3px_0_#1A1A1A] active:translate-y-px active:shadow-none
                    disabled:cursor-default
                    ${isVoted
                      ? 'bg-brand-lime text-ink shadow-none translate-y-px'
                      : hasVoted
                      ? 'bg-ink/10 text-ink/30 shadow-none'
                      : 'bg-white text-ink hover:bg-brand-lime'}`}
      >
        {isVoted ? '✓ Votado' : 'VOTAR'}
      </button>
    </div>
  )
}

// ── JerseySvg ───────────────────────────────────────────────────────────
// Vista posterior de una camiseta. fill: color principal. numero: dorsal.
function JerseySvg({ fill, numero }) {
  return (
    <svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="80" height="90" fill="#F5F0E8"/>
      <path
        d="M 20,20
           C 24,13 32,9 40,9
           C 48,9 56,13 60,20
           L 78,28 L 78,50 L 60,43
           L 60,86 L 20,86 L 20,43
           L 2,50 L 2,28
           Z"
        fill={fill}
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 24,14 C 32,22 48,22 56,14"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="20" y1="29" x2="60" y2="29" stroke="white" strokeWidth="1.5" opacity="0.55"/>
      <line x1="40" y1="20" x2="40" y2="86" stroke="white" strokeWidth="1.2" opacity="0.4"/>
      <line x1="20" y1="80" x2="60" y2="80" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      <text
        x="40"
        y="66"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="900"
        fontSize="28"
        fill="white"
        stroke="#1A1A1A"
        strokeWidth="2.5"
        style={{ paintOrder: 'stroke fill' }}
      >
        #{numero}
      </text>
    </svg>
  )
}
