import { useState, useEffect } from 'react'
import { getPartidos } from '../services/partidos.js'
import { submitPrediction } from '../services/quinielas.js'

// picks state: { "34": { h: "1", a: "0" } } — strings vacías = sin completar
// canonical output: { "34": { h: 1, a: 0 } } — solo partidos con ambos goles llenos

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })

function buildCanonicalPicks(partidos, picks) {
  const result = {}
  for (const p of partidos) {
    const key  = String(p.numero)
    const pick = picks[key] ?? {}
    const h    = pick.h
    const a    = pick.a
    if (h != null && h !== '' && a != null && a !== '') {
      result[key] = { h: Number(h), a: Number(a) }
    }
  }
  return result
}

export default function PredictView({ onNavigate }) {
  const [partidos,    setPartidos]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [picks,       setPicks]       = useState({})
  const [alias,       setAlias]       = useState('')
  const [contacto,    setContacto]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    getPartidos().then(({ data }) => {
      setPartidos(data)
      setLoading(false)
    })
  }, [])

  function setPickField(numero, field, value) {
    setPicks(prev => ({
      ...prev,
      [String(numero)]: { ...prev[String(numero)], [field]: value },
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const canonicalPicks = buildCanonicalPicks(partidos, picks)

    const { error } = await submitPrediction({
      alias:    alias.trim(),
      contacto: contacto.trim() || null,
      picks:    canonicalPicks,
    })

    if (error) {
      setSubmitError(error.message)
    } else {
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  // ── Estado: enviado ────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="sticker-card bg-brand-lime p-8 text-center text-ink space-y-3">
          <p className="text-5xl">🎉</p>
          <h2 className="font-display text-2xl tracking-wide">¡Quiniela enviada!</h2>
          <p className="font-sans text-sm">
            Tus picks quedaron guardados, <strong>{alias}</strong>. Los puntos se calculan
            automáticamente a medida que se resuelvan los partidos.
          </p>
          <button
            onClick={() => onNavigate?.('hoy')}
            className="btn-pop bg-ink text-white"
          >
            ← VOLVER AL INICIO
          </button>
        </div>
      </div>
    )
  }

  // ── Vista principal ────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="sticker-card bg-brand-purple p-4 text-center text-white">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => onNavigate?.('hoy')}
            className="text-sm text-white/70 hover:text-white font-sans transition-colors"
          >
            ← Volver
          </button>
          <span className="text-2xl">🔮</span>
          <span className="text-sm text-white/70 font-sans">
            {Object.keys(buildCanonicalPicks(partidos, picks)).length} picks
          </span>
        </div>
        <h1 className="font-display text-xl tracking-wide">TU QUINIELA</h1>
        <p className="mt-1 text-xs text-white/60 font-sans normal-case tracking-normal">
          Completá los partidos que quieras predecir — no es obligatorio llenar todos.
        </p>
      </div>

      {/* Lista de partidos */}
      {loading ? (
        <SkeletonMatches />
      ) : partidos.length === 0 ? (
        <div className="sticker-card bg-white p-6 text-center space-y-2">
          <p className="text-3xl">🏁</p>
          <p className="font-display text-lg">No hay partidos pendientes</p>
          <p className="font-sans text-sm text-ink/50">
            Todos los partidos programados ya están en curso o finalizados.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">

          {partidos.map(p => (
            <MatchPickCard
              key={p.numero}
              partido={p}
              pick={picks[String(p.numero)] ?? {}}
              onChange={(field, val) => setPickField(p.numero, field, val)}
            />
          ))}

          {/* Alias + contacto */}
          <div className="sticker-card bg-white p-4 space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Tu alias *
              </span>
              <input
                type="text"
                required
                value={alias}
                onChange={e => setAlias(e.target.value)}
                placeholder="@ejemplo"
                className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-sans text-base focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Contacto <span className="font-normal normal-case">(opcional)</span>
              </span>
              <input
                type="text"
                value={contacto}
                onChange={e => setContacto(e.target.value)}
                placeholder="email o teléfono"
                className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-sans text-base focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
              />
            </label>
          </div>

          {submitError && (
            <p className="text-center font-sans text-sm text-brand-coral">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-pop w-full bg-brand-coral text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ Enviando...' : '🔮 ENVIAR QUINIELA'}
          </button>

        </form>
      )}
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────────────────────

function MatchPickCard({ partido, pick, onChange }) {
  return (
    <div className="sticker-card bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="pop-tag bg-brand-purple text-white border-brand-purple text-[10px]">
          Grupo {partido.grupo}
        </span>
        <span className="font-sans text-[10px] text-ink/50">
          {formatDate(partido.fecha)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-right font-display text-sm leading-tight">
          {partido.local}
        </span>
        <input
          type="number"
          min="0"
          max="30"
          value={pick.h ?? ''}
          onChange={e => onChange('h', e.target.value)}
          className="w-12 rounded-sticker border-[3px] border-ink p-1 text-center font-display text-xl focus:outline-none focus:shadow-[0_0_0_2px_#4338CA]"
        />
        <span className="font-display text-lg text-ink/30">:</span>
        <input
          type="number"
          min="0"
          max="30"
          value={pick.a ?? ''}
          onChange={e => onChange('a', e.target.value)}
          className="w-12 rounded-sticker border-[3px] border-ink p-1 text-center font-display text-xl focus:outline-none focus:shadow-[0_0_0_2px_#4338CA]"
        />
        <span className="flex-1 font-display text-sm leading-tight">
          {partido.visitante}
        </span>
      </div>
    </div>
  )
}

function SkeletonMatches() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="sticker-card bg-white/60 p-3 animate-pulse">
          <div className="h-4 w-24 rounded-full bg-ink/10 mb-2" />
          <div className="flex items-center gap-2">
            <div className="h-5 flex-1 rounded bg-ink/10" />
            <div className="h-9 w-12 rounded-sticker bg-ink/10" />
            <div className="h-9 w-12 rounded-sticker bg-ink/10" />
            <div className="h-5 flex-1 rounded bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  )
}
