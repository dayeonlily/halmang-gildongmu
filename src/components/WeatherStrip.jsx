import { useEffect, useState } from 'react'
import { fetchWeather } from '../api/client'

// 기상청 예보 한 줄 요약 (제주시 · 서귀포시)
export default function WeatherStrip() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    Promise.all(['제주시', '서귀포시'].map(fetchWeather)).then(setRows).catch((e) => setErr(e.message))
  }, [])

  if (err) return <div className="soft-card p-3 small text-muted"><i className="bi bi-cloud-slash me-2" />날씨 연결 대기 중 — {err}</div>
  if (!rows) return <div className="soft-card p-3 small text-muted"><i className="bi bi-cloud me-2" />날씨 불러오는 중...</div>
  return (
    <div className="soft-card p-3">
      <div className="row g-2">
        {rows.map((w) => (
          <div className="col-6" key={w.place}>
            <div className="fw-bold">{w.place} <span className="text-muted fw-normal">{w.rows[0]?.temp}°C</span></div>
            <div className="small text-muted">{w.rows[0]?.sky} · 강수확률 {w.summary.pop}%</div>
          </div>
        ))}
      </div>
      <div className="small mt-2 text-primary-emphasis"><i className="bi bi-sun me-1" />{rows[0].summary.advice}</div>
    </div>
  )
}
