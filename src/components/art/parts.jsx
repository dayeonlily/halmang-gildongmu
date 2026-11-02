import { createContext, useContext } from 'react'
import { MascotArt, MascotId } from './Mascot'

// ── 수채화풍 2D 일러스트 부품 ─────────────────────────────
// 좌표계: 장면 400 x 280. 캐릭터는 발끝 가운데가 (0,0), 위쪽이 음수 y.
export const ArtId = createContext('')

const INK = '#6b5a52'
const LAND = { hillA: ['#b9e0a4', '#8fc788'], hillB: ['#a6d69c', '#79b97f'], mtnB: ['#bccae9', '#a0b1dc'], mtnG: ['#b0d6b8', '#86b99b'], sea: ['#b6e2ea', '#8dcad8'] }
const SKY = {
  day: ['#bcd9ea', '#f4ecd9'], dawn: ['#d9d0ea', '#fde6cf'], sea: ['#a8d5e2', '#e9f4ef'],
  dusk: ['#e9c9c3', '#fbe8c6'], wind: ['#a9bccd', '#e4e9ea'], deep: ['#6fa7c7', '#2f6f95'],
}
const tr = (x, y, s = 1, flip = false) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`
const edge = { stroke: INK, strokeOpacity: 0.38, strokeWidth: 1 }

// 종이 결 + 하늘·산·언덕·바다 그라데이션 (가장자리는 깔끔하게)
export function Defs({ id }) {
  return (
    <defs>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" />
        <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0.14 0" />
      </filter>
      <filter id={`blur-${id}`}><feGaussianBlur stdDeviation="2.2" /></filter>
      {Object.entries(SKY).map(([k, [a, b]]) => (
        <linearGradient key={k} id={`sky-${id}-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      ))}
      {Object.entries(LAND).map(([k, [a, b]]) => (
        <linearGradient key={k} id={`${k}-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
      ))}
      <radialGradient id={`cloud-${id}`} cx=".5" cy=".3" r=".8"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#e6eff6" /></radialGradient>
      <radialGradient id={`sun-${id}`}><stop offset="0" stopColor="#fff6cf" /><stop offset=".45" stopColor="#ffd98a" stopOpacity=".9" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
    </defs>
  )
}

export function Sky({ tone = 'day' }) {
  const id = useContext(ArtId)
  return <rect width="400" height="280" fill={`url(#sky-${id}-${tone})`} />
}

// ── 하늘·땅·바다 ─────────────────────────────────────────
export function Cloud({ x, y, s = 1 }) {
  const id = useContext(ArtId)
  return (
    <g transform={tr(x, y, s)}>
      <ellipse cx="2" cy="14" rx="42" ry="5" fill="#8fa8c0" opacity=".14" />
      <path d="M-36 12 C-44 -4 -22 -16 -8 -6 C-2 -24 30 -22 30 -4 C48 -6 52 14 34 14 Z" fill={`url(#cloud-${id})`} />
      <path d="M-20 -2 c4 -8 14 -8 17 0 M10 -8 c5 -7 15 -4 14 4" stroke="#fff" strokeOpacity=".9" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 4 c14 2 24 6 40 4" stroke="#d4e2ee" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

export function Mountain({ x, y, w, h, tone = 'blue', c1 }) {
  const id = useContext(ArtId)
  const top = `C${x - w * 0.3} ${y - h * 0.9} ${x - w * 0.12} ${y - h} ${x} ${y - h}`
  const right = `C${x + w * 0.12} ${y - h} ${x + w * 0.3} ${y - h * 0.9} ${x + w / 2} ${y}`
  return (
    <g>
      <path d={`M${x - w / 2} ${y} ${top} ${right} Z`} fill={c1 ?? `url(#${tone === 'green' ? 'mtnG' : 'mtnB'}-${id})`} />
      <path d={`M${x - w * 0.06} ${y - h * 0.98} C${x - w * 0.2} ${y - h * 0.8} ${x - w * 0.3} ${y - h * 0.5} ${x - w * 0.42} ${y - h * 0.12}`} stroke="#fff" strokeOpacity=".35" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  )
}

const TUFTS = [[22, 8], [58, 14], [94, 6], [132, 16], [170, 9], [208, 15], [246, 7], [284, 13], [322, 8], [360, 15]]
export function Hill({ y = 210, c, c2 }) {
  const id = useContext(ArtId)
  return (
    <g>
      <path d={`M0 ${y} C90 ${y - 18} 200 ${y + 10} 400 ${y - 10} V280 H0Z`} fill={c ?? `url(#hillA-${id})`} />
      <path d={`M0 ${y + 24} C110 ${y + 6} 230 ${y + 34} 400 ${y + 12} V280 H0Z`} fill={c2 ?? `url(#hillB-${id})`} opacity=".85" />
      {TUFTS.map(([tx, ty], i) => <path key={i} d={`M${tx} ${y + 26 + ty} q2 -7 4 0 q2 -8 4 0`} stroke="#5d9a67" strokeOpacity=".6" strokeWidth="1.5" fill="none" strokeLinecap="round" />)}
    </g>
  )
}

export function Sea({ y = 170, c }) {
  const id = useContext(ArtId)
  return (
    <g>
      <rect y={y} width="400" height={280 - y} fill={c ?? `url(#sea-${id})`} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${-20 + i * 14} ${y + 14 + i * 20} q30 -8 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`} stroke="#fff" strokeOpacity=".6" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ))}
    </g>
  )
}

export function Sun({ x, y, r = 24 }) {
  const id = useContext(ArtId)
  return <g><circle cx={x} cy={y} r={r * 2.4} fill={`url(#sun-${id})`} /><circle cx={x} cy={y} r={r * 0.7} fill="#fff4c4" /></g>
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

// ── 설문대할망: 마스코트 그림(Mascot.jsx)을 장면 좌표(발끝=(0,0))에 맞춰 놓는다 ──
export function Halmang2D({ x, y, s = 1, pose = 'stand', flip = false }) {
  const id = useContext(ArtId)
  const k = s * 0.74
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(-100 -262)`}>
      <MascotId.Provider value={`${id}m`}><MascotArt pose={pose} /></MascotId.Provider>
    </g>
  )
}

// ── 해녀 (오리지널 캐릭터: 흰 수건, 물안경, 물옷) — 할망 마스코트와 같은 머리 큰 비율 ──
export function Haenyeo2D({ x, y, s = 1, pose = 'stand', flip = false, clipBelow }) {
  const id = useContext(ArtId)
  const k = s * 1.3
  const suit = '#4f6270'
  const arm = (d, hand) => (
    <g>
      <path d={d} stroke={suit} strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d={d} stroke="#fff" strokeOpacity=".16" strokeWidth="4" strokeLinecap="round" fill="none" transform="translate(-2 -2)" />
      <circle cx={hand[0]} cy={hand[1]} r="6.6" fill="#fcdcc6" stroke={INK} strokeOpacity=".4" strokeWidth="1.2" />
    </g>
  )
  const arms = {
    stand: <>{arm('M-20 -54 Q-32 -38 -24 -22', [-24, -18])}{arm('M20 -54 Q32 -38 24 -22', [24, -18])}</>,
    wave: <>{arm('M-20 -54 Q-32 -38 -24 -22', [-24, -18])}{arm('M20 -54 Q48 -60 50 -90', [50, -96])}</>,
    pray: <>{arm('M-20 -54 Q-28 -40 -4 -34', [-3, -34])}{arm('M20 -54 Q28 -40 4 -34', [3, -34])}</>,
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`} clipPath={clipBelow ? `url(#clip-${id})` : undefined}>
      {clipBelow && <clipPath id={`clip-${id}`}><rect x="-90" y="-260" width="180" height={260 + clipBelow} /></clipPath>}
      <ellipse cx="0" cy="1" rx="28" ry="4.5" fill="#3a2a1c" opacity=".2" />
      <path d="M-9 -3 L-10 -22 M9 -3 L10 -22" stroke={suit} strokeWidth="14" strokeLinecap="round" />
      <ellipse cx="-10" cy="0" rx="8.5" ry="3.6" fill="#fcdcc6" stroke={INK} strokeOpacity=".35" strokeWidth="1" /><ellipse cx="10" cy="0" rx="8.5" ry="3.6" fill="#fcdcc6" stroke={INK} strokeOpacity=".35" strokeWidth="1" />
      <path d="M-23 -58 Q0 -50 23 -58 L27 -22 Q0 -12 -27 -22Z" fill={suit} stroke={INK} strokeOpacity=".4" strokeWidth="1.3" />
      <path d="M-14 -50 Q0 -44 14 -50" stroke="#fff" strokeOpacity=".22" strokeWidth="2" fill="none" strokeLinecap="round" />
      {arms[pose]}
      <ellipse cx="0" cy="-88" rx="34" ry="32" fill="#fde3cc" stroke={INK} strokeOpacity=".45" strokeWidth="1.5" />
      <path d="M-36 -92 C-40 -134 40 -134 36 -92 C26 -112 -26 -112 -36 -92Z" fill="#fff" stroke="#c9d3da" strokeWidth="1.4" />
      <path d="M-36 -94 l-11 7 l7 5 M36 -94 l11 7 l-7 5" fill="#fff" stroke="#c9d3da" strokeWidth="1.2" />
      <ellipse cx="0" cy="-112" rx="21" ry="8.5" fill="#d3ecf3" stroke="#5b8aa3" strokeWidth="2.6" />
      <path d="M-21 -112 L-34 -108 M21 -112 L34 -108" stroke="#5b8aa3" strokeWidth="2" />
      <path d="M-16 -88 Q-10 -97 -4 -88 M4 -88 Q10 -97 16 -88" stroke="#4d372d" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M0 -82 q3 4 -1 6" stroke="#d99f82" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="-22" cy="-76" r="6" fill="#f58f8f" opacity=".42" /><circle cx="22" cy="-76" r="6" fill="#f58f8f" opacity=".42" />
      <path d="M-8 -74 Q0 -64 8 -74" stroke="#bf5f55" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </g>
  )
}

// ── 돌하르방 (같은 비율: 큰 머리, 동그란 눈, 볼터치) ─────────
const SPECKS = Array.from({ length: 30 }, (_, i) => [((i * 37) % 70) - 35, -((i * 53) % 120) - 4, 0.7 + (i % 3) * 0.4])
export function Hareubang2D({ x, y, s = 1 }) {
  const k = s * 1.3
  const edgeS = { stroke: INK, strokeOpacity: 0.45, strokeWidth: 1.4 }
  return (
    <g transform={tr(x, y, k)}>
      <ellipse cx="0" cy="1" rx="36" ry="5" fill="#3a2a1c" opacity=".2" />
      <path d="M-30 -6 Q-36 -30 -28 -56 Q0 -48 28 -56 Q36 -30 30 -6 Q0 2 -30 -6Z" fill="#aeb1b4" {...edgeS} />
      <path d="M10 -52 Q30 -50 28 -56 Q36 -30 30 -6 Q18 -2 12 -4Z" fill="#6f7377" opacity=".22" />
      <ellipse cx="-11" cy="-30" rx="14" ry="8.5" fill="#c6c9cb" {...edgeS} /><ellipse cx="10" cy="-33" rx="14" ry="8.5" fill="#cdd0d2" {...edgeS} />
      <path d="M-20 -28 l3 5 M-12 -26 l3 5 M4 -31 l3 5 M12 -30 l3 5" stroke="#8d9195" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="0" cy="-86" rx="37" ry="33" fill="#b9bcbf" {...edgeS} />
      <path d="M-40 -96 Q-36 -134 0 -136 Q36 -134 40 -96 Q0 -106 -40 -96Z" fill="#8d9195" {...edgeS} />
      <path d="M-47 -96 Q0 -109 47 -96" stroke="#6e7276" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <ellipse cx="-14" cy="-88" rx="10" ry="11" fill="#eceeef" {...edgeS} /><ellipse cx="14" cy="-88" rx="10" ry="11" fill="#eceeef" {...edgeS} />
      <circle cx="-14" cy="-87" r="5.4" fill="#464a4f" /><circle cx="14" cy="-87" r="5.4" fill="#464a4f" />
      <circle cx="-12.4" cy="-89.4" r="1.8" fill="#fff" /><circle cx="15.6" cy="-89.4" r="1.8" fill="#fff" />
      <path d="M-8 -84 Q0 -60 8 -84 Q13 -60 0 -56 Q-13 -60 -8 -84Z" fill="#d2d4d6" {...edgeS} />
      <path d="M-12 -65 q12 8 24 0" stroke="#5e6266" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="-27" cy="-72" r="5.5" fill="#f2a9a9" opacity=".4" /><circle cx="27" cy="-72" r="5.5" fill="#f2a9a9" opacity=".4" />
      {SPECKS.map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r * 0.6} fill="#6e7276" opacity=".32" />)}
      <ellipse cx="-14" cy="-110" rx="16" ry="5" fill="#fff" opacity=".2" transform="rotate(-14 -14 -110)" />
    </g>
  )
}

// ── 아이(보호자): 할망 마스코트와 같은 머리 큰 비율 ──────────
export function Kid2D({ x, y, s = 1, color = '#8ec5e6', hair = '#4a3a33', pants = '#7c8aa8', walk = false, flip = false, point = false }) {
  const id = useContext(ArtId)
  return (
    <g transform={tr(x, y, s, flip)}>
      <ellipse cx="0" cy="1" rx="17" ry="3.5" fill="#5a3a22" opacity=".18" />
      <path d={walk ? 'M-6 -1 L-4 -22' : 'M-5 -1 L-5 -22'} stroke={pants} strokeWidth="8" strokeLinecap="round" />
      <path d={walk ? 'M9 -4 L5 -22' : 'M5 -1 L5 -22'} stroke={pants} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx={walk ? -7 : -5} cy="0" rx="6.5" ry="3" fill="#6b4e3a" /><ellipse cx={walk ? 11 : 5} cy={walk ? -3 : 0} rx="6.5" ry="3" fill="#6b4e3a" />
      <path d="M-13 -22 Q-14 -47 -9 -52 L9 -52 Q14 -47 13 -22 Z" fill={color} stroke={INK} strokeOpacity=".4" strokeWidth="1.2" />
      <path d="M-9 -50 Q0 -45 9 -50" stroke="#fff" strokeOpacity=".7" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M-11 -48 Q-19 -38 -15 -28" stroke={color} strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d={point ? 'M11 -48 Q24 -54 33 -60' : 'M11 -48 Q19 -38 15 -28'} stroke={color} strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <circle cx={point ? 34 : 15} cy={point ? -61 : -26} r="4" fill="#fcdcc6" stroke={INK} strokeOpacity=".35" strokeWidth="1" /><circle cx="-15" cy="-26" r="4" fill="#fcdcc6" stroke={INK} strokeOpacity=".35" strokeWidth="1" />
      <circle cx="0" cy="-68" r="18" fill={`url(#${'cloud'}-${id})`} opacity="0" />
      <circle cx="0" cy="-68" r="18" fill="#fde3cc" stroke={INK} strokeOpacity=".45" strokeWidth="1.4" />
      <path d="M-18 -70 Q-19 -90 0 -90 Q19 -90 18 -70 Q12 -80 3 -78 Q-8 -80 -18 -70Z" fill={hair} />
      <ellipse cx="-18" cy="-66" rx="3" ry="4.5" fill="#f5cfb3" /><ellipse cx="18" cy="-66" rx="3" ry="4.5" fill="#f5cfb3" />
      <circle cx="-6.5" cy="-67" r="2.1" fill="#3b2a22" /><circle cx="6.5" cy="-67" r="2.1" fill="#3b2a22" />
      <circle cx="-5.8" cy="-67.8" r=".7" fill="#fff" /><circle cx="7.2" cy="-67.8" r=".7" fill="#fff" />
      <path d="M-4 -60 q4 4 8 0" stroke="#c0675c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="-11" cy="-61" r="3.6" fill="#f58f8f" opacity=".45" /><circle cx="11" cy="-61" r="3.6" fill="#f58f8f" opacity=".45" />
      <ellipse cx="-6" cy="-78" rx="6" ry="2.4" fill="#fff" opacity=".25" transform="rotate(-20 -6 -78)" />
    </g>
  )
}
