import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 사람에 가까운 비율(머리 : 키 ≈ 1 : 4)의 자그마한 할머니. 덩어리마다 선을 하나씩만 두고,
// 한복의 주름과 그림자는 선 대신 은은한 음영으로 표현해 마디가 끊겨 보이지 않게 했다.
// 좌표: 폭 220 x 높이 300, 바닥이 y≈296.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색
const SKIN = '#ffe2cc', SKIN_L = '#d99b82', BLUSH = '#ff9aa8'
const HAIR = '#e9e9f2', HAIR_L = '#a3a3bd'
const TOP = '#ffc4d4', TOP_L = '#d9748f'
const LAV = '#b9aeea', LAV_L = '#8577cf'
const SKIRT_L = '#5aa577'
const INK = '#4a3029'

// 자세별 팔(어깨→손목)과 손 위치·방향(0=아래, 180=위, -90=오른쪽). front=저고리 앞으로 지나가는 팔
const ARMS = {
  wave: { L: { d: 'M85 116 Q72 142 74 170', h: [74, 178, 0] }, R: { d: 'M135 116 Q168 112 176 80', h: [177, 70, 190] }, wave: true },
  stand: { L: { d: 'M85 116 Q72 142 74 170', h: [74, 178, 0] }, R: { d: 'M135 116 Q148 142 146 170', h: [146, 178, 0] } },
  stretch: { L: { d: 'M85 114 Q54 112 40 82', h: [38, 72, 150] }, R: { d: 'M135 114 Q166 112 180 82', h: [182, 72, 210] } },
  throw: { L: { d: 'M85 116 Q72 142 74 170', h: [74, 178, 0] }, R: { d: 'M135 114 Q166 110 174 82', h: [175, 72, 190] }, rock: true },
  pour: { L: { d: 'M88 120 Q96 152 122 162', h: [132, 164, -90], front: true }, R: { d: 'M135 116 Q150 142 146 168', h: [146, 176, 0] }, basket: true },
}

// 손: 엄지가 있는 작은 손
function Hand({ p }) {
  return (
    <g transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]}) translate(0 7)`}>
      <path d="M-6 -4 C-7 -10 7 -10 6 -4 C8 3 4 11 0 11 C-4 11 -8 3 -6 -4 Z" fill={SKIN} stroke={SKIN_L} strokeWidth="1.8" />
      <path d="M5.5 -2 C11 -1 11 5.5 6 7 Z" fill={SKIN} stroke={SKIN_L} strokeWidth="1.8" />
    </g>
  )
}

// 소매: 어깨에서 손목으로 이어지는 하나의 분홍 소매 + 같은 길로 이어지는 손
function Arm({ a, fill }) {
  return (
    <g>
      <Hand p={a.h} />
      <path d={a.d} fill="none" stroke={TOP_L} strokeWidth="21" strokeLinecap="round" />
      <path d={a.d} fill="none" stroke={fill} strokeWidth="18" strokeLinecap="round" />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(142 174) rotate(28) scale(.9)">
      <ellipse rx="34" ry="13" fill="#f0d68c" stroke="#a8884a" strokeWidth="3" />
      <path d="M-28 -2 Q0 -20 28 -2 Q20 8 0 9 Q-20 8 -28 -2Z" fill="#a67c52" stroke="#7a5a3a" strokeWidth="2" strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={28 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke="#7a5a3a" strokeWidth="1">
          {animate && <animate attributeName="cy" values="6;80" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
          {animate && <animate attributeName="opacity" values="1;0" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </g>
  )
}

export function MascotArt({ pose = 'wave', speaking = false, animate = true }) {
  const id = useContext(MascotId)
  const a = ARMS[pose] ?? ARMS.wave
  const g = (n) => `url(#${id}-${n})`
  const top = g('top')
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="3.5" /></filter>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd9e3" /><stop offset="1" stopColor={TOP} /></linearGradient>
        <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7edd1" /><stop offset="1" stopColor="#9bd9ab" /></linearGradient>
        {/* 치마 주름: 선 대신 세로 음영 */}
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f7d52" stopOpacity=".16" /><stop offset=".18" stopColor="#2f7d52" stopOpacity="0" />
          <stop offset=".34" stopColor="#2f7d52" stopOpacity=".1" /><stop offset=".48" stopColor="#fff" stopOpacity=".16" />
          <stop offset=".66" stopColor="#2f7d52" stopOpacity=".1" /><stop offset=".82" stopColor="#2f7d52" stopOpacity="0" />
          <stop offset="1" stopColor="#2f7d52" stopOpacity=".18" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx=".45" cy=".4" r=".75"><stop offset="0" stopColor="#fff1e4" /><stop offset="1" stopColor={SKIN} /></radialGradient>
      </defs>
      <ellipse cx="110" cy="294" rx="68" ry="7" fill="#5a3a22" opacity=".18" filter={g('soft')} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -2;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

        {/* 버선 */}
        <path d="M66 291 Q66 285 78 286 L97 288 Q100 296 91 297 L70 297 Q65 296 66 291Z" fill="#fff" stroke="#c2b3a6" strokeWidth="1.8" />
        <path d="M154 291 Q154 285 142 286 L123 288 Q120 296 129 297 L150 297 Q155 296 154 291Z" fill="#fff" stroke="#c2b3a6" strokeWidth="1.8" />

        {/* 치마: 허리에서 한 번에 흘러내리며 퍼진다 */}
        <path d="M80 148 C76 194 58 244 36 289 C80 298 140 298 184 289 C162 244 144 194 140 148 Q110 160 80 148Z" fill={g('skirt')} stroke={SKIRT_L} strokeWidth="2" />
        <path d="M80 148 C76 194 58 244 36 289 C80 298 140 298 184 289 C162 244 144 194 140 148 Q110 160 80 148Z" fill={g('fold')} />
        <path d="M40 282 C80 292 140 292 180 282" stroke="#ff9db0" strokeOpacity=".8" strokeWidth="4" fill="none" />

        {/* 팔(앞으로 지나가지 않는 팔은 저고리 뒤에서 어깨로 이어진다) */}
        {!a.L.front && <Arm a={a.L} fill={top} />}
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-8 135 116;8 135 116;-8 135 116" dur="1.5s" repeatCount="indefinite" /><Arm a={a.R} fill={top} /></g>
          : <Arm a={a.R} fill={top} />}

        {/* 목 + 저고리 */}
        <path d="M100 88 L100 112 Q110 118 120 112 L120 88Z" fill={SKIN} stroke={SKIN_L} strokeWidth="1.8" />
        <path d="M84 110 C94 106 102 110 110 116 C118 110 126 106 136 110 C142 116 142 134 141 150 Q110 162 79 150 C78 134 78 116 84 110Z" fill={top} stroke={TOP_L} strokeWidth="2" />
        <path d="M84 118 C82 130 82 140 83 148" stroke="#fff" strokeOpacity=".45" strokeWidth="4" fill="none" />
        {/* 깃(보라): 왼쪽이 오른쪽 위로 여며지는 V */}
        <path d="M97 108 C102 122 108 136 112 148 M123 108 C118 122 112 136 108 148" stroke={LAV_L} strokeWidth="9" fill="none" />
        <path d="M97 108 C102 122 108 136 112 148 M123 108 C118 122 112 136 108 148" stroke={LAV} strokeWidth="6.5" fill="none" />
        <path d="M99.500 108 C104 121 109 133 112 143 M120.500 108 C116 121 111 133 108 143" stroke="#fff" strokeWidth="1.8" fill="none" />
        {/* 고름 */}
        <path d="M110 140 C96 130 86 146 102 150 Q109 150 110 140Z M110 140 C124 130 134 146 118 150 Q111 150 110 140Z" fill={LAV} stroke={LAV_L} strokeWidth="1.6" />
        <path d="M106 150 C101 170 109 180 103 204 M114 150 C121 168 116 182 124 200" stroke={LAV} strokeWidth="5.500" fill="none" />
        <circle cx="110" cy="144" r="4" fill="#9585d8" stroke={LAV_L} strokeWidth="1.6" />

        {a.L.front && <Arm a={a.L} fill={top} />}
        {a.basket && <Basket animate={animate} />}

        {/* 머리 */}
        <g transform="rotate(-2 110 100)">
          <g>
            {animate && <animateTransform attributeName="transform" type="rotate" values="-1.500 110 100;1.500 110 100;-1.500 110 100" dur="4s" repeatCount="indefinite" />}
            <path d="M80 64 C73 63 73 76 81 78 Z M140 64 C147 63 147 76 139 78 Z" fill={SKIN} stroke={SKIN_L} strokeWidth="1.8" />
            <path d="M110 36 C130 36 141 52 140 68 C139 84 127 95 110 95 C93 95 81 84 80 68 C79 52 90 36 110 36Z" fill={g('face')} stroke={SKIN_L} strokeWidth="2" />
            {/* 은빛 머리: 가운데 가르마에서 곱게 넘겨 쪽을 졌다 */}
            <path d="M80 68 C73 40 92 26 110 26 C128 26 147 40 140 68 C138 55 131 46 122 42 C116 50 104 50 98 42 C89 46 82 55 80 68Z" fill={HAIR} stroke={HAIR_L} strokeWidth="2" />
            <path d="M110 44 C104 36 94 34 86 40 M110 44 C116 36 126 34 134 40 M109 43 C101 31 92 30 84 38 M111 43 C119 31 128 30 136 38" stroke={HAIR_L} strokeOpacity=".6" strokeWidth="1.4" fill="none" />
            <path d="M99 30 C93 17 103 9 112 10 C123 10 128 21 121 30 C115 34 104 34 99 30Z" fill={HAIR} stroke={HAIR_L} strokeWidth="2" />
            <path d="M103 21 C107 15 115 15 118 22" stroke={HAIR_L} strokeOpacity=".6" strokeWidth="1.4" fill="none" />
            <path d="M90 24 L132 17" stroke="#3f9ec4" strokeWidth="4.600" /><path d="M90 24 L132 17" stroke="#8bd5ee" strokeWidth="2.400" />
            <circle cx="134.500" cy="16.700" r="3.600" fill="#8bd5ee" stroke="#3f9ec4" strokeWidth="1.600" />
            {/* 이목구비: 웃어서 감긴 눈 */}
            <path d="M90 58 Q97 54 103 57 M117 57 Q123 54 130 58" stroke="#b9b9cd" strokeWidth="2" fill="none" />
            <path d="M91 68 Q97 60.500 103 68 M117 68 Q123 60.500 129 68" stroke={INK} strokeWidth="2.600" fill="none" />
            <path d="M88 70 q-2 2.500 -4 1 M132 70 q2 2.500 4 1" stroke={SKIN_L} strokeOpacity=".7" strokeWidth="1.200" fill="none" />
            <ellipse cx="89" cy="78" rx="7" ry="4.500" fill={BLUSH} opacity=".45" /><ellipse cx="131" cy="78" rx="7" ry="4.500" fill={BLUSH} opacity=".45" />
            <path d="M108 73 Q110 77 113 73.500" stroke="#d58a73" strokeWidth="1.800" fill="none" />
            {speaking ? (
              <path d="M101 81 Q110 94 119 81 Q110 85 101 81Z" fill="#c9453f" stroke="#9c3030" strokeWidth="1.600">{animate && <animate attributeName="d" values="M102 82 Q110 86 118 82 Q110 84 102 82Z;M101 81 Q110 96 119 81 Q110 85 101 81Z;M102 82 Q110 90 118 82 Q110 85 102 82Z;M101 81 Q110 94 119 81 Q110 85 101 81Z;M102 82 Q110 86 118 82 Q110 84 102 82Z" dur="0.8s" repeatCount="indefinite" />}</path>
            ) : (
              <path d="M101 81 Q110 89 119 81" stroke="#c0574f" strokeWidth="2.200" fill="none" />
            )}
          </g>
        </g>
        {a.rock && <path d="M162 42 Q164 24 182 26 Q198 31 193 47 Q180 56 166 52Z" fill="#cfc9be" stroke="#8d877c" strokeWidth="2.600" />}
      </g>
    </g>
  )
}

// 단독으로 쓰는 마스코트 (시작 화면, 이야기 화면 등)
export default function HalmangMascot({ pose = 'wave', speaking = false, animate = true, className = '', style, label = '설문대할망' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <MascotId.Provider value={id}>
      <svg viewBox="0 0 220 300" className={className} style={style} role="img" aria-label={label}><MascotArt pose={pose} speaking={speaking} animate={animate} /></svg>
    </MascotId.Provider>
  )
}
