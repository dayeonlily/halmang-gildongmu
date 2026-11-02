import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Col, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import StoryArt from '../components/StoryArt'
import { Empty } from '../components/Status'
import HalmangMascot from '../components/art/Mascot'
import { AGE_BANDS, MISSION_KINDS, STORIES, missionsFor, wordsFor } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const ageIndex = (k) => AGE_BANDS.findIndex((a) => a.key === k)
const ageLabel = (k) => AGE_BANDS.find((a) => a.key === k)?.label ?? ''

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

// ── 이야기: 한 줄마다 그림이 바뀌고, 큰 글씨로 읽기 쉽게, 할망이 음성(TTS)으로 읽어 줌 ──
const FS_KEY = 'halmang-story-fs'
const FONT_SIZES = [['보통', 1.15], ['크게', 1.4], ['아주 크게', 1.7]]
const readFs = () => { try { const v = Number(localStorage.getItem(FS_KEY)); return v >= 0 && v < 3 ? v : 1 } catch { return 1 } }
const NOTE = /^\(보호자님께:\s*(.*)\)$/

function StoryTab() {
  const ageBand = useAppStore((s) => s.ageBand)
  const [params] = useSearchParams()
  const [id, setId] = useState(STORIES.some((x) => x.id === params.get('story')) ? params.get('story') : STORIES[0].id) // 장소 상세에서 넘어온 이야기
  const [i, setI] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [fs, setFs] = useState(readFs) // 글자 크기 단계
  const story = STORIES.find((s) => s.id === id)
  const tooYoung = ageIndex(ageBand) < ageIndex(story.minAge)
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
  const line = story.lines[i]
  const note = NOTE.exec(line)
  const last = i === story.lines.length - 1

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false) }
  const go = (n) => { stop(); setI(Math.min(story.lines.length - 1, Math.max(0, n))) }
  function pick(sid) { stop(); setId(sid); setI(0) }
  function pickSize(n) { setFs(n); try { localStorage.setItem(FS_KEY, String(n)) } catch { /* 저장 실패는 무시 */ } }
  function speak() {
    const synth = window.speechSynthesis
    if (speaking) return stop()
    const u = new SpeechSynthesisUtterance(note ? note[1] : line)
    u.lang = 'ko-KR'; u.rate = 0.85; u.pitch = 0.9
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false)
    setSpeaking(true); synth.speak(u)
  }

  return (
    <>
      {/* 이야기 고르기: 가로로 밀어 보는 큰 버튼 */}
      <div className="story-picker mb-3" role="tablist" aria-label="이야기 고르기">
        {STORIES.map((s) => (
          <button type="button" key={s.id} className={`story-chip ${s.id === id ? 'on' : ''}`} onClick={() => pick(s.id)}>
            <span className="fs-4">{s.emoji}</span><span>{s.title}</span>
          </button>
        ))}
      </div>

      <div className="soft-card p-3">
        <StoryArt storyId={story.id} index={i} label={`${story.title} ${i + 1}번째 장면`} />

        {/* 자막: 큰 글씨 + 말하는 할망 */}
        <div className="story-caption mt-3">
          <HalmangMascot pose="wave" speaking={speaking} className="story-mascot d-none d-md-block" />
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <h3 className="m-0 fs-5">{story.emoji} {story.title}</h3>
              <Badge bg="light" text="dark" className="border"><i className="bi bi-geo-alt me-1" />{story.place}</Badge>
              <div className="ms-auto d-flex align-items-center gap-1" role="group" aria-label="글자 크기">
                <span className="small text-muted me-1">글씨</span>
                {FONT_SIZES.map(([label], n) => (
                  <Button key={label} size="sm" variant={fs === n ? 'primary' : 'outline-secondary'} className="rounded-pill px-2" onClick={() => pickSize(n)}>{label}</Button>
                ))}
              </div>
            </div>
            {tooYoung && <div className="alert alert-warning py-2 small mb-2">{AGE_BANDS[ageIndex(story.minAge)].short} 이상에게 더 어울리는 이야기예요. 짧게 줄여서 들려주세요.</div>}
            {note
              ? <div className="story-note"><i className="bi bi-person-heart me-2" /><b>보호자님께</b> {note[1]}</div>
              : <p className="story-text" style={{ fontSize: `${FONT_SIZES[fs][1]}rem` }}>{line}</p>}
          </div>
        </div>

        {/* 진행 점: 눌러서 그 장면으로 */}
        <div className="story-dots my-3" role="group" aria-label="장면 이동">
          {story.lines.map((_, n) => <button type="button" key={n} className={n === i ? 'on' : n < i ? 'done' : ''} onClick={() => go(n)} aria-label={`${n + 1}번째 장면`} />)}
          <span className="small text-muted ms-2">{i + 1} / {story.lines.length}</span>
        </div>

        {/* 큰 버튼 */}
        <div className="story-controls">
          <Button size="lg" variant="outline-secondary" disabled={i === 0} onClick={() => go(i - 1)}><i className="bi bi-chevron-left me-1" />이전</Button>
          {canSpeak && <Button size="lg" variant={speaking ? 'danger' : 'outline-primary'} onClick={speak}><i className={`bi bi-${speaking ? 'stop-fill' : 'volume-up-fill'} me-1`} />{speaking ? '멈추기' : '읽어주기'}</Button>}
          {last
            ? <Button size="lg" variant="success" onClick={() => go(0)}><i className="bi bi-arrow-repeat me-1" />처음부터 다시</Button>
            : <Button size="lg" onClick={() => go(i + 1)}>다음<i className="bi bi-chevron-right ms-1" /></Button>}
        </div>
      </div>
    </>
  )
}

// ── 연령별 미션 카드 + 스탬프 (종류별로 골라 보기) ──
function MissionTab() {
  const ageBand = useAppStore((s) => s.ageBand)
  const stamps = useAppStore((s) => s.stamps)
  const toggleStamp = useAppStore((s) => s.toggleStamp)
  const [kind, setKind] = useState('all')
  const all = missionsFor(ageBand)
  const list = kind === 'all' ? all : all.filter((m) => m.kind === kind)
  const done = all.filter((m) => stamps.includes(m.id)).length
  const kinds = MISSION_KINDS.filter((k) => all.some((m) => m.kind === k.key))
  const kindOf = (key) => MISSION_KINDS.find((k) => k.key === key)

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-2">
        <div className="flex-grow-1"><ProgressBar now={all.length ? (done / all.length) * 100 : 0} style={{ height: 14 }} /></div>
        <b>{done} / {all.length}</b>{done === all.length && all.length > 0 && <span>🏅 모두 완료!</span>}
      </div>
      <div className="small text-muted mb-2">{ageLabel(ageBand)} 미션 {all.length}개 — 하고 싶은 것부터 골라 보세요</div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Button size="sm" className="rounded-pill" variant={kind === 'all' ? 'primary' : 'outline-secondary'} onClick={() => setKind('all')}>전체 {all.length}</Button>
        {kinds.map((k) => (
          <Button key={k.key} size="sm" className="rounded-pill" variant={kind === k.key ? 'primary' : 'outline-secondary'} onClick={() => setKind(k.key)}>
            <i className={`bi bi-${k.icon} me-1`} />{k.label} {all.filter((m) => m.kind === k.key).length}
          </Button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon="emoji-smile" text="이 종류의 미션은 아직 없어요" /> : (
        <Row xs={1} md={2} className="g-3">
          {list.map((m) => (
            <Col key={m.id}>
              <div className={`soft-card mission-card p-3 h-100 d-flex gap-3 align-items-center ${stamps.includes(m.id) ? 'done' : ''}`}>
                <div className="stamp">{m.stamp}</div>
                <div className="flex-grow-1">
                  <div className="fw-bold">{m.title} <Badge bg="light" text="dark" className="border fw-normal"><i className={`bi bi-${kindOf(m.kind)?.icon} me-1`} />{kindOf(m.kind)?.label}</Badge></div>
                  <div className="small text-muted">{m.text}</div>
                </div>
                <Button size="sm" variant={stamps.includes(m.id) ? 'success' : 'outline-primary'} onClick={() => toggleStamp(m.id)} aria-label="완료 표시">
                  <i className={`bi bi-${stamps.includes(m.id) ? 'check-lg' : 'circle'}`} />
                </Button>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </>
  )
}

// ── 제주어 카드: 연령에 맞는 낱말 8장 (눌러서 뒤집기) ──
function WordTab() {
  const ageBand = useAppStore((s) => s.ageBand)
  const [flipped, setFlipped] = useState({})
  const words = wordsFor(ageBand)
  const toggle = (k) => setFlipped((p) => ({ ...p, [k]: !p[k] }))
  return (
    <>
      <div className="small text-muted mb-3">{ageLabel(ageBand)}에게 어울리는 제주어 {words.length}장 — 카드를 눌러 뜻을 확인해요</div>
      <Row xs={2} md={3} lg={4} className="g-3">
        {words.map((w) => (
          <Col key={w.jeju}>
            <div className={`word-card ${flipped[w.jeju] ? 'flip' : ''}`} onClick={() => toggle(w.jeju)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggle(w.jeju)}>
              <div className="inner">
                <div className="face front"><div style={{ fontSize: '1.8rem' }}>{w.emoji}</div><div className="display-font fs-5">{w.jeju}</div><div className="small text-muted">눌러서 뜻 보기</div></div>
                <div className="face back"><div className="fw-bold fs-5">{w.ko}</div><div className="small mt-1">{w.tip}</div></div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <p className="small text-muted mt-3 mb-0"><i className="bi bi-info-circle me-1" />제주어는 마을과 세대에 따라 표기·발음이 조금씩 달라요. 제주 어르신께 직접 들어 보면 더 좋아요.</p>
    </>
  )
}

export default function Kids() {
  const ageBand = useAppStore((s) => s.ageBand)
  return (
    <>
      <PageTitle icon="balloon-heart" title="아이와 함께" sub="놀이 속에서 제주 문화를 배워요 — 할망 이야기 · 미션 · 제주어" />
      <AgePicker />
      <Tabs defaultActiveKey="story" className="mb-3" fill>
        <Tab eventKey="story" title="🐚 할망 이야기"><StoryTab /></Tab>
        {/* 연령을 바꾸면 그 연령의 카드로 새로 시작 */}
        <Tab eventKey="mission" title="⭐ 미션 카드"><MissionTab key={ageBand} /></Tab>
        <Tab eventKey="word" title="💬 제주어 카드"><WordTab key={ageBand} /></Tab>
      </Tabs>
    </>
  )
}
