import { useState } from 'react'
import { Badge, Button, Form, Modal } from 'react-bootstrap'
import Stars from './Stars'
import { useAppStore } from '../store/useAppStore'

// 일차별 후기 쓰기·고치기. route = 그날 돌아다닌 장소 [{id, title}] (후기와 함께 저장돼서 나중에 바구니가 바뀌어도 남는다)
export default function ReviewModal({ day, route, review, onHide }) {
  const saveReview = useAppStore((s) => s.saveReview)
  const deleteReview = useAppStore((s) => s.deleteReview)
  const [rating, setRating] = useState(review?.rating ?? 5)
  const [title, setTitle] = useState(review?.title ?? '')
  const [body, setBody] = useState(review?.body ?? '')
  const [busy, setBusy] = useState(false)
  const places = review?.route?.length ? review.route : route

  async function submit(e) {
    e.preventDefault()
    if (!body.trim()) return useAppStore.getState().toast('후기 내용을 적어 주세요', 'warning')
    setBusy(true)
    const ok = await saveReview({ id: review?.id, day: review?.day ?? day, title, body, rating, route: places, is_public: true })
    setBusy(false)
    if (ok) onHide()
  }

  async function remove() {
    if (!window.confirm('이 후기를 삭제할까요?')) return
    await deleteReview(review.id)
    onHide()
  }

  return (
    <Modal show onHide={onHide} centered scrollable>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title className="display-font fs-4">{review?.day ?? day}일차 후기</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <div className="small text-muted mb-1">이 날 어땠나요?</div>
            <Stars value={rating} onChange={setRating} size="1.7rem" />
          </div>

          <div className="mb-3">
            <div className="small text-muted mb-1">우리가 걸은 길 <span className="text-muted">(후기와 함께 저장돼요)</span></div>
            {places.length === 0
              ? <div className="small text-muted">이 날에 담은 장소가 없어요. 후기만 남겨도 괜찮아요.</div>
              : <div className="d-flex flex-wrap align-items-center gap-1">
                {places.map((p, i) => (
                  <span key={p.id ?? i} className="d-inline-flex align-items-center gap-1">
                    {i > 0 && <i className="bi bi-arrow-right text-muted small" />}<Badge bg="light" text="dark" className="border">{p.title}</Badge>
                  </span>
                ))}
              </div>}
          </div>

          <Form.Group className="mb-3">
            <Form.Control maxLength={60} placeholder="한 줄 제목 (예: 아이가 돌하르방 코를 쓰다듬은 날)" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control as="textarea" rows={5} maxLength={1500} required value={body} onChange={(e) => setBody(e.target.value)}
              placeholder={`${review?.day ?? day}일차에 이런 루트로 돌아다녔더니 너무 좋았어요. 유모차로 이동하기 편했고, 아이가…`} />
            <div className="text-end small text-muted">{body.length} / 1500</div>
          </Form.Group>
          <div className="small text-muted"><i className="bi bi-people me-1" />후기는 모든 가족에게 공개돼요. 이름은 <b>프로필의 우리 가족 이름</b>으로 보이고(없으면 “익명의 가족”), 이메일은 공개되지 않아요. 언제든 고치거나 지울 수 있어요.</div>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          {review ? <Button variant="outline-danger" onClick={remove}><i className="bi bi-trash me-1" />삭제</Button> : <span />}
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" onClick={onHide}>취소</Button>
            <Button type="submit" disabled={busy}><i className="bi bi-check2 me-1" />{busy ? '저장 중...' : review ? '수정 저장' : '후기 남기기'}</Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
