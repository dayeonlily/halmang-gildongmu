import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Col, Collapse, Form, InputGroup, Row } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import ScoreBars, { ScorePill } from '../components/ScoreBars'
import SpotDetail from '../components/SpotDetail'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchSpots } from '../api/client'
import { IslandScene } from '../scene/JejuScene'
import { AGE_BANDS, BUDGETS, NEEDS } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

// 무엇을 찾나요? — 종류 버튼 (공공데이터 contentTypeId)
const CATEGORIES = [
  ['', '전체', 'grid-3x3-gap'], ['12', '관광지', 'camera'], ['39', '음식점', 'cup-hot'], ['32', '숙박', 'house-heart'],
  ['14', '문화시설', 'bank'], ['28', '체험·레포츠', 'bicycle'], ['15', '축제·행사', 'balloon-heart'],
]
// 종류마다 고를 수 있는 세부 테마: [이름, 검색어(쉼표로 묶음), 아이콘]
const NATURE_THEMES = [
  ['숲길·산책', '숲길,둘레길,산책로,곶자왈', 'tree'],
  ['오름', '오름', 'triangle'],
  ['해안·바다', '해안도로,해수욕장,해변', 'water'],
  ['휴양림·수목원', '자연휴양림,수목원,식물원', 'flower1'],
  ['공원·놀이', '공원,테마파크,키즈', 'balloon'],
  ['박물관·체험', '박물관,체험마을,체험', 'bank'],
  ['목장·동물', '목장,동물원,아쿠아리움', 'bug'],
  ['해녀·문화', '해녀,돌문화,민속', 'moisture'],
]
const THEMES = {
  '39': [
    ['흑돼지', '흑돼지', 'egg-fried'], ['해산물·회', '해산물,횟집,회', 'water'], ['고기국수·한식', '국수,한식,백반', 'cup-hot'],
    ['카페·디저트', '카페,디저트,베이커리', 'cake2'], ['아이와 먹기 좋은', '돈가스,피자,치킨,키즈', 'emoji-smile'],
  ],
  '32': [
    ['호텔·리조트', '호텔,리조트', 'building'], ['펜션', '펜션', 'house-door'], ['풀빌라·독채', '풀빌라,독채', 'water'],
    ['게스트하우스·한옥', '게스트하우스,한옥,민박', 'houses'], ['캠핑·글램핑', '캠핑,글램핑,카라반', 'tree'],
  ],
}
const themesFor = (type) => THEMES[type] ?? NATURE_THEMES

const CRITERIA = {
  access: ['접근성', '유모차·휠체어·수유실·화장실·주차 등 무장애 시설이 얼마나 갖춰졌는지 (고른 필요 항목은 더 크게 반영)'],
  kids: ['아이 맞춤', '아이 나이대에 맞는 곳인지: 영아는 수유실·실내·유모차, 걸음마·유아는 놀이·체험, 저학년은 체험·동물, 고학년은 체험·역사'],
  safety: ['날씨 안전', '기상청 예보(비·더위·바람) · 에어코리아 미세먼지 · 기상청 자외선지수 · 정기 휴무 — 야외일수록, 아이가 어릴수록 크게 반영'],
  crowd: ['한산함', '한국관광공사 관광지 집중률 예측 — 고른 날짜에 덜 붐빌수록 높게 (예측이 있는 장소만)'],
  price: ['비용', '입장료가 예산 안인지 (예산을 정하지 않아도 저렴할수록 높게)'],
  near: ['가까움', '머무는 곳(또는 내 여행 바구니 중심)에서 가까울수록 높게 — 아이와는 이동 시간이 짧은 곳이 좋아요'],
  theme: ['테마 일치', '내가 고른 테마·검색어가 장소 이름·주소에 들어 있는지'],
}

// 머무는 곳 근처로 점수를 매길 때 쓰는 기준 위치
const BASES = [['jeju', '제주시 (공항·동문시장)', 33.4996, 126.5312], ['seogwipo', '서귀포시 (올레시장)', 33.2541, 126.5601], ['aewol', '애월·한림', 33.45, 126.31],
    ['jungmun', '중문·대정', 33.25, 126.42], ['seongsan', '성산·우도', 33.46, 126.93], ['hamdeok', '조천·함덕', 33.54, 126.67]].map(([key, label, lat, lng]) => ({ key, label, lat, lng }))

// 오늘로부터 n일 뒤 날짜(YYYY-MM-DD, 한국 시간) — 날짜 선택칸의 범위
const isoDay = (n) => new Date(Date.now() + 9 * 3600e3 + n * 86400e3).toISOString().slice(0, 10)

function SpotCard({ s, selected, onOpen, onAdd, inBasket }) {
  return (
    <div className={`soft-card spot-card h-100 ${selected ? 'selected' : ''}`} onClick={() => onOpen(s)} role="button">
      {s.image ? <img className="spot-img" src={s.image} alt={s.title} loading="lazy" /> : <div className="spot-img"><i className="bi bi-image" /></div>}
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <div className="fw-bold">{s.title}</div>
          <div className="text-center lh-1" title="우리 가족 맞춤 점수"><ScorePill score={s.scores.total} /><div className="text-muted" style={{ fontSize: '.7rem' }}>맞춤</div></div>
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
  const ageBand = useAppStore((s) => s.ageBand)
  const setAgeBand = useAppStore((s) => s.setAgeBand)
  const [params] = useSearchParams()
  const initQ = params.get('q') ?? '' // 역사 스탬프 투어 등에서 넘어온 검색어
  const [q, setQ] = useState(initQ)
  const [type, setType] = useState(initQ ? '' : '12') // 첫 화면은 관광지부터 (전체는 음식점이 많아 식당 위주로 보임)
  const [needs, setNeeds] = useState(null)   // null = 프로필 값 사용
  const [budget, setBudget] = useState(null)
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(null)
  const [accessible, setAccessible] = useState(false) // 무장애 정보가 등록된 장소만
  const [more, setMore] = useState(false)
  const [open, setOpen] = useState(null) // 상세 창에 띄울 장소
  const [how, setHow] = useState(false)  // 점수 기준 설명 펼치기
  const [date, setDate] = useState('')      // 방문 날짜 ('' = 오늘): 집중률 예측과 휴무일에 쓴다
  const [base, setBase] = useState('')      // 머무는 곳 ('' = 상관없음, 'basket' = 내 여행 바구니 중심)

  const effNeeds = needs ?? profile?.needs ?? []
  const effBudget = budget ?? profile?.budget ?? 'any'
  const age = AGE_BANDS.find((a) => a.key === ageBand)
  // 기준 위치는 문자열로 들고 있다가 쓸 때만 좌표로 바꾼다 (객체를 deps 에 넣으면 매 렌더마다 다시 검색해서)
  const placed = basket.filter((b) => b.lat && b.lng)
  const nearKey = base === 'basket' ? (placed.length ? `${placed.reduce((n, b) => n + b.lat, 0) / placed.length},${placed.reduce((n, b) => n + b.lng, 0) / placed.length}` : '')
    : (() => { const b = BASES.find((x) => x.key === base); return b ? `${b.lat},${b.lng}` : '' })()
  const near = nearKey ? { lat: Number(nearKey.split(',')[0]), lng: Number(nearKey.split(',')[1]) } : null

  const search = useCallback(async (keyword) => {
    setLoading(true); setErr('')
    try { setData(await fetchSpots({ keyword, type, needs: effNeeds, budget: effBudget, age: ageBand, near, date: date.replaceAll('-', ''), accessible, limit: 24 })); setSel(null) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [type, effNeeds, effBudget, ageBand, nearKey, date, accessible])

  // 다음 페이지를 불러와 목록 뒤에 이어 붙인다
  async function loadMore() {
    setMore(true)
    try {
      const next = await fetchSpots({ keyword: q, type, needs: effNeeds, budget: effBudget, age: ageBand, near, date: date.replaceAll('-', ''), accessible, limit: 24, page: data.page + 1 })
      const seen = new Set(data.items.map((x) => x.id))
      setData({ ...next, items: [...data.items, ...next.items.filter((x) => !seen.has(x.id))] })
    } catch (e) { setErr(e.message) }
    finally { setMore(false) }
  }

  useEffect(() => { search(q) /* eslint-disable-next-line */ }, [type, needs, budget, profile, accessible, ageBand, nearKey, date])

  const selected = data?.items.find((x) => x.id === sel)
  const toggleNeed = (k) => setNeeds(effNeeds.includes(k) ? effNeeds.filter((x) => x !== k) : [...effNeeds, k])
  const pickType = (k) => { setType(k); setQ('') } // 종류를 바꾸면 이전 테마는 비운다
  const pickTheme = (kw) => { const next = q === kw ? '' : kw; setQ(next); search(next) } // 같은 테마를 다시 누르면 해제
  const themes = themesFor(type)
  const weights = data?.basis?.weights ?? {}
  const wsum = Object.values(weights).reduce((n, v) => n + v, 0) || 1
  const needLabels = effNeeds.map((k) => NEEDS.find((n) => n.key === k)?.label).filter(Boolean)

  return (
    <>
      <PageTitle icon="compass" title="길동무 찾기" sub="우리 가족 기준(아이 나이·필요한 것·예산)과 고른 테마에 맞춰 점수를 매겨요" />

      {/* ① 무엇을 찾나요? */}
      <div className="cat-row mb-3" role="tablist" aria-label="장소 종류">
        {CATEGORIES.map(([k, label, icon]) => (
          <button type="button" key={k || 'all'} className={`cat-btn ${type === k ? 'on' : ''}`} onClick={() => pickType(k)} role="tab" aria-selected={type === k}>
            <i className={`bi bi-${icon}`} /><span>{label}</span>
          </button>
        ))}
      </div>

      {/* ② 어떤 곳을 원하나요? (종류에 맞는 테마) */}
      <div className="mb-3">
        <div className="fw-bold mb-2">어떤 곳을 원하세요? <span className="small text-muted fw-normal">눌러서 고르고, 다시 누르면 풀려요</span></div>
        <div className="d-flex flex-wrap gap-2">
          {themes.map(([label, kw, icon]) => (
            <Button key={label} variant={q === kw ? 'primary' : 'outline-secondary'} className="rounded-pill theme-chip" onClick={() => pickTheme(kw)}>
              <i className={`bi bi-${icon} me-1`} />{label}
            </Button>
          ))}
        </div>
      </div>

      <Form onSubmit={(e) => { e.preventDefault(); search(q) }} className="mb-3">
        <InputGroup>
          <Form.Control placeholder="직접 검색 (쉼표로 여러 개: 숲길,둘레길)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit"><i className="bi bi-search" /></Button>
        </InputGroup>
      </Form>

      {/* ③ 우리 가족 기준: 여기를 바꾸면 점수가 달라진다 */}
      <div className="soft-card p-3 mb-3">
        <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
          <div className="fw-bold fs-6"><i className="bi bi-people-fill text-primary me-2" />우리 가족 기준 <span className="small text-muted fw-normal">바꾸면 점수가 바로 달라져요</span></div>
          <Button variant="link" size="sm" className="ms-auto p-0" onClick={() => setHow(!how)} aria-expanded={how}>
            <i className="bi bi-question-circle me-1" />점수는 어떻게 매겨요?
          </Button>
        </div>

        <div className="small text-muted mb-1">아이 나이</div>
        <div className="d-flex flex-wrap gap-2 mb-3">
          {AGE_BANDS.map((a) => (
            <Button key={a.key} size="sm" variant={ageBand === a.key ? 'primary' : 'outline-primary'} className="rounded-pill" onClick={() => setAgeBand(a.key)}>
              <i className={`bi bi-${a.icon} me-1`} />{a.label}
            </Button>
          ))}
        </div>

        <Row className="g-3 align-items-end">
          <Col md="auto">
            <div className="small text-muted mb-1">필요한 것</div>
            <div className="d-flex flex-wrap gap-2">
              {NEEDS.filter((n) => n.key !== 'sensory').map((n) => (
                <Button key={n.key} size="sm" variant={effNeeds.includes(n.key) ? 'primary' : 'outline-primary'} className="rounded-pill" onClick={() => toggleNeed(n.key)}>
                  <i className={`bi bi-${n.icon} me-1`} />{n.label}
                </Button>
              ))}
            </div>
          </Col>
          <Col xs="auto">
            <div className="small text-muted mb-1">예산</div>
            <Form.Select size="sm" value={effBudget} onChange={(e) => setBudget(e.target.value)}>{BUDGETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</Form.Select>
          </Col>
          <Col xs="auto">
            <div className="small text-muted mb-1">언제 가세요?</div>
            <Form.Control size="sm" type="date" value={date} min={isoDay(0)} max={isoDay(29)} onChange={(e) => setDate(e.target.value)} />
          </Col>
          <Col xs="auto">
            <div className="small text-muted mb-1">머무는 곳</div>
            <Form.Select size="sm" value={base} onChange={(e) => setBase(e.target.value)}>
              <option value="">상관없어요</option>
              {placed.length > 0 && <option value="basket">내 여행 바구니 근처</option>}
              {BASES.map((b) => <option key={b.key} value={b.key}>{b.label} 근처</option>)}
            </Form.Select>
          </Col>
          <Col xs="auto">
            <Form.Check type="switch" id="acc-only" label="무장애 등록 장소만" checked={accessible} onChange={(e) => setAccessible(e.target.checked)} />
          </Col>
        </Row>

        <div className="mt-3 small" style={{ color: '#3d2a17' }}>
          <i className="bi bi-bullseye text-primary me-1" />지금 점수는 <b>{age?.short}</b>
          {needLabels.length > 0 && <> · <b>{needLabels.join('·')}</b></>} · 예산 <b>{BUDGETS.find((b) => b.key === effBudget)?.label}</b>
          {near && <> · <b>{base === 'basket' ? '바구니' : BASES.find((x) => x.key === base)?.label.split(' ')[0]}</b> 근처</>}
          {q && <> · 테마 <b>{themes.find(([, kw]) => kw === q)?.[0] ?? q}</b></>} 기준이에요
        </div>

        <Collapse in={how}>
          <div>
            <div className="how-score mt-3">
              <div className="fw-bold mb-2">우리 가족 맞춤 점수 = 아래 기준을 가중 평균 (0~100점)</div>
              {Object.entries(CRITERIA).map(([key, [name, desc]]) => {
                const w = weights[key]
                return (
                  <div key={key} className={`how-row ${w ? '' : 'off'}`}>
                    <span className="how-w">{w ? `${Math.round((w / wsum) * 100)}%` : '—'}</span>
                    <span><b>{name}</b> {desc}{!w && ' (테마를 고르면 반영돼요)'}</span>
                  </div>
                )
              })}
              <div className="small text-muted mt-2">70점 이상 초록, 50점 이상 노랑, 그 아래 빨강으로 보여요. 데이터는 한국관광공사(관광정보·무장애·집중률), 기상청(단기예보·자외선지수), 한국환경공단 에어코리아입니다.</div>
            </div>
          </div>
        </Collapse>
      </div>

      {data?.weather && (
        <div className="alert alert-light border py-2">
          <div><i className="bi bi-cloud-sun me-1" />지금 날씨: {data.weather.advice}</div>
          {data.env && (data.env.air || data.env.uv) && (
            <div className="mt-1">
              {data.env.air && <span className={`me-3 ${data.env.air.grade >= 3 ? 'text-danger fw-bold' : ''}`}><i className="bi bi-wind me-1" />미세먼지 {data.env.air.label}{data.env.air.pm10 != null && ` (PM10 ${data.env.air.pm10})`}</span>}
              {data.env.uv && <span className={data.env.uv.max >= 6 ? 'text-danger fw-bold' : ''}><i className="bi bi-brightness-high me-1" />자외선 {data.env.uv.label}</span>}
            </div>
          )}
        </div>
      )}
      <ErrorAlert error={err} />

      <div className="explore-grid">
        <div>
          {loading ? <Loading text="우리 가족 점수를 계산하는 중..." /> : !data || data.items.length === 0 ? (!err && <Empty text="조건에 맞는 곳이 없어요. 테마를 바꿔 보세요" icon="search" />) : (
            <>
              <div className="small text-muted mb-2">조건에 맞는 곳 <b>{data.total.toLocaleString()}</b>곳 중 {data.items.length}곳을 맞춤 점수 높은 순으로 보여드려요</div>
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
