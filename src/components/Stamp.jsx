// 연령별 도장 모양
//  · young(미취학~저학년): 물결 테두리의 동글동글한 칭찬 도장 — 큰 이모지 + "참 잘했어요" + 별
//  · upper(초등 고학년): 네모난 전각 인장 — 겹테두리, 시대·장소 이름, "탐방 완료"
const SCALLOP = Array.from({ length: 14 }, (_, i) => {
  const t = (i / 14) * Math.PI * 2
  return [50 + Math.cos(t) * 41, 50 + Math.sin(t) * 41]
})

// 장소 이름에서 앞 단어만, 네 글자까지 두 줄로 나눈다
function sealName(place) {
  const w = place.replace(/\s.*/, '').slice(0, 4)
  return w.length > 2 ? [w.slice(0, 2), w.slice(2)] : [w]
}

export default function Stamp({ tab, c, era, size = 74 }) {
  if (tab === 'upper') {
    const rows = sealName(c.place)
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ overflow: 'visible' }}>
        <rect x="8" y="8" width="84" height="84" rx="9" fill="#fff" fillOpacity=".82" stroke={era.color} strokeWidth="5" />
        <rect x="16" y="16" width="68" height="68" rx="4" fill="none" stroke={era.color} strokeWidth="1.8" />
        <text x="50" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill={era.color} fontFamily="serif">{era.label}</text>
        {rows.map((r, i) => (
          <text key={r} x="50" y={rows.length === 1 ? 56 : 49 + i * 17} textAnchor="middle" fontSize={rows.length === 1 ? 24 : 17} fontWeight="900" fill={era.color} fontFamily="serif">{r}</text>
        ))}
        <text x="50" y="80" textAnchor="middle" fontSize="8.5" fontWeight="700" fill={era.color} fontFamily="serif">탐방 완료</text>
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ overflow: 'visible' }}>
      {SCALLOP.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="11" fill={era.color} />)}
      <circle cx="50" cy="50" r="41" fill={era.color} />
      <circle cx="50" cy="50" r="35" fill="#fffdf6" />
      <circle cx="50" cy="50" r="35" fill="none" stroke={era.color} strokeWidth="2" strokeDasharray="2 5" strokeLinecap="round" />
      <text x="50" y="56" textAnchor="middle" fontSize="28">{c.theme.emoji}</text>
      <text x="36" y="34" textAnchor="middle" fontSize="11" fill="#ffc933">★</text><text x="50" y="30" textAnchor="middle" fontSize="12" fill="#ffc933">★</text><text x="64" y="34" textAnchor="middle" fontSize="11" fill="#ffc933">★</text>
      <text x="50" y="72" textAnchor="middle" fontSize="9.5" fontWeight="900" fill={era.color}>참 잘했어요</text>
    </svg>
  )
}
