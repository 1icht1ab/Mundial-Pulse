import { useState, useEffect, useRef, useCallback } from 'react'
import { grantArcadePack } from '../services/stickers.js'

// ── Fases del box breathing (4s cada una) ──────────────────────────
const PHASES = [
  { text: 'Inhala...', emoji: '🌬️', bg: 'bg-brand-lime',  fg: 'text-ink' },
  { text: 'Mantén...', emoji: '🫁',  bg: 'bg-white',       fg: 'text-brand-purple' },
  { text: 'Exhala...', emoji: '😮‍💨', bg: 'bg-brand-coral', fg: 'text-white' },
]

const MAX_BALLS        = 18
const BALL_LIFETIME_MS = 3000  // tiempo flotando antes de empezar a escaparse
const FADE_MS          = 500   // debe coincidir con animate-ball-fade
const POP_MS           = 300   // debe coincidir con animate-ball-pop
const SPAWN_MIN_MS     = 400
const SPAWN_MAX_MS     = 900

export default function ArcadeView() {
  const [phaseIdx, setPhaseIdx]   = useState(0)
  const [balls, setBalls]         = useState([])
  const [score, setScore]         = useState(0)
  const arenaRef                  = useRef(null)
  const ballIdRef                 = useRef(0)
  const spawnTimerRef             = useRef(null)
  const ballTimersRef             = useRef(new Map())   // id → timeout pendiente (despawn o remoción)
  const handledRef                = useRef(new Set())   // ids ya reclamados (pop/fade) — guard SÍNCRONO

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

  // Quitar definitivamente el balón del estado. La remoción se maneja con
  // timers determinísticos (no con onAnimationEnd) para que el ciclo de vida
  // siga funcionando aunque la pestaña esté en segundo plano y el navegador
  // congele las animaciones CSS (en ese caso animationend nunca dispararía).
  const removeBall = useCallback((id) => {
    const t = ballTimersRef.current.get(id)
    if (t) clearTimeout(t)
    ballTimersRef.current.delete(id)
    handledRef.current.delete(id)
    setBalls(prev => prev.filter(b => b.id !== id))
  }, [])

  // Balón "escapado" (despawn timer sin tap): NO suma al score. Pasa a la
  // animación de fade y agenda su remoción real al terminar el fade.
  // handledRef es el guard síncrono — no se puede confiar en el valor de
  // retorno del updater de setState porque corre de forma asíncrona.
  const fadeBall = useCallback((id) => {
    if (handledRef.current.has(id)) return
    handledRef.current.add(id)
    ballTimersRef.current.delete(id)   // el despawn timer ya disparó
    setBalls(prev => prev.map(b => b.id === id ? { ...b, fading: true } : b))
    ballTimersRef.current.set(id, setTimeout(() => removeBall(id), FADE_MS))
  }, [removeBall])

  // Tap del usuario sobre un balón a tiempo: cancela su despawn, lo marca como
  // popping, suma al score y agenda la remoción al terminar la animación de pop.
  // handledRef evita doble conteo si llegan dos taps antes del re-render.
  const popBall = useCallback((id) => {
    if (handledRef.current.has(id)) return
    handledRef.current.add(id)
    const despawn = ballTimersRef.current.get(id)
    if (despawn) clearTimeout(despawn)
    setBalls(prev => prev.map(b => b.id === id ? { ...b, popping: true } : b))
    setScore(s => s + 1)
    ballTimersRef.current.set(id, setTimeout(() => removeBall(id), POP_MS))
  }, [removeBall])

  // Aparecer un balón en posición random dentro del arena.
  // Si ya hay MAX_BALLS activos, descarta silenciosamente (el spawner sigue corriendo).
  const spawnBall = useCallback(() => {
    const id    = ballIdRef.current++
    const x     = 8 + Math.random() * 84
    const y     = 8 + Math.random() * 84
    const delay = `${(Math.random() * 1.4).toFixed(2)}s`
    const speed = `${(1.5 + Math.random()).toFixed(2)}s`

    // Programar despawn antes del setState para que el ID ya esté en el mapa.
    const timer = setTimeout(() => fadeBall(id), BALL_LIFETIME_MS)
    ballTimersRef.current.set(id, timer)

    setBalls(prev => {
      const active = prev.filter(b => !b.popping && !b.fading).length
      if (active >= MAX_BALLS) {
        // Sin lugar — cancelar el timer y no modificar estado.
        clearTimeout(timer)
        ballTimersRef.current.delete(id)
        return prev
      }
      return [...prev, { id, x, y, popping: false, fading: false, delay, speed }]
    })
  }, [fadeBall])

  // Spawner automático con delay random para sensación orgánica.
  // Cleanup al desmontar para no dejar timers corriendo en background.
  useEffect(() => {
    const scheduleNext = () => {
      const delay = SPAWN_MIN_MS + Math.random() * (SPAWN_MAX_MS - SPAWN_MIN_MS)
      spawnTimerRef.current = setTimeout(() => {
        spawnBall()
        scheduleNext()
      }, delay)
    }
    scheduleNext()

    return () => {
      clearTimeout(spawnTimerRef.current)
      ballTimersRef.current.forEach(t => clearTimeout(t))
      ballTimersRef.current.clear()
      handledRef.current.clear()
    }
  }, [spawnBall])

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

      {/* ── Descargador de Tensión ────────────────────────────────── */}
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

        {/* Arena de juego — sin onClick, los balones aparecen solos */}
        <div
          ref={arenaRef}
          className="relative h-56 w-full overflow-hidden bg-brand-purple"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)',
            backgroundSize: '18px 18px',
          }}
        >
          {balls.length === 0 && (
            <p className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 font-display text-sm tracking-wide text-white/35">
              <span className="text-2xl">⚽</span>
              Aparecen solos... ¡explotá los que puedas!
            </p>
          )}

          {balls.map(ball => (
            <Ball
              key={ball.id}
              ball={ball}
              onPop={popBall}
            />
          ))}
        </div>

        <p className="border-t-[2px] border-ink/10 px-4 py-2 text-center text-[11px] font-semibold text-ink/35">
          Máx. {MAX_BALLS} activos · ¡Tocá antes de que escapen!
        </p>
      </div>
    </section>
  )
}

// ── Ball ─────────────────────────────────────────────────────────────
// Wrapper div maneja la posición absoluta; el botón interior maneja la
// animación de forma independiente para que los transforms no colisionen.
// La remoción del estado la maneja un timer en el padre (no onAnimationEnd),
// para ser robusta cuando la pestaña está en background y el navegador
// congela las animaciones CSS.
function Ball({ ball, onPop }) {
  return (
    <div
      data-ball="true"
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
    >
      <button
        type="button"
        aria-label="Explotar balón"
        onClick={() => !ball.popping && !ball.fading && onPop(ball.id)}
        className={`block text-3xl leading-none select-none touch-none
                    ${ball.popping ? 'animate-ball-pop'
                    : ball.fading  ? 'animate-ball-fade'
                    : 'animate-ball-float'}`}
        style={
          ball.popping || ball.fading
            ? undefined
            : { animationDelay: ball.delay, animationDuration: ball.speed }
        }
      >
        ⚽
      </button>
    </div>
  )
}
