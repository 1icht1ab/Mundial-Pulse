import { useState, useEffect } from 'react'
import {
  getOrCreateUserId, getPackCount, grantDailyPack,
  getCatalogo, getColeccion, abrirSobre,
} from '../services/stickers.js'
import FiguritaIlustracion from '../components/FiguritaIlustracion.jsx'

const RAREZA_LABEL = { comun: 'Común', rara: 'Rara', epica: 'Épica' }
const RAREZA_TAG   = {
  comun:  'bg-white text-ink border-ink',
  rara:   'bg-brand-purple text-white border-brand-purple',
  epica:  'bg-brand-coral text-white border-brand-coral',
}

export default function StickersView({ onNavigate }) {
  const [catalogo,  setCatalogo]  = useState([])
  const [coleccion, setColeccion] = useState([])   // [{ figurita_id, cantidad }]
  const [packCount, setPackCount] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [opening,   setOpening]   = useState(false)
  const [picks,     setPicks]     = useState([])   // [{ ...figurita, isNew }]
  const [cardIdx,   setCardIdx]   = useState(0)
  const [cardShown, setCardShown] = useState(false)
  const [openError, setOpenError] = useState(null)

  const userId = getOrCreateUserId()

  useEffect(() => {
    // Daily free pack: otorgar 1 sobre al visitar la sección
    grantDailyPack()
    setPackCount(getPackCount())

    Promise.all([getCatalogo(), getColeccion(userId)])
      .then(([cat, col]) => { setCatalogo(cat); setColeccion(col); setLoading(false) })
      .catch(err => { console.error('[stickers]', err); setLoading(false) })
  }, [])

  const coleccionMap = Object.fromEntries(coleccion.map(c => [c.figurita_id, c.cantidad]))
  const conseguidas  = catalogo.filter(f => coleccionMap[f.id]).length

  async function handleAbrirSobre() {
    setOpenError(null)
    const preOwned   = new Set(Object.keys(coleccionMap))
    const seenInPack = new Set()
    try {
      const raw      = await abrirSobre(userId)
      const enriched = raw.map(p => {
        const isNew = !preOwned.has(p.id) && !seenInPack.has(p.id)
        seenInPack.add(p.id)
        return { ...p, isNew }
      })
      setPicks(enriched)
      setCardIdx(0)
      setCardShown(false)
      setOpening(true)
      setPackCount(getPackCount())
    } catch (err) {
      setOpenError(err.message)
    }
  }

  async function handleNext() {
    if (cardIdx < 4) {
      setCardIdx(i => i + 1)
      setCardShown(false)
    } else {
      setOpening(false)
      const col = await getColeccion(userId)
      setColeccion(col)
    }
  }

  // ── Modo apertura de sobre ─────────────────────────────────────────
  if (opening && picks.length > 0) {
    const card   = picks[cardIdx]
    const isLast = cardIdx === 4

    return (
      <div className="flex flex-col gap-4">

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <p className="font-display text-sm tracking-wide text-ink/50">
            Carta {cardIdx + 1} de 5
          </p>
          <div className="flex gap-1.5">
            {picks.map((_, i) => (
              <span
                key={i}
                className={`block h-2.5 w-2.5 rounded-full border-2 border-ink transition-all duration-300 ${
                  i < cardIdx
                    ? 'bg-brand-lime'
                    : i === cardIdx
                    ? 'bg-brand-purple scale-125'
                    : 'bg-ink/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Face-down card */}
        {!cardShown ? (
          <button
            onClick={() => setCardShown(true)}
            className="sticker-card flex flex-col items-center justify-center gap-5 bg-brand-purple py-20 text-white active:translate-y-0.5"
          >
            <span className="text-7xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🎁</span>
            <div className="text-center">
              <p className="font-display text-xl tracking-wide">CARTA MISTERIOSA</p>
              <p className="mt-1 text-xs text-white/60 font-sans">Tocá para revelar</p>
            </div>
          </button>
        ) : (
          /* Revealed card */
          <div className={`sticker-card flex flex-col items-center gap-4 px-5 py-8 animate-pop-in ${
            card.isNew ? 'bg-brand-lime text-ink' : 'bg-white text-ink'
          }`}>
            {card.isNew ? (
              <span className="pop-tag bg-ink text-white border-ink text-xs tracking-widest">¡NUEVA!</span>
            ) : (
              <span className="pop-tag bg-white text-ink/50 border-ink/20 text-xs">Repetida</span>
            )}
            <div className="w-44 aspect-square rounded-sticker border-[3px] border-ink overflow-hidden shadow-sticker">
              <FiguritaIlustracion id={card.ilustracion} />
            </div>
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl tracking-wide">{card.nombre}</h2>
              <p className="font-sans text-sm text-ink/60 leading-relaxed">{card.descripcion}</p>
              <span className={`pop-tag text-xs ${RAREZA_TAG[card.rareza]}`}>
                {RAREZA_LABEL[card.rareza]}
              </span>
            </div>
          </div>
        )}

        {cardShown && (
          <button onClick={handleNext} className="btn-pop w-full bg-brand-coral text-white">
            {isLast ? 'Ver mi álbum →' : 'Siguiente →'}
          </button>
        )}

      </div>
    )
  }

  // ── Vista álbum ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="sticker-card bg-brand-purple p-4 text-white">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onNavigate?.('hoy')}
            className="text-sm text-white/70 hover:text-white font-sans transition-colors"
          >
            ← Volver
          </button>
          <span className="text-2xl">✨</span>
          <span className="font-display text-sm text-white/70">
            {conseguidas}/{catalogo.length} 🃏
          </span>
        </div>
        <h1 className="font-display text-xl tracking-wide text-center">MI ÁLBUM</h1>
        <p className="mt-1 text-xs text-white/60 font-sans text-center normal-case tracking-normal">
          Coleccioná todas las figuritas del Mundial
        </p>
      </div>

      {/* Pack availability */}
      {packCount > 0 ? (
        <button onClick={handleAbrirSobre} className="btn-pop w-full bg-brand-lime text-ink">
          🎁 ABRIR SOBRE ({packCount} disponible{packCount !== 1 ? 's' : ''})
        </button>
      ) : (
        <div className="sticker-card bg-white p-3 text-center space-y-0.5">
          <p className="font-sans text-sm font-semibold text-ink/60">Sin sobres disponibles</p>
          <p className="font-sans text-xs text-ink/40">
            Próximo gratis mañana · Jugá Arcade o enviá tu quiniela para ganar extras
          </p>
        </div>
      )}

      {openError && (
        <p className="text-center font-sans text-sm text-brand-coral">{openError}</p>
      )}

      {/* Album grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sticker-card bg-white/60 aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {catalogo.map(f => {
            const qty   = coleccionMap[f.id]
            const owned = !!qty
            return (
              <div
                key={f.id}
                className={`sticker-card p-3 flex flex-col gap-2 ${owned ? 'bg-white' : 'bg-ink/5'}`}
              >
                <div className={`rounded-sticker overflow-hidden aspect-square border-[2px] border-ink/10 ${
                  owned ? '' : 'opacity-20 grayscale'
                }`}>
                  <FiguritaIlustracion id={f.ilustracion} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1 min-h-[2.2rem]">
                    <p className={`font-display text-xs leading-tight ${owned ? 'text-ink' : 'text-ink/25'}`}>
                      {owned ? f.nombre : '???'}
                    </p>
                    {owned && qty > 1 && (
                      <span className="shrink-0 pop-tag bg-brand-purple text-white border-brand-purple text-[9px]">
                        ×{qty}
                      </span>
                    )}
                  </div>
                  <span className={`pop-tag text-[9px] ${
                    owned ? RAREZA_TAG[f.rareza] : 'bg-ink/10 text-ink/20 border-ink/10'
                  }`}>
                    {owned ? RAREZA_LABEL[f.rareza] : '?'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Buy packs teaser */}
      <div className="sticker-card bg-ink/5 p-4 flex items-center justify-between">
        <div>
          <p className="font-display text-sm tracking-wide text-ink/40">COMPRAR SOBRES</p>
          <p className="font-sans text-xs text-ink/30">Más figuritas, al instante</p>
        </div>
        <span className="pop-tag bg-ink text-white border-ink text-[10px]">PRÓXIMAMENTE</span>
      </div>

    </div>
  )
}
