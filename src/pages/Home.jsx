import { useEffect, useState } from 'react'
import { Badge, Button, Col, ProgressBar, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { fetchPicks, fetchWeather } from '../api/client'
import DataNotice from '../components/DataNotice'
import { ScorePill } from '../components/ScoreBars'
import { IslandScene } from '../scene/JejuScene'
import Intro from './Intro'
import { AGE_BANDS, BUDGETS, EMERGENCY, NEEDS, STORIES, missionsFor, wordsFor, youngestBand } from '../../shared/lore'
import { HISTORY_COURSES, eraOf, stampIdOf } from '../../shared/history'
import { useAppStore } from '../store/useAppStore'

const dayIndex = Math.floor(Date.now() / 86400000) // 하루에 한 번 바뀌는 "오늘의 …" 고르기
const skyIcon = (w) => (w.rain !== '없음' ? (w.rain.includes('눈') ? '❄️' : '🌧️') : w.sky === '맑음' ? '☀️' : w.sky === '구름많음' ? '⛅' : '☁️')
const hourOf = (t) => { const h = Number(t.slice(9, 11)); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}시` }
const condOf = (w) => (w.rain !== '없음' ? 'rain' : w.sky === '맑음' ? 'sun' : 'cloud')

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
      {/* 지금 날씨 + 두 지역 */}
      <div className="wx-now">
        <div className="wx-big"><span className="wx-big-icon">{skyIcon(jeju.rows[0])}</span><span className="wx-big-temp">{jeju.rows[0]?.temp}°</span><span className="wx-big-sky">{jeju.rows[0]?.sky}</span></div>
        <div className="wx-places">
          <div><small>제주시</small><b>{jeju.rows[0]?.temp}°</b><span>비 {sm.pop}%</span></div>
          <div><small>서귀포시</small><b>{seogwipo.rows[0]?.temp}°</b><span>비 {seogwipo.summary.pop}%</span></div>
        </div>
      </div>
      {/* 아이 동반 조언: 좋은 날은 초록, 조심할 날은 빨강 */}
      <div className={`wx-advice ${sm.wet || sm.hot || sm.cold || sm.windy ? 'bad' : 'good'}`}><i className={`bi bi-${sm.wet || sm.hot || sm.cold || sm.windy ? 'exclamation-triangle-fill' : 'emoji-smile-fill'}`} />{sm.advice}</div>
      {/* 시간별: 날씨 색 카드 */}
      <div className="wx-strip" role="list" aria-label="시간별 날씨">
        {jeju.rows.map((r, i) => (
          <div key={r.time} role="listitem" className={`wx-cell ${condOf(r)} ${i === 0 ? 'now' : ''}`}>
            <div className="wx-time">{i === 0 ? '지금' : hourOf(r.time)}</div>
            <div className="wx-icon">{skyIcon(r)}</div>
            <div className="wx-temp">{r.temp}°</div>
            <div className="wx-rain" title={`강수확률 ${r.pop}%`}><span className="wx-bar"><i style={{ width: `${Math.min(100, r.pop)}%` }} /></span><em>{r.pop}%</em></div>
          </div>
        ))}
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
  const [pickNotice, setPickNotice] = useState(null) // 공공데이터를 못 불러온 항목
  const [spotErr, setSpotErr] = useState('')
  const [flip, setFlip] = useState(false)

  // 가족 정보(가장 어린 아이의 나이·필요한 것·예산)로 점수를 매긴 오늘의 추천 3곳
  const familyAge = youngestBand(profile?.child_age_bands) ?? ageBand
  const needsKey = (profile?.needs ?? []).join(',')
  useEffect(() => {
    if (!user || !profileLoaded) return
    let off = false
    setSpots(null); setSpotErr('')
    fetchPicks({ needs: needsKey ? needsKey.split(',') : [], budget: profile?.budget ?? 'any', age: familyAge })
      .then((r) => { if (!off) { setSpots(r.items); setPickNotice(r.degraded) } })
      .catch((e) => { if (!off) setSpotErr(e.message) })
    return () => { off = true }
  }, [user, profileLoaded, needsKey, profile?.budget, familyAge])

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

      {/* ① 왼쪽: 인사 + 제주 3D 지도(오늘의 추천 핀) / 오른쪽: 오늘 날씨 */}
      <Row className="g-3 mb-3">
        <Col lg={7}>
          <div className="soft-card p-3 p-md-4 h-100 d-flex flex-column">
            <div className="small text-muted">{today}</div>
            <h1 className="home-hello mb-3">{name}, <span className="text-primary">오늘 제주</span>는 이래요</h1>
            <div className="home-map"><IslandScene spots={spots ?? []} hero height="100%" /></div>
            <div className="text-center small text-muted mt-2"><i className="bi bi-geo-alt me-1" />아래 추천 장소 1~3번이 지도에 번호 핀으로 보여요</div>
          </div>
        </Col>
        <Col lg={5}>
          <div className="soft-card p-3 p-md-4 h-100">
            <div className="home-wx-title"><i className="bi bi-cloud-sun-fill me-2" />오늘 제주 날씨</div>
            <TodayWeather />
          </div>
        </Col>
      </Row>

      {/* 바로가기: 날씨 카드와 따로 한 줄 */}
      <div className="soft-card p-3 mb-4">
        <div className="fw-bold mb-2" style={{ fontSize: '1.15rem', color: '#3d2a17' }}><i className="bi bi-lightning-charge-fill text-primary me-2" />어디로 갈까요?</div>
            <div className="quick-grid">
              <Tile to="/explore" icon="compass" title="여행지 찾기" sub="맞춤 추천" />
              <Tile to="/basket" icon="calendar2-check" title="여행 일정" sub={`${basket.length}곳 담음`} />
              <Tile to="/history" icon="hourglass-split" title="역사 배우기" sub={`도장 ${histDone}/${courses.length}`} />
              <Tile to="/halmang" icon="chat-heart" title="할망에게 묻기" sub="AI 가이드" />
            </div>
      </div>

      {/* ② 오늘 가기 좋은 곳 TOP 3 */}
      <div className="d-flex align-items-end justify-content-between mb-2">
        <h2 className="home-section">오늘 우리 가족이 가기 좋은 곳</h2>
        <Link to="/explore" className="fw-bold">더 보기 <i className="bi bi-chevron-right" /></Link>
      </div>
      <div className="d-flex flex-wrap align-items-center gap-1 mb-3 small">
        <span className="text-muted me-1"><i className="bi bi-people-fill text-primary me-1" />우리 가족 기준</span>
        <Badge bg="primary">{AGE_BANDS.find((x) => x.key === familyAge)?.label}</Badge>
        {(profile?.needs ?? []).map((k) => <Badge key={k} bg="secondary">{NEEDS.find((n) => n.key === k)?.label}</Badge>)}
        <Badge bg="light" text="dark" className="border">예산 {BUDGETS.find((x) => x.key === (profile?.budget ?? 'any'))?.label}</Badge>
        {!profile && <Link to="/profile" className="ms-1">가족 정보를 입력하면 더 잘 맞춰요</Link>}
      </div>
      <DataNotice degraded={pickNotice} />
      <Row xs={1} md={3} className="g-3 mb-4">
        {!spots && !spotErr && [0, 1, 2].map((i) => <Col key={i}><div className="soft-card p-3 text-muted small" style={{ minHeight: 170 }}><i className="bi bi-hourglass-split me-1" />추천을 고르는 중...</div></Col>)}
        {spotErr && <Col xs={12}><div className="soft-card p-3 small text-muted">추천을 불러오지 못했어요. <Link to="/explore">여행지 찾기</Link>에서 직접 찾아보세요.</div></Col>}
        {spots && spots.length === 0 && (
          <Col xs={12}>
            <div className="soft-card p-3 d-flex flex-wrap align-items-center gap-3">
              <i className="bi bi-emoji-neutral fs-3 text-muted" />
              <div className="flex-grow-1">오늘은 우리 가족에게 꼭 맞는 장소를 찾지 못했어요. 날씨나 우리 가족 조건 때문에 추천할 곳이 적은 날이에요.</div>
              <Button as={Link} to="/explore" variant="outline-primary">여행지 찾기에서 직접 보기</Button>
            </div>
          </Col>
        )}
        {spots?.map((s) => (
          <Col key={s.id}>
            <div className="soft-card spot-card h-100 overflow-hidden">
              {s.image ? <img className="spot-img" src={s.image} alt={s.title} loading="lazy" style={{ height: 120 }} /> : <div className="spot-img" style={{ height: 120 }}><i className="bi bi-image" /></div>}
              <div className="p-3">
                <div className="d-flex justify-content-between gap-2"><div className="fw-bold fs-6">{s.title}</div><ScorePill score={s.scores.total} /></div>
                <div className="small text-muted text-truncate mb-2">{s.addr}</div>
                <div className="d-flex flex-wrap gap-1 mb-2">
                  <Badge bg={s.indoor ? 'info' : 'success'}>{s.indoor ? '실내' : '야외'}</Badge>
                  {(s.reasons ?? []).slice(0, 3).map((n) => <Badge key={n} bg="warning" text="dark">{n}</Badge>)}
                </div>
                <div className="d-flex gap-2">
                  <Button as={Link} to={`/explore?q=${encodeURIComponent(s.title)}`} size="sm" variant="outline-primary" className="flex-fill">자세히</Button>
                  <Button size="sm" className="flex-fill" disabled={basket.some((b) => b.content_id === s.id)} onClick={() => addToBasket(s)}>
                    <i className="bi bi-calendar2-plus me-1" />{basket.some((b) => b.content_id === s.id) ? '담았어요' : '담기'}
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ③ 내 여행 · 도장 현황 · 오늘의 제주어 */}
      <Row className="g-3 mb-3">
        <Col md={6} lg={4}>
          <div className="hb-card h-100">
            <div className="hb-head"><span className="hb-ico trip"><i className="bi bi-calendar2-check" /></span><h3>내 여행 일정</h3>{basket.length > 0 && <span className="hb-count">{basket.length}곳</span>}</div>
            {basket.length === 0 ? (
              <div className="hb-empty"><i className="bi bi-bag-plus" /><span>아직 담은 곳이 없어요.<br />위 추천에서 마음에 드는 곳을 담아 보세요.</span></div>
            ) : (
              <div className="hb-days">
                {days.slice(0, 3).map((d) => (
                  <div key={d} className="hb-day">
                    <span className="hb-daytag">{d < 1 ? '미정' : `${d}일차`}</span>
                    <span className="hb-places">{placed(d).slice(0, 3).map((b) => b.title).join(' · ')}{placed(d).length > 3 ? ` 외 ${placed(d).length - 3}곳` : ''}</span>
                  </div>
                ))}
              </div>
            )}
            <Button as={Link} to="/basket" className="hb-cta">일정 짜러 가기 <i className="bi bi-arrow-right ms-1" /></Button>
          </div>
        </Col>
        <Col md={6} lg={4}>
          <div className="hb-card h-100">
            <div className="hb-head"><span className="hb-ico stamp"><i className="bi bi-stamp" /></span><h3>도장 현황</h3><span className="hb-count">{age?.short}</span></div>
            <div className="hb-stats">
              <div className="hb-stat"><b>{histDone}<small>/{courses.length}</small></b><span>역사 도장</span><ProgressBar now={(histDone / courses.length) * 100} /></div>
              <div className="hb-stat"><b>{missionDone}<small>/{missions.length}</small></b><span>미션 카드</span><ProgressBar now={missions.length ? (missionDone / missions.length) * 100 : 0} /></div>
            </div>
            {next ? (
              <div className="hb-next" style={{ '--era': eraOf(next.era).color }}>
                <div className="hb-next-t"><span>다음 도장</span>{eraOf(next.era).emoji} {next.place}</div>
                <div className="hb-next-d">{next.mission}</div>
              </div>
            ) : <div className="small fw-bold text-success">🏅 역사 도장을 모두 모았어요!</div>}
            <div className="d-flex gap-2 mt-auto pt-3">
              <Button as={Link} to="/history" className="hb-cta flex-fill">도장 찍으러 가기</Button>
              <Button as={Link} to="/kids" variant="outline-secondary" className="hb-ghost">미션 카드</Button>
            </div>
          </div>
        </Col>
        <Col lg={4}>
          <div className="hb-card h-100">
            <div className="hb-head"><span className="hb-ico word"><i className="bi bi-chat-heart" /></span><h3>오늘의 제주어</h3></div>
            <div className={`word-card mb-3 ${flip ? 'flip' : ''}`} style={{ height: 130 }} onClick={() => setFlip(!flip)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setFlip(!flip)}>
              <div className="inner">
                <div className="face front"><div style={{ fontSize: '1.8rem' }}>{word.emoji}</div><div className="display-font fs-4">{word.jeju}</div><div className="small text-muted"><i className="bi bi-hand-index me-1" />눌러서 뜻 보기</div></div>
                <div className="face back"><div className="fw-bold fs-4">{word.ko}</div><div className="small mt-1">{word.tip}</div></div>
              </div>
            </div>
            <div className="hb-story"><span>{story.emoji} 오늘의 이야기</span><b>{story.title}</b></div>
            <Button as={Link} to={`/kids?story=${story.id}`} className="hb-cta">들으러 가기 <i className="bi bi-arrow-right ms-1" /></Button>
          </div>
        </Col>
      </Row>

      {/* ④ 안전: 응급 번호 */}
      <div className="hb-sos">
        <span className="hb-sos-t"><i className="bi bi-heart-pulse-fill" />급할 때</span>
        <div className="hb-sos-btns">
          {EMERGENCY.slice(0, 3).map((e) => <a key={e.tel} href={`tel:${e.tel}`} className={`hb-sos-btn ${e.tone}`}><i className="bi bi-telephone-fill" /><b>{e.tel}</b><span>{e.name}</span></a>)}
        </div>
        <Button as={Link} to="/care" variant="outline-secondary" className="ms-auto hb-ghost"><i className="bi bi-journal-heart me-1" />보호자 노트</Button>
      </div>
      <div className="small text-muted mt-3"><i className="bi bi-database-check me-1" />한국관광공사 관광정보·베리어프리·집중률, 기상청 단기예보·자외선지수, 한국환경공단 에어코리아(공공데이터포털)를 사용해요.</div>
    </>
  )
}
