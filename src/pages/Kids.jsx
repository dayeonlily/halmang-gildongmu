import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Col, ProgressBar, Row } from 'react-bootstrap'
import LearnTabs from '../components/LearnTabs'
import PageTitle from '../components/PageTitle'
import StoryArt from '../components/StoryArt'
import { Empty } from '../components/Status'
import HalmangMascot from '../components/art/Mascot'
import { AGE_BANDS, MISSION_KINDS, STORIES, missionsFor, wordsFor } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const ageIndex = (k) => AGE_BANDS.findIndex((a) => a.key === k)
const ageLabel = (k) => AGE_BANDS.find((a) => a.key === k)?.label ?? ''

// 1단계: 우리 아이 나이 — 나이에 맞는 이야기·미션·제주어를 보여 준다
function AgePicker() {
  const ageBand = useAppStore((s) => s.ageBand)
  const setAgeBand = useAppStore((s) => s.setAgeBand)
  return (
    <div className="kids-step">
      <div className="kids-step-title"><span className="kids-no">1</span>우리 아이는 몇 살이에요?<span className="kids-step-sub">나이에 맞는 내용으로 보여 드려요</span></div>
      <div className="kids-age" role="group" aria-label="아이 나이">
        {AGE_BANDS.map((a) => (
          <button type="button" key={a.key} className={`kids-age-btn ${ageBand === a.key ? 'on' : ''}`} onClick={() => setAgeBand(a.key)} aria-pressed={ageBand === a.key}>
            <i className={`bi bi-${a.icon}`} /><b>{a.short}</b><small>{a.label.match(/\(.*\)/)?.[0] ?? ''}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── 이야기: 한 줄마다 그림이 바뀌고, 큰 글씨로 읽기 쉽게, 할망이 음성(TTS)으로 읽어 줌 ──
const SHORT_NAME = { seolmundae: '설문대할망', ohbaek: '오백 장군', haenyeo: '해녀 할망', hareubang: '돌하르방', yeongdeung: '영등할망' }
const FS_KEY = 'halmang-story-fs'
const FONT_SIZES = [['보통', 1.3], ['크게', 1.6], ['아주 크게', 2]]
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
  const idx = STORIES.findIndex((s) => s.id === id)
  const goStory = (d) => pick(STORIES[(idx + d + STORIES.length) % STORIES.length].id) // 이야기 목록을 돌아가며

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
      {/* 넓은 화면: 그림은 왼쪽, 글과 버튼은 오른쪽 → 스크롤 없이 한 화면에서 읽는다. 좁은 화면: 그림 위, 글 아래 */}
      <div className="story-layout">
        <div className="story-art-box">
          <StoryArt storyId={story.id} index={i} label={`${story.title} ${i + 1}번째 장면`} />
          {/* 이야기 고르기: 그림 바로 아래 버튼 5개 (옆으로 밀 필요 없이 한눈에) */}
          <div className="story-pick" role="tablist" aria-label="이야기 고르기">
            {STORIES.map((x) => (
              <button type="button" key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? 'on' : ''} onClick={() => pick(x.id)}>
                <span>{x.emoji}</span><span>{SHORT_NAME[x.id] ?? x.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="story-side">
          <div className="story-head">
            <HalmangMascot pose="wave" speaking={speaking} className="story-mascot" />
            <div>
              <h3 className="story-title">{story.emoji} {story.title}</h3>
              <div className="story-place"><i className="bi bi-geo-alt me-1" />{story.place}</div>
            </div>
          </div>

          {tooYoung && <div className="alert alert-warning py-2 mb-2">{AGE_BANDS[ageIndex(story.minAge)].short} 이상에게 더 어울리는 이야기예요. 짧게 줄여서 들려주세요.</div>}
          <div className="story-caption">
            {note
              ? <div className="story-note"><i className="bi bi-person-heart me-2" /><b>보호자님께</b> {note[1]}</div>
              : <p className="story-text" style={{ fontSize: `${FONT_SIZES[fs][1]}rem` }}>{line}</p>}
          </div>

          <div className="story-size" role="group" aria-label="글자 크기">
            <span>글씨 크기</span>
            {FONT_SIZES.map(([label], n) => (
              <button type="button" key={label} className={fs === n ? 'on' : ''} onClick={() => pickSize(n)} aria-pressed={fs === n}>{label}</button>
            ))}
          </div>

          {/* 진행 점: 눌러서 그 장면으로 */}
          <div className="story-dots my-3" role="group" aria-label="장면 이동">
            {story.lines.map((_, n) => <button type="button" key={n} className={n === i ? 'on' : n < i ? 'done' : ''} onClick={() => go(n)} aria-label={`${n + 1}번째 장면`} />)}
            <span className="story-count">{i + 1} / {story.lines.length}</span>
          </div>

          {/* 큰 버튼 */}
          <div className="story-controls">
            <Button size="lg" variant="outline-secondary" disabled={i === 0} onClick={() => go(i - 1)}><i className="bi bi-chevron-left me-1" />이전</Button>
            {canSpeak && <Button size="lg" variant={speaking ? 'danger' : 'outline-primary'} onClick={speak}><i className={`bi bi-${speaking ? 'stop-fill' : 'volume-up-fill'} me-1`} />{speaking ? '멈추기' : '읽어주기'}</Button>}
            {last
              ? <Button size="lg" variant="success" onClick={() => goStory(1)}>다음 이야기<i className="bi bi-chevron-right ms-1" /></Button>
              : <Button size="lg" onClick={() => go(i + 1)}>다음<i className="bi bi-chevron-right ms-1" /></Button>}
          </div>
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
      <div className="kids-progress mb-2">
        <div className="flex-grow-1"><ProgressBar now={all.length ? (done / all.length) * 100 : 0} style={{ height: 16 }} /></div>
        <b>{done} / {all.length}</b>{done === all.length && all.length > 0 && <span>🏅 모두 완료!</span>}
      </div>
      <div className="kids-hint mb-3">{ageLabel(ageBand)} 미션 {all.length}개 — 하고 싶은 것부터 골라 보세요</div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button type="button" className={`kids-kind ${kind === 'all' ? 'on' : ''}`} onClick={() => setKind('all')}>전체 {all.length}</button>
        {kinds.map((k) => (
          <button type="button" key={k.key} className={`kids-kind ${kind === k.key ? 'on' : ''}`} onClick={() => setKind(k.key)}>
            <i className={`bi bi-${k.icon} me-1`} />{k.label} {all.filter((m) => m.kind === k.key).length}
          </button>
        ))}
      </div>
      {list.length === 0 ? <Empty icon="emoji-smile" text="이 종류의 미션은 아직 없어요" /> : (
        <Row xs={1} md={2} className="g-3">
          {list.map((m) => {
            const isDone = stamps.includes(m.id)
            return (
              <Col key={m.id}>
                <div className={`mission-card ${isDone ? 'done' : ''}`}>
                  <div className="mission-stamp">{m.stamp}</div>
                  <div className="mission-body">
                    <div className="mission-kind"><i className={`bi bi-${kindOf(m.kind)?.icon} me-1`} />{kindOf(m.kind)?.label}</div>
                    <div className="mission-title">{m.title}</div>
                    <div className="mission-text">{m.text}</div>
                  </div>
                  <Button className="mission-btn" variant={isDone ? 'success' : 'outline-primary'} onClick={() => toggleStamp(m.id)} aria-pressed={isDone}>
                    <i className={`bi bi-${isDone ? 'check-circle-fill' : 'circle'} me-1`} />{isDone ? '했어요!' : '해냈어요'}
                  </Button>
                </div>
              </Col>
            )
          })}
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
      <div className="kids-hint mb-3">{ageLabel(ageBand)}에게 어울리는 제주어 {words.length}장 — 카드를 눌러 뜻을 확인해요</div>
      <Row xs={1} sm={2} lg={4} className="g-3">
        {words.map((w) => (
          <Col key={w.jeju}>
            <div className={`word-card ${flipped[w.jeju] ? 'flip' : ''}`} onClick={() => toggle(w.jeju)} role="button" tabIndex={0} aria-pressed={!!flipped[w.jeju]} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle(w.jeju)}>
              <div className="inner">
                <div className="face front"><div className="word-emoji">{w.emoji}</div><div className="word-jeju">{w.jeju}</div><div className="word-hint"><i className="bi bi-hand-index me-1" />눌러서 뜻 보기</div></div>
                <div className="face back"><div className="word-ko">{w.ko}</div><div className="word-tip">{w.tip}</div></div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <p className="kids-hint mt-3 mb-0"><i className="bi bi-info-circle me-1" />제주어는 마을과 세대에 따라 표기·발음이 조금씩 달라요. 제주 어르신께 직접 들어 보면 더 좋아요.</p>
    </>
  )
}

const PANELS = [['story', '🐚', '할망 이야기', '그림과 함께 듣는 옛이야기'], ['mission', '⭐', '미션 카드', '해보고 도장 찍기'], ['word', '💬', '제주어 카드', '뒤집어서 뜻 맞히기']]

export default function Kids() {
  const ageBand = useAppStore((s) => s.ageBand)
  const [panel, setPanel] = useState('story')
  return (
    <>
      <LearnTabs />
      <PageTitle icon="balloon-heart" title="문화 배우기" sub="아이와 함께 놀며 제주 문화를 배워요 — 할망 이야기 · 미션 · 제주어" />
      {/* 넓은 화면에서는 1·2단계를 나란히 놓아 이야기가 한 화면에 들어오게 */}
      <div className="kids-steps mb-3">
      <AgePicker />

      {/* 2단계: 무엇을 할까요 */}
      <div className="kids-step">
        <div className="kids-step-title"><span className="kids-no">2</span>무엇을 해 볼까요?</div>
        <div className="kids-panels" role="tablist" aria-label="문화 배우기 메뉴">
          {PANELS.map(([key, emoji, name, desc]) => (
            <button type="button" key={key} role="tab" aria-selected={panel === key} className={`kids-panel-btn ${panel === key ? 'on' : ''}`} onClick={() => setPanel(key)}>
              <span className="kids-panel-emoji">{emoji}</span><b>{name}</b><small>{desc}</small>
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* 세 화면 모두 계속 띄워 두고 숨기기만 한다 → 탭을 옮겨도 읽던 이야기 위치가 그대로 */}
      <div className={panel === 'story' ? '' : 'd-none'}><StoryTab /></div>
      {/* 연령을 바꾸면 그 연령의 카드로 새로 시작 */}
      <div className={panel === 'mission' ? '' : 'd-none'}><MissionTab key={ageBand} /></div>
      <div className={panel === 'word' ? '' : 'd-none'}><WordTab key={ageBand} /></div>
    </>
  )
}
