import { ProgressBar } from 'react-bootstrap'

export const scoreClass = (s) => (s >= 70 ? 'score-hi' : s >= 50 ? 'score-mid' : 'score-lo')

export function ScorePill({ score }) {
  return <span className={`score-pill ${scoreClass(score)}`}>{Math.round(score)}</span>
}

// 우리 가족 맞춤 점수의 기준별 막대 (테마를 골랐을 때만 '테마' 막대가 붙는다)
export default function ScoreBars({ scores }) {
  const rows = [['접근성', scores.access, 'success'], ['아이 맞춤', scores.kids, 'primary'], ['날씨 안전', scores.safety, 'info'], ['비용', scores.price, 'warning'], ['가까움', scores.near, 'danger'], ['한산함', scores.crowd, 'dark'], ['테마', scores.theme, 'secondary']].filter((r) => r[1] != null)
  return (
    <div className="d-grid gap-1">
      {rows.map(([label, v, variant]) => (
        <div className="mini-bar" key={label}><span>{label}</span><ProgressBar now={v} variant={variant} /><span>{v}</span></div>
      ))}
    </div>
  )
}
