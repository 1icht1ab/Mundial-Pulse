/**
 * ComicPlaceholder — pantalla base con estética de cómic.
 *
 * Reutilizable para vistas "Próximamente" (Tienda, Comunidad). Combina fondo
 * de semitono (halftone), una explosión/starburst tipo cómic con el texto
 * "¡PRÓXIMAMENTE!" y un globo de diálogo con cola.
 */

// Genera los puntos de un starburst (estrella de picos) para el polígono SVG.
function makeBurst(spikes = 12, cx = 100, cy = 100, outer = 98, inner = 72) {
  const pts = []
  const step = Math.PI / spikes
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = i * step - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}

const BURST_POINTS = makeBurst()

export default function ComicPlaceholder({
  emoji,
  title,
  caption,
  bubbleClass = 'bg-brand-coral text-white',
}) {
  return (
    <section className="relative flex min-h-[28rem] flex-col items-center justify-center gap-6 overflow-hidden rounded-sticker border-[3px] border-ink bg-white px-6 py-10 text-center shadow-sticker">
      {/* Halftone de cómic */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(#1A1A1A 1.4px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
      />

      <span className="relative animate-float text-7xl drop-shadow-[3px_3px_0_#1A1A1A]">
        {emoji}
      </span>

      {/* Starburst "¡PRÓXIMAMENTE!" */}
      <div className="relative grid place-items-center">
        <svg viewBox="0 0 200 200" className="w-48 drop-shadow-[5px_5px_0_#1A1A1A]">
          <polygon
            points={BURST_POINTS}
            fill="#BEF264"
            stroke="#1A1A1A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -rotate-6 font-display text-xl tracking-wide text-ink">
          ¡PRÓXIMAMENTE!
        </span>
      </div>

      <h2 className="relative font-display text-2xl tracking-wide text-brand-purple">
        {title}
      </h2>

      {/* Globo de diálogo con cola */}
      <div
        className={`relative max-w-xs rounded-2xl border-[3px] border-ink px-4 py-3 text-sm font-semibold shadow-sticker-sm ${bubbleClass}`}
      >
        {caption}
        <span
          aria-hidden
          className={`absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-[3px] border-r-[3px] border-ink ${bubbleClass}`}
        />
      </div>
    </section>
  )
}
