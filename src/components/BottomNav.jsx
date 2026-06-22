/**
 * BottomNav — Bottom Navigation Bar fija (fixed bottom-0).
 *
 * Pieza geométrica gruesa: fondo blanco, borde superior de tinta de 4px.
 * La pestaña activa se rellena de `brand-lime` (semántica: lime = activo/vivo)
 * con contorno de tinta y una sombra interior que produce el efecto de
 * "botón hundido". Al hacer clic, todos los botones bajan ligeramente
 * (active:translate-y) reforzando la sensación táctil de hundido.
 *
 * Va centrada y limitada a `max-w-md` para alinearse con el marco del
 * MobileViewport tanto en móvil (full-bleed) como en desktop.
 */
export const TABS = [
  { id: 'hoy', emoji: '⚡', label: 'Hoy' },
  { id: 'arcade', emoji: '🕹️', label: 'Arcade' },
  // { id: 'tienda', emoji: '🛍️', label: 'Tienda' },  // re-enable when e-commerce is ready
  { id: 'comunidad', emoji: '💬', label: 'Comunidad' },
]

export default function BottomNav({ activeTab, onChange }) {
  return (
    <nav
      aria-label="Navegación principal"
      className="shrink-0 w-full border-t-4 border-ink bg-white px-2 pt-2
                 pb-[max(0.5rem,env(safe-area-inset-bottom))]
                 sm:rounded-b-[2.25rem] sm:border-x-[3px]"
    >
      <ul className="flex items-stretch justify-around gap-1">
        {TABS.map((tab) => {
          const active = tab.id === activeTab
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`flex w-full flex-col items-center justify-center gap-0.5
                            rounded-2xl py-2 font-display text-[11px] tracking-wide
                            transition-all duration-100 active:translate-y-[2px] ${
                              active
                                ? 'border-[3px] border-ink bg-brand-lime text-ink shadow-[inset_3px_3px_0_0_rgba(26,26,26,0.35)]'
                                : 'border-[3px] border-transparent text-ink/45 hover:text-ink/70'
                            }`}
              >
                <span className="text-xl leading-none">{tab.emoji}</span>
                {tab.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
