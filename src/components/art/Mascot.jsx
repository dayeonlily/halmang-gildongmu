import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 아주 둥글고 통통한 몸에 커다란 머리, 짧고 통통한 손발(손가락·소맷부리·신발 같은 세부 묘사 없음),
// 큼직하고 반짝이는 눈, 통통한 볼터치, 또렷하고 부드러운 갈색 윤곽선, 단순한 면 채색.
// 설문대할망의 특징은 의상으로: 은빛 쪽머리·파란 비녀, 분홍 저고리(보라 깃·고름), 연두 치마(분홍 속치마).
// 좌표: 폭 200 x 높이 270, 바닥이 y≈260.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e'
const LW = 3
const SKIN = '#ffe3cf', PINK = '#ffb8cb', LAV = '#b3a6e6', GREEN = '#a9dfb2', HEM = '#ffc3bb', HAIR = '#e3e3ed'

// 자세별 짧은 팔(굵은 선 하나)과 손(동그란 끝) 위치
const ARMS = {
  wave: { L: ['M68 170 Q54 184 60 198', [60, 202]], R: ['M132 170 Q184 172 182 130', [182, 124]], wave: true },
  stand: { L: ['M68 170 Q56 186 64 200', [64, 204]], R: ['M132 170 Q144 186 136 200', [136, 204]] },
  stretch: { L: ['M68 168 Q12 152 20 110', [20, 104]], R: ['M132 168 Q188 152 180 110', [180, 104]] },
  throw: { L: ['M68 170 Q56 186 64 200', [64, 204]], R: ['M132 168 Q190 154 182 110', [182, 104]], rock: true },
  pour: { L: ['M68 170 Q96 190 126 194', [130, 195]], R: ['M132 170 Q152 182 158 198', [160, 201]], basket: true },
}

// 짧고 통통한 팔: 소매 + 동그란 손 (세부 묘사 없음)
function Arm({ d, hand }) {
  return (
    <g>
      <path d={d} stroke={OUTLINE} strokeWidth="25" strokeLinecap="round" fill="none" />
      <path d={d} stroke={PINK} strokeWidth="19" strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r="11" fill={SKIN} stroke={OUTLINE} strokeWidth={LW - 0.5} />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(160 184) rotate(28)">
      <ellipse rx="36" ry="14" fill="#f0d68c" stroke={OUTLINE} strokeWidth={LW} />
      <path d="M-30 -2 Q0 -22 30 -2 Q22 8 0 9 Q-22 8 -30 -2Z" fill="#a67c52" stroke={OUTLINE} strokeWidth={LW - 1} strokeLinejoin="round" />
      <path d="M-26 6 L-20 12 M-12 8 L-6 13 M2 9 L8 14 M16 8 L22 13" stroke="#c9ad5c" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={30 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke={OUTLINE} strokeWidth="1">
          {animate && <animate attributeName="cy" values="6;60" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
          {animate && <animate attributeName="opacity" values="1;0" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </g>
  )
}

// 그림 본체: 호출하는 쪽의 <svg> 안에 놓는 <g>
export function MascotArt({ pose = 'wave', speaking = false, animate = true }) {
  const id = useContext(MascotId)
  const a = ARMS[pose] ?? ARMS.wave
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs><filter id={`${id}-soft`}><feGaussianBlur stdDeviation="3" /></filter></defs>
      <ellipse cx="100" cy="260" rx="66" ry="8" fill="#5a3a22" opacity=".2" filter={`url(#${id}-soft)`} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -3;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

        {/* 짧고 통통한 발 */}
        <ellipse cx="80" cy="258" rx="15" ry="8" fill="#fff" stroke={OUTLINE} strokeWidth={LW} /><ellipse cx="120" cy="258" rx="15" ry="8" fill="#fff" stroke={OUTLINE} strokeWidth={LW} />

        {/* 치마 + 분홍 속치마 */}
        <path d="M60 186 C48 212 38 234 36 250 Q100 270 164 250 C162 234 152 212 140 186 Z" fill={GREEN} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M36 250 Q100 270 164 250 L162 239 Q100 259 38 239 Z" fill={HEM} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M68 198 Q58 220 52 236" stroke="#fff" strokeOpacity=".5" strokeWidth="9" fill="none" />

        {/* 저고리: 분홍 + 보라 깃·고름 */}
        <path d="M64 158 Q100 172 136 158 L144 198 Q100 210 56 198 Z" fill={PINK} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M56 197 Q100 209 144 197" stroke={LAV} strokeWidth="6" fill="none" />
        <path d="M86 161 L104 194 M114 161 L96 194" stroke={LAV} strokeWidth="10" />
        <path d="M91 161 L104 190 M109 161 L97 190" stroke="#fff" strokeWidth="2.8" />
        <path d="M101 186 C80 168 66 190 92 195 Q99 193 101 186Z M101 186 C122 168 136 190 110 195 Q103 193 101 186Z" fill={LAV} stroke={OUTLINE} strokeWidth={LW - 1} />
        <path d="M98 194 C92 216 100 226 92 244 M104 194 C112 214 108 224 118 240" stroke={OUTLINE} strokeWidth="9.5" fill="none" />
        <path d="M98 194 C92 216 100 226 92 244 M104 194 C112 214 108 224 118 240" stroke={LAV} strokeWidth="6" fill="none" />
        <circle cx="101" cy="190" r="6.5" fill="#8f7fd0" stroke={OUTLINE} strokeWidth={LW - 1} />

        {/* 팔: 짧고 통통하게 */}
        <Arm d={a.L[0]} hand={a.L[1]} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-10 132 170;10 132 170;-10 132 170" dur="1.5s" repeatCount="indefinite" /><Arm d={a.R[0]} hand={a.R[1]} /></g>
          : <Arm d={a.R[0]} hand={a.R[1]} />}
        {a.basket && <Basket animate={animate} />}

        {/* 머리: 크고 둥글게 */}
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2.5 100 158;2.5 100 158;-2.5 100 158" dur="4s" repeatCount="indefinite" />}
          <ellipse cx="100" cy="106" rx="70" ry="64" fill={SKIN} stroke={OUTLINE} strokeWidth={LW} />
          {/* 은빛 머리와 쪽, 파란 비녀 */}
          <path d="M30 108 C22 50 62 20 100 20 C138 20 178 50 170 108 C164 86 146 74 130 76 C122 66 78 66 70 76 C54 74 36 86 30 108 Z" fill={HAIR} stroke={OUTLINE} strokeWidth={LW} />
          <path d="M100 68 L100 50" stroke="#b9b9cc" strokeWidth="3" fill="none" />
          <circle cx="100" cy="20" r="22" fill={HAIR} stroke={OUTLINE} strokeWidth={LW} />
          <path d="M88 20 q12 -14 24 0" stroke="#b9b9cc" strokeWidth="3" fill="none" />
          <path d="M64 32 L136 16" stroke={OUTLINE} strokeWidth="10" />
          <path d="M64 32 L136 16" stroke="#6ec6e8" strokeWidth="5.4" />
          <circle cx="138" cy="15.5" r="7" fill="#6ec6e8" stroke={OUTLINE} strokeWidth={LW - 1} /><circle cx="136" cy="13.5" r="2" fill="#fff" />
          {/* 얼굴: 큼직하고 반짝이는 눈, 통통한 볼, 작은 웃음 */}
          <ellipse cx="72" cy="112" rx="9.5" ry="12" fill="#3b2a26" /><ellipse cx="128" cy="112" rx="9.5" ry="12" fill="#3b2a26" />
          <circle cx="75.5" cy="106.5" r="4" fill="#fff" /><circle cx="131.5" cy="106.5" r="4" fill="#fff" />
          <circle cx="69" cy="118" r="2" fill="#fff" /><circle cx="125" cy="118" r="2" fill="#fff" />
          <ellipse cx="52" cy="132" rx="14" ry="9" fill="#ff8f9c" opacity=".6" /><ellipse cx="148" cy="132" rx="14" ry="9" fill="#ff8f9c" opacity=".6" />
          {speaking ? (
            <g>
              <ellipse cx="100" cy="136" rx="12" ry="8" fill="#c9453f" stroke={OUTLINE} strokeWidth="2.4">{animate && <animate attributeName="ry" values="3;9;4;8;3" dur="0.7s" repeatCount="indefinite" />}</ellipse>
              <ellipse cx="100" cy="140" rx="7" ry="3.4" fill="#ff9aa0" />
            </g>
          ) : <path d="M88 130 Q100 144 112 130" stroke={OUTLINE} strokeWidth="3.6" fill="none" />}
          <path d="M97 122 q3 3 6 0" stroke="#e7a98c" strokeWidth="2.4" fill="none" />
          <ellipse cx="72" cy="68" rx="22" ry="8" fill="#fff" opacity=".4" transform="rotate(-16 72 68)" />
        </g>
        {a.rock && <path d="M150 62 Q154 40 175 42 Q194 48 188 68 Q173 78 154 74Z" fill="#cfc9be" stroke={OUTLINE} strokeWidth={LW} />}
      </g>
    </g>
  )
}

// 단독으로 쓰는 마스코트 (시작 화면, 이야기 화면 등)
export default function HalmangMascot({ pose = 'wave', speaking = false, animate = true, className = '', style, label = '설문대할망' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <MascotId.Provider value={id}>
      <svg viewBox="0 0 200 270" className={className} style={style} role="img" aria-label={label}><MascotArt pose={pose} speaking={speaking} animate={animate} /></svg>
    </MascotId.Provider>
  )
}
