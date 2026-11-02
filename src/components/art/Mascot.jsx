import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 머리가 큰 캐릭터 비율. 부분마다 선을 두르지 않고 몸 전체를 색 면으로만 그린 뒤,
// 바깥 윤곽선 하나를 필터로 한꺼번에 둘러서 머리·몸·팔·손이 하나로 이어져 보이게 했다.
// 부분 사이는 색 차이와 은은한 그림자로만 구분한다. 좌표: 폭 220 x 높이 300, 바닥이 y≈296.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색
const LINE = '#8a5a4a' // 몸 전체를 감싸는 단 하나의 윤곽선 색
const SKIN = '#ffe3cf', BLUSH = '#ff9aa8'
const TOP = '#ffc9d8', SLEEVE = '#ffb4c8'
const LAV = '#b9aeea'
const INK = '#4a3029'

// 자세별 팔(어깨→손목)과 손 위치
const ARMS = {
  wave: { L: ['M66 174 Q48 194 54 218', [54, 226]], R: ['M154 172 Q196 168 198 130', [198, 119]], wave: true },
  stand: { L: ['M66 174 Q48 194 54 218', [54, 226]], R: ['M154 174 Q172 194 166 218', [166, 226]] },
  stretch: { L: ['M66 172 Q20 158 22 114', [22, 103]], R: ['M154 172 Q200 158 198 114', [198, 103]] },
  throw: { L: ['M66 174 Q48 194 54 218', [54, 226]], R: ['M154 172 Q200 162 198 120', [198, 109]], rock: true },
  pour: { L: ['M66 176 Q96 198 128 204', [139, 205]], R: ['M154 176 Q172 194 166 214', [166, 222]], basket: true },
}

function Arm({ a }) {
  return (
    <g>
      <path d={a[0]} fill="none" stroke={SLEEVE} strokeWidth="25" strokeLinecap="round" />
      <circle cx={a[1][0]} cy={a[1][1]} r="12" fill={SKIN} />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(164 208) rotate(28)">
      <ellipse rx="34" ry="13" fill="#f0d68c" />
      <path d="M-28 -2 Q0 -20 28 -2 Q20 8 0 9 Q-20 8 -28 -2Z" fill="#a67c52" />
      <path d="M-24 6 L-18 11 M-10 8 L-4 12 M4 9 L10 13 M18 7 L24 11" stroke="#c9ad5c" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={28 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52">
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
        <filter id={`${id}-shade`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        {/* 몸 전체의 바깥 윤곽선 하나 */}
        <filter id={`${id}-line`} filterUnits="userSpaceOnUse" x="-30" y="-30" width="280" height="360">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="d" />
          <feGaussianBlur in="d" stdDeviation=".5" result="db" />
          <feFlood floodColor={LINE} result="c" />
          <feComposite in="c" in2="db" operator="in" result="o" />
          <feMerge><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd8e3" /><stop offset="1" stopColor={TOP} /></linearGradient>
        <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7edd1" /><stop offset="1" stopColor="#9bd9ab" /></linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f7d52" stopOpacity=".2" /><stop offset=".2" stopColor="#2f7d52" stopOpacity="0" />
          <stop offset=".36" stopColor="#2f7d52" stopOpacity=".1" /><stop offset=".5" stopColor="#fff" stopOpacity=".2" />
          <stop offset=".66" stopColor="#2f7d52" stopOpacity=".1" /><stop offset=".8" stopColor="#2f7d52" stopOpacity="0" />
          <stop offset="1" stopColor="#2f7d52" stopOpacity=".22" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx=".42" cy=".38" r=".8"><stop offset="0" stopColor="#fff2e6" /><stop offset="1" stopColor={SKIN} /></radialGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f3fa" /><stop offset="1" stopColor="#d9d9e8" /></linearGradient>
      </defs>
      <ellipse cx="110" cy="294" rx="76" ry="8" fill="#5a3a22" opacity=".18" filter={g('soft')} />

      <g filter={g('line')}>
        <g>
          {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -2.5;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

          {/* 버선 */}
          <path d="M60 290 Q58 283 74 284 L98 287 Q102 297 90 298 L66 298 Q59 297 60 290Z" fill="#fff" />
          <path d="M160 290 Q162 283 146 284 L122 287 Q118 297 130 298 L154 298 Q161 297 160 290Z" fill="#fff" />

          {/* 치마: 허리에서 한 번에 퍼지며 흘러내림, 주름은 음영으로 */}
          <path d="M62 196 C54 238 38 264 28 287 C62 299 158 299 192 287 C182 264 166 238 158 196Z" fill={g('skirt')} />
          <path d="M62 196 C54 238 38 264 28 287 C62 299 158 299 192 287 C182 264 166 238 158 196Z" fill={g('fold')} />
          <path d="M32 281 C70 293 150 293 188 281 L190 288 C158 299 62 299 30 288Z" fill="#ffc0cd" />

          {/* 저고리 */}
          <path d="M58 158 C55 178 57 198 62 210 Q110 226 158 210 C163 198 165 178 162 158 C140 150 80 150 58 158Z" fill={g('top')} />
          <path d="M92 150 C98 172 106 190 112 208 L108 208 C104 196 96 176 90 156Z M128 150 C122 172 114 190 108 208 L112 208 C118 196 126 176 130 156Z" fill={LAV} />
          <path d="M106 206 C96 190 86 202 100 212 Q108 212 110 206Z M114 206 C124 190 134 202 120 212 Q112 212 110 206Z" fill="#a99be0" />
          <path d="M106 212 C100 232 108 244 100 268 L106 268 C112 246 112 232 112 212Z M114 212 C122 232 116 244 128 264 L122 266 C112 246 116 232 112 212Z" fill={LAV} />
          <circle cx="110" cy="207" r="5.500" fill="#9585d8" />

          {/* 팔: 어깨에서 소매로 이어짐 */}
          <Arm a={a.L} />
          {a.wave && animate
            ? <g><animateTransform attributeName="transform" type="rotate" values="-9 154 172;9 154 172;-9 154 172" dur="1.5s" repeatCount="indefinite" /><Arm a={a.R} /></g>
            : <Arm a={a.R} />}
          {a.basket && <Basket animate={animate} />}

          {/* 턱 밑 그림자: 머리와 몸이 자연스럽게 이어지도록 */}
          <ellipse cx="110" cy="168" rx="50" ry="12" fill="#c25b7c" opacity=".35" filter={g('shade')} />

          {/* 머리 */}
          <g>
            {animate && <animateTransform attributeName="transform" type="rotate" values="-1.500 110 170;1.500 110 170;-1.500 110 170" dur="4s" repeatCount="indefinite" />}
            <ellipse cx="48" cy="116" rx="8" ry="11" fill={SKIN} /><ellipse cx="172" cy="116" rx="8" ry="11" fill={SKIN} />
            <path d="M110 46 C152 46 175 80 173 112 C171 146 147 166 110 166 C73 166 49 146 47 112 C45 80 68 46 110 46Z" fill={g('face')} />
            {/* 은빛 머리와 쪽 */}
            <path d="M47 112 C37 54 74 28 110 28 C146 28 183 54 173 112 C169 92 155 76 139 72 C128 84 92 84 81 72 C65 76 51 92 47 112Z" fill={g('hair')} />
            <path d="M110 84 C104 62 92 52 76 52 M110 84 C116 62 128 52 144 52 M108 82 C98 60 84 50 66 56 M112 82 C122 60 136 50 154 56" stroke="#b8b8d0" strokeOpacity=".7" strokeWidth="1.800" fill="none" />
            <path d="M88 34 C80 14 98 4 112 5 C128 5 140 18 132 34 C124 40 96 40 88 34Z" fill={g('hair')} />
            <path d="M96 22 C102 12 118 12 124 24 M100 30 C108 22 118 24 124 31" stroke="#b8b8d0" strokeOpacity=".8" strokeWidth="1.800" fill="none" />
            <path d="M76 28 L146 18" stroke="#3f9ec4" strokeWidth="7.500" /><path d="M76 28 L146 18" stroke="#8bd5ee" strokeWidth="4" />
            <circle cx="149" cy="17.500" r="5.500" fill="#8bd5ee" stroke="#3f9ec4" strokeWidth="2" />
            {/* 이목구비: 웃어서 감긴 눈 */}
            <path d="M75 100 Q88 93 100 98 M120 98 Q132 93 145 100" stroke="#bcbcd2" strokeWidth="3.200" fill="none" />
            <path d="M77 116 Q88 103 99 116 M121 116 Q132 103 143 116" stroke={INK} strokeWidth="4" fill="none" />
            <path d="M72 120 q-3 4 -6 1 M148 120 q3 4 6 1" stroke="#d99b82" strokeOpacity=".8" strokeWidth="1.800" fill="none" />
            <ellipse cx="66" cy="134" rx="14" ry="9" fill={BLUSH} opacity=".5" /><ellipse cx="154" cy="134" rx="14" ry="9" fill={BLUSH} opacity=".5" />
            <path d="M106 126 Q110 132 115 126" stroke="#d58a73" strokeWidth="2.600" fill="none" />
            {speaking ? (
              <path d="M97 139 Q110 160 123 139 Q110 146 97 139Z" fill="#c9453f">{animate && <animate attributeName="d" values="M98 141 Q110 146 122 141 Q110 144 98 141Z;M97 139 Q110 162 123 139 Q110 146 97 139Z;M98 141 Q110 152 122 141 Q110 145 98 141Z;M97 139 Q110 160 123 139 Q110 146 97 139Z;M98 141 Q110 146 122 141 Q110 144 98 141Z" dur="0.8s" repeatCount="indefinite" />}</path>
            ) : (
              <g>
                <path d="M95 139 Q110 155 125 139" stroke="#c0574f" strokeWidth="3.400" fill="none" />
                <path d="M93 137 q-2 3 0 5 M127 137 q2 3 0 5" stroke="#d58a73" strokeWidth="2" fill="none" />
              </g>
            )}
          </g>
          {a.rock && <path d="M164 62 Q166 40 188 42 Q206 48 200 68 Q186 78 168 74Z" fill="#cfc9be" />}
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
      <svg viewBox="0 0 220 300" className={className} style={style} role="img" aria-label={label}><MascotArt pose={pose} speaking={speaking} animate={animate} /></svg>
    </MascotId.Provider>
  )
}
