import { useState } from 'react'
import { Button, ButtonGroup, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { ScorePill } from '../components/ScoreBars'
import { Empty } from '../components/Status'
import { IslandScene } from '../scene/JejuScene'
import ReviewModal from '../components/ReviewModal'
import Stars from '../components/Stars'
import { useAppStore } from '../store/useAppStore'

// 여행 일수는 사람마다 달라서 직접 늘리고 줄인다 (이 기기에 기억). day 0 = "아직 안 정했어요"
const KEY = 'halmang-trip-days'
const MAX_DAYS = 30
const loadDays = () => { try { return Math.min(MAX_DAYS, Math.max(1, Number(localStorage.getItem(KEY)) || 2)) } catch { return 2 } }
const tripLabel = (n) => (n <= 1 ? '당일치기' : `${n - 1}박 ${n}일`)

function BasketItem({ b, dayList, update, remove }) {
  return (
    <div className="soft-card p-3 mb-2" draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(b.id)); e.dataTransfer.effectAllowed = 'move' }} style={{ cursor: 'grab' }}>
      <div className="d-flex align-items-start gap-2">
        <i className="bi bi-grip-vertical text-muted d-none d-md-inline mt-1" title="끌어서 다른 일차로 옮겨요" />
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-bold">{b.title} {b.score != null && <ScorePill score={b.score} />}</div>
          <div className="small text-muted text-truncate">{b.addr}</div>
        </div>
        <Form.Select size="sm" className="d-lg-none" style={{ width: 'auto' }} value={b.day} onChange={(e) => update(b.id, { day: Number(e.target.value) })} aria-label="일차 이동">
          <option value={0}>미정</option>
          {dayList.map((x) => <option key={x} value={x}>{x}일차</option>)}
        </Form.Select>
        <Button size="sm" variant="outline-danger" onClick={() => remove(b.id)} aria-label="삭제"><i className="bi bi-trash" /></Button>
      </div>
      <Form.Control size="sm" className="mt-2" placeholder="메모 (예: 오전 10시, 간식 챙기기)" defaultValue={b.memo}
        onBlur={(e) => e.target.value !== b.memo && update(b.id, { memo: e.target.value })} />
    </div>
  )
}

// 일차 아래의 후기 칸: 쓴 후기가 있으면 미리 보여 주고, 없으면 쓰기 버튼
function DayReview({ day, count, review, onOpen }) {
  if (review) {
    return (
      <div className="soft-card p-2 px-3 small d-flex align-items-center gap-2" style={{ background: 'var(--hm-orange-soft)' }}>
        <Stars value={review.rating} /><div className="flex-grow-1 text-truncate">{review.title || review.body}</div>
        <Button size="sm" variant="link" className="p-0" onClick={() => onOpen(review)}>후기 수정</Button>
      </div>
    )
  }
  if (!count) return null
  return <Button size="sm" variant="outline-primary" onClick={() => onOpen(undefined)}><i className="bi bi-pencil-square me-1" />{day}일차 후기 쓰기</Button>
}

export default function Basket() {
  const basket = useAppStore((s) => s.basket)
  const update = useAppStore((s) => s.updateBasketItem)
  const remove = useAppStore((s) => s.removeFromBasket)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const reviews = useAppStore((s) => s.reviews)
  const nav = useNavigate()
  const [reviewing, setReviewing] = useState(null) // { day, review? } 후기 창
  const [days, setDaysRaw] = useState(loadDays)
  const [over, setOver] = useState(null) // 끌어서 올려 둔 칸 (일차 번호, 0 = 미정)

  const total = Math.max(1, days, ...basket.map((b) => b.day))
  const dayList = Array.from({ length: total }, (_, i) => i + 1)
  const unplaced = basket.filter((b) => b.day < 1)
  const spots = basket.filter((b) => b.lat && b.lng).map((b) => ({ id: b.content_id, title: b.title, lat: b.lat, lng: b.lng, scores: { total: b.score ?? 0 } }))

  function setDays(n) {
    const v = Math.min(MAX_DAYS, Math.max(1, n))
    setDaysRaw(v)
    try { localStorage.setItem(KEY, String(v)) } catch { /* 저장 실패는 무시 */ }
  }

  // 일차 삭제: 그 날 장소는 앞 일차(1일차면 '미정')로 옮기고, 뒤 일차는 한 칸씩 당긴다
  async function removeDay(d) {
    const here = basket.filter((b) => b.day === d)
    if (here.length && !window.confirm(`${d}일차에 담은 ${here.length}곳은 ${d > 1 ? `${d - 1}일차` : '"아직 안 정했어요"'}로 옮겨져요. 삭제할까요?`)) return
    await Promise.all(basket.filter((b) => b.day >= d).map((b) => update(b.id, { day: b.day === d ? Math.max(0, d - 1) : b.day - 1 })))
    setDays(total - 1)
  }

  const dropOn = (day) => (e) => {
    e.preventDefault(); setOver(null)
    const item = basket.find((b) => b.id === Number(e.dataTransfer.getData('text/plain')))
    if (item && item.day !== day) update(item.id, { day })
  }
  const zone = (day) => ({
    onDragOver: (e) => { e.preventDefault(); setOver(day) },
    onDragLeave: () => setOver((o) => (o === day ? null : o)),
    onDrop: dropOn(day),
    className: `rounded-4 p-2 ${over === day ? 'border border-2 border-primary bg-white' : 'border border-2 border-transparent'}`,
    style: { minHeight: 64 },
  })

  function askCheck() {
    const lines = dayList.map((d) => `${d}일차: ${basket.filter((b) => b.day === d).map((b) => b.title).join(', ') || '(비어 있음)'}`)
    if (unplaced.length) lines.push(`아직 일차 미정: ${unplaced.map((b) => b.title).join(', ')}`)
    sendMessage(`우리 가족 ${tripLabel(total)} 여행 일정을 점검해 줘. 날씨와 접근성을 확인하고 무리한 곳이 있으면 알려줘.\n${lines.join('\n')}`)
    nav('/halmang')
  }

  return (
    <>
      <PageTitle icon="calendar2-check" title="여행 일정" sub="담은 곳을 끌어서(터치 화면은 선택 메뉴로) 원하는 일차로 옮겨요">
        <div className="d-flex align-items-center gap-2">
          <ButtonGroup size="sm">
            <Button variant="outline-primary" onClick={() => removeDay(total)} disabled={total <= 1} aria-label="마지막 일차 삭제"><i className="bi bi-dash-lg" /></Button>
            <Button variant="light" disabled className="fw-bold px-3 text-dark">{tripLabel(total)}</Button>
            <Button variant="outline-primary" onClick={() => setDays(total + 1)} disabled={total >= MAX_DAYS} aria-label="일차 추가"><i className="bi bi-plus-lg" /></Button>
          </ButtonGroup>
        </div>
      </PageTitle>

      {basket.length === 0 ? (
        <Empty icon="calendar2-check" text={<>아직 담은 곳이 없어요. <Link to="/explore">여행지 찾으러 가기</Link></>} />
      ) : (
        <>
          {/* 지도는 맨 위, 담은 곳(일차별)은 지도 아래에 가로로 나란히 */}
          <div className="mb-4"><IslandScene spots={spots} height={360} /></div>

          <div className="basket-days">
            <div {...zone(0)}>
              <h5 className="mb-2"><span className="chip me-2"><i className="bi bi-inbox" />아직 안 정했어요</span><small className="text-muted fs-6">{unplaced.length}곳</small></h5>
              {unplaced.length === 0 && <div className="small text-muted ps-1">여기에 두면 나중에 일차를 정할 수 있어요.</div>}
              {unplaced.map((b) => <BasketItem key={b.id} b={b} dayList={dayList} update={update} remove={remove} />)}
            </div>

            {dayList.map((d) => {
              const items = basket.filter((b) => b.day === d)
              return (
                <div key={d} {...zone(d)}>
                  <h4 className="mb-2 d-flex align-items-center">
                    <span className="chip me-2">{d}일차</span><small className="text-muted fs-6">{items.length}곳</small>
                    {total > 1 && <Button size="sm" variant="link" className="ms-auto text-muted" onClick={() => removeDay(d)}><i className="bi bi-x-circle me-1" />이 일차 삭제</Button>}
                  </h4>
                  {items.length === 0 && <div className="small text-muted ps-1">비어 있어요. 장소를 끌어다 놓거나, 다른 일차에서 옮겨 보세요.</div>}
                  {items.map((b) => <BasketItem key={b.id} b={b} dayList={dayList} update={update} remove={remove} />)}
                  <DayReview day={d} count={items.length} review={reviews.find((r) => r.day === d)} onOpen={(review) => setReviewing({ day: d, review })} />
                </div>
              )
            })}
          </div>

          <div className="d-flex flex-wrap gap-2 mt-2">
            <Button variant="outline-secondary" onClick={() => setDays(total + 1)} disabled={total >= MAX_DAYS}><i className="bi bi-plus-circle me-1" />{total + 1}일차 추가</Button>
            <Button variant="outline-primary" onClick={askCheck}><i className="bi bi-chat-heart me-1" />할망에게 일정 점검 부탁하기</Button>
          </div>
        </>
      )}
      {reviewing && (
        <ReviewModal key={`${reviewing.day}-${reviewing.review?.id ?? 'new'}`} day={reviewing.day} review={reviewing.review} onHide={() => setReviewing(null)}
          route={basket.filter((b) => b.day === reviewing.day).map((b) => ({ id: b.content_id, title: b.title }))} />
      )}
    </>
  )
}
