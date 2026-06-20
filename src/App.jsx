import { useState } from 'react'
import MobileViewport from './components/MobileViewport.jsx'

// ── Demo del sistema de diseño ──────────────────────────────────────
// Pantalla "Hoy" de ejemplo para validar la estética sticker / neo-pop.
// Sustituible por las vistas reales (predice / arcade / tienda / comunidad).

const QUICK_ACTIONS = [
  { id: 'predice', emoji: '🔮', label: 'Predice', bg: 'bg-brand-lime' },
  { id: 'arcade', emoji: '🕹️', label: 'Arcade', bg: 'bg-brand-purple text-white' },
  { id: 'stickers', emoji: '✨', label: 'Stickers', bg: 'bg-brand-coral text-white' },
  { id: 'ranking', emoji: '🏆', label: 'Ranking', bg: 'bg-white' },
]

const TABS = [
  { id: 'hoy', emoji: '⚡', label: 'Hoy' },
  { id: 'arcade', emoji: '🕹️', label: 'Arcade' },
  { id: 'tienda', emoji: '🛍️', label: 'Tienda' },
  { id: 'comunidad', emoji: '💬', label: 'Comunidad' },
]

export default function App() {
  const [lang, setLang] = useState('ES')
  const [activeTab, setActiveTab] = useState('hoy')

  return (
    <MobileViewport>
      {/* ── App bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b-[3px] border-ink bg-main-cream/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-brand-lime text-xl shadow-sticker-sm">
            ⚽
          </span>
          <div className="leading-none">
            <h1 className="font-display text-xl tracking-wide text-brand-purple">
              MUNDIAL <span className="text-brand-coral">PULSE</span>
            </h1>
            <span className="pop-tag mt-1 border-brand-purple bg-brand-purple text-white">
              2026
            </span>
          </div>
        </div>

        {/* Toggle de idioma ES / EN */}
        <button
          onClick={() => setLang((l) => (l === 'ES' ? 'EN' : 'ES'))}
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1.5 font-display text-sm shadow-sticker-sm transition-transform active:translate-y-0.5"
          aria-label="Cambiar idioma"
        >
          {lang} ⇄ {lang === 'ES' ? 'EN' : 'ES'}
        </button>
      </header>

      {/* ── Contenido ─────────────────────────────────────────────── */}
      <main className="flex-1 space-y-5 overflow-y-auto px-4 pb-28 pt-5">
        {/* Hero: partido destacado */}
        <section className="sticker-card animate-pop-in overflow-hidden bg-brand-coral text-white">
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="pop-tag border-white bg-white text-brand-coral">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-coral" />
              EN VIVO
            </span>
            <span className="font-display text-sm tracking-wide">Grupo C</span>
          </div>

          <div className="flex items-center justify-around px-4 py-4">
            <Team flag="🇦🇷" name="ARG" />
            <div className="text-center">
              <div className="font-display text-4xl leading-none">1 : 0</div>
              <div className="mt-1 text-xs font-semibold opacity-90">67'</div>
            </div>
            <Team flag="🇲🇽" name="MEX" />
          </div>

          <button className="w-full border-t-[3px] border-ink bg-brand-lime py-2.5 font-display tracking-wide text-ink">
            VER EL PULSO →
          </button>
        </section>

        {/* Accesos rápidos */}
        <section>
          <SectionTitle>Jugá ahora</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <button
                key={a.id}
                className={`sticker-card flex flex-col items-start gap-2 p-4 text-left transition-transform active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${a.bg}`}
              >
                <span className="text-3xl">{a.emoji}</span>
                <span className="font-display text-lg tracking-wide">{a.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* CTA principal */}
        <button className="btn-pop w-full bg-brand-coral text-white">
          🎟️ JUGÁ LA QUINIELA
        </button>

        {/* Pulse del día */}
        <section className="sticker-card bg-white p-4">
          <SectionTitle>El pulso de hoy</SectionTitle>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat value="12" label="Partidos" />
            <Stat value="38K" label="Pulsos" />
            <Stat value="#7" label="Tu rank" />
          </div>
        </section>
      </main>

      {/* ── Tab bar inferior ──────────────────────────────────────── */}
      <nav className="absolute inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t-[3px] border-ink bg-main-cream px-2 py-2">
        {TABS.map((t) => {
          const active = t.id === activeTab
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-sticker py-1.5 font-display text-[11px] tracking-wide transition-all ${
                active
                  ? 'border-[3px] border-ink bg-brand-lime text-ink shadow-sticker-sm'
                  : 'border-[3px] border-transparent text-ink/50'
              }`}
            >
              <span className="text-xl">{t.emoji}</span>
              {t.label}
            </button>
          )
        })}
      </nav>
    </MobileViewport>
  )
}

// ── Subcomponentes de demo ──────────────────────────────────────────
function Team({ flag, name }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-white text-3xl shadow-sticker-sm">
        {flag}
      </span>
      <span className="font-display text-lg tracking-wide">{name}</span>
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
