import { useState } from 'react'
import { Button, Modal, ProgressBar } from 'react-bootstrap'
import Stamp from './Stamp'
import { ERAS, HISTORY_COURSES, HISTORY_TABS, eraOf, nextTitle, stampIdOf, titleFor } from '../../shared/history'

// 도장첩: 학년(미취학~저학년 / 고학년)별로 나눠서 보여 준다.
// 모은 도장은 시대 색으로 선명하게, 아직 안 모은 도장은 흐리게. 칭호와 진행도도 학년별로 센다.
export default function StampBook({ stamps, onHide, onPick, initialTab = 'young' }) {
  const [tab, setTab] = useState(initialTab)
  const [onlyMine, setOnlyMine] = useState(false)
  const has = (c) => stamps.includes(stampIdOf(c))
  const countOf = (key) => HISTORY_COURSES[key].filter(has).length

  const info = HISTORY_TABS.find((t) => t.key === tab)
  const courses = HISTORY_COURSES[tab].map((c) => ({ ...c, tab }))
  const gotCount = countOf(tab)
  const now = titleFor(gotCount, tab), next = nextTitle(gotCount, tab)

  return (
    <Modal show onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton><Modal.Title className="display-font fs-4"><i className="bi bi-journal-bookmark-fill me-2 text-primary" />내 도장첩</Modal.Title></Modal.Header>
      <Modal.Body>
        {/* 학년 고르기: 칸마다 그 학년에서 모은 도장 수 */}
        <div className="book-tabs mb-3" role="tablist" aria-label="학년">
          {HISTORY_TABS.map((t) => (
            <button type="button" key={t.key} role="tab" aria-selected={tab === t.key} className={`book-tab ${tab === t.key ? 'on' : ''}`} onClick={() => setTab(t.key)}>
              <span className="book-tab-name">{t.short}</span>
              <span className="book-tab-count">{countOf(t.key)} / {HISTORY_COURSES[t.key].length}</span>
            </button>
          ))}
        </div>

        {/* 요약: 이 학년의 칭호와 진행도 */}
        <div className="soft-card p-3 mb-3 text-center" style={{ background: 'var(--hm-orange-soft)' }}>
          <div style={{ fontSize: '2.2rem' }}>{now.emoji}</div>
          <div className="display-font fs-4">{now.label}</div>
          <div className="small text-muted mb-2">{info.label} 도장 <b>{gotCount}</b> / {courses.length}개</div>
          <ProgressBar now={(gotCount / courses.length) * 100} style={{ height: 10 }} />
          <div className="small text-muted mt-2">{next ? `도장 ${next.min - gotCount}개를 더 모으면 “${next.emoji} ${next.label}” 칭호를 얻어요` : '이 학년 도장을 모두 모았어요! 최고의 칭호예요 🎉'}</div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="small text-muted">시대별로 모아 둔 도장이에요</div>
          <Button size="sm" variant={onlyMine ? 'primary' : 'outline-secondary'} className="rounded-pill" onClick={() => setOnlyMine(!onlyMine)}>
            <i className={`bi bi-${onlyMine ? 'check2-square' : 'square'} me-1`} />모은 것만
          </Button>
        </div>

        {gotCount === 0 && onlyMine && <div className="text-center text-muted py-4"><i className="bi bi-stamp fs-1 d-block mb-1" />이 학년에서는 아직 모은 도장이 없어요. 첫 도장을 찍어 볼까요?</div>}

        {ERAS.map((e) => {
          const inEra = courses.filter((c) => c.era === e.key)
          const items = inEra.filter((c) => !onlyMine || has(c))
          if (!items.length) return null
          return (
            <div key={e.key} className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="era-tag" style={{ background: e.color }}>{e.emoji} {e.label}</span>
                <span className="small text-muted">{inEra.filter(has).length} / {inEra.length}</span>
              </div>
              <div className="stamp-grid">
                {items.map((c) => (
                  <button type="button" key={c.id} className={`stamp-tile ${has(c) ? 'got' : ''}`} style={{ '--era': eraOf(c.era).color }} onClick={() => onPick(c)}
                    aria-label={`${c.place} ${has(c) ? '도장 찍음' : '아직 안 찍음'}`}>
                    {has(c) ? <span className="stamp-face"><Stamp tab={tab} c={c} era={eraOf(c.era)} size={64} /></span> : <span className={`stamp-circle ${tab === 'upper' ? 'sq' : ''}`}><i className="bi bi-question-lg" /></span>}
                    <span className="stamp-name">{has(c) ? c.theme.name : '???'}</span>
                    <span className="stamp-place">{c.place}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Modal.Body>
      <Modal.Footer><Button variant="outline-secondary" onClick={onHide}>닫기</Button></Modal.Footer>
    </Modal>
  )
}
