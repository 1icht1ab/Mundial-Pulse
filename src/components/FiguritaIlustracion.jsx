// Ilustraciones SVG para cada figurita. Estilo neo-brutalista kawaii:
// formas geométricas planas, trazo negro grueso, paleta de marca.
// Sin siluetas ni caras de personas reales.

function GolAgonico() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#CCFF00"/>
      {/* Red (top-left) */}
      <rect x="4" y="4" width="36" height="36" fill="none" stroke="#1A1A2E" strokeWidth="2.5"/>
      <line x1="16" y1="4" x2="16" y2="40" stroke="#1A1A2E" strokeWidth="1.5"/>
      <line x1="28" y1="4" x2="28" y2="40" stroke="#1A1A2E" strokeWidth="1.5"/>
      <line x1="4"  y1="16" x2="40" y2="16" stroke="#1A1A2E" strokeWidth="1.5"/>
      <line x1="4"  y1="28" x2="40" y2="28" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* Speed lines */}
      <line x1="10" y1="60" x2="58" y2="60" stroke="#1A1A2E" strokeWidth="5"  strokeLinecap="round" opacity="0.25"/>
      <line x1="14" y1="70" x2="52" y2="70" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" opacity="0.18"/>
      <line x1="18" y1="79" x2="48" y2="79" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" opacity="0.12"/>
      {/* Ball */}
      <circle cx="68" cy="64" r="22" fill="white" stroke="#1A1A2E" strokeWidth="3"/>
      <polygon points="68,46 77,53 74,64 62,64 59,53" fill="#1A1A2E"/>
      <polygon points="74,64 80,58 86,64 83,72 74,72" fill="none" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="62,64 56,58 50,64 53,72 62,72" fill="none" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="74,72 83,72 80,80 68,84 56,80 53,72 62,72" fill="none" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* Star flash */}
      <polygon points="87,7 89,13 96,11 91,17 97,21 90,22 92,29 87,23 82,29 84,22 77,21 83,17 78,11 85,13" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="1"/>
    </svg>
  )
}

function ElMuro() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#F5F0E8"/>
      {/* Bricks row 1 (offset) */}
      <rect x="-4" y="48" width="38" height="16" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="36" y="48" width="38" height="16" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="76" y="48" width="28" height="16" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      {/* Bricks row 2 */}
      <rect x="4"  y="66" width="36" height="16" fill="#D06810" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="42" y="66" width="36" height="16" fill="#D06810" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="80" y="66" width="24" height="16" fill="#D06810" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      {/* Bricks row 3 */}
      <rect x="-4" y="84" width="38" height="20" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="36" y="84" width="38" height="20" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      <rect x="76" y="84" width="28" height="20" fill="#E07820" stroke="#1A1A2E" strokeWidth="2.5" rx="1"/>
      {/* Wall top edge */}
      <rect x="0" y="44" width="100" height="6" fill="#B85800" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* Eyes peering over wall */}
      <circle cx="32" cy="30" r="15" fill="white" stroke="#1A1A2E" strokeWidth="3"/>
      <circle cx="68" cy="30" r="15" fill="white" stroke="#1A1A2E" strokeWidth="3"/>
      {/* Pupils */}
      <circle cx="36" cy="27" r="7"   fill="#1A1A2E"/>
      <circle cx="72" cy="27" r="7"   fill="#1A1A2E"/>
      {/* Highlights */}
      <circle cx="39" cy="24" r="2.5" fill="white"/>
      <circle cx="75" cy="24" r="2.5" fill="white"/>
      {/* Angry V eyebrows */}
      <line x1="20" y1="16" x2="38" y2="20" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round"/>
      <line x1="62" y1="20" x2="80" y2="16" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

function ElVarazo() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#1A1A2E"/>
      {/* TV body */}
      <rect x="16" y="18" width="68" height="52" rx="5" fill="#2D2D50" stroke="#CCFF00" strokeWidth="3"/>
      {/* Screen */}
      <rect x="22" y="24" width="56" height="40" rx="3" fill="#4338CA"/>
      {/* VAR text */}
      <text x="50" y="51" textAnchor="middle" fontFamily="monospace" fontWeight="900" fontSize="20" fill="white" letterSpacing="4">VAR</text>
      {/* Blinking underscore detail */}
      <rect x="29" y="55" width="42" height="3" rx="1" fill="white" opacity="0.25"/>
      {/* TV stand */}
      <rect x="34" y="70" width="10" height="12" rx="1" fill="#2D2D50" stroke="#CCFF00" strokeWidth="2"/>
      <rect x="56" y="70" width="10" height="12" rx="1" fill="#2D2D50" stroke="#CCFF00" strokeWidth="2"/>
      {/* Antenna left */}
      <line x1="40" y1="18" x2="30" y2="6"  stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="29" cy="5" r="3" fill="#CCFF00"/>
      {/* Antenna right */}
      <line x1="60" y1="18" x2="70" y2="6"  stroke="#CCFF00" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="71" cy="5" r="3" fill="#CCFF00"/>
      {/* Lightning left */}
      <polygon points="7,30 12,30 8,46 14,46 9,62 4,62 8,47 2,47" fill="#CCFF00"/>
      {/* Lightning right */}
      <polygon points="93,30 88,30 92,46 86,46 91,62 96,62 92,47 98,47" fill="#CCFF00"/>
      {/* Stars bottom */}
      <circle cx="22" cy="88" r="4" fill="#FF4B4B"/>
      <circle cx="50" cy="90" r="3" fill="#FF4B4B"/>
      <circle cx="78" cy="88" r="4" fill="#FF4B4B"/>
    </svg>
  )
}

function LaRemontada() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#FF4B4B"/>
      {/* Big upward arrow */}
      <polygon
        points="50,6 78,40 63,40 63,94 37,94 37,40 22,40"
        fill="white"
        stroke="#1A1A2E"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Stars (4-pointed) */}
      <polygon points="14,16 16,22 22,20 16,26 14,32 12,26 6,20 12,22"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="86,10 88,16 94,14 88,20 86,26 84,20 78,14 84,16"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="90,54 92,59 98,58 93,62 90,68 88,62 82,58 88,59"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="10,64 12,69 18,68 13,72 10,78 8,72 2,68 8,69"    fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* Small accent dots */}
      <circle cx="20" cy="46" r="5" fill="#CCFF00" stroke="#1A1A2E" strokeWidth="2"/>
      <circle cx="82" cy="80" r="5" fill="#CCFF00" stroke="#1A1A2E" strokeWidth="2"/>
    </svg>
  )
}

function RojaDirecta() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#F5F0E8"/>
      {/* Card shadow */}
      <rect x="35" y="27" width="38" height="54" rx="4" fill="#1A1A2E" transform="rotate(10,54,54)"/>
      {/* Red card */}
      <rect x="28" y="20" width="38" height="54" rx="4" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="3" transform="rotate(10,47,47)"/>
      {/* Exclamation mark on card */}
      <rect x="44" y="30" width="7" height="26" rx="3" fill="white" transform="rotate(10,47,43)"/>
      <circle cx="50" cy="68" r="4.5" fill="white" transform="rotate(10,50,68)"/>
      {/* Sparks/stars flying off */}
      <polygon points="12,14 14,19 20,18 15,23 12,28 10,23 4,18 10,19"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="82,8  84,13 90,12 85,17 82,22 80,17 74,12 80,13"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      <polygon points="88,36 90,41 96,40 91,45 88,50 86,45 80,40 86,41"  fill="#CCFF00" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* Whistle accent */}
      <ellipse cx="14" cy="58" rx="6" ry="5" fill="#4338CA" stroke="#1A1A2E" strokeWidth="2"/>
      <line x1="20" y1="58" x2="28" y2="55" stroke="#4338CA" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

const ILLUSTRATIONS = {
  gol_agonico:  GolAgonico,
  el_muro:      ElMuro,
  el_varazo:    ElVarazo,
  la_remontada: LaRemontada,
  roja_directa: RojaDirecta,
}

export default function FiguritaIlustracion({ id }) {
  const Component = ILLUSTRATIONS[id]
  if (!Component) {
    return <div style={{ width: '100%', height: '100%', background: '#eee' }} />
  }
  return <Component />
}
