import { createContext, useContext } from 'react'

// ── 수채화풍 2D 일러스트 부품 ─────────────────────────────
// 좌표계: 장면 400 x 280. 캐릭터는 발끝 가운데가 (0,0), 위쪽이 음수 y.
export const ArtId = createContext('')

const INK = '#6b5a52'
const SKIN = '#f7dcc6'
const PINK = '#eaa7ba'   // 저고리
const LAV = '#a79bd4'    // 고름·깃·소맷부리
const GREEN = '#9fc4a8'  // 치마
const HEM = '#e9aaa4'    // 속치마
const SKY = {
  day: ['#bcd9ea', '#f4ecd9'], dawn: ['#d9d0ea', '#fde6cf'], sea: ['#a8d5e2', '#e9f4ef'],
  dusk: ['#e9c9c3', '#fbe8c6'], wind: ['#a9bccd', '#e4e9ea'], deep: ['#6fa7c7', '#2f6f95'],
}
const tr = (x, y, s = 1, flip = false) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`
const edge = { stroke: INK, strokeOpacity: 0.38, strokeWidth: 1 }

// 번지는 가장자리 + 종이 결 + 하늘 그라데이션
export function Defs({ id }) {
  return (
    <defs>
      <filter id={`wc-${id}`} x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
        <feGaussianBlur stdDeviation="0.3" />
      </filter>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" />
        <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0.16 0" />
      </filter>
      {Object.entries(SKY).map(([k, [a, b]]) => (
        <linearGradient key={k} id={`sky-${id}-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      ))}
    </defs>
  )
}

export function Sky({ tone = 'day' }) {
  const id = useContext(ArtId)
  return <rect width="400" height="280" fill={`url(#sky-${id}-${tone})`} />
}

// ── 하늘·땅·바다 ─────────────────────────────────────────
export function Cloud({ x, y, s = 1, c = '#fff' }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-34 8 C-40 -8 -18 -18 -6 -8 C0 -24 28 -22 28 -6 C46 -8 50 12 32 14 Z" fill={c} fillOpacity=".93" stroke="#c4d3de" strokeWidth="1" />
      <path d="M-8 -2 c7 -9 18 -2 13 6 c-4 6 -12 3 -10 -3" fill="none" stroke="#b6c8d6" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M30 4 c16 2 28 7 44 5" fill="none" stroke="#c4d3de" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
}

export function Mountain({ x, y, w, h, c1 = '#aab6dc', shade = false }) {
  const top = `C${x - w * 0.3} ${y - h * 0.9} ${x - w * 0.12} ${y - h} ${x} ${y - h}`
  const right = `C${x + w * 0.12} ${y - h} ${x + w * 0.3} ${y - h * 0.9} ${x + w / 2} ${y}`
  return (
    <g>
      <path d={`M${x - w / 2} ${y} ${top} ${right} Z`} fill={c1} />
      {shade && <path d={`M${x} ${y - h} ${right} L${x} ${y} Z`} fill="#4b5a8a" opacity=".16" />}
    </g>
  )
}

export function Hill({ y = 210, c = '#a8cfa0', c2 }) {
  return (
    <g>
      <path d={`M0 ${y} C90 ${y - 18} 200 ${y + 10} 400 ${y - 10} V280 H0Z`} fill={c} />
      {c2 && <path d={`M0 ${y + 24} C110 ${y + 6} 230 ${y + 34} 400 ${y + 12} V280 H0Z`} fill={c2} opacity=".55" />}
    </g>
  )
}

export function Sea({ y = 170, c = '#9fd0dc' }) {
  return (
    <g>
      <rect y={y} width="400" height={280 - y} fill={c} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${-20 + i * 14} ${y + 14 + i * 20} q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`} stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" fill="none" />
      ))}
    </g>
  )
}

export function Sun({ x, y, r = 24, c = '#ffd98a' }) {
  return <g><circle cx={x} cy={y} r={r * 1.6} fill={c} opacity=".28" /><circle cx={x} cy={y} r={r} fill={c} opacity=".85" /></g>
}

export function Oreum({ x, y, s = 1, crater = true, c = '#9bc08c' }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-28 0 C-22 -22 -11 -27 0 -27 C11 -27 22 -22 28 0Z" fill={c} {...edge} />
      {crater && <ellipse cx="0" cy="-25" rx="9" ry="3.2" fill="#8a6a4f" {...edge} />}
    </g>
  )
}

export function Sanbang({ x, y, w = 100, h = 90 }) {
  return (
    <g>
      <path d={`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 0.7} ${x - w * 0.25} ${y - h} ${x} ${y - h} C${x + w * 0.25} ${y - h} ${x + w / 2} ${y - h * 0.7} ${x + w / 2} ${y}Z`} fill="#bdb394" {...edge} />
      <path d={`M${x - w * 0.18} ${y - h * 0.9} Q${x} ${y - h * 1.04} ${x + w * 0.18} ${y - h * 0.9} Q${x} ${y - h * 0.8} ${x - w * 0.18} ${y - h * 0.9}Z`} fill="#8fb67f" />
      {[-0.28, -0.1, 0.1, 0.28].map((k) => <path key={k} d={`M${x + w * k} ${y - h * 0.75} L${x + w * k * 1.2} ${y - 4}`} stroke="#8d8466" strokeOpacity=".55" strokeWidth="1.6" />)}
    </g>
  )
}

export function Mist({ y = 150, o = 0.4 }) {
  return <g fill="#fff" opacity={o}><ellipse cx="90" cy={y} rx="120" ry="14" /><ellipse cx="300" cy={y + 18} rx="130" ry="12" /></g>
}

// ── 작은 소품 ────────────────────────────────────────────
export function Canola({ x, y, n = 8, w = 160 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x + (i / (n - 1)) * w, py = y + ((i * 7) % 9)
        return <g key={i}><path d={`M${px} ${py} v-12`} stroke="#6fa56a" strokeWidth="1.5" /><circle cx={px} cy={py - 14} r="4.5" fill="#f4d34a" /><circle cx={px - 1} cy={py - 15} r="1.5" fill="#fff6b0" /></g>
      })}
    </g>
  )
}

export function Swirl({ x, y, s = 1, o = 0.85, flip = false }) {
  return <path transform={tr(x, y, s, flip)} d="M0 0 c20 -14 44 -6 40 8 c-3 10 -18 8 -17 0 M-6 8 c12 4 30 4 46 -2" stroke="#fff" strokeOpacity={o} strokeWidth="2.6" strokeLinecap="round" fill="none" />
}

export function Bubbles({ x, y }) {
  return <g fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4">{[[0, 0, 5], [8, -14, 3.5], [-4, -26, 4.5], [6, -40, 3]].map(([a, b, r], i) => <circle key={i} cx={x + a} cy={y + b} r={r} />)}</g>
}

export function Fish({ x, y, s = 1, c = '#f2a65a', flip = false }) {
  return (
    <g transform={tr(x, y, s, flip)}>
      <path d="M-14 0 Q0 -10 14 0 Q0 10 -14 0Z" fill={c} {...edge} /><path d="M14 0 L24 -8 L24 8Z" fill={c} {...edge} /><circle cx="-7" cy="-1.5" r="1.4" fill={INK} />
    </g>
  )
}

export function Seaweed({ x, y, h = 50, c = '#6fae7a' }) {
  return <g fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" opacity=".9"><path d={`M${x} ${y} q-8 -${h * 0.3} 0 -${h * 0.55} q8 -${h * 0.25} 0 -${h * 0.5}`} /><path d={`M${x + 9} ${y} q8 -${h * 0.3} 0 -${h * 0.5} q-8 -${h * 0.2} 0 -${h * 0.4}`} /></g>
}

export function Abalone({ x, y, s = 1 }) {
  return <g transform={tr(x, y, s)}><ellipse rx="14" ry="8" fill="#a98f7a" {...edge} /><ellipse rx="9" ry="4.5" cy="-1" fill="#e9b8c9" /></g>
}

export function Shell({ x, y, s = 1 }) {
  return <g transform={tr(x, y, s)}><path d="M-9 4 Q-14 -8 0 -12 Q14 -8 9 4 Q0 9 -9 4Z" fill="#f1d6c1" {...edge} /><path d="M-3 -2 q3 -5 6 0 q-3 5 -6 0" fill="none" stroke="#c8997d" strokeWidth="1.2" /></g>
}

export function Tewak({ x, y, s = 1, net = true }) {
  return (
    <g transform={tr(x, y, s)}>
      {net && <g fill="none" stroke="#9a8f7a" strokeWidth="1.2"><path d="M-16 14 Q-22 52 0 58 Q22 52 16 14" fill="#9a8f7a" fillOpacity=".12" /><path d="M-12 22 L12 22 M-14 34 L14 34 M-10 46 L10 46 M-6 16 L-8 56 M2 16 L2 58 M10 16 L8 56" /></g>}
      <circle r="22" fill="#f08a3c" {...edge} /><path d="M-12 -12 A17 17 0 0 1 4 -17" stroke="#fff" strokeOpacity=".7" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M-4 -22 q4 -8 8 0" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.6" />
    </g>
  )
}

export function Kite({ x, y, s = 1, c = '#f2a6b8' }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M0 -16 L12 0 L0 20 L-12 0Z" fill={c} {...edge} /><path d="M0 -16 V20 M-12 0 H12" stroke="#fff" strokeOpacity=".6" />
      <path d="M0 20 q-8 14 2 26 q8 12 -2 26" fill="none" stroke={INK} strokeOpacity=".5" strokeWidth="1.2" /><circle cx="-2" cy="38" r="2.4" fill="#a79bd4" /><circle cx="2" cy="56" r="2.4" fill="#f4d34a" />
    </g>
  )
}

export function House({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <rect x="-26" y="-26" width="52" height="26" fill="#ebdcc0" {...edge} />
      <path d="M-34 -24 Q0 -58 34 -24 Q0 -34 -34 -24Z" fill="#d9b86a" {...edge} />
      <path d="M-22 -30 L-18 -26 M-6 -38 L-4 -30 M10 -36 L12 -29 M22 -29 L24 -26" stroke="#b8923f" strokeWidth="1.2" />
      <rect x="-7" y="-17" width="14" height="17" fill="#a98763" />
    </g>
  )
}

export function StoneWall({ x, y, w = 160 }) {
  const cols = ['#a8a6a2', '#92908c', '#b7b4ae', '#9b9892']
  const n = Math.floor(w / 13)
  return (
    <g>
      {Array.from({ length: n }, (_, i) => <ellipse key={`a${i}`} cx={x + i * 13 + 6} cy={y} rx="7.4" ry="5.6" fill={cols[i % 4]} {...edge} />)}
      {Array.from({ length: n - 1 }, (_, i) => <ellipse key={`b${i}`} cx={x + i * 13 + 12.5} cy={y - 8} rx="7" ry="5.4" fill={cols[(i + 2) % 4]} {...edge} />)}
    </g>
  )
}

export function Table({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-26 -16 H26 V-12 H-26Z" fill="#a67c52" {...edge} /><path d="M-22 -12 V0 M22 -12 V0" stroke="#8a6642" strokeWidth="3" />
      <ellipse cx="-12" cy="-19" rx="8" ry="3.4" fill="#f7efe0" {...edge} /><ellipse cx="10" cy="-19" rx="8" ry="3.4" fill="#f4d9a8" {...edge} />
      <path d="M18 -19 v-12" stroke="#fff3c9" strokeWidth="2.6" strokeLinecap="round" /><path d="M18 -33 q-3 -5 0 -8 q3 3 0 8" fill="#f7b24b" />
    </g>
  )
}

export function Cauldron({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-30 -2 L-18 -14 M30 -2 L18 -14" stroke="#7a5a3c" strokeWidth="5" strokeLinecap="round" />
      <path d="M-14 4 Q-8 -14 0 -22 Q4 -12 10 -8 Q16 -16 14 4Z" fill="#f5a65b" /><path d="M-5 4 Q-1 -8 3 -12 Q6 -4 8 4Z" fill="#f9d77e" />
      <path d="M-52 -50 Q-56 -8 -30 -6 L30 -6 Q56 -8 52 -50Z" fill="#4c4c58" {...edge} />
      <ellipse cx="0" cy="-50" rx="52" ry="10" fill="#2f2f3a" {...edge} /><ellipse cx="0" cy="-50" rx="43" ry="7" fill="#eadbb0" />
      <path d="M-14 -62 q-10 -14 2 -26 q10 -10 0 -22 M8 -62 q-10 -12 2 -22 q10 -10 2 -24 M26 -60 q-6 -10 2 -18" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

export function Rock({ x, y, s = 1, face = false }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-15 0 L-19 -28 Q-14 -50 0 -54 Q15 -48 18 -26 L15 0Z" fill="#a39d93" {...edge} />
      <path d="M4 -53 Q15 -48 18 -26 L15 0 L6 0Z" fill="#6f695f" opacity=".3" />
      <ellipse cx="-8" cy="-46" rx="7" ry="3" fill="#8fb67f" opacity=".75" />
      {face && <g><circle cx="-6" cy="-34" r="2.3" fill="#4a423c" /><circle cx="6" cy="-34" r="2.3" fill="#4a423c" /><path d="M-5 -27 q5 5 10 0" stroke="#4a423c" strokeWidth="1.4" fill="none" strokeLinecap="round" /><circle cx="-10" cy="-28" r="3" fill="#f3a9a0" opacity=".5" /><circle cx="10" cy="-28" r="3" fill="#f3a9a0" opacity=".5" /></g>}
    </g>
  )
}

export function Seeds({ x, y, n = 9 }) {
  return <g>{Array.from({ length: n }, (_, i) => <ellipse key={i} cx={x + ((i * 29) % 90) - 20} cy={y + ((i * 17) % 50)} rx="2.6" ry="1.7" fill={['#f4d34a', '#f2a6b8', '#fff', '#a8cfa0'][i % 4]} transform={`rotate(${i * 40} ${x} ${y})`} />)}</g>
}

// ── 얼굴: 은은한 눈웃음 ──────────────────────────────────
function Face({ y = -166, aged = false }) {
  return (
    <g>
      <path d={`M-13 ${y} q5 4 9 0 M4 ${y} q5 4 9 0`} stroke={INK} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d={`M-14 ${y - 7} q5 -3 10 0 M4 ${y - 7} q5 -3 10 0`} stroke="#a8a29b" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d={`M0 ${y + 4} q3 4 -1 6`} stroke="#d9a98c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d={`M-6 ${y + 14} q6 5 12 0`} stroke="#c0675c" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <circle cx="-15" cy={y + 9} r="5.2" fill="#f3a9a0" opacity=".42" /><circle cx="15" cy={y + 9} r="5.2" fill="#f3a9a0" opacity=".42" />
      {aged && <path d={`M-18 ${y - 1} l-4 -1.5 M18 ${y - 1} l4 -1.5 M-9 ${y - 14} q9 -3 18 0`} stroke="#c9a58d" strokeWidth=".9" fill="none" strokeLinecap="round" />}
    </g>
  )
}

const Arm = ({ d, hand: [hx, hy] }) => (
  <g>
    <path d={d} stroke={INK} strokeOpacity=".35" strokeWidth="17" strokeLinecap="round" fill="none" />
    <path d={d} stroke={PINK} strokeWidth="15" strokeLinecap="round" fill="none" />
    <circle cx={hx} cy={hy} r="8.6" fill={LAV} {...edge} /><circle cx={hx} cy={hy} r="5.8" fill={SKIN} {...edge} />
  </g>
)

const SOIL = [[66, -92], [70, -78], [64, -66], [74, -58], [68, -46], [78, -40], [72, -30]]

// ── 설문대할망 (참고 그림의 의상: 쪽머리·파란 비녀·분홍 저고리·보라 고름·연두 치마·버선) ──
export function Halmang2D({ x, y, s = 1, pose = 'stand', flip = false }) {
  return (
    <g transform={tr(x, y, s, flip)}>
      {/* 치마·속치마·버선·신발 */}
      <path d="M-30 -98 Q-34 -50 -52 -8 Q0 4 52 -8 Q34 -50 30 -98Z" fill={GREEN} {...edge} />
      <path d="M-9 -96 Q-14 -52 -26 -14 M10 -96 Q14 -52 26 -14 M0 -96 Q0 -50 0 -10" stroke="#78a384" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
      <ellipse cx="-14" cy="-40" rx="18" ry="30" fill="#6f9f80" opacity=".16" />
      <path d="M-52 -8 Q0 4 52 -8 L50 -2 Q0 10 -50 -2Z" fill={HEM} {...edge} />
      <ellipse cx="-14" cy="-1" rx="10" ry="4.4" fill="#fff" {...edge} /><ellipse cx="14" cy="-1" rx="10" ry="4.4" fill="#fff" {...edge} />
      <ellipse cx="-18" cy="1" rx="8" ry="3.6" fill="#9b7653" /><ellipse cx="18" cy="1" rx="8" ry="3.6" fill="#9b7653" />
      {/* 저고리와 보라 깃·고름 */}
      <path d="M-26 -138 Q0 -147 26 -138 L31 -94 Q0 -88 -31 -94Z" fill={PINK} {...edge} />
      <path d="M-11 -141 L2 -112 M11 -141 L-2 -112" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M-14 -140 L3 -110 M14 -140 L-3 -110" stroke={LAV} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M2 -112 q-17 -7 -13 6 q9 4 13 -6 M2 -112 q17 -7 13 6 q-9 4 -13 -6" fill={LAV} {...edge} />
      <path d="M1 -108 q-8 24 -2 54 M4 -108 q4 24 10 44" stroke={LAV} strokeWidth="4.4" strokeLinecap="round" fill="none" />
      {/* 팔 */}
      {pose === 'stand' && <><Arm d="M-26 -134 Q-42 -112 -31 -92" hand={[-30, -88]} /><Arm d="M26 -134 Q42 -112 31 -92" hand={[30, -88]} /></>}
      {pose === 'wave' && <><Arm d="M-26 -134 Q-42 -112 -31 -92" hand={[-30, -88]} /><Arm d="M26 -134 Q52 -148 54 -178" hand={[54, -183]} /></>}
      {pose === 'stretch' && <><Arm d="M-26 -134 Q-48 -160 -42 -198" hand={[-42, -203]} /><Arm d="M26 -134 Q48 -160 42 -198" hand={[42, -203]} /></>}
      {pose === 'throw' && <><Arm d="M-26 -134 Q-42 -112 -31 -92" hand={[-30, -88]} /><Arm d="M26 -134 Q50 -160 40 -196" hand={[40, -201]} /><path d="M26 -206 Q38 -224 54 -214 Q60 -200 48 -194 Q34 -190 26 -206Z" fill="#a39d93" {...edge} /></>}
      {pose === 'pour' && (
        <>
          <Arm d="M-26 -134 Q-8 -112 22 -104" hand={[24, -104]} /><Arm d="M26 -134 Q52 -122 62 -102" hand={[62, -100]} />
          <g transform="translate(44 -106) rotate(-22)">
            <ellipse rx="35" ry="13" fill="#dcc47d" {...edge} />
            <path d="M-30 -2 Q0 -15 30 -2 Q22 7 0 8 Q-22 7 -30 -2Z" fill="#9b7653" />
            <path d="M-26 5 L-20 12 M-13 7 L-7 13 M1 8 L7 13 M15 6 L21 11" stroke="#b99a4e" strokeWidth="1.4" />
          </g>
          <path d="M66 -94 Q70 -70 74 -36" stroke="#9b7653" strokeOpacity=".5" strokeWidth="5" strokeLinecap="round" fill="none" />
          {SOIL.map(([a, b], i) => <circle key={i} cx={a} cy={b} r={2 + (i % 3) * 0.7} fill="#9b7653" />)}
        </>
      )}
      {/* 머리: 은빛 쪽머리·파란 비녀 */}
      <rect x="-6" y="-146" width="12" height="12" fill={SKIN} />
      <ellipse cx="0" cy="-166" rx="23" ry="27" fill={SKIN} {...edge} />
      <path d="M-24 -168 C-26 -204 26 -204 24 -168 C15 -184 -15 -184 -24 -168Z" fill="#cfcfd6" {...edge} />
      <path d="M-23 -166 q-3 10 1 18 M23 -166 q3 10 -1 18" stroke="#cfcfd6" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="0" cy="-203" r="12" fill="#c3c3cc" {...edge} />
      <path d="M-14 -199 L20 -209" stroke="#6ec1d9" strokeWidth="3.2" strokeLinecap="round" /><circle cx="21" cy="-209.5" r="2.8" fill="#6ec1d9" />
      <Face aged />
    </g>
  )
}

// ── 해녀 (오리지널 캐릭터: 흰 수건, 물안경, 검은 물옷) ────────
export function Haenyeo2D({ x, y, s = 1, pose = 'stand', flip = false, clipBelow }) {
  const id = useContext(ArtId)
  const arms = {
    stand: <><path d="M-17 -126 Q-28 -104 -20 -86" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /><path d="M17 -126 Q28 -104 20 -86" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /></>,
    wave: <><path d="M-17 -126 Q-28 -104 -20 -86" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /><path d="M17 -126 Q40 -140 42 -166" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /><circle cx="42" cy="-170" r="6" fill={SKIN} {...edge} /></>,
    pray: <><path d="M-17 -126 Q-26 -110 -4 -108" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /><path d="M17 -126 Q26 -110 4 -108" stroke="#4b5964" strokeWidth="12" strokeLinecap="round" fill="none" /><circle cx="0" cy="-108" r="6" fill={SKIN} {...edge} /></>,
  }
  return (
    <g transform={tr(x, y, s, flip)} clipPath={clipBelow ? `url(#clip-${id})` : undefined}>
      {clipBelow && <clipPath id={`clip-${id}`}><rect x="-80" y="-260" width="160" height={260 + clipBelow} /></clipPath>}
      <path d="M-11 -84 L-13 -8 M11 -84 L13 -8" stroke="#4b5964" strokeWidth="15" strokeLinecap="round" />
      <ellipse cx="-13" cy="-2" rx="9" ry="4" fill={SKIN} {...edge} /><ellipse cx="13" cy="-2" rx="9" ry="4" fill={SKIN} {...edge} />
      <path d="M-17 -130 Q0 -138 17 -130 L15 -82 Q0 -76 -15 -82Z" fill="#4b5964" {...edge} />
      <path d="M-15 -100 Q0 -94 15 -100" stroke="#fff" strokeOpacity=".3" strokeWidth="1.4" fill="none" />
      {arms[pose]}
      <rect x="-5" y="-142" width="10" height="12" fill={SKIN} />
      <ellipse cx="0" cy="-156" rx="21" ry="24" fill={SKIN} {...edge} />
      <path d="M-22 -158 C-24 -190 24 -190 22 -158 C13 -170 -13 -170 -22 -158Z" fill="#fff" {...edge} />
      <path d="M-22 -160 l-10 6 l6 4 M22 -160 l10 6 l-6 4" fill="#fff" {...edge} />
      <ellipse cx="0" cy="-173" rx="15" ry="6.5" fill="#d3ecf3" stroke="#6b8aa0" strokeWidth="2" />
      <g transform="translate(0 10)"><Face y={-166} /></g>
    </g>
  )
}

// ── 돌하르방 ─────────────────────────────────────────────
const SPECKS = Array.from({ length: 34 }, (_, i) => [((i * 37) % 64) - 32, -((i * 53) % 190) - 2, 0.8 + (i % 3) * 0.5])
export function Hareubang2D({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-34 -104 Q-42 -50 -30 0 L30 0 Q42 -50 34 -104Z" fill="#adb0b3" {...edge} />
      <path d="M8 -104 Q34 -100 34 -104 Q42 -50 30 0 L12 0Z" fill="#7e8286" opacity=".25" />
      <ellipse cx="0" cy="-138" rx="31" ry="33" fill="#b6b9bc" {...edge} />
      <path d="M-36 -150 Q-32 -196 0 -198 Q32 -196 36 -150 Q0 -160 -36 -150Z" fill="#8f9296" {...edge} />
      <path d="M-40 -150 Q0 -160 40 -150" stroke="#6f7377" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="-12" cy="-142" rx="8" ry="9" fill="#d2d4d6" {...edge} /><ellipse cx="12" cy="-142" rx="8" ry="9" fill="#d2d4d6" {...edge} />
      <circle cx="-12" cy="-141" r="4" fill="#4d5156" /><circle cx="12" cy="-141" r="4" fill="#4d5156" /><circle cx="-10.5" cy="-143" r="1.3" fill="#fff" /><circle cx="13.5" cy="-143" r="1.3" fill="#fff" />
      <path d="M-8 -138 Q0 -112 8 -138 Q12 -112 0 -108 Q-12 -112 -8 -138Z" fill="#c9cbcd" {...edge} />
      <path d="M-10 -114 q10 5 20 0" stroke="#5e6266" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="-12" cy="-72" rx="14" ry="8" fill="#c2c4c7" {...edge} /><ellipse cx="10" cy="-76" rx="14" ry="8" fill="#c8cacc" {...edge} />
      <path d="M-20 -70 l4 4 M-12 -68 l3 4 M2 -74 l4 4 M10 -72 l3 4" stroke="#8f9296" strokeWidth="1" />
      {SPECKS.map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r * 0.6} fill="#6e7276" opacity=".4" />)}
    </g>
  )
}

// ── 아이(보호자) ─────────────────────────────────────────
export function Kid2D({ x, y, s = 1, color = '#8ec5e6', hair = '#4a3a33', pants = '#7c8aa8', walk = false, flip = false, point = false }) {
  return (
    <g transform={tr(x, y, s, flip)}>
      <path d={walk ? 'M-8 0 L-4 -24' : 'M-5 0 L-5 -24'} stroke={pants} strokeWidth="6.5" strokeLinecap="round" />
      <path d={walk ? 'M8 -3 L4 -24' : 'M5 0 L5 -24'} stroke={pants} strokeWidth="6.5" strokeLinecap="round" />
      <path d="M-11 -26 Q-12 -48 -8 -52 L8 -52 Q12 -48 11 -26Z" fill={color} {...edge} />
      <path d="M-10 -48 Q-17 -37 -13 -28" stroke={color} strokeWidth="5.4" strokeLinecap="round" fill="none" />
      <path d={point ? 'M10 -48 Q22 -52 30 -56' : 'M10 -48 Q17 -37 13 -28'} stroke={color} strokeWidth="5.4" strokeLinecap="round" fill="none" />
      <circle cx={point ? 31 : 13} cy={point ? -57 : -26} r="3.2" fill={SKIN} /><circle cx="-13" cy="-26" r="3.2" fill={SKIN} />
      <circle cx="0" cy="-63" r="12.8" fill={SKIN} {...edge} />
      <path d="M-13.5 -63 Q-14 -79 0 -79 Q14 -79 13.5 -63 Q8 -71 0 -70 Q-8 -71 -13.5 -63Z" fill={hair} />
      <circle cx="-4.6" cy="-62" r="1.4" fill={INK} /><circle cx="4.6" cy="-62" r="1.4" fill={INK} />
      <path d="M-3.5 -57 q3.5 3 7 0" stroke="#c0675c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="-8" cy="-58" r="2.6" fill="#f3a9a0" opacity=".5" /><circle cx="8" cy="-58" r="2.6" fill="#f3a9a0" opacity=".5" />
    </g>
  )
}
