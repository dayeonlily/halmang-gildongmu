import { useEffect, useState } from 'react'
import { Badge, Button, Col, ProgressBar, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchSpots, fetchWeather } from '../api/client'
import { ScorePill } from '../components/ScoreBars'
import { IslandScene } from '../scene/JejuScene'
import Intro from './Intro'
import { AGE_BANDS, EMERGENCY, STORIES, missionsFor, wordsFor } from '../../shared/lore'
import { HISTORY_COURSES, eraOf, stampIdOf } from '../../shared/history'
import { useAppStore } from '../store/useAppStore'

const dayIndex = Math.floor(Date.now() / 86400000) // 하루에 한 번 바뀌는 "오늘의 …" 고르기
const skyIcon = (w) => (w.rain !== '없음' ? (w.rain.includes('눈') ? '❄️' : '🌧️') : w.sky === '맑음' ? '☀️' : w.sky === '구름많음' ? '⛅' : '☁️')
const hourOf = (t) => `${Number(t.slice(9, 11))}시`

// ── 오늘 날씨: 제주시·서귀포시 + 시간대별 예보 + 아이 동반 조언 ──
function TodayWeather() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => { Promise.all(['제주시', '서귀포시'].map(fetchWeather)).then(setData).catch((e) => setErr(e.message)) }, [])
  if (err) return <div className="small text-muted"><i className="bi bi-cloud-slash me-1" />날씨를 불러오지 못했어요</div>
  if (!data) return <div className="small text-muted"><i className="bi bi-cloud me-1" />날씨 불러오는 중...</div>
  const [jeju, seogwipo] = data
  const sm = jeju.summary
  return (
    <div>
      <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
        <div className="display-font" style={{ fontSize: '3rem', lineHeight: 1 }}>{skyIcon(jeju.rows[0])} {jeju.rows[0]?.temp}°</div>
        <div style={{ fontSize: '1.05rem' }}><b>제주시</b> {jeju.rows[0]?.sky} · 강수확률 {sm.pop}%<br /><b>서귀포시</b> {seogwipo.rows[0]?.temp}° · 강수확률 {seogwipo.summary.pop}%</div>
      </div>
      <div className={`fw-bold mb-2 ${sm.wet || sm.hot || sm.cold || sm.windy ? 'text-danger' : 'text-success'}`}><i className="bi bi-lightbulb me-1" />{sm.advice}</div>
      <div className="hour-strip">
        {jeju.rows.map((r) => <div key={r.time} className="hour-chip"><small>{hourOf(r.time)}</small><span>{skyIcon(r)}</span><b>{r.temp}°</b><small>{r.pop}%</small></div>)}
      </div>
    </div>
  )
}

// 큰 바로가기 타일
const Tile = ({ to, icon, title, sub }) => (
  <Link to={to} className="quick-tile"><i className={`bi bi-${icon}`} /><b>{title}</b><small>{sub}</small></Link>
)

export default function Home() {
  const user = useAppStore((s) => s.user)
  const ready = useAppStore((s) => s.authReady)
  const profile = useAppStore((s) => s.profile)
  const profileLoaded = useAppStore((s) => s.profileLoaded)
  const basket = useAppStore((s) => s.basket)
  const stamps = useAppStore((s) => s.stamps)
  const ageBand = useAppStore((s) => s.ageBand)
  const addToBasket = useAppStore((s) => s.addToBasket)
  const [spots, setSpots] = useState(null)
  const [spotErr, setSpotErr] = useState('')
  const [flip, setFlip] = useState(false)

  // 우리 가족(접근성·예산)에 맞춘 오늘의 추천 장소
  useEffect(() => {
    if (!user || !profileLoaded) return
    let off = false
    // 접근성이 필요한 가족은 무장애 정보가 등록된 곳에서, 날마다 다른 쪽(페이지)을 보여 줘서 매일 새롭게
    const needs = profile?.needs ?? []
    fetchSpots({ type: needs.length ? '' : '12', needs, budget: profile?.budget ?? 'any', age: ageBand, accessible: needs.length > 0, page: (dayIndex % 12) + 1, limit: 24 })
      .then((r) => {
        if (off) return
        // 후보 24곳 중 구경할 만한 곳(관광지·문화시설·체험·행사)을 점수순으로 3곳. 부족하면 나머지로 채운다
        const sight = r.items.filter((p) => ['12', '14', '28', '15'].includes(p.type))
          .sort((x, y) => y.scores.total - x.scores.total || Number(!!y.image) - Number(!!x.image)) // 같은 점수면 사진이 있는 곳 먼저
        setSpots([...sight, ...r.items.filter((p) => !sight.includes(p))].slice(0, 3))
      })
      .catch((e) => { if (!off) setSpotErr(e.message) })
    return () => { off = true }
  }, [user, profileLoaded, profile, ageBand])

  if (!ready) return <div className="intro" /> // 로그인 여부를 확인하는 동안 같은 배경만 보여 깜빡임을 막는다
  if (!user) return <Intro />

  const name = profile?.display_name || '여행자'
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })
  const age = AGE_BANDS.find((a) => a.key === ageBand)

  // 내 여행: 일차별로 묶기
  const days = [...new Set(basket.map((b) => b.day))].sort((a, b) => a - b)
  const placed = (d) => basket.filter((b) => b.day === d)

  // 도장 현황
  const tab = ageBand === 'upper' ? 'upper' : 'young'
  const courses = HISTORY_COURSES[tab]
  const histDone = courses.filter((c) => stamps.includes(stampIdOf(c))).length
  const next = courses.find((c) => !stamps.includes(stampIdOf(c)))
  const missions = missionsFor(ageBand)
  const missionDone = missions.filter((m) => stamps.includes(m.id)).length

  // 오늘의 제주어 · 이야기
  const words = wordsFor(ageBand)
  const word = words[dayIndex % words.length]
  const story = STORIES[dayIndex % STORIES.length]

  return (
    <>
      {profileLoaded && !profile && (
        <div className="soft-card p-3 mb-3 d-flex flex-wrap align-items-center gap-3" style={{ background: 'var(--hm-orange-soft)' }}>
          <i className="bi bi-people fs-3 text-primary" />
          <div className="flex-grow-1">
            <div className="fw-bold">처음 오셨네요! 우리 가족 정보를 알려 주세요</div>
            <div className="small text-muted">아이 나이, 유모차·휠체어, 예산을 한 번만 적으면 맞춤 추천을 해 드려요. 나중에 '우리 가족' 메뉴에서 고칠 수 있어요.</div>
          </div>
          <Button as={Link} to="/profile">가족 정보 입력하기</Button>
        </div>
      )}

      {/* ① 인사 + 오늘 날씨 + 바로가기 / 3D 지도(오늘의 추천 핀) */}
      <Row className="g-3 mb-3">
        <Col lg={7}>
          <div className="soft-card p-3 p-md-4 h-100">
            <div className="small text-muted">{today}</div>
            <h1 className="home-hello mb-3">{name}, <span className="text-primary">오늘 제주</span>는 이래요</h1>
            <TodayWeather />
            <div className="quick-grid mt-3">
              <Tile to="/explore" icon="compass" title="길동무 찾기" sub="맞춤 추천" />
              <Tile to="/basket" icon="basket2" title="여행 바구니" sub={`${basket.length}곳 담음`} />
              <Tile to="/history" icon="hourglass-split" title="역사 도장" sub={`${histDone}/${courses.length}`} />
              <Tile to="/halmang" icon="chat-heart" title="할망에게 묻기" sub="AI 가이드" />
            </div>
          </div>
        </Col>
        <Col lg={5}>
          <IslandScene spots={spots ?? []} hero height={330} />
          <div className="text-center small text-muted mt-2"><i className="bi bi-geo-alt me-1" />오늘의 추천 장소가 지도에 핀으로 보여요</div>
        </Col>
      </Row>

      {/* ② 오늘 가기 좋은 곳 TOP 3 */}
      <div className="d-flex align-items-end justify-content-between mb-2">
        <h2 className="home-section">오늘 우리 가족이 가기 좋은 곳</h2>
        <Link to="/explore" className="fw-bold">더 보기 <i className="bi bi-chevron-right" /></Link>
      </div>
      <Row xs={1} md={3} className="g-3 mb-4">
        {!spots && !spotErr && [0, 1, 2].map((i) => <Col key={i}><div className="soft-card p-3 text-muted small" style={{ minHeight: 170 }}><i className="bi bi-hourglass-split me-1" />추천을 고르는 중...</div></Col>)}
        {spotErr && <Col xs={12}><div className="soft-card p-3 small text-muted">추천을 불러오지 못했어요. <Link to="/explore">길동무 찾기</Link>에서 직접 찾아보세요.</div></Col>}
        {spots?.map((s) => (
          <Col key={s.id}>
            <div className="soft-card spot-card h-100 overflow-hidden">
              {s.image ? <img className="spot-img" src={s.image} alt={s.title} loading="lazy" style={{ height: 120 }} /> : <div className="spot-img" style={{ height: 120 }}><i className="bi bi-image" /></div>}
              <div className="p-3">
                <div className="d-flex justify-content-between gap-2"><div className="fw-bold fs-6">{s.title}</div><ScorePill score={s.scores.total} /></div>
                <div className="small text-muted text-truncate mb-2">{s.addr}</div>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  <Badge bg={s.indoor ? 'info' : 'success'}>{s.indoor ? '실내' : '야외'}</Badge>
                  {s.notes.slice(0, 2).map((n) => <Badge key={n} bg="warning" text="dark">{n}</Badge>)}
                </div>
                <div className="d-flex gap-2">
                  <Button as={Link} to={`/explore?q=${encodeURIComponent(s.title)}`} size="sm" variant="outline-primary" className="flex-fill">자세히</Button>
                  <Button size="sm" className="flex-fill" disabled={basket.some((b) => b.content_id === s.id)} onClick={() => addToBasket(s)}>
                    <i className="bi bi-basket2 me-1" />{basket.some((b) => b.content_id === s.id) ? '담았어요' : '담기'}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ③ 내 여행 · 도장 현황 · 오늘의 한 장 */}
      <Row className="g-3 mb-3">
        <Col md={6} lg={4}>
          <div className="soft-card p-3 h-100">
            <h3 className="fs-5"><i className="bi bi-basket2 text-primary me-2" />내 여행 바구니</h3>
            {basket.length === 0 ? (
              <div className="small text-muted">아직 담은 곳이 없어요. 위의 추천에서 마음에 드는 곳을 담아 보세요.</div>
            ) : (
              days.slice(0, 3).map((d) => (
                <div key={d} className="mb-2">
                  <span className="chip me-1">{d < 1 ? '미정' : `${d}일차`}</span>
                  <span className="small">{placed(d).slice(0, 3).map((b) => b.title).join(' · ')}{placed(d).length > 3 ? ` 외 ${placed(d).length - 3}곳` : ''}</span>
                </div>
              ))
            )}
            <Button as={Link} to="/basket" variant="outline-primary" className="mt-2">일정 짜러 가기</Button>
          </div>
        </Col>
        <Col md={6} lg={4}>
          <div className="soft-card p-3 h-100">
            <h3 className="fs-5"><i className="bi bi-stamp text-primary me-2" />도장 현황 <small className="text-muted fs-6">({age?.short})</small></h3>
            <div className="small d-flex justify-content-between"><span>역사 스탬프 투어</span><b>{histDone}/{courses.length}</b></div>
            <ProgressBar now={(histDone / courses.length) * 100} className="mb-2" style={{ height: 8 }} />
            <div className="small d-flex justify-content-between"><span>미션 카드</span><b>{missionDone}/{missions.length}</b></div>
            <ProgressBar now={missions.length ? (missionDone / missions.length) * 100 : 0} className="mb-3" style={{ height: 8 }} />
            {next ? (
              <div className="h-mission small" style={{ '--era': eraOf(next.era).color }}>
                <div className="fw-bold mb-1">다음 도장 👉 {eraOf(next.era).emoji} {next.place}</div>
                <div className="text-muted">{next.mission}</div>
              </div>
            ) : <div className="small fw-bold text-success">🏅 역사 도장을 모두 모았어요!</div>}
            <div className="d-flex gap-2 mt-2">
              <Button as={Link} to="/history" size="sm" variant="outline-primary">도장 찍으러 가기</Button>
              <Button as={Link} to="/kids" size="sm" variant="outline-secondary">미션 카드</Button>
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="soft-card p-3 h-100">
            <h3 className="fs-5"><i className="bi bi-chat-heart text-primary me-2" />오늘의 제주어</h3>
            <div className={`word-card mb-2 ${flip ? 'flip' : ''}`} style={{ height: 120 }} onClick={() => setFlip(!flip)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setFlip(!flip)}>
              <div className="inner">
                <div className="face front"><div style={{ fontSize: '1.6rem' }}>{word.emoji}</div><div className="display-font fs-5">{word.jeju}</div><div className="small text-muted">눌러서 뜻 보기</div></div>
                <div className="face back"><div className="fw-bold fs-5">{word.ko}</div><div className="small mt-1">{word.tip}</div></div>
              </div>
            </div>
            <div className="small"><b>{story.emoji} 오늘의 이야기</b> {story.title}</div>
            <Button as={Link} to={`/kids?story=${story.id}`} size="sm" variant="outline-primary" className="mt-2">들으러 가기</Button>
          </div>
        </Col>
      </Row>

      {/* ④ 안전: 응급 번호 한 줄 */}
      <div className="soft-card p-3 d-flex flex-wrap align-items-center gap-2">
        <span className="fw-bold me-2"><i className="bi bi-heart-pulse text-danger me-1" />급할 때</span>
        {EMERGENCY.slice(0, 3).map((e) => <Button key={e.tel} as="a" href={`tel:${e.tel}`} size="sm" variant={e.tone}><i className="bi bi-telephone-fill me-1" />{e.name} <span className="d-none d-sm-inline small">{e.desc.split(' ')[0]}</span></Button>)}
        <Button as={Link} to="/care" size="sm" variant="outline-secondary" className="ms-auto">보호자 노트</Button>
      </div>
      <div className="small text-muted mt-3"><i className="bi bi-database-check me-1" />한국관광공사 관광정보·무장애 여행정보, 기상청 단기예보(공공데이터포털)를 사용해요.</div>
    </>
  )
}
