import { Fragment, useCallback, useEffect, useState } from 'react'
import { Badge, Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import ScoreBars, { ScorePill } from '../components/ScoreBars'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchSpots } from '../api/client'
import { IslandScene } from '../scene/JejuScene'
import { BUDGETS, NEEDS } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const TYPES = [['', '전체'], ['12', '관광지'], ['14', '문화시설'], ['15', '축제·행사'], ['39', '음식점']]
const CHIPS = ['해녀', '오름', '박물관', '체험', '바다']

function SpotCard({ s, selected, onSelect, onAdd, inBasket }) {
  return (
    <div className={`soft-card spot-card h-100 ${selected ? 'selected' : ''}`} onClick={() => onSelect(s.id)}>
      {s.image ? <img className="spot-img" src={s.image} alt={s.title} loading="lazy" /> : <div className="spot-img"><i className="bi bi-image" /></div>}
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div className="fw-bold">{s.title}</div><ScorePill score={s.scores.total} />
        </div>
        <div className="small text-muted mb-2 text-truncate">{s.addr}</div>
        <div className="d-flex flex-wrap gap-1 mb-2">
          <Badge bg={s.indoor ? 'info' : 'success'}>{s.indoor ? '실내' : '야외'}</Badge>
          <Badge bg="light" text="dark">{s.price}</Badge>
          {s.notes.map((n) => <Badge key={n} bg="warning" text="dark">{n}</Badge>)}
        </div>
        <ScoreBars scores={s.scores} />
        <Button size="sm" className="mt-3 w-100" variant={inBasket ? 'secondary' : 'primary'} disabled={inBasket}
          onClick={(e) => { e.stopPropagation(); onAdd(s) }}>
          <i className={`bi bi-${inBasket ? 'check2' : 'basket2'} me-1`} />{inBasket ? '담았어요' : '바구니에 담기'}
        </Button>
      </div>
    </div>
  )
}

function Detail({ s }) {
  const a = s.access
  const rows = a?.registered ? [['유모차', a.stroller], ['휠체어', a.wheelchair], ['엘리베이터', a.elevator], ['장애인 화장실', a.restroom], ['주차', a.parking], ['출입구', a.exit], ['수유실', a.lactation], ['대중교통', a.route]].filter(([, v]) => v) : []
  return (
    <div className="soft-card p-3 mt-3">
      <div className="fw-bold mb-1"><i className="bi bi-universal-access me-1 text-primary" />{s.title} 무장애 정보</div>
      {rows.length === 0 ? <div className="small text-muted">등록된 무장애 상세 정보가 없어요. 방문 전 전화 확인을 권해요{s.tel ? ` (${s.tel})` : ''}.</div>
        : <dl className="row small mb-0">{rows.map(([k, v]) => <Fragment key={k}><dt className="col-4 col-md-3">{k}</dt><dd className="col-8 col-md-9">{v}</dd></Fragment>)}</dl>}
    </div>
  )
}

export default function Explore() {
  const profile = useAppStore((s) => s.profile)
  const basket = useAppStore((s) => s.basket)
  const addToBasket = useAppStore((s) => s.addToBasket)
  const [q, setQ] = useState('')
  const [type, setType] = useState('')
  const [needs, setNeeds] = useState(null)   // null = 프로필 값 사용
  const [budget, setBudget] = useState(null)
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(null)

  const effNeeds = needs ?? profile?.needs ?? []
  const effBudget = budget ?? profile?.budget ?? 'any'

  const search = useCallback(async (keyword) => {
    setLoading(true); setErr('')
    try { setData(await fetchSpots({ keyword, type, needs: effNeeds, budget: effBudget })); setSel(null) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [type, effNeeds, effBudget])

  useEffect(() => { search(q) /* eslint-disable-next-line */ }, [type, needs, budget, profile])

  const selected = data?.items.find((x) => x.id === sel)
  const toggleNeed = (k) => setNeeds(effNeeds.includes(k) ? effNeeds.filter((x) => x !== k) : [...effNeeds, k])

  return (
    <>
      <PageTitle icon="compass" title="길동무 찾기" sub="접근성 · 안전 · 가격 점수로 우리 가족에게 맞는 곳을 골라요" />

      <Form onSubmit={(e) => { e.preventDefault(); search(q) }} className="mb-3">
        <InputGroup className="mb-2">
          <Form.Control placeholder="검색어 (예: 해녀, 오름, 박물관)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit"><i className="bi bi-search" /></Button>
        </InputGroup>
        <div className="d-flex flex-wrap gap-2 mb-2">
          {CHIPS.map((c) => <Button key={c} size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => { setQ(c); search(c) }}>#{c}</Button>)}
        </div>
        <Row className="g-2 align-items-center">
          <Col xs="auto"><Form.Select size="sm" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Form.Select></Col>
          <Col xs="auto"><Form.Select size="sm" value={effBudget} onChange={(e) => setBudget(e.target.value)}>{BUDGETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</Form.Select></Col>
          <Col>
            <div className="d-flex flex-wrap gap-1">
              {NEEDS.filter((n) => n.key !== 'sensory').map((n) => (
                <Button key={n.key} size="sm" variant={effNeeds.includes(n.key) ? 'primary' : 'outline-primary'} className="rounded-pill" onClick={() => toggleNeed(n.key)}>
                  <i className={`bi bi-${n.icon} me-1`} />{n.label}
                </Button>
              ))}
            </div>
          </Col>
        </Row>
      </Form>

      {data?.weather && <div className="alert alert-light border small py-2"><i className="bi bi-cloud-sun me-1" />지금 날씨: {data.weather.advice}</div>}
      <ErrorAlert error={err} />

      <div className="explore-grid">
        <div>
          {loading ? <Loading text="세 가지 공공데이터를 합치는 중..." /> : !data || data.items.length === 0 ? (!err && <Empty text="조건에 맞는 곳이 없어요. 검색어를 바꿔 보세요" icon="search" />) : (
            <Row xs={1} md={2} className="g-3">
              {data.items.map((s) => (
                <Col key={s.id}><SpotCard s={s} selected={s.id === sel} onSelect={setSel} onAdd={addToBasket} inBasket={basket.some((b) => b.content_id === s.id)} /></Col>
              ))}
            </Row>
          )}
        </div>
        <div className="sticky-scene">
          <IslandScene spots={data?.items ?? []} selectedId={sel} onSelect={setSel} height={440} />
          <div className="small text-muted mt-2"><span className="text-success">●</span> 70점 이상 <span style={{ color: '#f9a825' }}>●</span> 50점 이상 <span className="text-danger">●</span> 그 아래 — 핀을 눌러 보세요</div>
          {selected && <Detail s={selected} />}
        </div>
      </div>
    </>
  )
}
