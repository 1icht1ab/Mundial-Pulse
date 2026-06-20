/**
 * LiveScoreboard — marcador en vivo (vista "Hoy").
 *
 * Tarjeta sticker coral con chip "EN VIVO", banderas troqueladas, marcador
 * grande y un botón lima de acción. Recibe `match` (con datos por defecto de
 * demo) para conectar luego al feed real de partidos.
 */
const DEFAULT_MATCH = {
  group: 'Grupo C',
  minute: "67'",
  live: true,
  home: { flag: '🇦🇷', code: 'ARG', score: 1 },
  away: { flag: '🇲🇽', code: 'MEX', score: 0 },
}

export default function LiveScoreboard({ match = DEFAULT_MATCH }) {
  const { group, minute, live, home, away } = match

  return (
    <section className="sticker-card overflow-hidden bg-brand-coral text-white">
      <div className="flex items-center justify-between px-4 pt-3">
        {live ? (
          <span className="pop-tag border-white bg-white text-brand-coral">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-coral" />
            EN VIVO
          </span>
        ) : (
          <span className="pop-tag border-white text-white">PRÓXIMO</span>
        )}
        <span className="font-display text-sm tracking-wide">{group}</span>
      </div>

      <div className="flex items-center justify-around px-4 py-4">
        <Team flag={home.flag} code={home.code} />
        <div className="text-center">
          <div className="font-display text-4xl leading-none">
            {home.score} : {away.score}
          </div>
          <div className="mt-1 text-xs font-semibold opacity-90">{minute}</div>
        </div>
        <Team flag={away.flag} code={away.code} />
      </div>

      <button className="w-full border-t-[3px] border-ink bg-brand-lime py-2.5 font-display tracking-wide text-ink transition-transform active:translate-y-[2px]">
        VER EL PULSO →
      </button>
    </section>
  )
}

function Team({ flag, code }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-ink bg-white text-3xl shadow-sticker-sm">
        {flag}
      </span>
      <span className="font-display text-lg tracking-wide">{code}</span>
    </div>
  )
}
