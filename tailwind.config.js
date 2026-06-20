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
      },
      animation: {
        'pop-in': 'pop-in 0.25s ease-out both',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
