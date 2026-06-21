import { useState } from 'react'
import MobileViewport from './components/MobileViewport.jsx'
import BottomNav from './components/BottomNav.jsx'
import HoyView from './views/HoyView.jsx'
import ArcadeView from './views/ArcadeView.jsx'
import TiendaView from './views/TiendaView.jsx'
import ComunidadView from './views/ComunidadView.jsx'
import AdminView from './views/AdminView.jsx'
import PredictView from './views/PredictView.jsx'
import StickersView from './views/StickersView.jsx'
import FixtureView from './views/FixtureView.jsx'

// Mapa pestaña → componente de pantalla. El componente central se alterna
// dinámicamente según `activeTab`.
const VIEWS = {
  hoy: HoyView,
  arcade: ArcadeView,
  tienda: TiendaView,
  comunidad: ComunidadView,
  predice: PredictView,
  stickers: StickersView,
  fixture: FixtureView,
}

export default function App() {
  // Ruta /admin — fuera del shell normal (sin nav, sin header de app)
  if (window.location.pathname === '/admin') return <AdminView />

  const [lang, setLang] = useState('ES')
  const [activeTab, setActiveTab] = useState('hoy')

  const ActiveView = VIEWS[activeTab]

  return (
    <MobileViewport>
      {/* ── App bar ───────────────────────────────────────────────── */}
      <header className="z-20 flex shrink-0 items-center justify-between gap-2 border-b-[3px] border-ink bg-main-cream px-4 py-3">
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

        <button
          onClick={() => setLang((l) => (l === 'ES' ? 'EN' : 'ES'))}
          className="rounded-full border-[3px] border-ink bg-white px-3 py-1.5 font-display text-sm shadow-sticker-sm transition-transform active:translate-y-0.5"
          aria-label="Cambiar idioma"
        >
          {lang} ⇄ {lang === 'ES' ? 'EN' : 'ES'}
        </button>
      </header>

      {/* ── Vista activa (conmutada por estado) ───────────────────── */}
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-5">
        <div key={activeTab} className="animate-pop-in">
          <ActiveView onNavigate={setActiveTab} />
        </div>
      </main>

      {/* ── Bottom Navigation Bar (fixed) ─────────────────────────── */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </MobileViewport>
  )
}
