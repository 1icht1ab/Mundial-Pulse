/**
 * MobileViewport — contenedor global de la app.
 *
 * Centra una "columna teléfono" de `max-w-md` que llega de arriba abajo de la
 * pantalla, para que la Bottom Navigation Bar (con `position: fixed`) quede
 * alineada exactamente con el marco del dispositivo. En desktop muestra el
 * marco neo-brutalista (borde de tinta, esquinas superiores redondeadas y un
 * backdrop de lunares pop); en móvil ocupa toda la pantalla (full-bleed).
 */
export default function MobileViewport({ children }) {
  return (
    <div
      className="flex min-h-[100dvh] w-full justify-center sm:pt-5"
      style={{
        backgroundColor: '#4338CA',
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.16) 1.6px, transparent 1.6px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div
        className="relative flex h-[100dvh] w-full max-w-md flex-col
                   overflow-hidden bg-main-cream
                   sm:h-[calc(100dvh-1.25rem)] sm:rounded-t-[2.25rem]
                   sm:border-[3px] sm:border-b-0 sm:border-ink"
      >
        {children}
      </div>
    </div>
  )
}
