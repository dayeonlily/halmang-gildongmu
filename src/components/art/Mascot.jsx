import { createContext, useId } from 'react'
import halmangUrl from '../../assets/halmang.webp'

// ── 설문대할망 마스코트 ─────────────────────────────────────────────
// 정해진 할망 그림(src/assets/halmang.webp, 배경을 지운 투명 이미지)을 그대로 쓴다.
// 그림은 한 가지 자세(손 흔들기)뿐이라, 이야기 장면의 던지기·흙 붓기 자세는
// 같은 그림 위에 돌이나 삼태기를 얹어서 표현한다.
// 좌표: 폭 220 x 높이 300 (그림은 가운데, 발이 바닥 y≈296).
export const MascotId = createContext('')

export const OUTLINE = '#6f4b3e' // 장면의 다른 요소들이 쓰는 윤곽선 색

const IMG = { x: 18.500, y: 2, w: 183, h: 294 } // 560x900 그림을 담는 자리

// 흙이 담긴 삼태기(흙 붓는 장면): 내려간 쪽 손 옆에 얹는다
function Basket({ animate }) {
  return (
    <g transform="translate(70 226) rotate(-26) scale(.85)">
      <ellipse rx="34" ry="13" fill="#f0d68c" stroke="#a8884a" strokeWidth="3" />
      <path d="M-28 -2 Q0 -20 28 -2 Q20 8 0 9 Q-20 8 -28 -2Z" fill="#a67c52" stroke="#7a5a3a" strokeWidth="2" strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={-28 - (i % 3) * 6} cy="6" r={2.6 + (i % 3) * 0.8} fill="#a67c52" stroke="#7a5a3a" strokeWidth="1">
          {animate && <animate attributeName="cy" values="6;70" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
          {animate && <animate attributeName="opacity" values="1;0" dur={`${1.1 + (i % 3) * 0.2}s`} begin={`${i * 0.17}s`} repeatCount="indefinite" />}
        </circle>
      ))}
    </g>
  )
}

export function MascotArt({ pose = 'wave', speaking = false, animate = true }) {
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <ellipse cx="110" cy="294" rx="64" ry="7" fill="#5a3a22" opacity=".18" />
      <g>
        {animate && <animateTransform attributeName="transform" type="translate" values={pose === 'throw' ? '0 0;0 -10;0 0' : speaking ? '0 0;0 -4;0 0' : '0 0;0 -2.500;0 0'} dur={pose === 'throw' ? '1.4s' : speaking ? '0.6s' : '2.8s'} repeatCount="indefinite" />}
        <image href={halmangUrl} x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} preserveAspectRatio="xMidYMax meet" />
        {pose === 'throw' && <path d="M168 76 Q170 56 192 58 Q210 64 204 82 Q190 92 172 88Z" fill="#cfc9be" stroke="#8d877c" strokeWidth="2.600" />}
        {pose === 'pour' && <Basket animate={animate} />}
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
