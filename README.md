# Mundial Pulse ⚽ 2026

Web App informativa y de gamificación para el **Mundial 2026**, mobile-first y
optimizada para tráfico viral de TikTok. Diseño de autor con estética
**Kawaii Geométrica + Modern Pop**: contornos de tinta gruesos, sombras sólidas
desplazadas y tarjetas tipo *sticker físico troquelado*.

> Reconstrucción en React del proyecto original "Mundial Pulse TV" (vanilla JS).

## Stack

- **React 18** + **Vite** (SPA mobile-first, build estático para Vercel)
- **Tailwind CSS v3** con `tailwind.config.js` y design tokens propios
- Tipografía: **Lilita One** (titulares pop) + **Fredoka** (cuerpo geométrico)

## Empezar

```bash
npm install
npm run dev      # http://localhost:5190
npm run build    # genera dist/
```

## Sistema de diseño

Paleta (en `tailwind.config.js → theme.extend.colors`):

| Token                 | Hex       | Uso                                  |
| --------------------- | --------- | ------------------------------------ |
| `main-cream`          | `#FFFDF6` | Fondo general (evita blanco genérico)|
| `brand-purple`        | `#4338CA` | Púrpura profundo oficial             |
| `brand-purple-deep`   | `#5B21B6` | Variante violeta                     |
| `brand-lime`          | `#BEF264` | Activos / estados "vivos"            |
| `brand-coral`         | `#FF6B6B` | Llamadas a la acción (CTA)           |
| `ink`                 | `#1A1A1A` | Contornos y sombras sólidas          |

Sombras sticker (`theme.extend.boxShadow`): `sticker`, `sticker-sm`,
`sticker-lg`, y variantes de color (`sticker-purple`, `sticker-lime`,
`sticker-coral`).

Clases utilitarias (en `src/index.css`):

- `.sticker-card` — tarjeta troquelada (borde de tinta + sombra sólida)
- `.btn-pop` — botón con interacción de "presionado" (cae sobre su sombra)
- `.pop-tag` — chip/etiqueta pop

## Estructura

```
src/
├─ components/
│  └─ MobileViewport.jsx   # Contenedor global (max-w-md + marco de móvil)
├─ App.jsx                 # Pantalla "Hoy" de demo del sistema de diseño
├─ main.jsx
└─ index.css               # Capas Tailwind + componentes
```
