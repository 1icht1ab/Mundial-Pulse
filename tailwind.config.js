/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // ── Paleta oficial Mundial Pulse 2026 ──────────────────────────
      colors: {
        // Fondo general — crema cálido para evitar el blanco genérico de IA.
        'main-cream': '#FFFDF6',
        // Púrpura profundo oficial (indigo-700). `deep` = variante violeta.
        'brand-purple': '#4338CA',
        'brand-purple-deep': '#5B21B6',
        // Verde lima eléctrico — estados activos / "vivos".
        'brand-lime': '#BEF264',
        // Coral vibrante — llamadas a la acción (CTA).
        'brand-coral': '#FF6B6B',
        // Tinta — contornos de tarjeta troquelada y sombras sólidas.
        'ink': '#1A1A1A',
      },

      // ── Tipografía geométrica / pop ────────────────────────────────
      fontFamily: {
        // Titulares chunky tipo pop.
        display: ['"Lilita One"', 'system-ui', 'sans-serif'],
        // Cuerpo geométrico redondeado (kawaii).
        sans: ['Fredoka', 'system-ui', 'sans-serif'],
      },

      // ── Sombras rígidas / sticker físico troquelado ────────────────
      boxShadow: {
        sticker: '5px 5px 0px 0px #1A1A1A',
        'sticker-sm': '3px 3px 0px 0px #1A1A1A',
        'sticker-lg': '8px 8px 0px 0px #1A1A1A',
        'sticker-purple': '5px 5px 0px 0px #4338CA',
        'sticker-lime': '5px 5px 0px 0px #BEF264',
        'sticker-coral': '5px 5px 0px 0px #FF6B6B',
      },

      // ── Radios generosos para el look kawaii ───────────────────────
      borderRadius: {
        sticker: '1.5rem',
        'sticker-lg': '2rem',
      },

      // ── Microinteracciones pop ─────────────────────────────────────
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.18)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        // Orbe de respiración 12s: inhala (0-33%) → mantén (33-66%) → exhala (66-100%)
        'breathe-orb': {
          '0%, 100%': { transform: 'scale(1)' },
          '33%': { transform: 'scale(1.24)' },
          '66%': { transform: 'scale(1.24)' },
        },
        // Anillo exterior del orbe: expande más para efecto ripple
        'breathe-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '33%': { transform: 'scale(1.45)', opacity: '0.15' },
          '66%': { transform: 'scale(1.45)', opacity: '0.15' },
        },
        // Balones: pop rápido con overshoot antes de desaparecer
        'ball-pop': {
          '0%':   { transform: 'scale(1)',   opacity: '1' },
          '30%':  { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(0)',   opacity: '0' },
        },
        // Balones: flotación suave mientras están activos
        'ball-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-7px)' },
        },
        // Balones: fade+shrink suave cuando se escapan sin ser tocados
        'ball-fade': {
          '0%':   { transform: 'scale(1)',    opacity: '1' },
          '40%':  { transform: 'scale(0.75)', opacity: '0.6' },
          '100%': { transform: 'scale(0.2)',  opacity: '0' },
        },
      },
      animation: {
        'pop-in':      'pop-in 0.25s ease-out both',
        wiggle:        'wiggle 0.6s ease-in-out infinite',
        breathe:       'breathe 4s ease-in-out infinite',
        float:         'float 3s ease-in-out infinite',
        'breathe-orb': 'breathe-orb 12s ease-in-out infinite',
        'breathe-ring': 'breathe-ring 12s ease-in-out infinite',
        'ball-pop':    'ball-pop 0.3s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
        'ball-float':  'ball-float 2s ease-in-out infinite',
        'ball-fade':   'ball-fade 0.5s ease-in forwards',
      },
    },
  },
  plugins: [],
}
