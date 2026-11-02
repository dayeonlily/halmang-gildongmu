import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { HalmangBuddy } from '../scene/JejuScene'
import Waves from '../components/Waves'

// 처음 방문한(로그인 전) 사람이 가장 먼저 보는 화면: 할망이 제주어로 말을 건넨다
export default function Intro() {
  const [speaking, setSpeaking] = useState(true)
  useEffect(() => { const t = setTimeout(() => setSpeaking(false), 4200); return () => clearTimeout(t) }, [])

  return (
    <div className="intro">
      <div className="intro-halmang"><HalmangBuddy speaking={speaking} height={285} bare /></div>

      <div className="intro-bubble">
        <span className="chip mb-2">혼저 옵서예 👋</span>
        <div className="intro-jeju">놀멍 배우멍 걸으멍,<br />다 혼디 제주</div>
        <div className="intro-ko">놀며 배우며 걸으며, 모두 함께 제주</div>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <Button as={Link} to="/login" size="lg" className="px-4"><i className="bi bi-box-arrow-in-right me-2" />로그인</Button>
          <Button as={Link} to="/login?mode=up" size="lg" variant="outline-primary" className="px-4 bg-white"><i className="bi bi-person-plus me-2" />회원가입</Button>
        </div>
        <Link to="/explore" className="d-inline-block mt-3 small text-muted">로그인 없이 먼저 둘러볼래요</Link>
      </div>
      <Waves />
    </div>
  )
}
