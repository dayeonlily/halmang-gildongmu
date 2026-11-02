import { useState } from 'react'
import { Button, Modal, ProgressBar } from 'react-bootstrap'
import Stamp from './Stamp'
import { ERAS, HISTORY_COURSES, HISTORY_TABS, eraOf, nextTitle, stampIdOf, titleFor } from '../../shared/history'

// 도장첩: 모은 도장은 시대 색으로 선명하게, 아직 안 모은 도장은 흐리게 보여 준다.
export default function StampBook({ stamps, onHide, onPick }) {
  const [onlyMine, setOnlyMine] = useState(false)
  const all = HISTORY_TABS.flatMap((t) => HISTORY_COURSES[t.key].map((c) => ({ ...c, tab: t.key })))
  const has = (c) => stamps.includes(stampIdOf(c))
  const mine = all.filter(has)
  const now = titleFor(mine.length), next = nextTitle(mine.length)

  return (
    <Modal show onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton><Modal.Title className="display-font fs-4"><i className="bi bi-journal-bookmark-fill me-2 text-primary" />내 도장첩</Modal.Title></Modal.Header>
      <Modal.Body>
        {/* 요약: 칭호와 진행도 */}
        <div className="soft-card p-3 mb-3 text-center" style={{ background: 'var(--hm-orange-soft)' }}>
          <div style={{ fontSize: '2.2rem' }}>{now.emoji}</div>
          <div className="display-font fs-4">{now.label}</div>
          <div className="small text-muted mb-2">모은 도장 <b>{mine.length}</b> / {all.length}개</div>
          <ProgressBar now={(mine.length / all.length) * 100} style={{ height: 10 }} />
          <div className="small text-muted mt-2">{next ? `도장 ${next.min - mine.length}개를 더 모으면 “${next.emoji} ${next.label}” 칭호를 얻어요` : '모든 도장을 모았어요! 최고의 칭호예요 🎉'}</div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="small text-muted">시대별로 모아 둔 도장이에요</div>
          <Button size="sm" variant={onlyMine ? 'primary' : 'outline-secondary'} className="rounded-pill" onClick={() => setOnlyMine(!onlyMine)}>
            <i className={`bi bi-${onlyMine ? 'check2-square' : 'square'} me-1`} />모은 것만
          </Button>
        </div>

        {mine.length === 0 && onlyMine && <div className="text-center text-muted py-4"><i className="bi bi-stamp fs-1 d-block mb-1" />아직 모은 도장이 없어요. 첫 도장을 찍어 볼까요?</div>}

        {ERAS.map((e) => {
          const items = all.filter((c) => c.era === e.key && (!onlyMine || has(c)))
          if (!items.length) return null
          const got = all.filter((c) => c.era === e.key && has(c)).length
          return (
            <div key={e.key} className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="era-tag" style={{ background: e.color }}>{e.emoji} {e.label}</span>
                <span className="small text-muted">{got} / {all.filter((c) => c.era === e.key).length}</span>
              </div>
              <div className="stamp-grid">
                {items.map((c) => (
                  <button type="button" key={c.id} className={`stamp-tile ${has(c) ? 'got' : ''}`} style={{ '--era': eraOf(c.era).color }} onClick={() => onPick(c)}
                    aria-label={`${c.place} ${has(c) ? '도장 찍음' : '아직 안 찍음'}`}>
                    {has(c) ? <span className="stamp-face"><Stamp tab={c.tab} c={c} era={eraOf(c.era)} size={64} /></span> : <span className={`stamp-circle ${c.tab === 'upper' ? 'sq' : ''}`}><i className="bi bi-question-lg" /></span>}
                    <span className="stamp-name">{has(c) ? c.theme.name : '???'}</span>
                    <span className="stamp-place">{c.place}</span>
                    <span className="stamp-age">{HISTORY_TABS.find((t) => t.key === c.tab).short.split(' ')[0]}</span>
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
