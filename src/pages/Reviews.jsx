import { useEffect, useState } from 'react'
import { Alert, Badge, Button, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import ReviewModal from '../components/ReviewModal'
import Stars from '../components/Stars'
import { Empty } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

const fmt = (d) => new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

function ReviewCard({ r, mine, onEdit }) {
  return (
    <div className="soft-card p-3 mb-3">
      <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
        <span className="chip">{r.day}일차</span><Stars value={r.rating} />
        {mine && <Badge bg="success">내 후기</Badge>}
        <span className="ms-auto small text-muted">{fmt(r.created_at)}</span>
      </div>
      {r.title && <h5 className="mb-2">{r.title}</h5>}
      {r.route?.length > 0 && (
        <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
          <i className="bi bi-signpost-split text-primary me-1" />
          {r.route.map((p, i) => (
            <span key={p.id ?? i} className="d-inline-flex align-items-center gap-1">
              {i > 0 && <i className="bi bi-arrow-right text-muted small" />}<Badge bg="light" text="dark" className="border">{p.title}</Badge>
            </span>
          ))}
        </div>
      )}
      <p className="mb-2" style={{ whiteSpace: 'pre-line' }}>{r.body}</p>
      <div className="d-flex align-items-center small text-muted">
        <span><i className="bi bi-person-heart me-1" />{r.author || '익명의 가족'}</span>
        {mine && <Button size="sm" variant="outline-primary" className="ms-auto" onClick={() => onEdit(r)}><i className="bi bi-pencil me-1" />수정</Button>}
      </div>
    </div>
  )
}

export default function Reviews() {
  const user = useAppStore((s) => s.user)
  const reviews = useAppStore((s) => s.reviews)
  const publicReviews = useAppStore((s) => s.publicReviews)
  const reviewsReady = useAppStore((s) => s.reviewsReady)
  const loadPublicReviews = useAppStore((s) => s.loadPublicReviews)
  const [tab, setTab] = useState('public')
  const [editing, setEditing] = useState(null)

  useEffect(() => { loadPublicReviews() }, [loadPublicReviews])
  const others = publicReviews.filter((r) => r.user_id !== user?.id)

  return (
    <>
      <PageTitle icon="journal-richtext" title="여행 후기" sub="우리 가족이 걸은 길을 남기고, 다른 가족의 루트도 구경해요" />
      {!reviewsReady && <Alert variant="warning" className="small">후기 기능을 준비하고 있어요. 조금만 기다려 주세요!{import.meta.env.DEV && <> (개발자 메모: Supabase SQL Editor 에서 <code>supabase/reviews.sql</code> 을 실행하면 켜져요)</>}</Alert>}

      <Nav variant="pills" className="mb-3" activeKey={tab} onSelect={setTab} fill>
        <Nav.Item><Nav.Link eventKey="public">다른 가족 후기 <Badge bg="light" text="dark">{others.length}</Badge></Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="mine">내 후기 <Badge bg="light" text="dark">{reviews.length}</Badge></Nav.Link></Nav.Item>
      </Nav>

      {tab === 'public' && (others.length === 0
        ? <Empty icon="chat-heart" text="아직 공개된 후기가 없어요. 첫 후기를 남겨 볼까요?" />
        : others.map((r) => <ReviewCard key={r.id} r={r} />))}

      {tab === 'mine' && (!user
        ? <Empty icon="person-heart" text={<><Link to="/login">로그인</Link>하면 내 후기를 볼 수 있어요</>} />
        : reviews.length === 0
          ? <Empty icon="journal-plus" text={<>아직 쓴 후기가 없어요. <Link to="/basket">여행 일정</Link>의 일차마다 후기를 남길 수 있어요</>} />
          : reviews.map((r) => <ReviewCard key={r.id} r={r} mine onEdit={setEditing} />))}

      {editing && <ReviewModal key={editing.id} review={editing} route={editing.route ?? []} day={editing.day} onHide={() => setEditing(null)} />}
    </>
  )
}
