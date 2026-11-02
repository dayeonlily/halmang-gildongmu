import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 귀여움의 규칙: 아주 둥글고 통통한 몸, 큼직하고 반짝이는 눈, 통통한 볼터치, 또렷하고 부드러운 갈색 윤곽선,
// 단순한 면 채색(주름·잔결 없음). 설문대할망의 특징은 의상으로: 은빛 쪽머리·파란 비녀, 분홍 저고리(보라 깃·고름·소맷부리),
// 연두 치마(분홍 속치마), 흰 버선. 삼태기는 흙을 붓는 이야기 장면('pour' 자세)에서만 나온다.
// 좌표: 폭 200 x 높이 270, 발끝이 y≈262.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e'
const LW = 3 // 윤곽선 굵기
const SKIN = '#ffe3cf', PINK = '#ffb8cb', LAV = '#b3a6e6', GREEN = '#a9dfb2', HEM = '#ffc3bb', HAIR = '#e3e3ed'

// 자세별 팔(통통한 소매 선)과 손 위치
const ARMS = {
  wave: { L: ['M70 166 Q50 182 60 204', [60, 209]], R: ['M130 164 Q178 166 176 120', [176, 111]], wave: true },
  stand: { L: ['M70 166 Q52 184 66 206', [66, 211]], R: ['M130 166 Q148 184 134 206', [134, 211]] },
  stretch: { L: ['M70 166 Q34 148 40 98', [40, 89]], R: ['M130 166 Q166 148 160 98', [160, 89]] },
  throw: { L: ['M70 166 Q52 184 66 206', [66, 211]], R: ['M130 164 Q170 148 160 100', [160, 91]], rock: true },
  pour: { L: ['M70 166 Q100 192 134 198', [138, 199]], R: ['M130 164 Q158 180 164 200', [164, 204]], basket: true },
}

function Arm({ d, hand }) {
  return (
    <g>
      <path d={d} stroke={OUTLINE} strokeWidth="24" strokeLinecap="round" fill="none" />
      <path d={d} stroke={PINK} strokeWidth="18" strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1] - 3} r="12.5" fill={LAV} stroke={OUTLINE} strokeWidth={LW - 1} />
      <circle cx={hand[0]} cy={hand[1] + 1} r="9" fill={SKIN} stroke={OUTLINE} strokeWidth={LW - 1} />
    </g>
  )
}

// 흙이 담긴 삼태기 + 떨어지는 흙 알갱이
function Basket({ animate }) {
  return (
    <g transform="translate(152 190) rotate(30)">
      <ellipse rx="36" ry="14" fill="#f0d68c" stroke={OUTLINE} strokeWidth={LW} />
      <path d="M-30 -2 Q0 -22 30 -2 Q22 8 0 9 Q-22 8 -30 -2Z" fill="#a67c52" stroke={OUTLINE} strokeWidth={LW - 1} strokeLinejoin="round" />
      <path d="M-26 6 L-20 12 M-12 8 L-6 13 M2 9 L8 14 M16 8 L22 13" stroke="#c9ad5c" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={30 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke={OUTLINE} strokeWidth="1">
          {animate && <animate attributeName="cy" values="6;56" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
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
      <ellipse cx="100" cy="262" rx="64" ry="8" fill="#5a3a22" opacity=".2" filter={`url(#${id}-soft)`} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="2.8s" repeatCount="indefinite" />}

        {/* 치마 + 분홍 속치마 + 버선 */}
        <path d="M62 190 C54 214 44 236 36 252 Q100 270 164 252 C156 236 146 214 138 190 Z" fill={GREEN} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M36 252 Q100 270 164 252 L160 241 Q100 259 40 241 Z" fill={HEM} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M70 200 Q62 222 54 238" stroke="#fff" strokeOpacity=".5" strokeWidth="8" fill="none" />
        <ellipse cx="80" cy="262" rx="14" ry="7" fill="#fff" stroke={OUTLINE} strokeWidth={LW} /><ellipse cx="120" cy="262" rx="14" ry="7" fill="#fff" stroke={OUTLINE} strokeWidth={LW} />

        {/* 저고리: 분홍 + 보라 깃·고름 */}
        <path d="M66 158 Q100 172 134 158 L142 198 Q100 210 58 198 Z" fill={PINK} stroke={OUTLINE} strokeWidth={LW} />
        <path d="M58 197 Q100 209 142 197" stroke={LAV} strokeWidth="6" fill="none" />
        <path d="M86 160 L104 192 M114 160 L96 192" stroke={LAV} strokeWidth="9" />
        <path d="M91 160 L104 188 M109 160 L97 188" stroke="#fff" strokeWidth="2.6" />
        <path d="M101 184 C80 166 66 188 92 193 Q99 191 101 184Z M101 184 C122 166 136 188 110 193 Q103 191 101 184Z" fill={LAV} stroke={OUTLINE} strokeWidth={LW - 1} />
        <path d="M98 192 C92 214 100 224 92 242 M104 192 C112 212 108 222 118 238" stroke={OUTLINE} strokeWidth="9.5" fill="none" />
        <path d="M98 192 C92 214 100 224 92 242 M104 192 C112 212 108 222 118 238" stroke={LAV} strokeWidth="6" fill="none" />
        <circle cx="101" cy="188" r="6" fill="#8f7fd0" stroke={OUTLINE} strokeWidth={LW - 1} />

        {/* 팔 */}
        <Arm d={a.L[0]} hand={a.L[1]} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-9 130 164;10 130 164;-9 130 164" dur="1.5s" repeatCount="indefinite" /><Arm d={a.R[0]} hand={a.R[1]} /></g>
          : <Arm d={a.R[0]} hand={a.R[1]} />}
        {a.basket && <Basket animate={animate} />}
        {a.rock && <path d="M146 78 Q150 58 170 60 Q188 66 182 84 Q168 94 150 90Z" fill="#cfc9be" stroke={OUTLINE} strokeWidth={LW} />}

        {/* 머리: 크고 둥글게 */}
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2.5 100 156;2.5 100 156;-2.5 100 156" dur="4s" repeatCount="indefinite" />}
          <ellipse cx="100" cy="106" rx="68" ry="62" fill={SKIN} stroke={OUTLINE} strokeWidth={LW} />
          {/* 은빛 머리와 쪽, 파란 비녀 */}
          <path d="M32 108 C24 52 62 22 100 22 C138 22 176 52 168 108 C162 86 144 74 128 76 C120 66 80 66 72 76 C56 74 38 86 32 108 Z" fill={HAIR} stroke={OUTLINE} strokeWidth={LW} />
          <path d="M100 68 L100 50" stroke="#b9b9cc" strokeWidth="3" fill="none" />
          <circle cx="100" cy="22" r="22" fill={HAIR} stroke={OUTLINE} strokeWidth={LW} />
          <path d="M88 22 q12 -14 24 0" stroke="#b9b9cc" strokeWidth="3" fill="none" />
          <path d="M64 34 L136 18" stroke={OUTLINE} strokeWidth="10" />
          <path d="M64 34 L136 18" stroke="#6ec6e8" strokeWidth="5.4" />
          <circle cx="138" cy="17.5" r="7" fill="#6ec6e8" stroke={OUTLINE} strokeWidth={LW - 1} /><circle cx="136" cy="15.5" r="2" fill="#fff" />
          {/* 얼굴: 큼직하고 반짝이는 눈, 통통한 볼, 작은 웃음 */}
          <ellipse cx="73" cy="110" rx="9" ry="11.5" fill="#3b2a26" /><ellipse cx="127" cy="110" rx="9" ry="11.5" fill="#3b2a26" />
          <circle cx="76.5" cy="105" r="3.8" fill="#fff" /><circle cx="130.5" cy="105" r="3.8" fill="#fff" />
          <circle cx="70" cy="116" r="1.9" fill="#fff" /><circle cx="124" cy="116" r="1.9" fill="#fff" />
          <ellipse cx="54" cy="130" rx="14" ry="9" fill="#ff8f9c" opacity=".6" /><ellipse cx="146" cy="130" rx="14" ry="9" fill="#ff8f9c" opacity=".6" />
          {speaking ? (
            <g>
              <ellipse cx="100" cy="134" rx="12" ry="8" fill="#c9453f" stroke={OUTLINE} strokeWidth="2.4">{animate && <animate attributeName="ry" values="3;9;4;8;3" dur="0.7s" repeatCount="indefinite" />}</ellipse>
              <ellipse cx="100" cy="138" rx="7" ry="3.4" fill="#ff9aa0" />
            </g>
          ) : <path d="M88 128 Q100 142 112 128" stroke={OUTLINE} strokeWidth="3.6" fill="none" />}
          <path d="M97 120 q3 3 6 0" stroke="#e7a98c" strokeWidth="2.4" fill="none" />
          <ellipse cx="74" cy="70" rx="22" ry="8" fill="#fff" opacity=".4" transform="rotate(-16 74 70)" />
        </g>
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
