// Ilustraciones SVG para cada figurita. Estilo neo-brutalista kawaii:
// formas geométricas planas, trazo negro grueso, paleta de marca.
// Sin siluetas ni caras de personas reales.

function VarCharla() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="#FFE500"/>
      {/* TV body */}
      <rect x="12" y="18" width="64" height="48" rx="7" fill="#F5F0E8" stroke="#1A1A2E" strokeWidth="3"/>
      {/* TV screen */}
      <rect x="19" y="25" width="50" height="34" rx="4" fill="#BFD7F5" stroke="#1A1A2E" strokeWidth="2"/>
      {/* Suspicious squinting eyes */}
      <ellipse cx="34" cy="38" rx="5.5" ry="3.5" fill="#1A1A2E"/>
      <ellipse cx="54" cy="38" rx="5.5" ry="3.5" fill="#1A1A2E"/>
      {/* Eye shine */}
      <ellipse cx="36" cy="36.5" rx="2" ry="1.5" fill="white" opacity="0.7"/>
      <ellipse cx="56" cy="36.5" rx="2" ry="1.5" fill="white" opacity="0.7"/>
      {/* Suspicious slanted brows */}
      <line x1="27" y1="31" x2="41" y2="34" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="47" y1="34" x2="61" y2="31" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Smirk */}
      <path d="M35,50 C40,54 52,53 58,49" fill="none" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Sweat drop */}
      <ellipse cx="62" cy="30" rx="2.5" ry="3.5" fill="#4338CA" stroke="#1A1A2E" strokeWidth="1"/>
      <circle cx="62" cy="27" r="1.5" fill="#4338CA" stroke="#1A1A2E" strokeWidth="0.8"/>
      {/* TV antennae */}
      <line x1="34" y1="18" x2="26" y2="6" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="25" cy="5" r="3" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="1.5"/>
      <line x1="54" y1="18" x2="62" y2="6" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="63" cy="5" r="3" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="1.5"/>
      {/* TV legs */}
      <rect x="26" y="66" width="9" height="9" rx="2" fill="#F5F0E8" stroke="#1A1A2E" strokeWidth="2"/>
      <rect x="53" y="66" width="9" height="9" rx="2" fill="#F5F0E8" stroke="#1A1A2E" strokeWidth="2"/>
      {/* VAR label below TV */}
      <rect x="22" y="77" width="44" height="13" rx="3" fill="#1A1A2E"/>
      <text x="44" y="87" textAnchor="middle" fontFamily="monospace" fontWeight="900" fontSize="8" fill="#FFE500" letterSpacing="3">VAR</text>
      {/* Magnifying glass (right side) */}
      <circle cx="83" cy="56" r="13" fill="white" stroke="#1A1A2E" strokeWidth="3"/>
      <circle cx="83" cy="56" r="9" fill="#BFD7F5" stroke="#1A1A2E" strokeWidth="1.5"/>
      <text x="80" y="61" fontFamily="sans-serif" fontWeight="900" fontSize="11" fill="#1A1A2E">?</text>
      {/* Handle */}
      <line x1="93" y1="67" x2="98" y2="73" stroke="#1A1A2E" strokeWidth="5" strokeLinecap="round"/>
      {/* Exclamation marks accent */}
      <text x="4" y="55" fontFamily="sans-serif" fontWeight="900" fontSize="12" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="0.8">!</text>
      <text x="4" y="40" fontFamily="sans-serif" fontWeight="900" fontSize="9" fill="#FF4B4B" stroke="#1A1A2E" strokeWidth="0.6">?</text>
    </svg>
  )
}

function DefensaBloque() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Fondo amarillo mostaza */}
      <rect width="200" height="200" rx="24" fill="#F5C518"/>

      {/* Cartel ligeramente torcido */}
      <g transform="rotate(-3, 100, 100)">
        {/* Cuerpo del cartel */}
        <rect x="25" y="55" width="150" height="90" rx="8"
              fill="#FFF8E7" stroke="#000" strokeWidth="5"/>

        {/* Texto CERRADO */}
        <text x="100" y="108" textAnchor="middle"
              fontFamily="Arial Black, sans-serif"
              fontWeight="900" fontSize="32"
              fill="#CC0000" stroke="#000" strokeWidth="2"
              paintOrder="stroke fill">
          CERRADO
        </text>

        {/* Ojos somnolientos */}
        <path d="M65 75 Q72 70 79 75" fill="none"
              stroke="#000" strokeWidth="4" strokeLinecap="round"/>
        <path d="M121 75 Q128 70 135 75" fill="none"
              stroke="#000" strokeWidth="4" strokeLinecap="round"/>

        {/* Boca plana aburrida */}
        <line x1="85" y1="88" x2="115" y2="88"
              stroke="#000" strokeWidth="4" strokeLinecap="round"/>
      </g>

      {/* Cadena y candado */}
      <line x1="148" y1="30" x2="148" y2="55"
            stroke="#888" strokeWidth="4"/>
      <rect x="138" y="18" width="20" height="14" rx="3"
            fill="#888" stroke="#000" strokeWidth="3"/>
      <path d="M142 18 Q142 10 148 10 Q154 10 154 18"
            fill="none" stroke="#888" strokeWidth="4"/>

      {/* ZZZ */}
      <text x="155" y="75" fontFamily="Arial Black, sans-serif"
            fontWeight="900" fontSize="18" fill="#000" opacity="0.4">
        z z z
      </text>
    </svg>
  )
}

function AnuloMufa() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="200" height="200" rx="24" fill="#A3E635"/>

      {/* Puño cerrado — base de la mano */}
      <rect x="62" y="120" width="76" height="55" rx="14"
            fill="#FFD700" stroke="#000" strokeWidth="5"/>

      {/* Nudillos de los dedos cerrados */}
      <rect x="62" y="118" width="18" height="20" rx="8"
            fill="#FFD700" stroke="#000" strokeWidth="4"/>
      <rect x="83" y="115" width="18" height="23" rx="8"
            fill="#FFD700" stroke="#000" strokeWidth="4"/>
      <rect x="104" y="116" width="18" height="22" rx="8"
            fill="#FFD700" stroke="#000" strokeWidth="4"/>
      <rect x="124" y="120" width="16" height="18" rx="8"
            fill="#FFD700" stroke="#000" strokeWidth="4"/>

      {/* Pulgar hacia el costado */}
      <rect x="38" y="130" width="30" height="18" rx="9"
            fill="#FFD700" stroke="#000" strokeWidth="4"/>

      {/* Dedo índice levantado — claramente parte de la mano */}
      <rect x="83" y="58" width="22" height="62" rx="11"
            fill="#FFD700" stroke="#000" strokeWidth="5"/>
      {/* Uña */}
      <ellipse cx="94" cy="64" rx="8" ry="5"
               fill="#FFF8DC" stroke="#000" strokeWidth="2"/>

      {/* Burbuja TE LO DIJE */}
      <rect x="115" y="42" width="76" height="38" rx="10"
            fill="#FFF" stroke="#000" strokeWidth="4"/>
      <polygon points="118,72 106,82 130,72"
               fill="#FFF" stroke="#000" strokeWidth="3"/>
      <text x="153" y="66" textAnchor="middle"
            fontFamily="Arial Black, sans-serif"
            fontWeight="900" fontSize="12"
            fill="#000">TE LO DIJE</text>

      {/* Destellos */}
      <text x="22" y="70" fontSize="22">✨</text>
      <text x="158" y="168" fontSize="16">⭐</text>
      <text x="30" y="175" fontSize="14">✨</text>
    </svg>
  )
}

function AbsolutoCine() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Fondo azul oscuro con estrellas */}
      <rect width="200" height="200" rx="24" fill="#1a1a2e"/>
      <circle cx="30" cy="25" r="2" fill="#FFF" opacity="0.6"/>
      <circle cx="170" cy="35" r="1.5" fill="#FFF" opacity="0.5"/>
      <circle cx="155" cy="15" r="2" fill="#FFF" opacity="0.7"/>
      <circle cx="55" cy="18" r="1.5" fill="#FFF" opacity="0.4"/>
      <circle cx="185" cy="70" r="2" fill="#FFF" opacity="0.5"/>

      {/* Bolsa de palomitas — forma trapezoidal */}
      <path d="M60 95 L50 175 L150 175 L140 95 Z"
            fill="#CC0000" stroke="#000" strokeWidth="5"
            strokeLinejoin="round"/>
      {/* Rayas amarillas verticales */}
      <path d="M75 95 L66 175" stroke="#FFD700" strokeWidth="8"
            strokeLinecap="butt"/>
      <path d="M95 95 L88 175" stroke="#FFD700" strokeWidth="8"/>
      <path d="M115 95 L112 175" stroke="#FFD700" strokeWidth="8"/>
      <path d="M135 95 L134 175" stroke="#FFD700" strokeWidth="8"/>
      {/* Tapa blanca del borde superior */}
      <path d="M55 95 L145 95 L140 108 L60 108 Z"
            fill="#FFF" stroke="#000" strokeWidth="4"
            strokeLinejoin="round"/>

      {/* Cara de shock en la bolsa */}
      {/* Ojos desorbitados */}
      <circle cx="82" cy="128" r="14"
              fill="#FFF" stroke="#000" strokeWidth="4"/>
      <circle cx="118" cy="128" r="14"
              fill="#FFF" stroke="#000" strokeWidth="4"/>
      {/* Pupilas pequeñas descentradas — mirando hacia arriba */}
      <circle cx="85" cy="122" r="5" fill="#000"/>
      <circle cx="121" cy="122" r="5" fill="#000"/>
      {/* Brillo en los ojos */}
      <circle cx="88" cy="119" r="2" fill="#FFF"/>
      <circle cx="124" cy="119" r="2" fill="#FFF"/>
      {/* Boca abierta en O de shock */}
      <ellipse cx="100" cy="155" rx="14" ry="12"
               fill="#000" stroke="#000" strokeWidth="2"/>
      <ellipse cx="100" cy="155" rx="9" ry="7" fill="#CC0000"/>

      {/* Palomitas volando — asimétricas */}
      <ellipse cx="48" cy="68" rx="14" ry="10"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(-25, 48, 68)"/>
      <ellipse cx="48" cy="62" rx="10" ry="7"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(15, 48, 62)"/>

      <ellipse cx="82" cy="52" rx="13" ry="9"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(10, 82, 52)"/>
      <ellipse cx="88" cy="44" rx="9" ry="7"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(-20, 88, 44)"/>

      <ellipse cx="138" cy="58" rx="12" ry="9"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(30, 138, 58)"/>
      <ellipse cx="155" cy="72" rx="10" ry="8"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(-10, 155, 72)"/>

      {/* Palomita pequeña con carita de susto */}
      <ellipse cx="165" cy="50" rx="11" ry="8"
               fill="#FFF8DC" stroke="#000" strokeWidth="3"
               transform="rotate(20, 165, 50)"/>
      <circle cx="163" cy="48" r="2.5" fill="#000"/>
      <circle cx="168" cy="48" r="2.5" fill="#000"/>
      <path d="M162 53 Q165 56 169 53" fill="none"
            stroke="#000" strokeWidth="1.5"
            strokeLinecap="round"/>
    </svg>
  )
}

function ModoAvion() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="100" height="100" fill="white"/>
      {/* Caution tape top */}
      <rect x="0" y="0" width="100" height="14" fill="#FFE500"/>
      <line x1="0"  y1="0" x2="14"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="14" y1="0" x2="28"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="28" y1="0" x2="42"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="42" y1="0" x2="56"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="56" y1="0" x2="70"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="70" y1="0" x2="84"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <line x1="84" y1="0" x2="98"  y2="14" stroke="#1A1A2E" strokeWidth="3.5"/>
      <rect x="0" y="0" width="100" height="14" fill="none" stroke="#1A1A2E" strokeWidth="2"/>
      {/* Phone body */}
      <rect x="27" y="16" width="46" height="72" rx="8" fill="#E8E8E8" stroke="#1A1A2E" strokeWidth="3"/>
      {/* Screen dark */}
      <rect x="32" y="23" width="36" height="55" rx="5" fill="#1A1A2E"/>
      {/* Airplane icon on screen */}
      <path d="M50,35 L62,42 L50,46 L38,42 Z" fill="#CCFF00" opacity="0.85"/>
      <rect x="48" y="46" width="4" height="12" rx="1" fill="#CCFF00" opacity="0.85"/>
      <rect x="40" y="54" width="20" height="3" rx="1" fill="#CCFF00" opacity="0.85"/>
      {/* Signal bars — all X'd out */}
      <rect x="36" y="65" width="5" height="7" rx="1" fill="#4B5563" opacity="0.5"/>
      <rect x="44" y="61" width="5" height="11" rx="1" fill="#4B5563" opacity="0.5"/>
      <rect x="52" y="57" width="5" height="15" rx="1" fill="#4B5563" opacity="0.5"/>
      <rect x="60" y="53" width="5" height="19" rx="1" fill="#4B5563" opacity="0.5"/>
      {/* Big X over signal */}
      <line x1="36" y1="53" x2="65" y2="72" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      <line x1="65" y1="53" x2="36" y2="72" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
      {/* Mummy bandage strips */}
      <rect x="22" y="28" width="56" height="8" rx="2" fill="white" stroke="#1A1A2E" strokeWidth="2" opacity="0.95"/>
      <rect x="20" y="42" width="60" height="8" rx="2" fill="white" stroke="#1A1A2E" strokeWidth="2" opacity="0.95" transform="rotate(-3,50,46)"/>
      <rect x="22" y="58" width="56" height="8" rx="2" fill="white" stroke="#1A1A2E" strokeWidth="2" opacity="0.95" transform="rotate(2,50,62)"/>
      <rect x="18" y="72" width="64" height="8" rx="2" fill="white" stroke="#1A1A2E" strokeWidth="2" opacity="0.9" transform="rotate(-2,50,76)"/>
      {/* Cute eyes peeking through bandage gap (between bandage 1 and 2) */}
      <circle cx="43" cy="38" r="4.5" fill="white" stroke="#1A1A2E" strokeWidth="1.5"/>
      <circle cx="57" cy="38" r="4.5" fill="white" stroke="#1A1A2E" strokeWidth="1.5"/>
      <circle cx="43" cy="38" r="2.5" fill="#1A1A2E"/>
      <circle cx="57" cy="38" r="2.5" fill="#1A1A2E"/>
      <circle cx="44" cy="37" r="1" fill="white"/>
      <circle cx="58" cy="37" r="1" fill="white"/>
      {/* MODO AVIÓN label */}
      <rect x="8" y="92" width="84" height="8" rx="3" fill="#1A1A2E"/>
      <text x="50" y="98.5" textAnchor="middle" fontFamily="monospace" fontWeight="900" fontSize="6.5" fill="#CCFF00" letterSpacing="2">MODO AVIÓN</text>
      {/* Stars accent */}
      <polygon points="8,50 9.5,54 13,53 10.5,56 8,60 5.5,56 2,53 5.5,54" fill="#FFE500" stroke="#1A1A2E" strokeWidth="1"/>
      <polygon points="90,35 91.5,39 95,38 92.5,41 90,45 87.5,41 84,38 87.5,39" fill="#FFE500" stroke="#1A1A2E" strokeWidth="1"/>
    </svg>
  )
}

function DatoInutil() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Background cycles purple→lime→coral for holographic wow effect */}
      <rect width="100" height="100">
        <animate attributeName="fill" values="#4338CA;#5B21B6;#BEF264;#CCFF00;#FF6B6B;#FF4B4B;#4338CA" dur="3s" repeatCount="indefinite"/>
      </rect>

      {/* Brain body */}
      <path
        d="M22,80 C10,80 8,65 14,57 C10,50 13,40 20,34 C22,26 30,19 40,20 C44,25 56,25 60,20 C70,19 78,26 80,34 C87,40 90,50 86,57 C92,65 90,80 78,80 Z"
        fill="#FFD6D6" stroke="#1A1A1A" strokeWidth="3"
      />
      {/* Central fissure */}
      <path d="M50,21 C48,40 52,60 50,80" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round"/>
      {/* Squiggly texture — left hemisphere */}
      <path d="M24,47 C28,41 34,47 38,43" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M26,58 C30,54 34,58 38,55" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Squiggly texture — right hemisphere */}
      <path d="M62,47 C66,41 72,47 76,43" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M62,58 C66,54 70,58 74,55" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>

      {/* Surprised wide eyes */}
      <circle cx="36" cy="64" r="9" fill="white" stroke="#1A1A1A" strokeWidth="2.5"/>
      <circle cx="64" cy="64" r="9" fill="white" stroke="#1A1A1A" strokeWidth="2.5"/>
      {/* Pupils looking UP (shocked) */}
      <circle cx="35" cy="60" r="4.5" fill="#1A1A1A"/>
      <circle cx="63" cy="60" r="4.5" fill="#1A1A1A"/>
      <circle cx="37" cy="57.5" r="2" fill="white"/>
      <circle cx="65" cy="57.5" r="2" fill="white"/>

      {/* Raised surprised eyebrows */}
      <path d="M26,51 C30,47 42,49 45,51" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M55,51 C58,49 70,47 74,51" fill="none" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>

      {/* Surprised O-mouth */}
      <ellipse cx="50" cy="74" rx="5.5" ry="3.5" fill="#1A1A1A"/>
      <ellipse cx="50" cy="73" rx="3.5" ry="2" fill="#FF6B6B"/>

      {/* Explosion burst from brain top */}
      <line x1="50" y1="18" x2="50" y2="4"  stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="50" y1="18" x2="42" y2="5"  stroke="#1A1A1A" strokeWidth="2"   strokeLinecap="round"/>
      <line x1="50" y1="18" x2="58" y2="5"  stroke="#1A1A1A" strokeWidth="2"   strokeLinecap="round"/>
      <line x1="50" y1="18" x2="35" y2="7"  stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="18" x2="65" y2="7"  stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="50" y1="18" x2="26" y2="11" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <line x1="50" y1="18" x2="74" y2="11" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>

      {/* Stars at explosion tips */}
      <circle cx="50" cy="3"  r="3"   fill="#BEF264" stroke="#1A1A1A" strokeWidth="1.5"/>
      <circle cx="34" cy="6"  r="2.5" fill="#FF6B6B" stroke="#1A1A1A" strokeWidth="1.5"/>
      <circle cx="66" cy="6"  r="2.5" fill="#4338CA" stroke="#1A1A1A" strokeWidth="1.5"/>
      <polygon points="26,8 27.5,12 31,10.5 28.5,14 26,17 23.5,14 20,10.5 23.5,12" fill="#BEF264" stroke="#1A1A1A" strokeWidth="1"/>
      <polygon points="74,8 75.5,12 79,10.5 76.5,14 74,17 71.5,14 68,10.5 71.5,12" fill="#BEF264" stroke="#1A1A1A" strokeWidth="1"/>

      {/* Floating ! and ? */}
      <text x="7"  y="70" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="white" stroke="#1A1A1A" strokeWidth="0.8">!</text>
      <text x="82" y="68" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="white" stroke="#1A1A1A" strokeWidth="0.8">?</text>
      <text x="13" y="29" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="white" stroke="#1A1A1A" strokeWidth="0.7" opacity="0.8">?</text>
      <text x="80" y="31" fontFamily="sans-serif" fontWeight="900" fontSize="10" fill="white" stroke="#1A1A1A" strokeWidth="0.7" opacity="0.8">!</text>
    </svg>
  )
}

const ILLUSTRATIONS = {
  var_charla:      VarCharla,
  defensa_bloque:  DefensaBloque,
  anulo_mufa:      AnuloMufa,
  absoluto_cine:   AbsolutoCine,
  modo_avion:      ModoAvion,
  dato_inutil:     DatoInutil,
}

export default function FiguritaIlustracion({ id }) {
  const Component = ILLUSTRATIONS[id]
  if (!Component) {
    return <div style={{ width: '100%', height: '100%', background: '#eee' }} />
  }
  return <Component />
}
