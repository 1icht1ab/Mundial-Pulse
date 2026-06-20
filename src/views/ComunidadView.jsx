import ComicPlaceholder from '../components/ComicPlaceholder.jsx'

/** ComunidadView — pantalla base placeholder con estética de cómic. */
export default function ComunidadView() {
  return (
    <ComicPlaceholder
      emoji="💬"
      title="Comunidad"
      caption="Hinchas de todo el mundo en un solo feed. Sumate a la conversa del Mundial."
      bubbleClass="bg-brand-purple text-white"
    />
  )
}
