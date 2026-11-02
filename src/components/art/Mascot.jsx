import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 도형을 이어 붙이지 않고 곡선으로 윤곽을 그린다: 턱선이 있는 얼굴, 가르마 탄 은빛 머리와 쪽,
// 웃어서 감긴 눈, 어깨에서 소매 끝으로 퍼지는 한복 소매, 허리에서 흘러내리는 치마 주름, 버선.
// 선 색은 면 색보다 한 톤 짙은 같은 계열로 둔다. 좌표: 폭 220 x 높이 300, 바닥이 y≈296.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색
const SKIN = '#ffe4d0', SKIN_L = '#d98f78', BLUSH = '#ff9aa8'
const HAIR = '#e8e8f1', HAIR_L = '#9a9ab4'
const TOP = '#ffc2d2', TOP_L = '#d6678a'
const LAV = '#b9aeea', LAV_L = '#7f70c9'
const SKIRT = '#a8e0b4', SKIRT_L = '#4f9e6c'
const INK = '#4a3029'

// 자세별 소매(어깨→손목), 소매 끝단(손목→끝), 손 위치와 방향(0=아래, 180=위, -90=오른쪽)
const ARMS = {
  wave: { L: ['M76 170 Q58 190 62 210', [62, 210], [62, 221], [62, 230, 0]], R: ['M144 170 Q180 162 186 130', [186, 130], [187, 119], [188, 109, 180]], wave: true },
  stand: { L: ['M76 170 Q60 192 66 212', [66, 212], [66, 223], [66, 232, 0]], R: ['M144 170 Q160 192 154 212', [154, 212], [154, 223], [154, 232, 0]] },
  stretch: { L: ['M76 168 Q36 152 30 122', [30, 122], [30, 111], [30, 101, 180]], R: ['M144 168 Q184 152 190 122', [190, 122], [190, 111], [190, 101, 180]] },
  throw: { L: ['M76 170 Q60 192 66 212', [66, 212], [66, 223], [66, 232, 0]], R: ['M144 168 Q184 158 188 126', [188, 126], [188, 115], [188, 105, 180]], rock: true },
  pour: { L: ['M76 172 Q102 194 128 200', [128, 200], [139, 201], [149, 202, -90]], R: ['M144 172 Q164 190 160 210', [160, 210], [160, 221], [160, 230, 0]], basket: true },
}

// 손: 엄지가 있는 통통한 손
function Hand({ p }) {
  return (
    <g transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]})`}>
      <path d="M-8.5 -7 C-11 4 -6 13 0 13 C6 13 11 4 8.5 -7 Z" fill={SKIN} stroke={SKIN_L} strokeWidth="2" />
      <path d="M7.5 -3 C15 -2 15 7 8.5 9 Z" fill={SKIN} stroke={SKIN_L} strokeWidth="2" />
    </g>
  )
}

// 소매: 어깨는 가늘고 끝으로 갈수록 퍼지는 한복 소매
function Arm({ a, fill }) {
  const [d, w, c, h] = a
  const end = `M${w[0]} ${w[1]} L${c[0]} ${c[1]}`
  return (
    <g>
      <path d={d} fill="none" stroke={TOP_L} strokeWidth="24" strokeLinecap="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth="20" strokeLinecap="round" />
      <Hand p={h} />
      <path d={end} stroke={LAV_L} strokeWidth="31" strokeLinecap="butt" />
      <path d={end} stroke={LAV} strokeWidth="27" strokeLinecap="butt" />
      <path d={end} stroke="#fff" strokeOpacity=".5" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(164 206) rotate(28)">
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
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd6e1" /><stop offset="1" stopColor={TOP} /></linearGradient>
        <linearGradient id={`${id}-skirt`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4ecce" /><stop offset="1" stopColor={SKIRT} /></linearGradient>
        <radialGradient id={`${id}-face`} cx=".42" cy=".35" r=".75"><stop offset="0" stopColor="#fff2e6" /><stop offset="1" stopColor={SKIN} /></radialGradient>
      </defs>
      <ellipse cx="110" cy="294" rx="70" ry="8" fill="#5a3a22" opacity=".18" filter={g('soft')} />

      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -2.5;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

        {/* 버선: 코가 살짝 올라간 흰 버선 */}
        <path d="M62 289 Q60 281 72 283 L97 286 Q101 295 90 296 L67 296 Q61 295 62 289Z" fill="#fff" stroke="#b9a99c" strokeWidth="2" />
        <path d="M158 289 Q160 281 148 283 L123 286 Q119 295 130 296 L153 296 Q159 295 158 289Z" fill="#fff" stroke="#b9a99c" strokeWidth="2" />

        {/* 치마: 허리에서 흘러내리며 퍼지고, 주름이 진다 */}
        <path d="M74 200 C64 234 44 262 30 285 C70 296 150 296 190 285 C176 262 156 234 146 200 Q110 214 74 200Z" fill={g('skirt')} stroke={SKIRT_L} strokeWidth="2.4" />
        <path d="M93 210 C88 242 78 268 66 290 M110 213 C110 246 110 270 110 293 M127 210 C132 242 142 268 154 290" stroke={SKIRT_L} strokeOpacity=".45" strokeWidth="2.2" fill="none" />
        <path d="M34 280 C74 291 146 291 186 280" stroke="#ff9db0" strokeWidth="5" fill="none" />

        {/* 저고리 */}
        <path d="M72 162 C86 154 100 157 110 166 C120 157 134 154 148 162 C153 178 152 194 150 206 Q110 218 70 206 C68 194 67 178 72 162Z" fill={g('top')} stroke={TOP_L} strokeWidth="2.4" />
        {/* 깃: 왼쪽이 오른쪽 위로 여며지는 V 모양 */}
        <path d="M91 156 C98 172 106 188 112 202 M129 156 C122 172 116 188 110 202" stroke={LAV_L} strokeWidth="13" fill="none" />
        <path d="M91 156 C98 172 106 188 112 202 M129 156 C122 172 116 188 110 202" stroke={LAV} strokeWidth="10" fill="none" />
        <path d="M95 156 C101 171 108 186 112 197 M125 156 C119 171 114 186 110 197" stroke="#fff" strokeWidth="2.6" fill="none" />
        {/* 고름: 매듭과 흐르는 끈 */}
        <path d="M110 190 C90 176 76 196 98 202 Q108 201 110 190Z M110 190 C128 178 144 194 124 202 Q113 201 110 190Z" fill={LAV} stroke={LAV_L} strokeWidth="2" />
        <path d="M105 202 C99 224 109 234 100 262 M115 202 C123 220 117 236 128 256" stroke={LAV} strokeWidth="7" fill="none" />
        <circle cx="110" cy="195" r="5.5" fill="#9585d8" stroke={LAV_L} strokeWidth="2" />

        {/* 팔 */}
        <Arm a={a.L} fill={g('top')} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-9 146 170;9 146 170;-9 146 170" dur="1.5s" repeatCount="indefinite" /><Arm a={a.R} fill={g('top')} /></g>
          : <Arm a={a.R} fill={g('top')} />}
        {a.basket && <Basket animate={animate} />}

        {/* 머리: 고개를 살짝 기울인 채 천천히 흔들린다 */}
        <g transform="rotate(-2.5 110 160)">
          <g>
            {animate && <animateTransform attributeName="transform" type="rotate" values="-1.5 110 160;1.5 110 160;-1.5 110 160" dur="4s" repeatCount="indefinite" />}
            {/* 목 */}
            <path d="M99 146 L99 164 Q110 170 121 164 L121 146Z" fill={SKIN} stroke={SKIN_L} strokeWidth="2" />
            {/* 귀 */}
            <path d="M55 100 C47 98 45 112 54 118 C57 119 58 108 55 100Z M165 100 C173 98 175 112 166 118 C163 119 162 108 165 100Z" fill={SKIN} stroke={SKIN_L} strokeWidth="2" />
            {/* 얼굴: 볼이 통통하고 턱이 부드럽게 모이는 윤곽 */}
            <path d="M110 46 C146 46 167 72 166 102 C165 130 144 153 110 153 C76 153 55 130 54 102 C53 72 74 46 110 46Z" fill={g('face')} stroke={SKIN_L} strokeWidth="2.4" />
            {/* 은빛 머리: 가운데 가르마에서 뒤로 곱게 빗어 넘김 */}
            <path d="M54 102 C46 56 74 32 110 32 C146 32 174 56 166 102 C164 84 152 70 138 64 C124 72 118 66 110 64 C102 66 96 72 82 64 C68 70 56 84 54 102Z" fill={HAIR} stroke={HAIR_L} strokeWidth="2.4" />
            <path d="M110 64 C104 52 92 48 80 56 M110 64 C116 52 128 48 140 56 M108 62 C100 46 86 42 72 52 M112 62 C120 46 134 42 148 52" stroke={HAIR_L} strokeOpacity=".7" strokeWidth="1.8" fill="none" />
            {/* 쪽머리와 비녀 */}
            <path d="M92 36 C86 22 98 12 111 13 C126 12 134 24 128 36 C122 40 98 40 92 36Z" fill={HAIR} stroke={HAIR_L} strokeWidth="2.4" />
            <path d="M100 26 C106 18 118 18 122 28 M104 32 C110 27 118 28 121 33" stroke={HAIR_L} strokeOpacity=".7" strokeWidth="1.8" fill="none" />
            <path d="M80 30 L142 22" stroke="#3f9ec4" strokeWidth="6.5" /><path d="M80 30 L142 22" stroke="#7fd0ee" strokeWidth="3.4" />
            <circle cx="145" cy="21.5" r="5" fill="#7fd0ee" stroke="#3f9ec4" strokeWidth="2" />
            {/* 이목구비: 웃어서 감긴 눈, 부드러운 눈썹, 볼 */}
            <path d="M74 91 Q84 85 95 90 M125 90 Q136 85 146 91" stroke="#b7b7cb" strokeWidth="3" fill="none" />
            <path d="M76 106 Q85 96 95 106 M125 106 Q135 96 144 106" stroke={INK} strokeWidth="3.6" fill="none" />
            <path d="M72 109 q-3 3 -5 1 M148 109 q3 3 5 1" stroke={SKIN_L} strokeOpacity=".7" strokeWidth="1.6" fill="none" />
            <ellipse cx="70" cy="125" rx="13" ry="8" fill={BLUSH} opacity=".45" /><ellipse cx="150" cy="125" rx="13" ry="8" fill={BLUSH} opacity=".45" />
            <path d="M107 117 Q110 122 114 117" stroke="#d58a73" strokeWidth="2.4" fill="none" />
            {speaking ? (
              <g>
                <path d="M97 128 Q110 150 123 128 Q110 134 97 128Z" fill="#c9453f" stroke="#9c3030" strokeWidth="2">{animate && <animate attributeName="d" values="M98 130 Q110 136 122 130 Q110 134 98 130Z;M97 128 Q110 152 123 128 Q110 134 97 128Z;M98 130 Q110 140 122 130 Q110 134 98 130Z;M97 128 Q110 150 123 128 Q110 134 97 128Z;M98 130 Q110 136 122 130 Q110 134 98 130Z" dur="0.8s" repeatCount="indefinite" />}</path>
              </g>
            ) : (
              <g>
                <path d="M95 128 Q110 144 125 128" stroke="#c0574f" strokeWidth="3" fill="none" />
                <path d="M93 126 q-2 2 0 4 M127 126 q2 2 0 4" stroke="#d58a73" strokeWidth="2" fill="none" />
              </g>
            )}
          </g>
        </g>
        {a.rock && <path d="M170 70 Q172 50 192 52 Q210 58 204 76 Q190 86 174 82Z" fill="#cfc9be" stroke="#8d877c" strokeWidth="3" />}
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
