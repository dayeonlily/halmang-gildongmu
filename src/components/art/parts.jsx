import { createContext, useContext } from 'react'
import { MascotArt, MascotId, OUTLINE } from './Mascot'

// ── 통일된 동화책 스티커 스타일의 2D 일러스트 부품 ───────────────────
// 모든 요소(캐릭터·산·구름·바위·집…)가 같은 규칙을 쓴다:
//  ① 같은 갈색 윤곽선(굵기 2.2, 둥근 모서리)  ② 밝은 파스텔 면 채색  ③ 같은 얼굴 틀(반짝이는 큰 눈·볼터치·작은 웃음)
// 좌표계: 장면 400 x 280. 캐릭터는 발끝 가운데가 (0,0), 위쪽이 음수 y.
export const ArtId = createContext('')

const O = { stroke: OUTLINE, strokeWidth: 2.2, strokeLinejoin: 'round', strokeLinecap: 'round' }
const SKIN = '#ffe3cf'
const SKY = {
  day: ['#c9e8ff', '#fff6e0'], dawn: ['#e3d8ff', '#ffe9d1'], sea: ['#bde9ff', '#f1fbf4'],
  dusk: ['#ffd8cb', '#fff1c9'], wind: ['#c4d6ea', '#eef2f2'], deep: ['#5ab5e7', '#2f78b8'],
}
const tr = (x, y, s = 1, flip = false) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`

// 종이 결 + 하늘 그라데이션
export function Defs({ id }) {
  return (
    <defs>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="9" />
        <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0.1 0" />
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

// 같은 얼굴 틀: 반짝이는 큰 눈, 볼터치, 작은 웃음 (cx,cy = 얼굴 중심, u = 크기)
function CuteFace({ cx = 0, cy, u = 1, open = false }) {
  return (
    <g>
      <ellipse cx={cx - 8 * u} cy={cy} rx={3.5 * u} ry={4.5 * u} fill="#3b2a26" /><ellipse cx={cx + 8 * u} cy={cy} rx={3.5 * u} ry={4.5 * u} fill="#3b2a26" />
      <circle cx={cx - 6.8 * u} cy={cy - 1.8 * u} r={1.5 * u} fill="#fff" /><circle cx={cx + 9.2 * u} cy={cy - 1.8 * u} r={1.5 * u} fill="#fff" />
      <ellipse cx={cx - 15 * u} cy={cy + 6 * u} rx={5 * u} ry={3.2 * u} fill="#ff8f9c" opacity=".6" /><ellipse cx={cx + 15 * u} cy={cy + 6 * u} rx={5 * u} ry={3.2 * u} fill="#ff8f9c" opacity=".6" />
      {open ? <ellipse cx={cx} cy={cy + 8 * u} rx={3.4 * u} ry={3 * u} fill="#c9453f" /> : <path d={`M${cx - 4 * u} ${cy + 6 * u} Q${cx} ${cy + 11 * u} ${cx + 4 * u} ${cy + 6 * u}`} stroke={OUTLINE} strokeWidth={1.8 * u} fill="none" strokeLinecap="round" />}
    </g>
  )
}

// 윤곽선이 있는 통통한 팔다리
function Limb({ d, color, w = 8, hand }) {
  const W = Number(w) // 문자열로 넘어와도 숫자로 ("8"+3.6 이 "83.6" 이 되는 실수 방지)
  return (
    <g>
      <path d={d} stroke={OUTLINE} strokeWidth={W + 3.6} strokeLinecap="round" fill="none" />
      <path d={d} stroke={color} strokeWidth={W} strokeLinecap="round" fill="none" />
      {hand && <circle cx={hand[0]} cy={hand[1]} r="4.6" fill={SKIN} {...O} strokeWidth="1.6" />}
    </g>
  )
}

// ── 하늘·땅·바다 ─────────────────────────────────────────
export function Cloud({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-36 12 C-46 -4 -24 -18 -8 -8 C-2 -26 30 -24 30 -6 C48 -8 52 14 34 14 Z" fill="#fff" {...O} />
      <path d="M-20 2 q4 -8 13 -5" stroke="#cde3f3" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

export function Mountain({ x, y, w, h, tone = 'blue', c1 }) {
  const top = `C${x - w * 0.3} ${y - h * 0.9} ${x - w * 0.12} ${y - h} ${x} ${y - h}`
  const right = `C${x + w * 0.12} ${y - h} ${x + w * 0.3} ${y - h * 0.9} ${x + w / 2} ${y}`
  return (
    <g>
      <path d={`M${x - w / 2} ${y} ${top} ${right} Z`} fill={c1 ?? (tone === 'green' ? '#97dbaa' : '#b0c6f6')} {...O} />
      <path d={`M${x - w * 0.06} ${y - h * 0.97} C${x - w * 0.2} ${y - h * 0.78} ${x - w * 0.3} ${y - h * 0.5} ${x - w * 0.4} ${y - h * 0.16}`} stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
    </g>
  )
}

export function Hill({ y = 210, c, c2 }) {
  const a = `M0 ${y} C90 ${y - 18} 200 ${y + 10} 400 ${y - 10}`
  const b = `M0 ${y + 26} C110 ${y + 8} 230 ${y + 36} 400 ${y + 14}`
  return (
    <g>
      <path d={`${a} V280 H0Z`} fill={c ?? '#a9e49b'} /><path d={a} fill="none" {...O} />
      <path d={`${b} V280 H0Z`} fill={c2 ?? '#88d686'} /><path d={b} fill="none" {...O} />
      {[[24, 40], [74, 52], [128, 44], [190, 56], [250, 46], [310, 54], [362, 44]].map(([tx, ty], i) => <path key={i} d={`M${tx} ${y + ty} q2 -7 4 0 q2 -8 4 0`} stroke="#4f9a63" strokeWidth="1.8" fill="none" strokeLinecap="round" />)}
    </g>
  )
}

export function Sea({ y = 170, c }) {
  const edge = `M0 ${y} q25 -7 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0`
  return (
    <g>
      <path d={`${edge} V280 H0Z`} fill={c ?? '#8fd8f5'} /><path d={edge} fill="none" {...O} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-10 + i * 18} ${y + 22 + i * 22} q22 -8 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0`} stroke="#fff" strokeOpacity=".85" strokeWidth="2.4" fill="none" strokeLinecap="round" />)}
    </g>
  )
}

export function Sun({ x, y, r = 24 }) {
  return <g><circle cx={x} cy={y} r={r * 1.7} fill="#fff3b8" opacity=".6" /><circle cx={x} cy={y} r={r * 0.85} fill="#ffd95a" {...O} /></g>
}

export function Oreum({ x, y, s = 1, crater = true, c = '#9fe08f' }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-30 0 C-24 -24 -12 -29 0 -29 C12 -29 24 -24 30 0Z" fill={c} {...O} />
      {crater && <ellipse cx="0" cy="-26" rx="10" ry="3.6" fill="#b88a5e" {...O} strokeWidth="1.8" />}
    </g>
  )
}

export function Sanbang({ x, y, w = 100, h = 90 }) {
  return (
    <g>
      <path d={`M${x - w / 2} ${y} C${x - w / 2} ${y - h * 0.7} ${x - w * 0.25} ${y - h} ${x} ${y - h} C${x + w * 0.25} ${y - h} ${x + w / 2} ${y - h * 0.7} ${x + w / 2} ${y}Z`} fill="#dccfa6" {...O} />
      <path d={`M${x - w * 0.2} ${y - h * 0.9} Q${x} ${y - h * 1.06} ${x + w * 0.2} ${y - h * 0.9} Q${x} ${y - h * 0.8} ${x - w * 0.2} ${y - h * 0.9}Z`} fill="#8fd68a" {...O} strokeWidth="1.8" />
      {[-0.28, -0.1, 0.1, 0.28].map((k) => <path key={k} d={`M${x + w * k} ${y - h * 0.72} L${x + w * k * 1.2} ${y - 5}`} stroke="#a89a6e" strokeWidth="2.2" strokeLinecap="round" />)}
    </g>
  )
}

export function Mist({ y = 150, o = 0.5 }) {
  return <g fill="#fff" opacity={o}><ellipse cx="90" cy={y} rx="120" ry="14" /><ellipse cx="300" cy={y + 18} rx="130" ry="12" /></g>
}

// ── 작은 소품 ────────────────────────────────────────────
export function Canola({ x, y, n = 8, w = 160 }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const px = x + (i / (n - 1)) * w, py = y + ((i * 7) % 9)
        return <g key={i}><path d={`M${px} ${py} v-12`} stroke="#4f9a63" strokeWidth="2" strokeLinecap="round" /><circle cx={px} cy={py - 14} r="5" fill="#ffd84a" {...O} strokeWidth="1.5" /><circle cx={px} cy={py - 14} r="1.6" fill="#fff6b0" /></g>
      })}
    </g>
  )
}

export function Swirl({ x, y, s = 1, o = 0.95, flip = false }) {
  return <path transform={tr(x, y, s, flip)} d="M0 0 c20 -14 44 -6 40 8 c-3 10 -18 8 -17 0 M-6 8 c12 4 30 4 46 -2" stroke="#fff" strokeOpacity={o} strokeWidth="3" strokeLinecap="round" fill="none" />
}

export function Bubbles({ x, y }) {
  return <g fill="#fff" fillOpacity=".25" stroke="#fff" strokeWidth="1.8">{[[0, 0, 5], [8, -14, 3.5], [-4, -26, 4.5], [6, -40, 3]].map(([a, b, r], i) => <circle key={i} cx={x + a} cy={y + b} r={r} />)}</g>
}

export function Fish({ x, y, s = 1, c = '#ffb259', flip = false }) {
  return (
    <g transform={tr(x, y, s, flip)}>
      <path d="M-14 0 Q0 -11 14 0 Q0 11 -14 0Z" fill={c} {...O} strokeWidth="1.8" /><path d="M14 0 L25 -9 L25 9Z" fill={c} {...O} strokeWidth="1.8" /><circle cx="-7" cy="-1.5" r="1.8" fill="#3b2a26" />
    </g>
  )
}

export function Seaweed({ x, y, h = 50, c = '#5fc58a' }) {
  return <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="round"><path d={`M${x} ${y} q-8 -${h * 0.3} 0 -${h * 0.55} q8 -${h * 0.25} 0 -${h * 0.5}`} /><path d={`M${x + 10} ${y} q8 -${h * 0.3} 0 -${h * 0.5} q-8 -${h * 0.2} 0 -${h * 0.4}`} /></g>
}

export function Abalone({ x, y, s = 1 }) {
  return <g transform={tr(x, y, s)}><ellipse rx="15" ry="9" fill="#b99a84" {...O} /><ellipse rx="9.5" ry="5" cy="-1" fill="#ffc9da" /></g>
}

export function Shell({ x, y, s = 1 }) {
  return <g transform={tr(x, y, s)}><path d="M-9 4 Q-14 -8 0 -12 Q14 -8 9 4 Q0 9 -9 4Z" fill="#ffe4d0" {...O} strokeWidth="1.8" /><path d="M-3 -2 q3 -5 6 0 q-3 5 -6 0" fill="none" stroke="#d9a07d" strokeWidth="1.4" /></g>
}

export function Tewak({ x, y, s = 1, net = true }) {
  return (
    <g transform={tr(x, y, s)}>
      {net && <g fill="none" stroke={OUTLINE} strokeOpacity=".7" strokeWidth="1.6"><path d="M-16 14 Q-22 52 0 58 Q22 52 16 14" fill="#fff" fillOpacity=".35" /><path d="M-12 22 L12 22 M-14 34 L14 34 M-10 46 L10 46 M-6 16 L-8 56 M2 16 L2 58 M10 16 L8 56" /></g>}
      <circle r="22" fill="#ff9340" {...O} /><path d="M-12 -12 A17 17 0 0 1 4 -17" stroke="#fff" strokeOpacity=".8" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M-4 -22 q4 -8 8 0" fill="none" {...O} strokeWidth="1.8" />
    </g>
  )
}

export function Kite({ x, y, s = 1, c = '#ffb3c6' }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M0 -16 L12 0 L0 20 L-12 0Z" fill={c} {...O} /><path d="M0 -16 V20 M-12 0 H12" stroke="#fff" strokeOpacity=".8" strokeWidth="1.6" />
      <path d="M0 20 q-8 14 2 26 q8 12 -2 26" fill="none" stroke={OUTLINE} strokeWidth="1.6" strokeLinecap="round" /><circle cx="-2" cy="38" r="3" fill="#b3a6e6" {...O} strokeWidth="1.2" /><circle cx="2" cy="56" r="3" fill="#ffd84a" {...O} strokeWidth="1.2" />
    </g>
  )
}

export function House({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <rect x="-26" y="-26" width="52" height="26" rx="3" fill="#fff0d2" {...O} />
      <path d="M-35 -24 Q0 -60 35 -24 Q0 -34 -35 -24Z" fill="#f0cf78" {...O} />
      <path d="M-22 -31 L-18 -26 M-6 -39 L-4 -31 M10 -37 L12 -30 M22 -30 L24 -26" stroke="#c99a3f" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="-7" y="-17" width="14" height="17" rx="2" fill="#c89a6d" {...O} strokeWidth="1.8" />
    </g>
  )
}

export function StoneWall({ x, y, w = 160 }) {
  const cols = ['#cfcac2', '#bdb8b0', '#d9d4cc', '#c4bfb7']
  const n = Math.floor(w / 13)
  return (
    <g>
      {Array.from({ length: n }, (_, i) => <ellipse key={`a${i}`} cx={x + i * 13 + 6} cy={y} rx="7.4" ry="5.6" fill={cols[i % 4]} {...O} strokeWidth="1.6" />)}
      {Array.from({ length: n - 1 }, (_, i) => <ellipse key={`b${i}`} cx={x + i * 13 + 12.5} cy={y - 8} rx="7" ry="5.4" fill={cols[(i + 2) % 4]} {...O} strokeWidth="1.6" />)}
    </g>
  )
}

export function Table({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-22 -12 V0 M22 -12 V0" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" /><path d="M-22 -12 V0 M22 -12 V0" stroke="#c89a6d" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="-27" y="-17" width="54" height="6" rx="2" fill="#d9a877" {...O} />
      <ellipse cx="-12" cy="-20" rx="8" ry="3.4" fill="#fff" {...O} strokeWidth="1.6" /><ellipse cx="10" cy="-20" rx="8" ry="3.4" fill="#ffe2a6" {...O} strokeWidth="1.6" />
      <path d="M19 -20 v-12" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" /><path d="M19 -20 v-12" stroke="#fff6d6" strokeWidth="2.6" strokeLinecap="round" /><path d="M19 -35 q-3 -5 0 -8 q3 3 0 8" fill="#ffb347" />
    </g>
  )
}

export function Cauldron({ x, y, s = 1 }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-30 -2 L-18 -14 M30 -2 L18 -14" stroke={OUTLINE} strokeWidth="7" strokeLinecap="round" /><path d="M-30 -2 L-18 -14 M30 -2 L18 -14" stroke="#c89a6d" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M-14 4 Q-8 -14 0 -22 Q4 -12 10 -8 Q16 -16 14 4Z" fill="#ffae5e" {...O} strokeWidth="1.8" /><path d="M-5 4 Q-1 -8 3 -12 Q6 -4 8 4Z" fill="#ffe08a" />
      <path d="M-52 -50 Q-56 -8 -30 -6 L30 -6 Q56 -8 52 -50Z" fill="#6c6c82" {...O} />
      <ellipse cx="0" cy="-50" rx="52" ry="10" fill="#4a4a5e" {...O} /><ellipse cx="0" cy="-50" rx="43" ry="7" fill="#fff0c4" />
      <path d="M-14 -62 q-10 -14 2 -26 q10 -10 0 -22 M8 -62 q-10 -12 2 -22 q10 -10 2 -24 M26 -60 q-6 -10 2 -18" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
    </g>
  )
}

export function Rock({ x, y, s = 1, face = false }) {
  return (
    <g transform={tr(x, y, s)}>
      <path d="M-16 0 L-20 -28 Q-14 -52 0 -56 Q15 -50 19 -26 L16 0Z" fill="#cfc9be" {...O} />
      <path d="M-9 -47 Q-3 -53 5 -50" stroke="#fff" strokeOpacity=".6" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="-8" cy="-44" rx="6" ry="2.6" fill="#97dbaa" />
      {face && <CuteFace cy={-30} u={0.9} />}
    </g>
  )
}

export function Seeds({ x, y, n = 9 }) {
  return <g>{Array.from({ length: n }, (_, i) => <ellipse key={i} cx={x + ((i * 29) % 90) - 20} cy={y + ((i * 17) % 50)} rx="3" ry="2" fill={['#ffd84a', '#ffb3c6', '#fff', '#a9e49b'][i % 4]} stroke={OUTLINE} strokeWidth="1" transform={`rotate(${i * 40} ${x} ${y})`} />)}</g>
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

// ── 해녀 (오리지널): 같은 얼굴 틀, 흰 수건과 물안경, 물옷 ──
export function Haenyeo2D({ x, y, s = 1, pose = 'stand', flip = false, clipBelow }) {
  const id = useContext(ArtId)
  const k = s * 1.6
  const suit = '#5f7a8c'
  const arms = {
    stand: <><Limb d="M-14 -40 Q-24 -32 -19 -22" color={suit} w="8" hand={[-19, -19]} /><Limb d="M14 -40 Q24 -32 19 -22" color={suit} w="8" hand={[19, -19]} /></>,
    wave: <><Limb d="M-14 -40 Q-24 -32 -19 -22" color={suit} w="8" hand={[-19, -19]} /><Limb d="M14 -40 Q38 -44 40 -66" color={suit} w="8" hand={[40, -70]} /></>,
    pray: <><Limb d="M-14 -40 Q-20 -30 -3 -28" color={suit} w="8" hand={[-2, -28]} /><Limb d="M14 -40 Q20 -30 3 -28" color={suit} w="8" hand={[2, -28]} /></>,
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`} clipPath={clipBelow ? `url(#clip-${id})` : undefined}>
      {clipBelow && <clipPath id={`clip-${id}`}><rect x="-90" y="-260" width="180" height={260 + clipBelow} /></clipPath>}
      <ellipse cx="0" cy="1" rx="22" ry="4" fill="#3a2a1c" opacity=".2" />
      <ellipse cx="-7" cy="-1" rx="8" ry="4" fill={SKIN} {...O} strokeWidth="1.8" /><ellipse cx="7" cy="-1" rx="8" ry="4" fill={SKIN} {...O} strokeWidth="1.8" />
      <path d="M-7 -4 V-16 M7 -4 V-16" stroke={OUTLINE} strokeWidth="11.6" strokeLinecap="round" /><path d="M-7 -4 V-16 M7 -4 V-16" stroke={suit} strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="0" cy="-30" rx="17" ry="18" fill={suit} {...O} />
      <path d="M-9 -24 Q0 -20 9 -24" stroke="#fff" strokeOpacity=".4" strokeWidth="2" fill="none" strokeLinecap="round" />
      {arms[pose]}
      <circle cx="0" cy="-64" r="23" fill={SKIN} {...O} />
      <path d="M-24 -68 C-28 -104 28 -104 24 -68 C16 -84 -16 -84 -24 -68Z" fill="#fff" {...O} />
      <path d="M-24 -70 l-10 6 l6 5 M24 -70 l10 6 l-6 5" fill="#fff" {...O} strokeWidth="1.8" />
      <ellipse cx="0" cy="-84" rx="15" ry="6.5" fill="#d9f1f8" {...O} strokeWidth="2" />
      <CuteFace cy={-62} u={1.05} />
    </g>
  )
}

// ── 돌하르방: 같은 얼굴 틀, 벙거지, 배 위의 두 손 ──
const SPECKS = Array.from({ length: 22 }, (_, i) => [((i * 37) % 44) - 22, -((i * 53) % 74) - 4, 0.8 + (i % 3) * 0.4])
export function Hareubang2D({ x, y, s = 1 }) {
  const k = s * 1.6
  return (
    <g transform={tr(x, y, k)}>
      <ellipse cx="0" cy="1" rx="26" ry="4.5" fill="#3a2a1c" opacity=".2" />
      <path d="M-22 -2 Q-26 -26 -20 -46 Q0 -40 20 -46 Q26 -26 22 -2 Q0 4 -22 -2Z" fill="#c9c5be" {...O} />
      <ellipse cx="-7" cy="-26" rx="10" ry="6" fill="#ddd9d2" {...O} strokeWidth="1.8" /><ellipse cx="8" cy="-28" rx="10" ry="6" fill="#e3dfd8" {...O} strokeWidth="1.8" />
      <circle cx="0" cy="-66" r="26" fill="#d6d2cb" {...O} />
      <path d="M-29 -74 Q-26 -104 0 -105 Q26 -104 29 -74 Q0 -82 -29 -74Z" fill="#a8a39b" {...O} />
      <path d="M-34 -74 Q0 -85 34 -74" stroke={OUTLINE} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M-4 -64 Q0 -52 4 -64 Q8 -50 0 -48 Q-8 -50 -4 -64Z" fill="#c3beb6" {...O} strokeWidth="1.6" />
      <CuteFace cy={-64} u={1.15} />
      {SPECKS.map(([a, b, r], i) => <circle key={i} cx={a} cy={b} r={r * 0.55} fill="#8a857c" opacity=".3" />)}
    </g>
  )
}

// ── 아이(보호자): 같은 머리 큰 비율과 얼굴 틀 ──
export function Kid2D({ x, y, s = 1, color = '#8ec5e6', hair = '#5a4034', pants = '#8a98b8', walk = false, flip = false, point = false }) {
  return (
    <g transform={tr(x, y, s, flip)}>
      <ellipse cx="0" cy="1" rx="18" ry="3.6" fill="#3a2a1c" opacity=".2" />
      <ellipse cx={walk ? -6 : -5} cy="0" rx="6.5" ry="3.2" fill="#8b6a55" {...O} strokeWidth="1.6" /><ellipse cx={walk ? 11 : 5} cy={walk ? -3 : 0} rx="6.5" ry="3.2" fill="#8b6a55" {...O} strokeWidth="1.6" />
      <Limb d={walk ? 'M-6 -3 L-4 -16' : 'M-5 -3 L-5 -16'} color={pants} w="8" />
      <Limb d={walk ? 'M9 -6 L5 -16' : 'M5 -3 L5 -16'} color={pants} w="8" />
      <ellipse cx="0" cy="-28" rx="15" ry="16" fill={color} {...O} />
      <Limb d="M-12 -34 Q-21 -28 -17 -20" color={color} w="7" hand={[-17, -18]} />
      <Limb d={point ? 'M12 -34 Q26 -40 34 -48' : 'M12 -34 Q21 -28 17 -20'} color={color} w="7" hand={point ? [35, -50] : [17, -18]} />
      <circle cx="0" cy="-60" r="21" fill={SKIN} {...O} />
      <path d="M-21 -62 C-24 -88 24 -88 21 -62 C14 -74 -14 -74 -21 -62Z" fill={hair} {...O} />
      <CuteFace cy={-58} u={1} />
    </g>
  )
}
