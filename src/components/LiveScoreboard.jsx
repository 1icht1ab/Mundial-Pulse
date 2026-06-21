import { useState, useEffect, useCallback } from 'react'
import { getLiveMatches } from '../services/matches.js'

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

const POLL_INTERVAL_MS = 45_000   // 45 s — balance entre frescura y cuota de API

// Mapa de código ISO → emoji de bandera (los más comunes del Mundial 2026).
const FLAG_MAP = {
  Argentina: '🇦🇷', México: '🇲🇽', Brazil: '🇧🇷', France: '🇫🇷',
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Germany: '🇩🇪', Spain: '🇪🇸', Portugal: '🇵🇹',
  Netherlands: '🇳🇱', Uruguay: '🇺🇾', Colombia: '🇨🇴', Ecuador: '🇪🇨',
  'United States': '🇺🇸', Canada: '🇨🇦', Morocco: '🇲🇦', Japan: '🇯🇵',
  'South Korea': '🇰🇷', Australia: '🇦🇺', Senegal: '🇸🇳', Ghana: '🇬🇭',
  Croatia: '🇭🇷', Serbia: '🇷🇸', Switzerland: '🇨🇭', Belgium: '🇧🇪',
  Denmark: '🇩🇰', Poland: '🇵🇱', Mexico: '🇲🇽', Chile: '🇨🇱',
}
const flag = (name) => FLAG_MAP[name] ?? '🏳️'

function pickMatch(matches) {
  if (!matches?.length) return null
  const live = matches.find((m) => m.status === 'live')
  if (live) return live
  return matches.find((m) => m.status === 'upcoming') ?? matches[0]
}

export default function LiveScoreboard() {
  const [matches, setMatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState(null)
  const [lastOk,  setLastOk]    = useState(null)  // último fetch exitoso

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

  // Fetch inicial + polling
  useEffect(() => {
    fetchMatches()
    const t = setInterval(fetchMatches, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [fetchMatches])

  const match = pickMatch(matches)

  // ── Estado: cargando (primer fetch) ──────────────────────────────
  if (loading) return <SkeletonCard />

  // ── Estado: sin partido seleccionable ────────────────────────────
  if (!match) return <EmptyCard onRetry={fetchMatches} />

  const isLive     = match.status === 'live'
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
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-white text-3xl shadow-sticker-sm">
        {flag(name)}
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
