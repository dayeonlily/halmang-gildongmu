import { useEffect, useState } from 'react'
import { Badge, Button, Col, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import { HalmangBuddy } from '../scene/JejuScene'
import { AGE_BANDS, JEJU_WORDS, STORIES, missionsFor } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const ageIndex = (k) => AGE_BANDS.findIndex((a) => a.key === k)

function AgePicker() {
  const ageBand = useAppStore((s) => s.ageBand)
  const setAgeBand = useAppStore((s) => s.setAgeBand)
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {AGE_BANDS.map((a) => (
        <Button key={a.key} size="sm" className="rounded-pill" variant={ageBand === a.key ? 'primary' : 'outline-primary'} onClick={() => setAgeBand(a.key)}>
          <i className={`bi bi-${a.icon} me-1`} />{a.short}
        </Button>
      ))}
    </div>
  )
}

// ── 이야기: 할망이 한 줄씩 들려주고, 브라우저 음성(TTS)으로 읽어 줌 ──
function StoryTab() {
  const ageBand = useAppStore((s) => s.ageBand)
  const [id, setId] = useState(STORIES[0].id)
  const [i, setI] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const story = STORIES.find((s) => s.id === id)
  const tooYoung = ageIndex(ageBand) < ageIndex(story.minAge)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  function pick(sid) { window.speechSynthesis?.cancel(); setSpeaking(false); setId(sid); setI(0) }
  function speak() {
    const synth = window.speechSynthesis
    if (speaking) { synth.cancel(); return setSpeaking(false) }
    const u = new SpeechSynthesisUtterance(story.lines[i].replace(/\(보호자님께:.*\)/, ''))
    u.lang = 'ko-KR'; u.rate = 0.85; u.pitch = 0.9
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false)
    setSpeaking(true); synth.speak(u)
  }

  return (
    <Row className="g-3">
      <Col md={4}>
        <HalmangBuddy speaking={speaking} height={260} />
        <div className="d-grid gap-2 mt-3">
          {STORIES.map((s) => (
            <Button key={s.id} variant={s.id === id ? 'primary' : 'outline-primary'} className="text-start" onClick={() => pick(s.id)}>{s.emoji} {s.title}</Button>
          ))}
        </div>
      </Col>
      <Col md={8}>
        <div className="soft-card p-4 h-100 d-flex flex-column">
          <div className="d-flex align-items-center gap-2 mb-3">
            <h3 className="m-0">{story.emoji} {story.title}</h3>
            <Badge bg="light" text="dark"><i className="bi bi-geo-alt me-1" />{story.place}</Badge>
          </div>
          {tooYoung && <div className="alert alert-warning py-2 small">{AGE_BANDS[ageIndex(story.minAge)].short} 이상에게 더 어울리는 이야기예요. 짧게 줄여서 들려주세요.</div>}
          <div className="story-line flex-grow-1">{story.lines[i]}</div>
          <ProgressBar now={((i + 1) / story.lines.length) * 100} className="my-3" style={{ height: 8 }} />
          <div className="d-flex gap-2 align-items-center">
            <Button variant="outline-secondary" disabled={i === 0} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setI(i - 1) }}><i className="bi bi-chevron-left" /></Button>
            <Button variant="outline-secondary" disabled={i === story.lines.length - 1} onClick={() => { window.speechSynthesis?.cancel(); setSpeaking(false); setI(i + 1) }}><i className="bi bi-chevron-right" /></Button>
            <span className="text-muted small">{i + 1} / {story.lines.length}</span>
            {canSpeak && <Button className="ms-auto" onClick={speak}><i className={`bi bi-${speaking ? 'stop-fill' : 'volume-up-fill'} me-1`} />{speaking ? '멈추기' : '읽어주기'}</Button>}
          </div>
        </div>
      </Col>
    </Row>
  )
}

// ── 연령별 미션 카드 + 스탬프 ──
function MissionTab() {
  const ageBand = useAppStore((s) => s.ageBand)
  const stamps = useAppStore((s) => s.stamps)
  const toggleStamp = useAppStore((s) => s.toggleStamp)
  const list = missionsFor(ageBand)
  const done = list.filter((m) => stamps.includes(m.id)).length
  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="flex-grow-1"><ProgressBar now={list.length ? (done / list.length) * 100 : 0} style={{ height: 14 }} /></div>
        <b>{done} / {list.length}</b>{done === list.length && list.length > 0 && <span>🏅 모두 완료!</span>}
      </div>
      <Row xs={1} md={2} className="g-3">
        {list.map((m) => (
          <Col key={m.id}>
            <div className={`soft-card mission-card p-3 h-100 d-flex gap-3 align-items-center ${stamps.includes(m.id) ? 'done' : ''}`}>
              <div className="stamp">{m.stamp}</div>
              <div className="flex-grow-1"><div className="fw-bold">{m.title}</div><div className="small text-muted">{m.text}</div></div>
              <Button size="sm" variant={stamps.includes(m.id) ? 'success' : 'outline-primary'} onClick={() => toggleStamp(m.id)} aria-label="완료 표시">
                <i className={`bi bi-${stamps.includes(m.id) ? 'check-lg' : 'circle'}`} />
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </>
  )
}

// ── 제주어 카드 (눌러서 뒤집기) ──
function WordTab() {
  const [flipped, setFlipped] = useState({})
  return (
    <Row xs={2} md={3} lg={4} className="g-3">
      {JEJU_WORDS.map((w) => (
        <Col key={w.jeju}>
          <div className={`word-card ${flipped[w.jeju] ? 'flip' : ''}`} onClick={() => setFlipped((p) => ({ ...p, [w.jeju]: !p[w.jeju] }))} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFlipped((p) => ({ ...p, [w.jeju]: !p[w.jeju] }))}>
            <div className="inner">
              <div className="face front"><div style={{ fontSize: '1.8rem' }}>{w.emoji}</div><div className="display-font fs-5">{w.jeju}</div><div className="small text-muted">눌러서 뜻 보기</div></div>
              <div className="face back"><div className="fw-bold fs-5">{w.ko}</div><div className="small mt-1">{w.tip}</div></div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  )
}

export default function Kids() {
  return (
    <>
      <PageTitle icon="balloon-heart" title="아이와 함께" sub="놀이 속에서 제주 문화를 배워요 — 할망 이야기 · 미션 · 제주어" />
      <AgePicker />
      <Tabs defaultActiveKey="story" className="mb-3" fill>
        <Tab eventKey="story" title="🐚 할망 이야기"><StoryTab /></Tab>
        <Tab eventKey="mission" title="⭐ 미션 카드"><MissionTab /></Tab>
        <Tab eventKey="word" title="💬 제주어 카드"><WordTab /></Tab>
      </Tabs>
    </>
  )
}
