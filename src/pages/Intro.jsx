import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import HalmangMascot from '../components/art/Mascot'
import Waves from '../components/Waves'

// 처음 방문한(로그인 전) 사람이 가장 먼저 보는 화면: 할망이 제주어로 말을 건넨다
export default function Intro() {
  const [speaking, setSpeaking] = useState(true)
  useEffect(() => { const t = setTimeout(() => setSpeaking(false), 4200); return () => clearTimeout(t) }, [])

  return (
    <div className="intro">
      {/* 넓은 화면: 창이 화면 정중앙, 할망은 창 왼쪽 옆. 좁은 화면: 할망이 창 위 */}
      <div className="intro-stage">
      <div className="intro-halmang"><HalmangMascot pose="wave" speaking={speaking} /></div>

      <div className="intro-bubble">
        <span className="chip mb-2">혼저 옵서예 👋</span>
        <div className="intro-jeju">놀멍 배우멍 걸으멍,<br />다 혼디 제주</div>
        <div className="intro-ko">놀며 배우며 걸으며, 모두 함께 제주</div>
        <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
          <Button as={Link} to="/login" size="lg" className="px-4"><i className="bi bi-box-arrow-in-right me-2" />로그인</Button>
          <Button as={Link} to="/login?mode=up" size="lg" variant="outline-primary" className="px-4 bg-white"><i className="bi bi-person-plus me-2" />회원가입</Button>
        </div>
      </div>
      </div>
      <Waves />
    </div>
  )
}
