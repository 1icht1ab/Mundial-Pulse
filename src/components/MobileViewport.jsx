/**
 * MobileViewport — contenedor global de la app.
 *
 * Restringe el ancho a `max-w-md mx-auto` y, en pantallas grandes, simula
 * un dispositivo móvil nativo de alta fidelidad: marco de tinta grueso,
 * esquinas redondeadas, sombra sólida tipo sticker troquelado y un backdrop
 * de lunares pop. En móvil ocupa toda la pantalla (full-bleed), como una
 * app nativa real.
 */
export default function MobileViewport({ children }) {
  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center sm:py-6 sm:px-4"
      style={{
        // Backdrop kawaii de lunares sobre púrpura (solo visible en desktop).
        backgroundColor: '#4338CA',
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.6px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div
        className="relative flex min-h-[100dvh] w-full max-w-md flex-col
                   overflow-hidden bg-main-cream
                   sm:min-h-0 sm:rounded-[2.25rem] sm:border-[3px] sm:border-ink
                   sm:shadow-sticker-lg"
      >
        {children}
      </div>
    </div>
  )
}
