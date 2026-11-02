import { ProgressBar } from 'react-bootstrap'

export const scoreClass = (s) => (s >= 70 ? 'score-hi' : s >= 50 ? 'score-mid' : 'score-lo')

export function ScorePill({ score }) {
  return <span className={`score-pill ${scoreClass(score)}`}>{score}</span>
}

// 접근성 · 안전 · 가격 세 기준을 막대로
export default function ScoreBars({ scores }) {
  const rows = [['접근성', scores.access, 'success'], ['안전', scores.safety, 'info'], ['가격', scores.price, 'warning']]
  return (
    <div className="d-grid gap-1">
      {rows.map(([label, v, variant]) => (
        <div className="mini-bar" key={label}><span>{label}</span><ProgressBar now={v} variant={variant} /><span>{v}</span></div>
      ))}
    </div>
  )
}
