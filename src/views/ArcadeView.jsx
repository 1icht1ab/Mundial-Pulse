/**
 * ArcadeView — contenedor base con diseño Pop llamativo.
 *
 * Aquí se montará el mini-juego de relajación para descomprimir la tensión de
 * los partidos. Por ahora muestra un "orbe de respiración" animado como
 * preview del concepto y un mount-point claro para el juego.
 */
export default function ArcadeView() {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <span className="pop-tag border-brand-purple bg-brand-purple text-white">
          Zona Zen ⚡
        </span>
        <h2 className="font-display text-2xl leading-tight tracking-wide text-brand-purple">
          Arcade <span className="text-brand-coral">anti-tensión</span>
        </h2>
        <p className="text-sm font-medium text-ink/70">
          Mini-juegos para bajar revoluciones cuando el partido te tiene al
          borde del infarto. 🫠
        </p>
      </header>

      <div className="relative grid min-h-[20rem] place-items-center overflow-hidden rounded-sticker border-[3px] border-ink bg-brand-purple p-6 text-center text-white shadow-sticker">
        {/* Formas pop flotantes de fondo */}
        <span
          aria-hidden
          className="absolute -left-6 -top-6 h-24 w-24 rotate-12 rounded-3xl border-[3px] border-ink bg-brand-coral/90"
        />
        <span
          aria-hidden
          className="absolute -bottom-8 -right-4 h-28 w-28 animate-float rounded-full border-[3px] border-ink bg-brand-lime/90"
        />
        <span aria-hidden className="absolute right-8 top-6 animate-wiggle text-3xl">
          ✨
        </span>

        {/* Orbe de respiración = preview del juego de relajación */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="grid h-36 w-36 animate-breathe place-items-center rounded-full border-[3px] border-ink bg-brand-lime text-ink shadow-sticker">
            <span className="font-display text-lg tracking-wide">RESPIRÁ</span>
          </div>

          {/* TODO: montar aquí el mini-juego de relajación (mount point) */}
          <p className="max-w-[14rem] text-sm font-semibold">
            Inhalá… exhalá… el juego de relajación se monta en este contenedor.
          </p>
        </div>

        <span className="pop-tag absolute right-3 top-3 border-white bg-white text-brand-purple">
          Próximamente
        </span>
      </div>
    </section>
  )
}
