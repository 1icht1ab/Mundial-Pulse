import LiveScoreboard from '../components/LiveScoreboard.jsx'

/**
 * HoyView — pantalla principal. Muestra el marcador en vivo (LiveScoreboard),
 * accesos rápidos y el "pulso del día".
 */
const QUICK_ACTIONS = [
  { id: 'predice', emoji: '🔮', label: 'Predice', bg: 'bg-brand-lime text-ink', tab: 'predice' },
  { id: 'arcade', emoji: '🕹️', label: 'Arcade', bg: 'bg-brand-purple text-white', tab: 'arcade' },
  { id: 'stickers', emoji: '✨', label: 'Stickers', bg: 'bg-brand-coral text-white', tab: 'stickers' },
  { id: 'ranking', emoji: '🏆', label: 'Ranking', bg: 'bg-white text-ink' },
]

export default function HoyView({ onNavigate }) {
  return (
    <div className="space-y-5">
      <LiveScoreboard />

      {/* Fixture shortcut — junto al marcador en vivo (relación temática) */}
      <button
        onClick={() => onNavigate?.('fixture')}
        className="sticker-card w-full flex items-center justify-between bg-white px-4 py-3 text-left transition-transform active:translate-y-0.5"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📅</span>
          <div className="leading-tight">
            <p className="font-display text-sm tracking-wide">FIXTURE COMPLETO</p>
            <p className="font-sans text-[10px] text-ink/50">Todos los partidos · Hora local</p>
          </div>
        </div>
        <span className="font-sans text-sm text-ink/30">→</span>
      </button>

      <section>
        <SectionTitle>Jugá ahora</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => a.tab && onNavigate?.(a.tab)}
              className={`sticker-card flex flex-col items-start gap-2 p-4 text-left transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${a.bg}`}
            >
              <span className="text-3xl">{a.emoji}</span>
              <span className="font-display text-lg tracking-wide">{a.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div>
        <button onClick={() => onNavigate?.('predice')} className="btn-pop w-full bg-brand-coral text-white">
          🎟️ JUGÁ LA QUINIELA
        </button>
        <p className="mt-1.5 text-center text-[11px] font-sans text-ink/50">
          Predecí resultados y sumá puntos en el Ranking.
        </p>
      </div>

      <section className="sticker-card bg-white p-4">
        <SectionTitle>El pulso de hoy</SectionTitle>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value="12" label="Partidos" />
          <Stat value="38K" label="Pulsos" />
          <Stat value="#7" label="Tu rank" />
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 font-display text-lg tracking-wide text-brand-purple">
      {children}
    </h2>
  )
}

function Stat({ value, label }) {
  return (
    <div className="rounded-sticker border-2 border-ink bg-main-cream py-2">
      <div className="font-display text-2xl leading-none text-brand-purple">{value}</div>
      <div className="mt-1 text-[11px] font-semibold text-ink/60">{label}</div>
    </div>
  )
}
