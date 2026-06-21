import { useState, useEffect, useRef, useCallback } from 'react'
import { grantArcadePack } from '../services/stickers.js'

// ── Fases del box breathing (4s cada una) ──────────────────────────
const PHASES = [
  { text: 'Inhala...', emoji: '🌬️', bg: 'bg-brand-lime',  fg: 'text-ink' },
  { text: 'Mantén...', emoji: '🫁',  bg: 'bg-white',       fg: 'text-brand-purple' },
  { text: 'Exhala...', emoji: '😮‍💨', bg: 'bg-brand-coral', fg: 'text-white' },
]

// Límite de balones activos para no saturar la memoria.
const MAX_BALLS = 18

export default function ArcadeView() {
  const [phaseIdx, setPhaseIdx]   = useState(0)
  const [balls, setBalls]         = useState([])
  const [score, setScore]         = useState(0)
  const arenaRef                  = useRef(null)
  const ballIdRef                 = useRef(0)

  // Ciclo de fases cada 4s (sincronizado con la animación CSS de 12s).
  useEffect(() => {
    const t = setInterval(
      () => setPhaseIdx(i => (i + 1) % PHASES.length),
      4000,
    )
    return () => clearInterval(t)
  }, [])

  // Primer pop del día → sobre extra en Stickers
  useEffect(() => {
    if (score === 1) grantArcadePack()
  }, [score])

  // Añadir balón en la posición exacta del tap/clic dentro del arena.
  const addBall = useCallback((e) => {
    // No crear un balón nuevo si el clic fue sobre uno existente.
    if (e.target.closest('[data-ball]')) return
    const arena = arenaRef.current
    if (!arena) return

    setBalls(prev => {
      // Respetar el límite de activos (excluye los que ya están explotando).
      if (prev.filter(b => !b.popping).length >= MAX_BALLS) return prev
      const rect = arena.getBoundingClientRect()
      const x = Math.max(8, Math.min(92, ((e.clientX - rect.left)  / rect.width)  * 100))
      const y = Math.max(8, Math.min(92, ((e.clientY - rect.top)   / rect.height) * 100))
      return [
        ...prev,
        {
          id:      ballIdRef.current++,
          x, y,
          popping: false,
          // Delay y velocidad aleatorios para flotación no sincronizada.
          delay:   `${(Math.random() * 1.4).toFixed(2)}s`,
          speed:   `${(1.5 + Math.random() * 1.0).toFixed(2)}s`,
        },
      ]
    })
  }, [])

  // Marcar balón para explotar y sumar al contador.
  const popBall = useCallback((id) => {
    setBalls(prev => prev.map(b => b.id === id ? { ...b, popping: true } : b))
    setScore(s => s + 1)
  }, [])

  // Limpiar balón del estado una vez terminó su animación de pop.
  const removeBall = useCallback((id) => {
    setBalls(prev => prev.filter(b => b.id !== id))
  }, [])

  const phase = PHASES[phaseIdx]

  return (
    <section className="space-y-4">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="space-y-1">
        <span className="pop-tag border-brand-purple bg-brand-purple text-white">
          Zona Zen ⚡
        </span>
        <h2 className="font-display text-2xl tracking-wide text-brand-purple">
          Arcade <span className="text-brand-coral">anti-tensión</span>
        </h2>
        <p className="text-sm font-medium text-ink/60">
          Respirá y explotá balones para bajar las revoluciones. 🫠
        </p>
      </header>

      {/* ── Orbe de Respiración ───────────────────────────────────── */}
      <div className="relative flex flex-col items-center gap-4 rounded-sticker border-[3px] border-ink bg-brand-purple py-7 shadow-sticker">

        {/* Decoración geométrica de fondo */}
        <span aria-hidden className="absolute left-4 top-4 animate-float text-2xl opacity-60">✦</span>
        <span aria-hidden className="absolute right-4 bottom-4 animate-float text-xl opacity-40" style={{ animationDelay: '1.1s' }}>◆</span>

        <p className="font-display text-[10px] tracking-[0.25em] text-white/50 uppercase">
          Box Breathing · 4 · 4 · 4
        </p>

        {/* Orbe con anillo exterior */}
        <div className="relative grid place-items-center">
          {/* Anillo ripple exterior */}
          <div
            aria-hidden
            className="absolute rounded-full border-[3px] border-white/25 animate-breathe-ring"
            style={{ width: '184px', height: '184px', animationDuration: '12s', animationDelay: '0.15s' }}
          />

          {/* Orbe principal */}
          <div
            className={`relative grid h-40 w-40 place-items-center rounded-full
                        border-[4px] border-ink shadow-sticker
                        animate-breathe-orb
                        transition-colors duration-700
                        ${phase.bg} ${phase.fg}`}
            style={{ animationDuration: '12s' }}
          >
            <div className="flex flex-col items-center gap-0.5 select-none">
              <span className="font-display text-xl tracking-wide">{phase.text}</span>
              <span className="text-2xl leading-none">{phase.emoji}</span>
            </div>
          </div>
        </div>

        {/* Indicadores de fase */}
        <div className="flex items-center gap-3">
          {PHASES.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`block h-2.5 w-2.5 rounded-full border-2 border-ink
                            transition-all duration-500
                            ${i === phaseIdx ? 'bg-brand-lime scale-[1.35]' : 'bg-white/25'}`}
              />
              <span className={`font-display text-[9px] tracking-wide transition-opacity duration-500 ${i === phaseIdx ? 'text-brand-lime opacity-100' : 'text-white/30 opacity-60'}`}>
                {p.text.replace('...', '')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Descargador de Tensión (Clicker) ─────────────────────── */}
      <div className="sticker-card overflow-hidden">

        {/* Barra de título + contador */}
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-main-cream px-4 py-2.5">
          <h3 className="font-display text-base tracking-wide text-brand-purple">
            ¡DESAHÓGATE!
          </h3>
          <div className="flex items-center gap-1.5 rounded-full border-[3px] border-ink bg-brand-lime px-3 py-1 shadow-sticker-sm">
            <span className="text-base leading-none">😤</span>
            <span className="font-display text-lg text-ink leading-none">{score}</span>
            <span className="text-[10px] font-bold text-ink/60 uppercase tracking-wide">liberados</span>
          </div>
        </div>

        {/* Arena de juego */}
        <div
          ref={arenaRef}
          onClick={addBall}
          className="relative h-56 w-full overflow-hidden bg-brand-purple"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
            cursor: 'crosshair',
          }}
        >
          {balls.length === 0 && (
            <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 font-display text-sm tracking-wide text-white/35">
              <span className="text-2xl">⚽</span>
              TAP aquí para crear balones
            </p>
          )}

          {balls.map(ball => (
            <Ball
              key={ball.id}
              ball={ball}
              onPop={popBall}
              onRemoved={removeBall}
            />
          ))}
        </div>

        <p className="border-t-[2px] border-ink/10 px-4 py-2 text-center text-[11px] font-semibold text-ink/35">
          Máx. {MAX_BALLS} balones activos · Tocá cada uno para explotar
        </p>
      </div>
    </section>
  )
}

// ── Ball ─────────────────────────────────────────────────────────────
// Wrapper div maneja la posición absoluta; el botón interior maneja la
// animación de forma independiente para que los transforms no colisionen.
function Ball({ ball, onPop, onRemoved }) {
  return (
    <div
      data-ball="true"
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
    >
      <button
        type="button"
        aria-label="Explotar balón"
        onClick={() => !ball.popping && onPop(ball.id)}
        onAnimationEnd={() => ball.popping && onRemoved(ball.id)}
        className={`block text-3xl leading-none select-none touch-none
                    ${ball.popping ? 'animate-ball-pop' : 'animate-ball-float'}`}
        style={
          ball.popping
            ? undefined
            : { animationDelay: ball.delay, animationDuration: ball.speed }
        }
      >
        ⚽
      </button>
    </div>
  )
}
