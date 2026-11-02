import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: '4rem' }}>🗿</div>
      <h1>길을 잃었주!</h1>
      <p className="text-muted">돌하르방도 이 주소는 모른대요.</p>
      <Link to="/" className="btn btn-primary">홈으로 돌아가기</Link>
    </div>
  )
}
