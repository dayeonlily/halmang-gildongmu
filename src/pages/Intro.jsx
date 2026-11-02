import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { HalmangBuddy } from '../scene/JejuScene'

// 처음 방문한(로그인 전) 사람이 가장 먼저 보는 화면: 할망이 제주어로 말을 건넨다
export default function Intro() {
  const [speaking, setSpeaking] = useState(true)
  useEffect(() => { const t = setTimeout(() => setSpeaking(false), 4200); return () => clearTimeout(t) }, [])

  return (
    <div className="intro">
      <div className="intro-sun" />
      <div className="intro-halmang"><HalmangBuddy speaking={speaking} height={285} bare /></div>

      <div className="intro-bubble">
        <span className="chip mb-2">혼저 옵서예 👋</span>
        <div className="intro-jeju">제주에서 혼디<br />재미지게 놀게마씸!</div>
        <div className="intro-ko">제주에서 같이 재미있게 놀자!</div>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <Button as={Link} to="/login" size="lg" className="px-4"><i className="bi bi-box-arrow-in-right me-2" />로그인</Button>
          <Button as={Link} to="/login?mode=up" size="lg" variant="outline-primary" className="px-4 bg-white"><i className="bi bi-person-plus me-2" />회원가입</Button>
        </div>
        <Link to="/explore" className="d-inline-block mt-3 small text-muted">로그인 없이 먼저 둘러볼래요</Link>
      </div>

      <svg className="intro-waves" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true">
        <path className="w1" d="M0 70 C240 20 480 120 720 70 S1200 20 1440 70 V160 H0Z" fill="#8fd6d6" opacity=".55" />
        <path className="w2" d="M0 100 C260 60 520 140 780 100 S1220 60 1440 100 V160 H0Z" fill="#2a9d8f" opacity=".75" />
      </svg>
    </div>
  )
}
