import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트) ──────────────────────────────
// 참고 그림의 의상과 특징: 은빛 쪽머리·파란 비녀, 눈웃음과 잔주름, 분홍 저고리(보라 깃·고름·소맷부리),
// 연두 치마(분홍 속치마), 흰 버선. (삼태기는 흙을 붓는 이야기 장면 'pour' 자세에서만 등장)
// 머리가 크고 몸이 작은 마스코트 비율. 좌표: 폭 200 x 높이 264, 발끝이 y≈258.
export const MascotId = createContext('')

const OUT = '#8a5a45' // 윤곽선(진한 갈색, 투명도로 부드럽게)
const PINK = '#f2a9bf', PINK_EDGE = '#c97f98', LAV = '#a99bd8', LAV_DK = '#8576bd'

// 자세별 팔: 소매(굵은 선)와 손 위치
const ARMS = {
  wave: { L: ['M66 158 Q44 178 56 204', [56, 210]], R: ['M134 158 Q186 160 184 112', [184, 104]], wave: true },
  stand: { L: ['M66 158 Q44 178 62 204', [62, 209]], R: ['M134 158 Q156 178 138 204', [138, 209]] },
  stretch: { L: ['M66 158 Q30 140 38 88', [38, 80]], R: ['M134 158 Q170 140 162 88', [162, 80]] },
  throw: { L: ['M66 158 Q44 178 62 204', [62, 209]], R: ['M134 158 Q170 140 160 92', [160, 84]], rock: true },
  pour: { L: ['M66 158 Q98 186 132 192', [136, 194]], R: ['M134 158 Q162 172 166 194', [166, 198]], basket: 'pour' },
}

function Arm({ d, hand }) {
  return (
    <g>
      <path d={d} stroke={PINK_EDGE} strokeWidth="23" strokeLinecap="round" fill="none" opacity=".55" />
      <path d={d} stroke={PINK} strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d={d} stroke="#fff" strokeOpacity=".22" strokeWidth="6" strokeLinecap="round" fill="none" transform="translate(-3 -3)" />
      <circle cx={hand[0]} cy={hand[1] - 1} r="12.5" fill={LAV} stroke={LAV_DK} strokeOpacity=".5" strokeWidth="1.4" />
      <circle cx={hand[0]} cy={hand[1] + 3} r="8.4" fill="#fcdcc6" stroke={OUT} strokeOpacity=".4" strokeWidth="1.3" />
    </g>
  )
}

// 흙이 담긴 삼태기 + 흙 알갱이(떨어지는 애니메이션)
function Basket({ x, y, rot, drops, animate }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <ellipse rx="35" ry="13" fill="#e2c982" stroke="#a8884a" strokeWidth="2" />
      <ellipse rx="29" ry="9" cy="-2" fill="#c9ad66" opacity=".7" />
      <path d="M-30 -2 Q0 -22 30 -2 Q22 8 0 9 Q-22 8 -30 -2Z" fill="#9b7653" stroke="#7a5a3a" strokeOpacity=".5" />
      <path d="M-14 -8 q4 -5 8 0 M4 -10 q5 -4 9 1" stroke="#b58f66" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M-27 6 L-21 12 M-14 8 L-8 13 M-1 9 L5 14 M12 8 L18 13 M24 5 L29 9" stroke="#b79a52" strokeWidth="1.5" />
      {drops && Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={28 + (i % 3) * 6} cy="6" r={2.4 + (i % 3) * 0.8} fill="#8b6845">
          {animate && <animate attributeName="cy" values="6;52" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
          {animate && <animate attributeName="opacity" values="1;0" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </g>
  )
}

// 그림 본체: 호출하는 쪽의 <svg> 안에 놓는 <g>. id 는 그라데이션 구분용.
export function MascotArt({ pose = 'wave', speaking = false, animate = true }) {
  const id = useContext(MascotId)
  const a = ARMS[pose] ?? ARMS.wave
  const g = (n) => `url(#${id}-${n})`
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-skin`} cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#fff0e2" /><stop offset=".6" stopColor="#fbdcc4" /><stop offset="1" stopColor="#f2c3a4" /></radialGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f1f6" /><stop offset=".6" stopColor="#d3d3dc" /><stop offset="1" stopColor="#b9b9c7" /></linearGradient>
        <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe0c4" /><stop offset="1" stopColor="#84b693" /></linearGradient>
        <linearGradient id={`${id}-jeo`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8c0d0" /><stop offset="1" stopColor="#eb9fb8" /></linearGradient>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <ellipse cx="100" cy="256" rx="66" ry="8" fill="#5a3a22" opacity=".2" filter={`url(#${id}-soft)`} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="2.8s" repeatCount="indefinite" />}

        {/* 치마 + 분홍 속치마 + 버선 */}
        <path d="M64 176 C58 204 44 230 38 246 Q100 262 162 246 C156 230 142 204 136 176 Z" fill={g('skirt')} stroke={OUT} strokeOpacity=".45" strokeWidth="1.6" />
        <path d="M82 180 Q74 214 62 244 M102 182 Q102 216 100 252 M122 180 Q130 214 140 244" stroke="#6fa383" strokeOpacity=".4" strokeWidth="1.6" fill="none" />
        <path d="M70 186 Q60 216 50 240" stroke="#fff" strokeOpacity=".3" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M38 246 Q100 262 162 246 L160 237 Q100 253 40 237 Z" fill="#f0b4ad" stroke={OUT} strokeOpacity=".4" strokeWidth="1.4" />
        <path d="M66 252 q12 -9 24 0 q-3 10 -12 10 q-9 0 -12 -10Z M110 252 q12 -9 24 0 q-3 10 -12 10 q-9 0 -12 -10Z" fill="#fff" stroke={OUT} strokeOpacity=".4" strokeWidth="1.3" />
        <path d="M70 258 q8 5 16 0 M114 258 q8 5 16 0" stroke="#9b7653" strokeWidth="3.4" strokeLinecap="round" fill="none" />

        {/* 저고리: 분홍 + 보라 깃·고름 */}
        <path d="M62 152 Q100 168 138 152 L147 192 Q100 203 53 192 Z" fill={g('jeo')} stroke={OUT} strokeOpacity=".45" strokeWidth="1.6" />
        <path d="M54 190 Q100 201 146 190" stroke={LAV} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M84 154 L104 189" stroke={LAV} strokeWidth="9" strokeLinecap="round" />
        <path d="M116 154 L98 189" stroke={LAV} strokeWidth="9" strokeLinecap="round" />
        <path d="M89 154 L105 185 M111 154 L99 185" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M101 177 C82 163 70 182 93 187 Q99 185 101 177Z M101 177 C120 163 132 182 109 187 Q103 185 101 177Z" fill={LAV} stroke={LAV_DK} strokeOpacity=".6" strokeWidth="1.4" />
        <path d="M99 184 C92 206 100 216 93 236 M104 184 C112 204 107 214 117 230" stroke={LAV} strokeWidth="6.5" strokeLinecap="round" fill="none" />
        <path d="M99 184 C92 206 100 216 93 236 M104 184 C112 204 107 214 117 230" stroke={LAV_DK} strokeOpacity=".4" strokeWidth="1.4" fill="none" transform="translate(2 0)" />
        <circle cx="101" cy="180" r="5.5" fill={LAV_DK} />

        {/* 팔 */}
        <Arm d={a.L[0]} hand={a.L[1]} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-9 134 158;10 134 158;-9 134 158" dur="1.5s" repeatCount="indefinite" /><Arm d={a.R[0]} hand={a.R[1]} /></g>
          : <Arm d={a.R[0]} hand={a.R[1]} />}
        {a.basket === 'pour' && <Basket x={152} y={188} rot={30} drops animate={animate} />}
        {a.rock && <path d="M146 74 Q150 56 168 58 Q184 64 178 80 Q166 90 150 86Z" fill="#a8a299" stroke="#7b756b" strokeOpacity=".6" strokeWidth="1.6" />}

        {/* 머리 */}
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2.5 100 150;2.5 100 150;-2.5 100 150" dur="4s" repeatCount="indefinite" />}
          <ellipse cx="38" cy="110" rx="8" ry="11" fill="#f5cfb3" stroke={OUT} strokeOpacity=".4" strokeWidth="1.4" />
          <ellipse cx="162" cy="110" rx="8" ry="11" fill="#f5cfb3" stroke={OUT} strokeOpacity=".4" strokeWidth="1.4" />
          <ellipse cx="100" cy="102" rx="62" ry="56" fill={g('skin')} stroke={OUT} strokeOpacity=".5" strokeWidth="1.8" />
          {/* 은빛 머리: 가운데 가르마, 결, 쪽, 파란 비녀 */}
          <path d="M36 104 C26 50 64 24 100 24 C136 24 174 50 164 104 C158 82 138 70 118 68 Q100 64 82 68 C62 70 42 82 36 104 Z" fill={g('hair')} stroke={OUT} strokeOpacity=".5" strokeWidth="1.8" />
          <path d="M100 66 Q70 64 42 98 M100 66 Q130 64 158 98 M100 64 Q78 48 54 62 M100 64 Q122 48 146 62 M100 64 L100 40" stroke="#a9abc0" strokeOpacity=".7" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="22" r="21" fill={g('hair')} stroke={OUT} strokeOpacity=".5" strokeWidth="1.8" />
          <path d="M87 22 q13 -15 26 0 q-11 13 -24 4 M93 20 q7 -7 13 0" stroke="#aeb0c3" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M66 32 L134 18" stroke="#4aa7c9" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M66 30 L134 16" stroke="#9fe0f2" strokeWidth="2" strokeLinecap="round" />
          <circle cx="136" cy="17.5" r="5.5" fill="#4aa7c9" /><circle cx="134.5" cy="16" r="1.8" fill="#bff0fa" />
          {/* 얼굴: 눈웃음, 눈썹, 눈가 주름, 볼터치, 웃는 입 */}
          <path d="M62 90 Q74 83 86 90 M114 90 Q126 83 138 90" stroke="#b3ada5" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <path d="M62 109 Q73 94 84 109 M116 109 Q127 94 138 109" stroke="#4d372d" strokeWidth="4.2" fill="none" strokeLinecap="round" />
          <path d="M55 106 l-7 -3 M55 112 l-7 2 M145 106 l7 -3 M145 112 l7 2 M80 77 Q100 72 120 77" stroke="#d3a98f" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity=".8" />
          <path d="M100 112 q5 8 -3 11" stroke="#d99f82" strokeWidth="2.3" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="127" r="12" fill="#f58f8f" opacity=".4" /><circle cx="140" cy="127" r="12" fill="#f58f8f" opacity=".4" />
          {speaking ? (
            <g>
              <ellipse cx="100" cy="137" rx="12" ry="8" fill="#8a2f2f">{animate && <animate attributeName="ry" values="3;9;4;8;3" dur="0.7s" repeatCount="indefinite" />}</ellipse>
              <ellipse cx="100" cy="141" rx="7" ry="3.6" fill="#ff8d8d" />
            </g>
          ) : <path d="M83 130 Q100 148 117 130" stroke="#bf5f55" strokeWidth="3.8" fill="none" strokeLinecap="round" />}
          <ellipse cx="72" cy="66" rx="20" ry="7" fill="#fff" opacity=".28" transform="rotate(-18 72 66)" />
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
      <svg viewBox="0 0 200 264" className={className} style={style} role="img" aria-label={label}><MascotArt pose={pose} speaking={speaking} animate={animate} /></svg>
    </MascotId.Provider>
  )
}
