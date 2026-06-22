import { useState, useEffect, useCallback } from 'react'
import { DUELO_ID, OPCIONES, getDuelo, votarCrack, getVotoGuardado } from '../services/cracks.js'

const POLL_MS    = 30_000
const ZERO_VOTES = Object.fromEntries(Object.keys(OPCIONES).map(k => [k, 0]))

export default function CracksModal({ onClose }) {
  const [votes,   setVotes]   = useState(ZERO_VOTES)
  const [voted,   setVoted]   = useState(() => getVotoGuardado(DUELO_ID))
  const [voting,  setVoting]  = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchVotes = useCallback(async () => {
    const { data } = await getDuelo(DUELO_ID)
    if (data) setVotes(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVotes()
    const t = setInterval(fetchVotes, POLL_MS)
    return () => clearInterval(t)
  }, [fetchVotes])

  async function handleVote(opcion) {
    if (voted || voting) return
    setVoting(true)
    // Optimistic update
    setVotes(prev => ({ ...prev, [opcion]: prev[opcion] + 1 }))
    setVoted(opcion)
    const { error } = await votarCrack(DUELO_ID, opcion)
    if (error && error.message !== 'ya-votado') {
      // Rollback
      setVotes(prev => ({ ...prev, [opcion]: Math.max(0, prev[opcion] - 1) }))
      setVoted(null)
    } else {
      fetchVotes() // sync with real count after persist
    }
    setVoting(false)
  }

  const total  = votes.delantero + votes.arquero
  const pctDel = total === 0 ? 50 : Math.round((votes.delantero / total) * 100)
  const pctArq = 100 - pctDel

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/60"
        onClick={onClose}
      />

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
              ¡EL CRACK DEL DÍA! 👑
            </h2>
            <p className="mt-0.5 font-sans text-xs text-ink/70">
              ¿Cuál es el rol más determinante del partido?
            </p>
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
            {Object.entries(OPCIONES).map(([key, opcion]) => (
              <JerseyCard
                key={key}
                id={key}
                opcion={opcion}
                voted={voted}
                voting={voting}
                onVote={handleVote}
              />
            ))}
          </div>

          {/* Vote bar */}
          {loading ? (
            <div className="h-6 animate-pulse rounded-full border-[3px] border-ink bg-ink/10" />
          ) : (
            <div className="space-y-1.5">
              <div className="flex h-6 w-full overflow-hidden rounded-full border-[3px] border-ink">
                <div
                  className="bg-brand-lime transition-all duration-700 ease-out"
                  style={{ width: `${pctDel}%` }}
                />
                <div className="flex-1 bg-brand-coral" />
              </div>
              <div className="flex justify-between font-sans text-[11px] font-bold text-ink/70">
                <span>👟 {pctDel}% <span className="font-normal opacity-70">({votes.delantero})</span></span>
                <span><span className="font-normal opacity-70">({votes.arquero})</span> {pctArq}% 🧤</span>
              </div>
            </div>
          )}

          {voted && (
            <p className="text-center font-sans text-[11px] text-ink/50">
              Votaste por <strong>{OPCIONES[voted]?.label}</strong> · se actualiza cada 30s
            </p>
          )}
        </div>
      </div>
    </>
  )
}

// ── JerseyCard ──────────────────────────────────────────────────────────
function JerseyCard({ id, opcion, voted, voting, onVote }) {
  const isVoted  = voted === id
  const hasVoted = voted !== null

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Jersey */}
      <div className={`w-full aspect-square rounded-sticker border-[3px] border-ink overflow-hidden
                       shadow-sticker-sm transition-all duration-200
                       ${isVoted ? 'scale-[1.04] shadow-sticker' : hasVoted ? 'opacity-55' : ''}`}>
        <JerseySvg fill={opcion.fill} numero={opcion.numero} />
      </div>

      {/* Archetype label */}
      <p className={`text-center font-display text-[11px] leading-tight tracking-wide
                     ${isVoted ? 'text-brand-purple' : 'text-ink/70'}`}>
        {opcion.label}
      </p>

      {/* Vote button */}
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
                      ? 'bg-ink/8 text-ink/30 shadow-none'
                      : 'bg-white text-ink hover:bg-brand-lime'}`}
      >
        {isVoted ? '✓ Votado' : 'VOTAR'}
      </button>
    </div>
  )
}

// ── JerseySvg ───────────────────────────────────────────────────────────
// Vista posterior de una camiseta de fútbol. Sin marcas, solo forma geométrica.
// fill: color principal de la camiseta. numero: número dorsal.
function JerseySvg({ fill, numero }) {
  return (
    <svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Fondo crema */}
      <rect width="80" height="90" fill="#F5F0E8"/>

      {/* Cuerpo + mangas — vista posterior */}
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

      {/* Línea de cuello posterior (costura) */}
      <path
        d="M 24,14 C 32,22 48,22 56,14"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Costura de hombro */}
      <line x1="20" y1="29" x2="60" y2="29" stroke="white" strokeWidth="1.5" opacity="0.55"/>

      {/* Costura central vertical */}
      <line x1="40" y1="20" x2="40" y2="86" stroke="white" strokeWidth="1.2" opacity="0.4"/>

      {/* Dobladillo inferior */}
      <line x1="20" y1="80" x2="60" y2="80" stroke="white" strokeWidth="1.5" opacity="0.4"/>

      {/* Número dorsal */}
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
