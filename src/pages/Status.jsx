import { useState } from 'react'
import { Badge, Button, ListGroup } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import { fetchAccess, fetchSpots, fetchWeather, ping } from '../api/client'
import { isSupabaseReady, supabase } from '../lib/supabase'

// 단계별 연결 점검: Supabase → 서버 함수 → 공공데이터 3종 → (에이전트는 /halmang 에서)
const CHECKS = [
  { key: 'env', label: '.env.local (VITE_SUPABASE_*)', run: async () => { if (!isSupabaseReady) throw new Error('VITE_SUPABASE_URL / ANON_KEY 가 비어 있어요'); return '설정됨' } },
  { key: 'db', label: 'Supabase DB 연결 (profiles 테이블)', run: async () => {
      if (!supabase) throw new Error('Supabase 미설정')
      const { error, count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (error) throw new Error(error.message + ' — supabase/schema.sql 실행했나요?')
      return `연결 OK (본인 행 ${count ?? 0}개)`
    } },
  { key: 'hello', label: '서버 함수 /api/hello (키 설정 여부)', run: async () => { const r = await ping(); return `공공데이터 키 ${r.hasDataKey ? 'O' : 'X'} · Claude 키 ${r.hasClaudeKey ? 'O' : 'X'}` } },
  { key: 'tour', label: 'API ① 한국관광공사 관광정보', run: async () => { const r = await fetchSpots({ keyword: '해녀' }); return `${r.items.length}곳 조회` } },
  { key: 'access', label: 'API ② 한국관광공사 무장애 여행정보', run: async () => {
      const r = await fetchSpots({ type: '12', needs: ['stroller'] })
      const a = r.items.filter((p) => p.access?.registered).length
      if (r.items[0]) await fetchAccess(r.items[0].id)
      return `${r.items.length}곳 중 무장애 정보 ${a}곳`
    } },
  { key: 'weather', label: 'API ③ 기상청 단기예보', run: async () => { const r = await fetchWeather('제주시'); return `제주시 ${r.rows[0]?.temp}°C · ${r.rows[0]?.sky}` } },
]

export default function Status() {
  const [res, setRes] = useState({})
  const [running, setRunning] = useState(false)

  async function runAll() {
    setRunning(true); setRes({})
    for (const c of CHECKS) {
      setRes((p) => ({ ...p, [c.key]: { state: 'run' } }))
      try { const text = await c.run(); setRes((p) => ({ ...p, [c.key]: { state: 'ok', text } })) }
      catch (e) { setRes((p) => ({ ...p, [c.key]: { state: 'fail', text: e.message } })) }
    }
    setRunning(false)
  }

  const bg = { run: 'secondary', ok: 'success', fail: 'danger' }
  return (
    <div style={{ maxWidth: 760 }}>
      <PageTitle icon="plug" title="연결 점검" sub="Supabase · 서버 함수 · 공공데이터 API를 차례로 확인해요">
        <Button onClick={runAll} disabled={running}><i className="bi bi-play-fill me-1" />{running ? '확인 중...' : '전체 점검'}</Button>
      </PageTitle>
      <ListGroup className="soft-card overflow-hidden">
        {CHECKS.map((c) => {
          const r = res[c.key]
          return (
            <ListGroup.Item key={c.key} className="d-flex align-items-start gap-3">
              <Badge bg={r ? bg[r.state] : 'light'} text={r ? undefined : 'dark'} style={{ minWidth: 56 }}>{r ? { run: '확인중', ok: '정상', fail: '실패' }[r.state] : '대기'}</Badge>
              <div><div className="fw-bold">{c.label}</div>{r?.text && <div className={`small ${r.state === 'fail' ? 'text-danger' : 'text-muted'}`}>{r.text}</div>}</div>
            </ListGroup.Item>
          )
        })}
      </ListGroup>
    </div>
  )
}
