import { createContext, useContext, useId } from 'react'

// ── 설문대할망 마스코트 (2D 일러스트, 오리지널 캐릭터) ─────────────────
// 보송보송한 인형(플러시) 질감의 마스코트: 키가 큰 통통한 콩 모양 몸에 머리와 몸이 이어지고,
// 한복의 색동 소매(줄무늬 팔), 큼직한 둥근 발바닥, 큼직하고 반짝이는 눈, 활짝 웃는 입.
// 설문대할망의 특징은 의상으로: 은빛 쪽머리·파란 비녀, 분홍 저고리(보라 깃·고름), 연두 치마.
// 좌표: 폭 220 x 높이 300, 바닥이 y≈296.
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색
const SOFT = '#d97296' // 인형 몸의 부드러운 테두리(같은 색 계열)
const PINK1 = '#ffd3df', PINK2 = '#ff9fba', LAV = '#b3a6e6', MINT = '#9fe0c4', YEL = '#ffe08a', CREAM = '#fff4e2'
const GREEN1 = '#c2eccb', GREEN2 = '#8fd6a2', HAIR = '#e9e9f2'

// 자세별 짧은 색동 팔과 손 위치
const ARMS = {
  wave: { L: ['M60 172 Q38 190 46 218', [46, 224]], R: ['M160 168 Q206 170 202 126', [202, 118]], wave: true },
  stand: { L: ['M60 172 Q40 196 52 224', [52, 229]], R: ['M160 172 Q180 196 168 224', [168, 229]] },
  stretch: { L: ['M60 168 Q6 150 16 104', [16, 96]], R: ['M160 168 Q214 150 204 104', [204, 96]] },
  throw: { L: ['M60 172 Q40 196 52 224', [52, 229]], R: ['M160 168 Q212 154 204 108', [204, 100]], rock: true },
  pour: { L: ['M60 172 Q100 198 150 206', [154, 207]], R: ['M160 172 Q184 190 186 212', [186, 216]], basket: true },
}

// 색동 소매: 분홍 바탕에 보라·민트·노랑 줄무늬 + 동그란 손
function Arm({ d, hand }) {
  const tube = (extra) => <path d={d} fill="none" strokeLinecap="round" {...extra} />
  return (
    <g>
      {tube({ stroke: SOFT, strokeWidth: 30 })}
      {tube({ stroke: PINK1, strokeWidth: 26 })}
      <path d={d} fill="none" stroke={LAV} strokeWidth="26" strokeDasharray="7 31" strokeDashoffset="0" />
      <path d={d} fill="none" stroke={MINT} strokeWidth="26" strokeDasharray="7 31" strokeDashoffset="-12" />
      <path d={d} fill="none" stroke={YEL} strokeWidth="26" strokeDasharray="7 31" strokeDashoffset="-24" />
      <circle cx={hand[0]} cy={hand[1]} r="14" fill={CREAM} stroke={SOFT} strokeWidth="2.4" />
    </g>
  )
}

// 흙이 담긴 삼태기(흙 붓는 장면)
function Basket({ animate }) {
  return (
    <g transform="translate(176 200) rotate(28)">
      <ellipse rx="36" ry="14" fill="#f0d68c" stroke="#a8884a" strokeWidth="3" />
      <path d="M-30 -2 Q0 -22 30 -2 Q22 8 0 9 Q-22 8 -30 -2Z" fill="#a67c52" stroke="#7a5a3a" strokeWidth="2" strokeLinejoin="round" />
      <path d="M-26 6 L-20 12 M-12 8 L-6 13 M2 9 L8 14 M16 8 L22 13" stroke="#c9ad5c" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={30 + (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke="#7a5a3a" strokeWidth="1">
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
  const u = (n) => `url(#${id}-${n})`
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        {/* 보송보송한 털 가장자리 + 은은한 털결 */}
        <filter id={`${id}-fur`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${id}-soft`}><feGaussianBlur stdDeviation="3.5" /></filter>
        <radialGradient id={`${id}-body`} cx=".36" cy=".3" r=".85"><stop offset="0" stopColor={PINK1} /><stop offset="1" stopColor={PINK2} /></radialGradient>
        <radialGradient id={`${id}-skirt`} cx=".4" cy=".2" r=".9"><stop offset="0" stopColor={GREEN1} /><stop offset="1" stopColor={GREEN2} /></radialGradient>
        <radialGradient id={`${id}-face`} cx=".4" cy=".3" r=".8"><stop offset="0" stopColor="#fff1e4" /><stop offset="1" stopColor="#ffd9c0" /></radialGradient>
      </defs>
      <ellipse cx="110" cy="296" rx="74" ry="9" fill="#5a3a22" opacity=".2" filter={u('soft')} />

      <g filter={u('fur')}>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : '0 0;0 -3;0 0'} dur={pose === 'throw' ? '1.4s' : '2.8s'} repeatCount="indefinite" />}

        {/* 큼직한 둥근 발바닥 */}
        <ellipse cx="78" cy="288" rx="27" ry="12" fill={CREAM} stroke={SOFT} strokeWidth="2.4" /><ellipse cx="142" cy="288" rx="27" ry="12" fill={CREAM} stroke={SOFT} strokeWidth="2.4" />
        <g fill="#ffc6d3"><circle cx="66" cy="288" r="3.4" /><circle cx="78" cy="291" r="3.4" /><circle cx="90" cy="288" r="3.4" /><circle cx="130" cy="288" r="3.4" /><circle cx="142" cy="291" r="3.4" /><circle cx="154" cy="288" r="3.4" /></g>

        {/* 몸: 키가 큰 통통한 콩 모양 (머리와 한 덩어리) */}
        <path d="M44 124 C40 40 180 40 176 124 C180 176 190 224 184 256 C178 288 42 288 36 256 C30 224 40 176 44 124 Z" fill={u('body')} stroke={SOFT} strokeWidth="2.6" />

        {/* 치마: 아랫부분을 연두색으로 + 분홍 속치마 */}
        <path d="M39 206 C34 236 32 262 38 268 C44 286 176 286 182 268 C188 262 186 236 181 206 Q110 224 39 206Z" fill={u('skirt')} stroke={SOFT} strokeWidth="2.4" />
        <path d="M38 268 C44 286 176 286 182 268 L181 258 C170 276 50 276 39 258Z" fill="#ffc3bb" stroke={SOFT} strokeWidth="2" />
        <path d="M58 218 Q50 240 46 258" stroke="#fff" strokeOpacity=".55" strokeWidth="10" fill="none" />

        {/* 보라 깃 + 흰 동정 + 고름 */}
        <path d="M92 150 L112 194 M128 150 L106 194" stroke={LAV} strokeWidth="12" fill="none" />
        <path d="M97 150 L112 190 M123 150 L107 190" stroke="#fff" strokeWidth="3" fill="none" />
        <path d="M110 188 C84 168 66 196 100 200 Q108 198 110 188Z M110 188 C136 168 154 196 120 200 Q112 198 110 188Z" fill={LAV} stroke={SOFT} strokeWidth="2" />
        <path d="M106 200 C98 222 108 234 98 254 M114 200 C124 220 118 232 130 250" stroke={LAV} strokeWidth="8" fill="none" />
        <circle cx="110" cy="194" r="7" fill="#8f7fd0" stroke={SOFT} strokeWidth="2" />

        {/* 색동 팔 */}
        <Arm d={a.L[0]} hand={a.L[1]} />
        {a.wave && animate
          ? <g><animateTransform attributeName="transform" type="rotate" values="-10 160 168;10 160 168;-10 160 168" dur="1.5s" repeatCount="indefinite" /><Arm d={a.R[0]} hand={a.R[1]} /></g>
          : <Arm d={a.R[0]} hand={a.R[1]} />}
        {a.basket && <Basket animate={animate} />}

        {/* 머리 부분: 얼굴 + 은빛 쪽머리와 파란 비녀 */}
        <g>
          {animate && <animateTransform attributeName="transform" type="rotate" values="-2 110 170;2 110 170;-2 110 170" dur="4s" repeatCount="indefinite" />}
          <ellipse cx="110" cy="116" rx="60" ry="52" fill={u('face')} />
          <path d="M44 114 C34 50 74 24 110 24 C146 24 186 50 176 114 C170 92 150 80 134 82 C126 72 94 72 86 82 C70 80 50 92 44 114 Z" fill={HAIR} stroke="#b9b9cc" strokeWidth="2.6" />
          <path d="M110 74 L110 54" stroke="#c9c9d9" strokeWidth="3" fill="none" />
          <circle cx="110" cy="22" r="21" fill={HAIR} stroke="#b9b9cc" strokeWidth="2.6" />
          <path d="M98 22 q12 -13 24 0" stroke="#c9c9d9" strokeWidth="3" fill="none" />
          <path d="M72 34 L146 18" stroke="#3f9ec4" strokeWidth="9" /><path d="M72 34 L146 18" stroke="#6ec6e8" strokeWidth="5" />
          <circle cx="148" cy="17.5" r="7" fill="#6ec6e8" stroke="#3f9ec4" strokeWidth="2" /><circle cx="146" cy="15.5" r="2" fill="#fff" />
          {/* 얼굴: 큼직하고 반짝이는 눈, 눈썹, 작은 코, 활짝 웃는 입 */}
          <path d="M70 94 Q82 86 96 92 M124 92 Q138 86 150 94" stroke="#bdbdd0" strokeWidth="4" fill="none" />
          <ellipse cx="82" cy="116" rx="10.5" ry="13.5" fill="#3b2a26" /><ellipse cx="138" cy="116" rx="10.5" ry="13.5" fill="#3b2a26" />
          <circle cx="86" cy="110" r="4.4" fill="#fff" /><circle cx="142" cy="110" r="4.4" fill="#fff" />
          <circle cx="78" cy="122" r="2.2" fill="#fff" /><circle cx="134" cy="122" r="2.2" fill="#fff" />
          <ellipse cx="58" cy="138" rx="14" ry="9" fill="#ff8f9c" opacity=".55" /><ellipse cx="162" cy="138" rx="14" ry="9" fill="#ff8f9c" opacity=".55" />
          <ellipse cx="110" cy="128" rx="6.5" ry="4.8" fill="#ff6f7d" />
          {speaking ? (
            <g>
              <ellipse cx="110" cy="146" rx="15" ry="9" fill="#c9453f" stroke={SOFT} strokeWidth="2.4">{animate && <animate attributeName="ry" values="3;11;5;10;3" dur="0.7s" repeatCount="indefinite" />}</ellipse>
              <ellipse cx="110" cy="151" rx="8.5" ry="4" fill="#ff9aa0" />
            </g>
          ) : (
            <g>
              <path d="M88 138 Q110 166 132 138 Q110 146 88 138Z" fill="#d9524b" stroke={SOFT} strokeWidth="2.4" />
              <path d="M98 148 Q110 158 122 148 Q110 154 98 148Z" fill="#ff9aa0" />
            </g>
          )}
          <ellipse cx="82" cy="72" rx="24" ry="8" fill="#fff" opacity=".4" transform="rotate(-16 82 72)" />
        </g>
        {a.rock && <path d="M158 62 Q162 40 183 42 Q202 48 196 68 Q181 78 162 74Z" fill="#cfc9be" stroke="#8d877c" strokeWidth="3" />}
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
