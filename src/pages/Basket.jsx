import { useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { ScorePill } from '../components/ScoreBars'
import { Empty } from '../components/Status'
import { IslandScene } from '../scene/JejuScene'
import { useAppStore } from '../store/useAppStore'

export default function Basket() {
  const basket = useAppStore((s) => s.basket)
  const update = useAppStore((s) => s.updateBasketItem)
  const remove = useAppStore((s) => s.removeFromBasket)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const nav = useNavigate()
  const [days, setDays] = useState(2)
  const dayList = Array.from({ length: Math.max(days, ...basket.map((b) => b.day)) }, (_, i) => i + 1)

  const spots = basket.filter((b) => b.lat && b.lng).map((b) => ({ id: b.content_id, title: b.title, lat: b.lat, lng: b.lng, scores: { total: b.score ?? 0 } }))

  function askCheck() {
    const plan = dayList.map((d) => `${d}일차: ${basket.filter((b) => b.day === d).map((b) => b.title).join(', ') || '(비어 있음)'}`).join('\n')
    sendMessage(`우리 가족 여행 일정을 점검해 줘. 날씨와 접근성을 확인하고 무리한 곳이 있으면 알려줘.\n${plan}`)
    nav('/halmang')
  }

  return (
    <>
      <PageTitle icon="basket2" title="여행 바구니" sub="담은 곳을 날짜별로 나눠 우리 가족 일정을 만들어요">
        <Form.Select size="sm" style={{ width: 'auto' }} value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="여행 일수">
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}일 일정</option>)}
        </Form.Select>
      </PageTitle>

      {basket.length === 0 ? (
        <Empty icon="basket2" text={<>아직 담은 곳이 없어요. <Link to="/explore">길동무 찾으러 가기</Link></>} />
      ) : (
        <Row className="g-4">
          <Col lg={7}>
            {dayList.map((d) => {
              const items = basket.filter((b) => b.day === d)
              return (
                <div key={d} className="mb-4">
                  <h4 className="mb-2"><span className="chip me-2">{d}일차</span><small className="text-muted fs-6">{items.length}곳</small></h4>
                  {items.length === 0 && <div className="small text-muted ps-1">비어 있어요. 다른 날에서 옮겨 보세요.</div>}
                  {items.map((b) => (
                    <div key={b.id} className="soft-card p-3 mb-2">
                      <div className="d-flex align-items-start gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-bold">{b.title} {b.score != null && <ScorePill score={b.score} />}</div>
                          <div className="small text-muted">{b.addr}</div>
                        </div>
                        <Form.Select size="sm" style={{ width: 'auto' }} value={b.day} onChange={(e) => update(b.id, { day: Number(e.target.value) })} aria-label="날짜 이동">
                          {dayList.map((x) => <option key={x} value={x}>{x}일차</option>)}
                        </Form.Select>
                        <Button size="sm" variant="outline-danger" onClick={() => remove(b.id)} aria-label="삭제"><i className="bi bi-trash" /></Button>
                      </div>
                      <Form.Control size="sm" className="mt-2" placeholder="메모 (예: 오전 10시, 간식 챙기기)" defaultValue={b.memo}
                        onBlur={(e) => e.target.value !== b.memo && update(b.id, { memo: e.target.value })} />
                    </div>
                  ))}
                </div>
              )
            })}
            <Button variant="outline-primary" onClick={askCheck}><i className="bi bi-chat-heart me-1" />할망에게 일정 점검 부탁하기</Button>
          </Col>
          <Col lg={5}><div style={{ position: 'sticky', top: '1.2rem' }}><IslandScene spots={spots} height={380} /></div></Col>
        </Row>
      )}
    </>
  )
}
