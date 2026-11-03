import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Button, Col, Collapse, Form, InputGroup, Row } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import ScoreBars, { ScorePill } from '../components/ScoreBars'
import SpotDetail from '../components/SpotDetail'
import DataNotice from '../components/DataNotice'
import { Empty, ErrorAlert, Loading } from '../components/Status'
import { fetchSpots } from '../api/client'
import { IslandScene } from '../scene/JejuScene'
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
  access: ['접근성', '유모차·휠체어·수유실·화장실·주차 등 베리어프리 시설이 얼마나 갖춰졌는지 (고른 필요 항목은 더 크게 반영)'],
  kids: ['아이 맞춤', '아이 나이대에 맞는 곳인지: 영아는 수유실·실내·유모차, 걸음마·유아는 놀이·체험, 저학년은 체험·동물, 고학년은 체험·역사'],
  safety: ['날씨 안전', '기상청 예보(비·더위·바람) · 에어코리아 미세먼지 · 기상청 자외선지수 · 정기 휴무 — 야외일수록, 아이가 어릴수록 크게 반영'],
  crowd: ['한산함', '한국관광공사 관광지 집중률 예측 — 고른 날짜에 덜 붐빌수록 높게 (예측이 있는 장소만)'],
  price: ['비용', '입장료가 예산 안인지 (예산을 정하지 않아도 저렴할수록 높게)'],
  near: ['가까움', '머무는 곳(또는 내 여행 일정 중심)에서 가까울수록 높게 — 아이와는 이동 시간이 짧은 곳이 좋아요'],
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
          <div className="spot-title">{s.title}</div>
          <span title="우리 가족 맞춤 점수"><ScorePill score={s.scores.total} /></span>
        </div>
        <div className="small text-muted mb-2 text-truncate">{s.addr}</div>
        <div className="spot-tags mb-3">
          <Badge bg={s.indoor ? 'info' : 'success'}>{s.indoor ? '실내' : '야외'}</Badge>
          <Badge bg="light" text="dark">{s.price}</Badge>
          {s.notes.slice(0, 3).map((n) => <Badge key={n} bg="warning" text="dark">{n}</Badge>)}
          {s.notes.length > 3 && <Badge bg="light" text="dark">+{s.notes.length - 3}</Badge>}
        </div>
        <ScoreBars scores={s.scores} />
        <div className="d-flex gap-2 mt-3">
          <Button size="sm" variant="outline-primary" className="flex-fill"><i className="bi bi-card-text me-1" />자세히</Button>
          <Button size="sm" className="flex-fill" variant={inBasket ? 'secondary' : 'primary'} disabled={inBasket}
            onClick={(e) => { e.stopPropagation(); onAdd(s) }}>
            <i className={`bi bi-${inBasket ? 'check2' : 'calendar2-plus'} me-1`} />{inBasket ? '담았어요' : '담기'}
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
  const [params] = useSearchParams()
  const initQ = params.get('q') ?? '' // 역사 스탬프 투어 등에서 넘어온 검색어
  const [q, setQ] = useState(initQ)
  const [type, setType] = useState('') // 첫 화면은 '전체': 관광지·체험·문화시설을 모아 맞춤 점수가 높은 곳부터 보여준다
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(null)
  const [accessible, setAccessible] = useState(false) // 베리어프리 정보가 등록된 장소만
  const [more, setMore] = useState(false)
  const [open, setOpen] = useState(null) // 상세 창에 띄울 장소
  const [how, setHow] = useState(false)  // 점수 기준 설명 펼치기
  const [date, setDate] = useState('')      // 방문 날짜 ('' = 오늘): 집중률 예측과 휴무일에 쓴다
  const [base, setBase] = useState('')      // 머무는 곳 ('' = 상관없음, 'basket' = 내 여행 일정 중심)

  // 아이 나이·필요한 것·예산은 가족 정보(프로필)에서 가져온다 (아이 나이는 ageBand 에 이미 맞춰져 있다)
  const effNeeds = profile?.needs ?? []
  const effBudget = profile?.budget ?? 'any'
  // 기준 위치는 문자열로 들고 있다가 쓸 때만 좌표로 바꾼다 (객체를 deps 에 넣으면 매 렌더마다 다시 검색해서)
  const placed = basket.filter((b) => b.lat && b.lng)
  const nearKey = base === 'basket' ? (placed.length ? `${placed.reduce((n, b) => n + b.lat, 0) / placed.length},${placed.reduce((n, b) => n + b.lng, 0) / placed.length}` : '')
    : (() => { const b = BASES.find((x) => x.key === base); return b ? `${b.lat},${b.lng}` : '' })()
  const near = nearKey ? { lat: Number(nearKey.split(',')[0]), lng: Number(nearKey.split(',')[1]) } : null

  // 전체(종류 미선택·검색어 없음): 음식점·숙박이 섞이면 식당만 보이니, 나들이 종류 3가지를 모아 점수 높은 순으로 합친다
  const load = useCallback(async (keyword, page = 1) => {
    const args = { needs: effNeeds, budget: effBudget, age: ageBand, near, date: date.replaceAll('-', ''), accessible, limit: 12, page }
    if (type !== '' || keyword) return fetchSpots({ keyword, type, ...args })
    const parts = await Promise.all(['12', '28', '14'].map((t) => fetchSpots({ keyword, type: t, ...args }).catch(() => null)))
    const ok = parts.filter(Boolean)
    if (!ok.length) throw new Error('불러오지 못했어요. 잠시 후 다시 시도해 주세요')
    const seen = new Set()
    const items = ok.flatMap((p) => p.items).filter((x) => !seen.has(x.id) && seen.add(x.id)).sort((a, b) => b.scores.total - a.scores.total)
    return { ...ok[0], items, total: ok.reduce((n, p) => n + p.total, 0), page, hasMore: ok.some((p) => p.hasMore), hiddenAdult: ok.reduce((n, p) => n + (p.hiddenAdult ?? 0), 0) }
  }, [type, effNeeds, effBudget, ageBand, nearKey, date, accessible])

  const search = useCallback(async (keyword) => {
    setLoading(true); setErr('')
    try { setData(await load(keyword)); setSel(null) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [load])

  // 다음 페이지를 불러와 목록 뒤에 이어 붙인다
  async function loadMore() {
    setMore(true)
    try {
      const next = await load(q, data.page + 1)
      const seen = new Set(data.items.map((x) => x.id))
      const merged = [...data.items, ...next.items.filter((x) => !seen.has(x.id))]
      setData({ ...next, items: type === '' && !q ? merged.sort((a, b) => b.scores.total - a.scores.total) : merged })
    } catch (e) { setErr(e.message) }
    finally { setMore(false) }
  }

  useEffect(() => { search(q) /* eslint-disable-next-line */ }, [type, profile, accessible, ageBand, nearKey, date])

  const selected = data?.items.find((x) => x.id === sel)
  const pickType = (k) => { setType(k); setQ('') } // 종류를 바꾸면 이전 테마는 비운다
  const pickTheme = (kw) => { const next = q === kw ? '' : kw; setQ(next); search(next) } // 같은 테마를 다시 누르면 해제
  const themes = themesFor(type)
  const weights = data?.basis?.weights ?? {}
  const wsum = Object.values(weights).reduce((n, v) => n + v, 0) || 1

  return (
    <>
      <PageTitle icon="compass" title="여행지 찾기" sub="우리 가족 정보와 고른 종류·테마에 맞춰 점수를 매겨요" />

      {/* 검색창: 가장 위 */}
      <Form onSubmit={(e) => { e.preventDefault(); search(q) }} className="mb-3">
        <InputGroup size="lg">
          <Form.Control placeholder="장소 이름이나 키워드로 찾아보세요 (예: 오름, 박물관, 해변)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="장소 검색" />
          <Button type="submit" aria-label="검색"><i className="bi bi-search me-1" />검색</Button>
        </InputGroup>
      </Form>

      {/* 방문 조건 패널: 언제 · 머무는 곳 · 베리어프리 + 지금 날씨 (검색창 바로 아래) */}
      <section className="ex-panel mb-3">
        <div className="ex-fields">
          <label className="ex-field">
            <span><i className="bi bi-calendar-event me-1" />언제 가세요?</span>
            <Form.Control type="date" value={date} min={isoDay(0)} max={isoDay(29)} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="ex-field">
            <span><i className="bi bi-geo-alt me-1" />머무는 곳</span>
            <Form.Select value={base} onChange={(e) => setBase(e.target.value)}>
              <option value="">상관없어요</option>
              {placed.length > 0 && <option value="basket">내 여행 일정 근처</option>}
              {BASES.map((b) => <option key={b.key} value={b.key}>{b.label} 근처</option>)}
            </Form.Select>
          </label>
          <button type="button" className={`ex-toggle ${accessible ? 'on' : ''}`} aria-pressed={accessible} onClick={() => setAccessible(!accessible)} title="베리어프리 = 유모차·휠체어도 계단 없이 편하게 다닐 수 있도록 갖춘 곳">
            <i className="bi bi-universal-access" /><span><b>베리어프리만 보기</b><small>유모차·휠체어 편한 곳</small></span><i className={`bi bi-${accessible ? 'toggle-on' : 'toggle-off'} ex-sw`} />
          </button>
        </div>
        {data?.weather && (
          <div className="ex-wx">
            <span className="ex-wx-chip main"><i className="bi bi-cloud-sun" />{data.weather.advice}</span>
            {data.env?.air && <span className={`ex-wx-chip ${data.env.air.grade >= 3 ? 'bad' : ''}`}><i className="bi bi-wind" />미세먼지 {data.env.air.label}{data.env.air.pm10 != null && ` · ${data.env.air.pm10}`}</span>}
            {data.env?.uv && <span className={`ex-wx-chip ${data.env.uv.max >= 6 ? 'bad' : ''}`}><i className="bi bi-brightness-high" />자외선 {data.env.uv.label}</span>}
          </div>
        )}
      </section>
      {!profile && <div className="small text-muted mb-3"><i className="bi bi-people me-1" /><Link to="/profile">가족 정보</Link>를 입력하면 아이 나이·필요한 것·예산에 맞춰 점수를 매겨요.</div>}
      <Collapse in={how}>
        <div>
          <div className="how-score mb-3">
            <div className="fw-bold mb-2">맞춤 점수 = 아래 기준을 가중 평균 (0~100점)</div>
            {Object.entries(CRITERIA).map(([key, [name, desc]]) => {
              const w = weights[key]
              return (
                <div key={key} className={`how-row ${w ? '' : 'off'}`}>
                  <span className="how-w">{w ? `${Math.round((w / wsum) * 100)}%` : '—'}</span>
                  <span><b>{name}</b> {desc}{!w && ' (테마를 고르면 반영돼요)'}</span>
                </div>
              )
            })}
            <div className="small text-muted mt-2">70점 이상 초록, 50점 이상 노랑, 그 아래 빨강으로 보여요. 데이터는 한국관광공사(관광정보·베리어프리·집중률), 기상청(단기예보·자외선지수), 한국환경공단 에어코리아입니다.</div>
          </div>
        </div>
      </Collapse>

      {/* ① 무엇을 찾나요? */}
      <div className="ex-label">무엇을 찾나요?</div>
      <div className="cat-row mb-3" role="tablist" aria-label="장소 종류">
        {CATEGORIES.map(([k, label, icon]) => (
          <button type="button" key={k || 'all'} className={`cat-btn ${type === k ? 'on' : ''}`} onClick={() => pickType(k)} role="tab" aria-selected={type === k}>
            <i className={`bi bi-${icon}`} /><span>{label}</span>
          </button>
        ))}
      </div>

      {/* ② 어떤 곳을 원하나요? (종류에 맞는 테마) — 종류를 고른 경우에만 */}
      {type !== '' && <div className="mb-3">
        <div className="fw-bold mb-2">어떤 곳을 원하세요? <span className="small text-muted fw-normal">눌러서 고르고, 다시 누르면 풀려요</span></div>
        <div className="d-flex flex-wrap gap-2">
          {themes.map(([label, kw, icon]) => (
            <Button key={label} variant={q === kw ? 'primary' : 'outline-secondary'} className="rounded-pill theme-chip" onClick={() => pickTheme(kw)}>
              <i className={`bi bi-${icon} me-1`} />{label}
            </Button>
          ))}
        </div>
      </div>}

      <DataNotice degraded={data?.degraded} />
      <ErrorAlert error={err} />

      <div className="explore-grid">
        <div>
          {loading ? <Loading text="우리 가족 점수를 계산하는 중..." /> : !data || data.items.length === 0 ? (!err && <Empty text="조건에 맞는 곳이 없어요. 테마를 바꿔 보세요" icon="search" />) : (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <div className="small text-muted">조건에 맞는 곳 <b>{data.total.toLocaleString()}</b>곳 중 {data.items.length}곳을 맞춤 점수 높은 순으로 보여드려요</div>
                <Button variant="link" size="sm" className="p-0" onClick={() => setHow(!how)} aria-expanded={how}><i className="bi bi-question-circle me-1" />점수는 어떻게 매겨요?</Button>
              </div>
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
