import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Col, Form, InputGroup, Row } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import ScoreBars, { ScorePill } from '../components/ScoreBars'
import SpotDetail from '../components/SpotDetail'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchSpots } from '../api/client'
import { IslandScene } from '../scene/JejuScene'
import { BUDGETS, NEEDS } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const TYPES = [['', '전체'], ['12', '관광지'], ['14', '문화시설'], ['28', '레포츠·체험'], ['15', '축제·행사'], ['39', '음식점'], ['32', '숙박']]
// 테마: 검색어를 쉼표로 묶어 한 번에 찾는다 (아이와 걷기 좋은 곳 위주)
const THEMES = [
  ['숲길·산책', '숲길,둘레길,산책로,곶자왈', 'tree'],
  ['오름', '오름', 'triangle'],
  ['해안·바다', '해안도로,해수욕장,해변', 'water'],
  ['휴양림·수목원', '자연휴양림,수목원,식물원', 'flower1'],
  ['공원·놀이', '공원,테마파크,키즈', 'balloon'],
  ['박물관·체험', '박물관,체험마을,체험', 'bank'],
  ['목장·동물', '목장,동물원,아쿠아리움', 'bug'],
  ['해녀·문화', '해녀,돌문화,민속', 'moisture'],
]

function SpotCard({ s, selected, onOpen, onAdd, inBasket }) {
  return (
    <div className={`soft-card spot-card h-100 ${selected ? 'selected' : ''}`} onClick={() => onOpen(s)} role="button">
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
        <div className="d-flex gap-2 mt-3">
          <Button size="sm" variant="outline-primary" className="flex-fill"><i className="bi bi-card-text me-1" />자세히</Button>
          <Button size="sm" className="flex-fill" variant={inBasket ? 'secondary' : 'primary'} disabled={inBasket}
            onClick={(e) => { e.stopPropagation(); onAdd(s) }}>
            <i className={`bi bi-${inBasket ? 'check2' : 'basket2'} me-1`} />{inBasket ? '담았어요' : '담기'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Explore() {
  const profile = useAppStore((s) => s.profile)
  const basket = useAppStore((s) => s.basket)
  const addToBasket = useAppStore((s) => s.addToBasket)
  const [q, setQ] = useState('')
  const [type, setType] = useState('12') // 첫 화면은 관광지부터 (전체는 음식점이 많아 식당 위주로 보임)
  const [needs, setNeeds] = useState(null)   // null = 프로필 값 사용
  const [budget, setBudget] = useState(null)
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(null)
  const [accessible, setAccessible] = useState(false) // 무장애 정보가 등록된 장소만
  const [more, setMore] = useState(false)
  const [open, setOpen] = useState(null) // 상세 창에 띄울 장소

  const effNeeds = needs ?? profile?.needs ?? []
  const effBudget = budget ?? profile?.budget ?? 'any'

  const search = useCallback(async (keyword) => {
    setLoading(true); setErr('')
    try { setData(await fetchSpots({ keyword, type, needs: effNeeds, budget: effBudget, accessible })); setSel(null) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [type, effNeeds, effBudget, accessible])

  // 다음 페이지를 불러와 목록 뒤에 이어 붙인다
  async function loadMore() {
    setMore(true)
    try {
      const next = await fetchSpots({ keyword: q, type, needs: effNeeds, budget: effBudget, accessible, page: data.page + 1 })
      const seen = new Set(data.items.map((x) => x.id))
      setData({ ...next, items: [...data.items, ...next.items.filter((x) => !seen.has(x.id))] })
    } catch (e) { setErr(e.message) }
    finally { setMore(false) }
  }

  useEffect(() => { search(q) /* eslint-disable-next-line */ }, [type, needs, budget, profile, accessible])

  const selected = data?.items.find((x) => x.id === sel)
  const toggleNeed = (k) => setNeeds(effNeeds.includes(k) ? effNeeds.filter((x) => x !== k) : [...effNeeds, k])

  return (
    <>
      <PageTitle icon="compass" title="길동무 찾기" sub="접근성 · 안전 · 가격 점수로 우리 가족에게 맞는 곳을 골라요" />

      <Form onSubmit={(e) => { e.preventDefault(); search(q) }} className="mb-3">
        <InputGroup className="mb-2">
          <Form.Control placeholder="검색어 (쉼표로 여러 개: 숲길,둘레길)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit"><i className="bi bi-search" /></Button>
        </InputGroup>
        <div className="d-flex flex-wrap gap-2 mb-2">
          {THEMES.map(([label, kw, icon]) => (
            <Button key={label} size="sm" variant={q === kw ? 'primary' : 'outline-secondary'} className="rounded-pill" onClick={() => { setQ(kw); search(kw) }}>
              <i className={`bi bi-${icon} me-1`} />{label}
            </Button>
          ))}
        </div>
        <Row className="g-2 align-items-center">
          <Col xs="auto"><Form.Select size="sm" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Form.Select></Col>
          <Col xs="auto"><Form.Select size="sm" value={effBudget} onChange={(e) => setBudget(e.target.value)}>{BUDGETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</Form.Select></Col>
          <Col xs="auto">
            <Form.Check type="switch" id="acc-only" label="무장애 등록 장소만" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} />
          </Col>
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
            <>
              <div className="small text-muted mb-2">조건에 맞는 곳 <b>{data.total.toLocaleString()}</b>곳 중 {data.items.length}곳을 보여드려요</div>
              <Row xs={1} md={2} className="g-3">
                {data.items.map((s) => (
                  <Col key={s.id}><SpotCard s={s} selected={s.id === sel} onOpen={(x) => { setSel(x.id); setOpen(x) }} onAdd={addToBasket} inBasket={basket.some((b) => b.content_id === s.id)} /></Col>
                ))}
              </Row>
              {data.hasMore && (
                <div className="text-center mt-3">
                  <Button variant="outline-primary" onClick={loadMore} disabled={more}>
                    {more ? '불러오는 중...' : <><i className="bi bi-plus-circle me-1" />더 보기</>}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="sticky-scene">
          <IslandScene spots={data?.items ?? []} selectedId={sel} onSelect={setSel} height={440} />
          <div className="small text-muted mt-2"><span className="text-success">●</span> 70점 이상 <span style={{ color: '#f9a825' }}>●</span> 50점 이상 <span className="text-danger">●</span> 그 아래 — 핀을 눌러 보세요</div>
          {selected && (
            <div className="soft-card p-3 mt-3 d-flex align-items-center gap-3">
              <div className="flex-grow-1"><div className="fw-bold">{selected.title} <ScorePill score={selected.scores.total} /></div><div className="small text-muted text-truncate">{selected.addr}</div></div>
              <Button size="sm" onClick={() => setOpen(selected)}>자세히 보기</Button>
            </div>
          )}
        </div>
      </div>
      <SpotDetail spot={open} inBasket={!!open && basket.some((b) => b.content_id === open.id)} onAdd={addToBasket} onHide={() => setOpen(null)} />
    </>
  )
}
