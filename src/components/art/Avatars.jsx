// 우리 가족 프로필용 제주 캐릭터 (단순한 SVG). 눈·볼은 공통으로 그려 한 가족처럼 보이게 한다.
const Face = ({ x = 60, y = 62, gap = 15 }) => (
  <g>
    <circle cx={x - gap} cy={y} r="3.6" fill="#3a2a1a" /><circle cx={x + gap} cy={y} r="3.6" fill="#3a2a1a" />
    <circle cx={x - gap - 1} cy={y - 1.2} r="1.1" fill="#fff" /><circle cx={x + gap - 1} cy={y - 1.2} r="1.1" fill="#fff" />
    <circle cx={x - gap - 8} cy={y + 9} r="5" fill="#ff9aa2" opacity=".55" /><circle cx={x + gap + 8} cy={y + 9} r="5" fill="#ff9aa2" opacity=".55" />
    <path d={`M${x - 5} ${y + 8} Q${x} ${y + 14} ${x + 5} ${y + 8}`} stroke="#3a2a1a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </g>
)

const ART = {
  hallabong: (
    <>
      <path d="M60 22 Q60 8 70 6 Q66 18 60 22Z" fill="#4e9a4e" /><ellipse cx="78" cy="14" rx="9" ry="5" fill="#6fbf6f" transform="rotate(-25 78 14)" />
      <path d="M44 34 Q60 14 76 34 Q104 44 104 74 Q104 104 60 106 Q16 104 16 74 Q16 44 44 34Z" fill="#f6a21e" />
      <ellipse cx="42" cy="50" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-30 42 50)" />
      <Face y={72} />
    </>
  ),
  dolhareubang: (
    <>
      <path d="M26 46 Q26 14 60 12 Q94 14 94 46 L94 54 L26 54Z" fill="#8c8a86" />
      <rect x="22" y="48" width="76" height="10" rx="5" fill="#76746f" />
      <rect x="30" y="54" width="60" height="54" rx="24" fill="#a8a59f" />
      <ellipse cx="46" cy="78" rx="5" ry="6" fill="#3a2a1a" /><ellipse cx="74" cy="78" rx="5" ry="6" fill="#3a2a1a" />
      <path d="M56 92 Q60 97 64 92" stroke="#3a2a1a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="60" cy="86" rx="4" ry="5" fill="#8c8a86" />
      <circle cx="38" cy="90" r="5" fill="#d9a09a" opacity=".6" /><circle cx="82" cy="90" r="5" fill="#d9a09a" opacity=".6" />
    </>
  ),
  pony: (
    <>
      <path d="M34 24 L40 8 L50 22Z" fill="#7a4b27" /><path d="M70 22 L80 8 L86 24Z" fill="#7a4b27" />
      <path d="M36 28 Q60 6 84 28 Q96 60 86 96 Q60 112 34 96 Q24 60 36 28Z" fill="#a8682f" />
      <path d="M52 14 Q60 4 70 14 Q66 32 60 40 Q54 32 52 14Z" fill="#4a2c14" />
      <ellipse cx="60" cy="88" rx="22" ry="16" fill="#f1d3a8" />
      <circle cx="52" cy="90" r="2.6" fill="#7a4b27" /><circle cx="68" cy="90" r="2.6" fill="#7a4b27" />
      <Face y={60} gap={17} />
    </>
  ),
  dolphin: (
    <>
      <path d="M22 70 Q24 30 62 28 Q98 28 100 62 Q100 92 62 96 Q40 98 30 88 Q18 98 8 92 Q18 84 22 70Z" fill="#6aa9d8" />
      <path d="M30 78 Q60 100 98 70 Q96 94 62 96 Q40 98 30 88Z" fill="#dff0fb" />
      <path d="M58 28 Q64 10 78 8 Q74 20 74 30Z" fill="#4f8fc0" />
      <Face x={66} y={58} gap={13} />
    </>
  ),
  camellia: (
    <>
      <path d="M24 100 Q40 92 52 100 Q40 112 24 100Z" fill="#3f8f55" /><path d="M96 100 Q80 92 68 100 Q80 112 96 100Z" fill="#3f8f55" />
      <g fill="#e0344a">
        <circle cx="60" cy="34" r="20" /><circle cx="86" cy="52" r="20" /><circle cx="76" cy="82" r="20" /><circle cx="44" cy="82" r="20" /><circle cx="34" cy="52" r="20" />
      </g>
      <circle cx="60" cy="62" r="25" fill="#c8243a" />
      <g fill="#ffd23f"><circle cx="48" cy="44" r="2.4" /><circle cx="60" cy="40" r="2.4" /><circle cx="72" cy="44" r="2.4" /></g>
      <Face y={64} gap={12} />
    </>
  ),
  haenyeo: (
    <>
      <circle cx="60" cy="66" r="38" fill="#f8d9b8" />
      <path d="M20 62 Q20 20 60 18 Q100 20 100 62 Q80 44 60 44 Q40 44 20 62Z" fill="#2f5f8f" />
      <path d="M20 62 Q40 44 60 44 Q80 44 100 62" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" />
      <circle cx="92" cy="30" r="9" fill="#f6a21e" /><path d="M92 21 Q92 16 96 15" stroke="#4e9a4e" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Face y={70} />
    </>
  ),
}

export const AVATARS = [
  { key: 'hallabong', label: '한라봉', bg: '#fdeccc' },
  { key: 'dolhareubang', label: '돌하르방', bg: '#e9e7e2' },
  { key: 'pony', label: '조랑말', bg: '#f6e0c8' },
  { key: 'dolphin', label: '돌고래', bg: '#d9ecf8' },
  { key: 'camellia', label: '동백꽃', bg: '#fbdadf' },
  { key: 'haenyeo', label: '해녀', bg: '#d8e6f4' },
]

export default function Avatar({ kind = 'hallabong', size = 96, className = '' }) {
  const a = AVATARS.find((x) => x.key === kind) ?? AVATARS[0]
  return (
    <svg className={className} viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={a.label}>
      <circle cx="60" cy="60" r="60" fill={a.bg} />
      {ART[a.key]}
    </svg>
  )
}
