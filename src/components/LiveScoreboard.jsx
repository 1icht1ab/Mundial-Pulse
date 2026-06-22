import { useState, useEffect, useCallback } from 'react'
import { getLiveMatches } from '../services/matches.js'
import { getReacciones, addReaccion, getUsedEmojis, REACTION_EMOJIS } from '../services/reacciones.js'
import { flagCode } from '../utils/flags.js'

/**
 * LiveScoreboard — marcador en vivo con fetch real + polling cada 45s.
 *
 * Lógica de visualización:
 *   1. Si hay partidos "live" → muestra el primero (o el índice activo)
 *   2. Si no hay live pero sí "upcoming" → muestra el próximo
 *   3. Si no hay ninguno → muestra estado vacío
 *
 * Estados de UI:
 *   loading (primer fetch) → esqueleto pulsante
 *   error (fetch fallido)  → badge de error + último dato conocido si existe
 *   data                   → tarjeta de partido normal
 */

const POLL_INTERVAL_MS      = 45_000  // 45 s — marcador
const REACTIONS_POLL_MS     = 30_000  // 30 s — reacciones
const ZERO_REACTIONS        = REACTION_EMOJIS.map(emoji => ({ emoji, total: 0 }))

function pickMatch(matches) {
  if (!matches?.length) return null
  const live = matches.find((m) => m.status === 'live')
  if (live) return live
  return matches.find((m) => m.status === 'upcoming') ?? matches[0]
}

export default function LiveScoreboard() {
  const [matches,   setMatches]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [lastOk,    setLastOk]    = useState(null)
  const [reactions, setReactions] = useState(ZERO_REACTIONS)
  const [usedEmojis,setUsedEmojis]= useState([])

  const fetchMatches = useCallback(async () => {
    const { data, error: fetchErr } = await getLiveMatches()
    if (fetchErr) {
      console.error('[LiveScoreboard] fetch error:', fetchErr.message)
      setError(fetchErr)
    } else {
      setMatches(data)
      setLastOk(new Date())
      setError(null)
    }
    setLoading(false)
  }, [])

  const fetchReactions = useCallback(async (fixtureId) => {
    const { data } = await getReacciones(fixtureId)
    setReactions(data)
  }, [])

  // Fetch inicial + polling del marcador
  useEffect(() => {
    fetchMatches()
    const t = setInterval(fetchMatches, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [fetchMatches])

  const match   = pickMatch(matches)
  const isLive  = match?.status === 'live'

  // Cargar emojis ya usados del localStorage cuando cambia el partido
  useEffect(() => {
    if (!match?.n) return
    setUsedEmojis(getUsedEmojis(match.n))
    setReactions(ZERO_REACTIONS)          // resetear al cambiar partido
    fetchReactions(match.n)
  }, [match?.n, fetchReactions])

  // Polling de reacciones cada 30s (solo mientras hay partido EN VIVO)
  useEffect(() => {
    if (!isLive || !match?.n) return
    const t = setInterval(() => fetchReactions(match.n), REACTIONS_POLL_MS)
    return () => clearInterval(t)
  }, [isLive, match?.n, fetchReactions])

  // Tap de reacción: optimistic update → insert → rollback si falla
  const handleReact = useCallback(async (emoji) => {
    if (!match?.n || usedEmojis.includes(emoji)) return
    // Optimistic
    setReactions(prev => prev.map(r => r.emoji === emoji ? { ...r, total: r.total + 1 } : r))
    setUsedEmojis(prev => [...prev, emoji])
    // Persist
    const { error: insertErr } = await addReaccion(match.n, emoji)
    if (insertErr && insertErr.message !== 'rate-limited') {
      // Rollback solo si es error real (rate-limited ya está manejado en el servicio)
      setReactions(prev => prev.map(r => r.emoji === emoji ? { ...r, total: Math.max(0, r.total - 1) } : r))
      setUsedEmojis(prev => prev.filter(e => e !== emoji))
    }
  }, [match?.n, usedEmojis])

  // ── Estado: cargando (primer fetch) ──────────────────────────────
  if (loading) return <SkeletonCard />

  // ── Estado: sin partido seleccionable ────────────────────────────
  if (!match) return <EmptyCard onRetry={fetchMatches} />

  const isUpcoming = match.status === 'upcoming'
  const scoreH     = match.result?.h ?? '-'
  const scoreA     = match.result?.a ?? '-'

  return (
    <section className="sticker-card overflow-hidden bg-brand-coral text-white">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="pop-tag border-white bg-white text-brand-coral">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-coral" />
              EN VIVO
            </span>
          ) : isUpcoming ? (
            <span className="pop-tag border-white text-white">PRÓXIMO</span>
          ) : (
            <span className="pop-tag border-white/60 text-white/60">FINALIZADO</span>
          )}
          {/* Badge de error sin tirar el layout */}
          {error && (
            <span className="pop-tag border-white/40 bg-black/20 text-white/70 text-[9px]">
              ⚠ datos desactualizados
            </span>
          )}
        </div>
        <span className="font-display text-sm tracking-wide">{match.group}</span>
      </div>

      {/* Marcador */}
      <div className="flex items-center justify-around px-4 py-4">
        <Team name={match.home} />
        <div className="text-center">
          <div className="font-display text-4xl leading-none">
            {scoreH} : {scoreA}
          </div>
          <div className="mt-1 text-xs font-semibold opacity-90">
            {isLive ? (match.minute ?? 'EN JUEGO') : isUpcoming ? match.time : 'FT'}
          </div>
        </div>
        <Team name={match.away} />
      </div>

      {/* Reacciones — solo en partido EN VIVO */}
      {isLive && match?.n && (
        <ReactionRow
          reactions={reactions}
          usedEmojis={usedEmojis}
          onReact={handleReact}
        />
      )}

      {/* CTA */}
      <button
        onClick={fetchMatches}
        className="w-full border-t-[3px] border-ink bg-brand-lime py-2.5 font-display tracking-wide text-ink transition-transform active:translate-y-[2px]"
      >
        {lastOk
          ? `↻ actualizado ${lastOk.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
          : 'VER EL PULSO →'}
      </button>
    </section>
  )
}

// ── Sub-componentes ─────────────────────────────────────────────────

function Team({ name }) {
  const code = flagCode(name)
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="h-14 w-14 rounded-full border-[3px] border-ink overflow-hidden shadow-sticker-sm bg-white">
        {code ? (
          <span
            className={`fi fi-${code} block h-full w-full`}
            style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-2xl">🏳️</span>
        )}
      </span>
      <span className="font-display text-sm tracking-wide text-center leading-tight max-w-[4.5rem]">
        {name}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="sticker-card overflow-hidden bg-brand-coral/60 animate-pulse">
      <div className="px-4 pt-3 pb-1 flex justify-between">
        <div className="h-5 w-20 rounded-full bg-white/30" />
        <div className="h-5 w-16 rounded-full bg-white/20" />
      </div>
      <div className="flex items-center justify-around px-4 py-4 gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-white/30" />
          <div className="h-4 w-12 rounded bg-white/20" />
        </div>
        <div className="h-10 w-20 rounded bg-white/30" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-white/30" />
          <div className="h-4 w-12 rounded bg-white/20" />
        </div>
      </div>
      <div className="h-10 border-t-[3px] border-ink bg-brand-lime/60" />
    </div>
  )
}

function ReactionRow({ reactions, usedEmojis, onReact }) {
  return (
    <div className="border-t-[2px] border-white/20 px-3 py-2 flex flex-wrap justify-center gap-1">
      {reactions.map(({ emoji, total }) => {
        const used = usedEmojis.includes(emoji)
        return (
          <button
            key={emoji}
            type="button"
            disabled={used}
            onClick={() => onReact(emoji)}
            className={`flex items-center gap-0.5 rounded-full border-[2px] border-ink
                        px-1.5 py-0.5 font-bold shadow-[2px_2px_0_#1A1A1A]
                        transition-all active:translate-y-[1px] active:shadow-none
                        ${used
                          ? 'bg-brand-lime text-ink cursor-default'
                          : 'bg-white/90 text-ink hover:bg-white'}`}
          >
            <span className="text-sm leading-none">{emoji}</span>
            {total > 0 && (
              <span className="text-[10px] leading-none">{total}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function EmptyCard({ onRetry }) {
  return (
    <div className="sticker-card overflow-hidden bg-brand-purple text-white text-center py-8 px-4 space-y-3">
      <p className="text-4xl">🏟️</p>
      <p className="font-display text-lg tracking-wide">No hay partidos en vivo</p>
      <p className="text-sm text-white/60">El Mundial no tiene partidos en curso ahora mismo.</p>
      <button
        onClick={onRetry}
        className="btn-pop bg-brand-lime text-ink text-sm mt-2"
      >
        ↻ Reintentar
      </button>
    </div>
  )
}
