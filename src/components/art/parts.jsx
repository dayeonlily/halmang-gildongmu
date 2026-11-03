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
      {/* 캐릭터 윤곽선: 부분마다 선을 두르지 않고 몸 전체 바깥에 하나만 */}
      <filter id={`ol-${id}`} filterUnits="userSpaceOnUse" x="-90" y="-150" width="180" height="170">
        <feMorphology in="SourceAlpha" operator="dilate" radius="1.3" result="d" />
        <feFlood floodColor="#7a5444" result="c" />
        <feComposite in="c" in2="d" operator="in" result="o" />
        <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
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
function CuteFace({ cx = 0, cy, u = 1, open = false, happy = false }) {
  return (
    <g>
      {happy ? ( // 웃어서 감긴 눈
        <path d={`M${cx - 12 * u} ${cy + 1 * u} Q${cx - 8 * u} ${cy - 6 * u} ${cx - 4 * u} ${cy + 1 * u} M${cx + 4 * u} ${cy + 1 * u} Q${cx + 8 * u} ${cy - 6 * u} ${cx + 12 * u} ${cy + 1 * u}`} stroke="#3b2a26" strokeWidth={2.2 * u} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx={cx - 8 * u} cy={cy} rx={3.9 * u} ry={5 * u} fill="#3b2a26" /><ellipse cx={cx + 8 * u} cy={cy} rx={3.9 * u} ry={5 * u} fill="#3b2a26" />
          <circle cx={cx - 6.6 * u} cy={cy - 2 * u} r={1.7 * u} fill="#fff" /><circle cx={cx + 9.4 * u} cy={cy - 2 * u} r={1.7 * u} fill="#fff" />
          <circle cx={cx - 9.4 * u} cy={cy + 2 * u} r={0.9 * u} fill="#fff" /><circle cx={cx + 6.6 * u} cy={cy + 2 * u} r={0.9 * u} fill="#fff" />
        </>
      )}
      <ellipse cx={cx - 15 * u} cy={cy + 6 * u} rx={5 * u} ry={3.2 * u} fill="#ff8f9c" opacity=".6" /><ellipse cx={cx + 15 * u} cy={cy + 6 * u} rx={5 * u} ry={3.2 * u} fill="#ff8f9c" opacity=".6" />
      {open ? <ellipse cx={cx} cy={cy + 8 * u} rx={3.4 * u} ry={3 * u} fill="#c9453f" /> : <path d={`M${cx - 4 * u} ${cy + 6 * u} Q${cx} ${cy + 11 * u} ${cx + 4 * u} ${cy + 6 * u}`} stroke={OUTLINE} strokeWidth={1.8 * u} fill="none" strokeLinecap="round" />}
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
// 몸 전체에 윤곽선 하나만 두르는 묶음 (마스코트 그림과 같은 방식)
function Sticker({ children }) {
  const id = useContext(ArtId)
  return <g filter={`url(#ol-${id})`}>{children}</g>
}

export function Halmang2D({ x, y, s = 1, pose = 'stand', flip = false }) {
  const id = useContext(ArtId)
  const k = s * 0.68 // 새 마스코트는 키가 커져서(300) 장면 안 크기를 맞춘다
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k}) translate(-110 -296)`}>
      <MascotId.Provider value={`${id}m`}><MascotArt pose={pose} /></MascotId.Provider>
    </g>
  )
}

// ── 해녀: 웃는 눈, 이마 위 물안경, 흰 수건, 짙은 물옷 ──
export function Haenyeo2D({ x, y, s = 1, pose = 'stand', flip = false, clipBelow }) {
  const id = useContext(ArtId)
  const k = s * 1.6
  const suit = '#4d6b82', lt = '#6f93ad'
  const arm = (d, hand) => (
    <g><path d={d} stroke={suit} strokeWidth="9" strokeLinecap="round" fill="none" /><path d={d} stroke={lt} strokeOpacity=".5" strokeWidth="2.4" strokeLinecap="round" fill="none" transform="translate(-1.6 -1)" /><circle cx={hand[0]} cy={hand[1]} r="4.4" fill={SKIN} /></g>
  )
  const arms = {
    stand: <>{arm('M-15 -44 Q-26 -35 -21 -22', [-21, -19])}{arm('M15 -44 Q26 -35 21 -22', [21, -19])}</>,
    wave: <>{arm('M-15 -44 Q-26 -35 -21 -22', [-21, -19])}{arm('M15 -44 Q40 -48 42 -70', [42, -74])}</>,
    pray: <>{arm('M-15 -44 Q-22 -33 -4 -30', [-3, -30])}{arm('M15 -44 Q22 -33 4 -30', [3, -30])}</>,
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`} clipPath={clipBelow ? `url(#clip-${id})` : undefined}>
      {clipBelow && <clipPath id={`clip-${id}`}><rect x="-90" y="-260" width="180" height={260 + clipBelow} /></clipPath>}
      <ellipse cx="0" cy="1" rx="22" ry="4" fill="#3a2a1c" opacity=".18" />
      <Sticker>
        <ellipse cx="-8" cy="-1.5" rx="8.5" ry="4" fill={SKIN} /><ellipse cx="8" cy="-1.5" rx="8.5" ry="4" fill={SKIN} />
        <path d="M-8 -5 V-20 M8 -5 V-20" stroke={suit} strokeWidth="10" strokeLinecap="round" />
        <path d="M-17 -62 Q-20 -40 -15 -24 Q0 -19 15 -24 Q20 -40 17 -62 Q0 -69 -17 -62Z" fill={suit} />
        <path d="M-12 -57 Q-15 -42 -11 -30" stroke={lt} strokeOpacity=".55" strokeWidth="3" fill="none" strokeLinecap="round" />
        {arms[pose]}
        <ellipse cx="0" cy="-47" rx="12" ry="3.4" fill="#000" opacity=".12" />
        {/* 머리: 귀 + 얼굴 + 흰 수건 + 이마 위 물안경 */}
        <circle cx="-21" cy="-64" r="4" fill={SKIN} /><circle cx="21" cy="-64" r="4" fill={SKIN} />
        <ellipse cx="0" cy="-64" rx="21.5" ry="20" fill={SKIN} />
        <path d="M-24 -70 C-28 -105 28 -105 24 -70 C16 -84 -16 -84 -24 -70Z" fill="#fbf7ec" />
        <path d="M-13 -88 Q-4 -96 7 -93 M-6 -80 Q8 -89 18 -83" stroke="#e1d8c4" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M22 -78 q9 -4 12 3 q-6 5 -10 4Z M23 -76 q8 6 7 14 q-6 -2 -9 -12Z" fill="#fbf7ec" />
        <path d="M-23 -80 Q0 -92 23 -80" stroke="#2f6177" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        <ellipse cx="-9" cy="-84" rx="7.6" ry="5.2" fill="#c7edf5" /><ellipse cx="9" cy="-84" rx="7.6" ry="5.2" fill="#c7edf5" />
        <ellipse cx="-9" cy="-84" rx="7.6" ry="5.2" fill="none" stroke="#3f8ca3" strokeWidth="1.8" /><ellipse cx="9" cy="-84" rx="7.6" ry="5.2" fill="none" stroke="#3f8ca3" strokeWidth="1.8" />
        <path d="M-13 -86 q2 -2 5 -1 M5 -86 q2 -2 5 -1" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <CuteFace cy={-62} u={1.05} happy />
        <path d="M-18 -53 q-2.4 3 0 5.4 M18 -53 q2.4 3 0 5.4" stroke="#e0a888" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </Sticker>
    </g>
  )
}

// ── 돌하르방: 벙거지, 툭 튀어나온 큰 눈, 큰 코, 배 위의 두 손, 현무암 구멍과 이끼 ──
const PORES = Array.from({ length: 34 }, (_, i) => [((i * 41) % 52) - 26, -((i * 59) % 96) - 4, 0.9 + (i % 3) * 0.5])
export function Hareubang2D({ x, y, s = 1 }) {
  const k = s * 1.6
  return (
    <g transform={tr(x, y, k)}>
      <ellipse cx="0" cy="1" rx="28" ry="4.6" fill="#3a2a1c" opacity=".2" />
      <Sticker>
        {/* 몸 */}
        <path d="M-25 0 Q-31 -24 -23 -52 Q0 -45 23 -52 Q31 -24 25 0 Q0 6 -25 0Z" fill="#c4bfb7" />
        <path d="M14 -48 Q27 -26 22 -2 Q16 2 10 1 Q18 -24 8 -47Z" fill="#9d978e" opacity=".28" />
        {/* 두 손: 위쪽 손은 가슴, 아래쪽 손은 배 */}
        <path d="M-17 -41 Q-6 -49 5 -42 Q7 -34 -2 -33 Q-14 -32 -17 -41Z" fill="#d6d1c9" />
        <path d="M-12 -38 v3 M-7 -39 v3.4 M-2 -38.6 v3" stroke="#8d877e" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M-2 -30 Q9 -37 21 -30 Q22 -22 12 -20 Q-1 -20 -2 -30Z" fill="#dcd7cf" />
        <path d="M5 -27 v3.4 M10 -28 v3.6 M15 -27.4 v3.2" stroke="#8d877e" strokeWidth="1.3" strokeLinecap="round" />
        {/* 머리 */}
        <ellipse cx="-29" cy="-66" rx="4.5" ry="8" fill="#c4bfb7" /><ellipse cx="29" cy="-66" rx="4.5" ry="8" fill="#c4bfb7" />
        <ellipse cx="0" cy="-67" rx="29" ry="25" fill="#d3cec6" />
        {/* 벙거지: 둥근 모자 + 넓은 챙 */}
        <path d="M-27 -80 Q-29 -111 0 -112 Q29 -111 27 -80 Q0 -88 -27 -80Z" fill="#aaa49b" />
        <path d="M-12 -104 Q-4 -109 6 -107" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-40 -78 Q0 -93 40 -78 Q32 -71 0 -71 Q-32 -71 -40 -78Z" fill="#938d84" />
        {/* 얼굴: 큰 눈, 큰 코, 넓은 미소 */}
        <ellipse cx="-12" cy="-64" rx="7.6" ry="8" fill="#f4f1ec" /><ellipse cx="12" cy="-64" rx="7.6" ry="8" fill="#f4f1ec" />
        <circle cx="-11.5" cy="-63.5" r="4.6" fill="#3f342f" /><circle cx="12.5" cy="-63.5" r="4.6" fill="#3f342f" />
        <circle cx="-10" cy="-65.4" r="1.7" fill="#fff" /><circle cx="14" cy="-65.4" r="1.7" fill="#fff" />
        <path d="M-5.5 -62 Q0 -49 5.5 -62 Q10 -47 0 -45 Q-10 -47 -5.5 -62Z" fill="#c1bcb3" />
        <path d="M-2.4 -49 q2.4 2 4.8 0" stroke="#8d877e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M-12 -42 Q0 -32 12 -42" stroke="#6e655d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="-20" cy="-52" rx="5.4" ry="3.4" fill="#f2a5a5" opacity=".42" /><ellipse cx="20" cy="-52" rx="5.4" ry="3.4" fill="#f2a5a5" opacity=".42" />
        {/* 현무암의 구멍과 이끼 */}
        {PORES.map(([a, b, r], i) => <ellipse key={i} cx={a} cy={b} rx={r * 0.7} ry={r * 0.5} fill="#7d776e" opacity=".3" />)}
        <ellipse cx="-14" cy="-3" rx="9" ry="3" fill="#8fbf7a" opacity=".5" /><ellipse cx="16" cy="-4" rx="7" ry="2.6" fill="#8fbf7a" opacity=".45" /><ellipse cx="-24" cy="-79" rx="6" ry="1.8" fill="#8fbf7a" opacity=".5" />
      </Sticker>
    </g>
  )
}

// ── 아이: 신발·소매·손이 있는 몸, 머리모양 3가지(셔츠 색으로 정해진다) ──
export function Kid2D({ x, y, s = 1, color = '#8ec5e6', hair = '#5a4034', pants = '#8a98b8', walk = false, flip = false, point = false }) {
  const style = ['bob', 'pony', 'short'][parseInt(color.slice(1, 3), 16) % 3]
  const arm = (d, hand) => <g><path d={d} stroke={color} strokeWidth="7.4" strokeLinecap="round" fill="none" /><circle cx={hand[0]} cy={hand[1]} r="3.9" fill={SKIN} /></g>
  return (
    <g transform={tr(x, y, s, flip)}>
      <ellipse cx="0" cy="1" rx="19" ry="3.6" fill="#3a2a1c" opacity=".18" />
      <Sticker>
        {/* 다리·신발 */}
        <path d={walk ? 'M-8 -26 L-12 -7' : 'M-7.5 -26 L-8 -7'} stroke={pants} strokeWidth="7.6" strokeLinecap="round" fill="none" />
        <path d={walk ? 'M8 -26 L11 -7' : 'M7.5 -26 L8 -7'} stroke={pants} strokeWidth="7.6" strokeLinecap="round" fill="none" />
        <ellipse cx={walk ? -14 : -9.5} cy="-2.6" rx="7.2" ry="3.8" fill="#a8745a" /><ellipse cx={walk ? 12.5 : 9.5} cy="-2.8" rx="7.2" ry="3.8" fill="#a8745a" />
        {/* 몸 */}
        <path d="M-13 -52 Q-16 -36 -13 -24 Q0 -20 13 -24 Q16 -36 13 -52 Q0 -58 -13 -52Z" fill={color} />
        <path d="M-11 -31 Q0 -27 11 -31" stroke="#fff" strokeOpacity=".4" strokeWidth="2" fill="none" strokeLinecap="round" />
        {walk ? <>{arm('M-12 -48 Q-22 -42 -24 -33', [-24, -30])}{arm('M12 -48 Q20 -42 19 -33', [19, -30])}</>
          : <>{arm('M-12 -48 Q-20 -40 -17 -30', [-17, -27])}{point ? arm('M12 -48 Q26 -54 33 -63', [34, -65]) : arm('M12 -48 Q20 -40 17 -30', [17, -27])}</>}
        <ellipse cx="0" cy="-50" rx="11" ry="3.2" fill="#000" opacity=".1" />
        {/* 머리 */}
        {style === 'pony' && <><circle cx="-24" cy="-69" r="5.8" fill={hair} /><circle cx="24" cy="-69" r="5.8" fill={hair} /><circle cx="-21" cy="-72" r="1.9" fill="#ff8fa3" /><circle cx="21" cy="-72" r="1.9" fill="#ff8fa3" /></>}
        <circle cx="-19" cy="-65" r="3.7" fill={SKIN} /><circle cx="19" cy="-65" r="3.7" fill={SKIN} />
        <ellipse cx="0" cy="-66" rx="19" ry="17.5" fill={SKIN} />
        <path d="M-20.5 -67 C-23 -91 23 -91 20.5 -67 C15 -77 8 -79 0 -75 C-8 -79 -15 -77 -20.5 -67Z" fill={hair} />
        {style === 'bob' && <><path d="M-20.5 -67 Q-23.5 -58 -19 -52 Q-16.5 -58 -17 -65Z" fill={hair} /><path d="M20.5 -67 Q23.5 -58 19 -52 Q16.5 -58 17 -65Z" fill={hair} /></>}
        {style === 'short' && <path d="M-3 -88 Q1 -96 5 -88Z" fill={hair} />}
        <ellipse cx="-8" cy="-83" rx="7" ry="2.4" fill="#fff" opacity=".26" transform="rotate(-18 -8 -83)" />
        <CuteFace cy={-63} u={0.95} />
      </Sticker>
    </g>
  )
}
