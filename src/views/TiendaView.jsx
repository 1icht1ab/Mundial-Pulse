import ComicPlaceholder from '../components/ComicPlaceholder.jsx'

/** TiendaView — pantalla base placeholder con estética de cómic. */
export default function TiendaView() {
  return (
    <ComicPlaceholder
      emoji="🛍️"
      title="Tienda Pulse"
      caption="Camisetas, stickers y merch oficial de tu selección. Estamos cosiendo los últimos detalles."
      bubbleClass="bg-brand-coral text-white"
    />
  )
}
