import { useState } from 'react'

const API_URL = '/api/admin/resolve-match'

export default function AdminView() {
  const [matchNum,    setMatchNum]    = useState('')
  const [localScore,  setLocalScore]  = useState('')
  const [visitScore,  setVisitScore]  = useState('')
  const [secret,      setSecret]      = useState('')
  const [status,      setStatus]      = useState(null)
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(API_URL, {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-admin-secret':  secret,
        },
        body: JSON.stringify({
          matchNumero:        Number(matchNum),
          resultadoLocal:     Number(localScore),
          resultadoVisitante: Number(visitScore),
        }),
      })
      const data = await res.json()
      setStatus({ ok: res.ok, data })
    } catch (err) {
      setStatus({ ok: false, data: { error: err.message } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink px-4 py-8 font-sans">
      <div className="mx-auto max-w-sm space-y-5">

        {/* Header */}
        <div className="sticker-card bg-brand-purple p-5 text-center text-white">
          <p className="text-3xl">⚙️</p>
          <h1 className="mt-1 font-display text-2xl tracking-wide">PANEL ADMIN</h1>
          <p className="mt-1 text-xs text-white/60 normal-case tracking-normal font-sans">
            Resolución de partidos · Cálculo automático de puntos
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="sticker-card bg-white p-5 space-y-4 text-ink">

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
              Nº de partido
            </span>
            <input
              type="number"
              min="1"
              required
              value={matchNum}
              onChange={e => setMatchNum(e.target.value)}
              placeholder="Ej: 4"
              className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-display text-xl focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Local
              </span>
              <input
                type="number"
                min="0"
                required
                value={localScore}
                onChange={e => setLocalScore(e.target.value)}
                placeholder="0"
                className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-display text-3xl text-center focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
                Visitante
              </span>
              <input
                type="number"
                min="0"
                required
                value={visitScore}
                onChange={e => setVisitScore(e.target.value)}
                placeholder="0"
                className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-display text-3xl text-center focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
              Admin Secret
            </span>
            <input
              type="password"
              required
              value={secret}
              onChange={e => setSecret(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-sticker border-[3px] border-ink px-3 py-2 font-sans text-base focus:outline-none focus:shadow-[0_0_0_3px_#4338CA]"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-pop w-full bg-brand-lime text-ink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Procesando...' : '⚡ RESOLVER PARTIDO'}
          </button>
        </form>

        {/* Response */}
        {status && (
          <div className={`sticker-card p-4 text-sm ${
            status.ok ? 'bg-brand-lime text-ink' : 'bg-brand-coral text-white'
          }`}>
            {status.ok ? (
              <div className="space-y-1">
                <p className="font-bold text-base">✅ {status.data.partido}</p>
                <p>
                  Exactos: <strong>{status.data.puntos.exactos}</strong> (×3 pts) ·{' '}
                  Tendencia: <strong>{status.data.puntos.tendencia}</strong> (×1 pt) ·{' '}
                  Fallidos: <strong>{status.data.puntos.fallidos}</strong>
                </p>
                <p className="text-xs opacity-70">
                  {status.data.updated} quinielas actualizadas
                </p>
              </div>
            ) : (
              <p className="font-bold">❌ {status.data?.error ?? 'Error desconocido'}</p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
