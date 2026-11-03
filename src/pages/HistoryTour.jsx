import { useState } from 'react'
import { Badge, Button, Col, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import LearnTabs from '../components/LearnTabs'
import PageTitle from '../components/PageTitle'
import Stamp from '../components/Stamp'
import StampBook from '../components/StampBook'
import { useHistoryStamps } from '../lib/historyStamps'
import { ERAS, HISTORY_COURSES, HISTORY_TABS, coursesFor, eraOf, stampIdOf } from '../../shared/history'
import { useAppStore } from '../store/useAppStore'

// ── 코스 카드 ─────────────────────────────────────────────
function CourseCard({ c, done, onStamp, tab }) {
  const era = eraOf(c.era)
  return (
    <div id={`card-${c.id}`} className={`soft-card h-card ${done ? 'stamped' : ''}`} style={{ '--era': era.color }}>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <span className="era-tag" style={{ background: era.color }}>{era.emoji} {era.label}</span>
        <span className="small text-muted"><i className="bi bi-geo-alt me-1" />{c.area}</span>
      </div>
      <h5 className="mt-2 mb-1">{c.place}</h5>
      <div className="fw-bold mb-1">{c.title}</div>
      <p className="small text-muted mb-2">{c.text}</p>
      <ul className="small ps-3 mb-2">{c.points.map((p) => <li key={p}>{p}</li>)}</ul>
      {c.note && <div className="small text-muted mb-2"><i className="bi bi-info-circle me-1" />{c.note}</div>}

      <div className="h-mission">
        <div className="small fw-bold text-primary"><i className="bi bi-stamp me-1" />스탬프 미션</div>
        <div className="small">{c.mission}</div>
        <div className="small mt-2">획득 테마 <Badge bg="light" text="dark" className="border fw-normal">{c.theme.emoji} {c.theme.name}</Badge></div>
      </div>

      <div className="d-flex gap-2 mt-3">
        <Button className="flex-fill" variant={done ? 'success' : 'primary'} onClick={onStamp}>
          {done ? <><i className="bi bi-check-circle-fill me-1" />도장 찍었어요</> : <><i className="bi bi-stamp me-1" />도장 찍기</>}
        </Button>
        <Button as={Link} to={`/explore?q=${encodeURIComponent(c.q)}`} variant="outline-primary" aria-label={`${c.place} 근처 찾아보기`} title="길동무 찾기에서 보기"><i className="bi bi-search" /></Button>
      </div>

      {/* 찍으면 쾅! 하고 나타나는 도장 */}
      {done && <div className="stamp-mark" aria-hidden="true"><Stamp tab={tab} c={c} era={era} /></div>}
    </div>
  )
}

// ── 한 연령 탭의 내용: 진행도 · 시대 타임라인(필터) · 카드 목록 ──
function TourPanel({ tab }) {
  const { stamps, toggle, guest } = useHistoryStamps()
  const [era, setEra] = useState('all')
  const courses = coursesFor(tab)
  const has = (c) => stamps.includes(stampIdOf(c))
  const done = courses.filter(has).length
  const list = era === 'all' ? courses : courses.filter((c) => c.era === era)
  const info = HISTORY_TABS.find((t) => t.key === tab)

  return (
    <>
      <div className="soft-card p-3 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="flex-grow-1">
            <div className="fw-bold">{info.desc}</div>
            <ProgressBar now={courses.length ? (done / courses.length) * 100 : 0} className="mt-2" style={{ height: 12 }} />
          </div>
          <div className="text-end"><b className="fs-5">{done}</b><span className="text-muted"> / {courses.length}</span></div>
        </div>
        {done === courses.length && courses.length > 0 && <div className="mt-2 fw-bold text-success">🏅 제주 역사 탐험가 달성! 모든 도장을 모았어요</div>}
        {guest && <div className="small text-muted mt-2"><i className="bi bi-info-circle me-1" />지금은 이 기기에만 저장돼요. <Link to="/login">로그인</Link>하면 계정에 저장돼요.</div>}
      </div>

      {/* 시대 타임라인: 눌러서 시대별로 모아 보기 */}
      <div className="era-strip mb-3" role="tablist" aria-label="시대 고르기">
        <button type="button" className={`era-step ${era === 'all' ? 'on' : ''}`} onClick={() => setEra('all')}>
          <span>전체</span><small>{done}/{courses.length}</small>
        </button>
        {ERAS.map((e) => {
          const all = courses.filter((c) => c.era === e.key)
          if (!all.length) return null
          return (
            <button type="button" key={e.key} className={`era-step ${era === e.key ? 'on' : ''}`} style={{ '--era': e.color }} onClick={() => setEra(e.key)} title={e.range}>
              <span>{e.emoji} {e.label}</span><small>{all.filter(has).length}/{all.length}</small>
            </button>
          )
        })}
      </div>

      <Row xs={1} md={2} xl={3} className="g-3">
        {list.map((c) => <Col key={c.id}><CourseCard tab={tab} c={c} done={has(c)} onStamp={() => toggle(stampIdOf(c))} /></Col>)}
      </Row>
    </>
  )
}

export default function HistoryTour() {
  const ageBand = useAppStore((s) => s.ageBand)
  const { stamps } = useHistoryStamps()
  const [tab, setTab] = useState(ageBand === 'upper' ? 'upper' : 'young') // 아이와 함께에서 고른 연령에 맞춰 시작
  const [book, setBook] = useState(false)
  const total = Object.values(HISTORY_COURSES).flat().filter((c) => stamps.includes(stampIdOf(c))).length

  // 도장첩에서 도장을 누르면 그 카드가 있는 탭으로 가서 카드 위치로 스크롤
  function pick(card) {
    const t = HISTORY_TABS.find((x) => HISTORY_COURSES[x.key].some((c) => c.id === card.id))
    setBook(false)
    if (t) setTab(t.key)
    setTimeout(() => document.getElementById(`card-${card.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350)
  }

  return (
    <>
      <LearnTabs />
      <PageTitle icon="hourglass-split" title="역사 배우기" sub="스탬프 투어로 선사시대부터 오늘까지, 시간 여행을 하며 도장을 모아요">
        <Button variant="outline-primary" className="rounded-pill" onClick={() => setBook(true)}>
          <i className="bi bi-journal-bookmark me-1" />내 도장첩 <Badge bg="primary" pill>{total}</Badge>
        </Button>
      </PageTitle>
      <Tabs activeKey={tab} onSelect={(k) => setTab(k)} className="mb-3" fill>
        {HISTORY_TABS.map((t) => <Tab key={t.key} eventKey={t.key} title={t.short}><TourPanel tab={t.key} /></Tab>)}
      </Tabs>
      <p className="small text-muted mb-0"><i className="bi bi-info-circle me-1" />운영시간·관람 범위는 장소마다 달라요. 방문 전에 확인해 주세요. 연도와 설명은 현장 안내판·박물관 설명으로 한 번 더 확인해 보세요.</p>
      {book && <StampBook stamps={stamps} initialTab={tab} onHide={() => setBook(false)} onPick={pick} />}
    </>
  )
}
