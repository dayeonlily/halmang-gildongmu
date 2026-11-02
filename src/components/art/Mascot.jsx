import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 둥글고 큰 머리(은빛 쪽머리·파란 비녀), 짧은 분홍 저고리(보라 깃·고름),
// 종 모양으로 퍼지는 연두 치마, 소매 끝에만 색동, 치마 밑으로 살짝 보이는 흰 버선.
// 좌표: 폭 220 x 높이 300, 바닥이 y≈296.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색
const LINE = '#8a5a4a'
const PINK1 = '#ffd0dc', PINK2 = '#ff9fb8', LAV = '#b3a6e6'
const HAIR = '#e6e6ef', HAIR_LINE = '#aaaabf', SKIN1 = '#fff0e2', SKIN2 = '#ffd8be'

// 자세별 소매(어깨→손목), 색동 끝단(손목→소매 끝), 손 위치
const ARMS = {
  wave: { L: ['M62 168 Q44 188 50 206', [50, 206], [50, 217], [50, 225]], R: ['M158 168 Q194 162 196 130', [196, 130], [197, 119], [198, 108]], wave: true },
  stand: { L: ['M62 168 Q46 188 52 206', [52, 206], [52, 217], [52, 225]], R: ['M158 168 Q174 188 168 206', [168, 206], [168, 217], [168, 225]] },
  stretch: { L: ['M62 166 Q24 152 22 120', [22, 120], [22, 109], [22, 98]], R: ['M158 166 Q196 152 198 120', [198, 120], [198, 109], [198, 98]] },
  throw: { L: ['M62 168 Q46 188 52 206', [52, 206], [52, 217], [52, 225]], R: ['M158 166 Q196 156 196 124', [196, 124], [196, 113], [196, 102]], rock: true },
  pour: { L: ['M62 170 Q92 194 126 198', [126, 198], [138, 199], [149, 200]], R: ['M158 170 Q176 188 172 208', [172, 208], [172, 219], [172, 227]], basket: true },
}

function Arm({ a, grad }) {
  const [d, w, c, h] = a
  return (
    <g>
      <path d={d} fill="none" stroke={LINE} strokeWidth="26" strokeLinecap="round" />
      <path d={d} fill="none" stroke={grad} strokeWidth="22" strokeLinecap="round" />
      {/* 색동 끝단 */}
      <path d={`M${w[0]} ${w[1]} L${c[0]} ${c[1]}`} stroke={LINE} strokeWidth="26" strokeLinecap="butt" />
      <path d={`M${w[0]} ${w[1]} L${c[0]} ${c[1]}`} stroke={LAV} strokeWidth="22" strokeLinecap="butt" />
      <circle cx={h[0]} cy={h[1]} r="11" fill={SKIN1} stroke={LINE} strokeWidth="2.4" />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(166 204) rotate(28)">
      <ellipse rx="34" ry="13" fill="#f0d68c" stroke="#a8884a" strokeWidth="3" />
      <path d="M-28 -2 Q0 -20 28 -2 Q20 8 0 9 Q-20 8 -28 -2Z" fill="#a67c52" stroke="#7a5a3a" strokeWidth="2" strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={28 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke="#7a5a3a" strokeWidth="1">
          {animate && <animate attributeName="cy" values="6;60" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
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
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="3.5" /></filter>
        <radialGradient id={`${id}-top`} cx=".4" cy=".25" r=".9"><stop offset="0" stopColor={PINK1} /><stop offset="1" stopColor={PINK2} /></radialGradient>
        <radialGradient id={`${id}-skirt`} cx=".4" cy=".15" r=".95"><stop offset="0" stopColor="#c9efd1" /><stop offset="1" stopColor="#8fd6a2" /></radialGradient>
        <radialGradient id={`${id}-face`} cx=".4" cy=".3" r=".8"><stop offset="0" stopColor={SKIN1} /><stop offset="1" stopColor={SKIN2} /></radialGradient>
      </defs>
      <ellipse cx="110" cy="294" rx="76" ry="9" fill="#5a3a22" opacity=".2" filter={g('soft')} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -3;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

        {/* 버선 */}
        <ellipse cx="82" cy="286" rx="20" ry="9" fill="#fff" stroke={LINE} strokeWidth="2.4" /><ellipse cx="138" cy="286" rx="20" ry="9" fill="#fff" stroke={LINE} strokeWidth="2.4" />

        {/* 치마: 허리에서 종 모양으로 퍼짐 */}
        <path d="M64 182 C52 224 30 252 30 274 C34 288 186 288 190 274 C190 252 168 224 156 182 Z" fill={g('skirt')} stroke={LINE} strokeWidth="2.6" />
        <path d="M30 274 C34 288 186 288 190 274 L189 262 C170 276 50 276 31 262Z" fill="#ffc3bb" stroke={LINE} strokeWidth="2.2" />
        <path d="M70 200 Q58 232 48 254" stroke="#fff" strokeOpacity=".5" strokeWidth="9" fill="none" />

        {/* 저고리: 짧은 상의 */}
        <path d="M62 150 C58 168 60 186 66 198 Q110 210 154 198 C160 186 162 168 158 150 Q110 138 62 150Z" fill={g('top')} stroke={LINE} strokeWidth="2.6" />
        {/* 깃(보라) + 동정 */}
        <path d="M92 146 L112 192 M128 146 L108 192" stroke={LAV} strokeWidth="12" fill="none" />
        <path d="M96 146 L112 188 M124 146 L108 188" stroke="#fff" strokeWidth="3" fill="none" />
        {/* 고름 */}
        <path d="M110 190 C86 172 70 196 100 202 Q108 200 110 190Z M110 190 C134 172 150 196 120 202 Q112 200 110 190Z" fill={LAV} stroke={LINE} strokeWidth="2" />
        <path d="M106 202 C98 226 108 238 98 262 M114 202 C124 224 118 236 130 258" stroke={LAV} strokeWidth="8" fill="none" />
        <circle cx="110" cy="196" r="6.5" fill="#8f7fd0" stroke={LINE} strokeWidth="2" />

        {/* 팔 */}
        <Arm a={a.L} grad={g('top')} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-9 158 168;9 158 168;-9 158 168" dur="1.5s" repeatCount="indefinite" /><Arm a={a.R} grad={g('top')} /></g>
          : <Arm a={a.R} grad={g('top')} />}
        {a.basket && <Basket animate={animate} />}

        {/* 머리 */}
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2 110 150;2 110 150;-2 110 150" dur="4s" repeatCount="indefinite" />}
          <ellipse cx="110" cy="98" rx="64" ry="56" fill={g('face')} stroke={LINE} strokeWidth="2.6" />
          {/* 은빛 머리: 가운데 가르마, 이마를 덮고 뒤로 넘김 */}
          <path d="M47 94 C40 44 76 26 110 26 C144 26 180 44 173 94 C168 78 152 66 138 68 Q124 58 110 62 Q96 58 82 68 C68 66 52 78 47 94Z" fill={HAIR} stroke={HAIR_LINE} strokeWidth="2.4" />
          <path d="M110 62 Q108 44 100 34 M110 62 Q112 44 120 34" stroke="#cfcfdd" strokeWidth="2.4" fill="none" />
          {/* 쪽 + 비녀 */}
          <circle cx="110" cy="20" r="17" fill={HAIR} stroke={HAIR_LINE} strokeWidth="2.4" />
          <path d="M101 20 q9 -10 18 0" stroke="#cfcfdd" strokeWidth="2.4" fill="none" />
          <path d="M80 26 L148 14" stroke="#3f9ec4" strokeWidth="8" /><path d="M80 26 L148 14" stroke="#6ec6e8" strokeWidth="4.4" />
          <circle cx="150" cy="13.6" r="6" fill="#6ec6e8" stroke="#3f9ec4" strokeWidth="2" />
          {/* 얼굴 */}
          <path d="M72 94 Q82 88 94 92 M126 92 Q138 88 148 94" stroke="#b9b9cc" strokeWidth="3.4" fill="none" />
          <ellipse cx="84" cy="108" rx="8.5" ry="11" fill="#3b2a26" /><ellipse cx="136" cy="108" rx="8.5" ry="11" fill="#3b2a26" />
          <circle cx="87.4" cy="103.6" r="3.6" fill="#fff" /><circle cx="139.4" cy="103.6" r="3.6" fill="#fff" />
          <circle cx="81" cy="113" r="1.8" fill="#fff" /><circle cx="133" cy="113" r="1.8" fill="#fff" />
          <ellipse cx="66" cy="126" rx="12" ry="7.5" fill="#ff8f9c" opacity=".5" /><ellipse cx="154" cy="126" rx="12" ry="7.5" fill="#ff8f9c" opacity=".5" />
          <path d="M106 120 q4 4 8 0" stroke="#d9876f" strokeWidth="2.4" fill="none" />
          {speaking ? (
            <ellipse cx="110" cy="136" rx="10" ry="6" fill="#c9453f" stroke={LINE} strokeWidth="2.2">{animate && <animate attributeName="ry" values="2;8;3;7;2" dur="0.7s" repeatCount="indefinite" />}</ellipse>
          ) : (
            <path d="M98 131 Q110 144 122 131" stroke="#c0574f" strokeWidth="3.2" fill="none" />
          )}
        </g>
        {a.rock && <path d="M170 66 Q172 46 192 48 Q210 54 204 72 Q190 82 174 78Z" fill="#cfc9be" stroke="#8d877c" strokeWidth="3" />}
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
