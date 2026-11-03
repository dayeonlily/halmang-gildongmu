import { NavLink } from 'react-router-dom'

// 배움(교육) 묶음: 문화 배우기와 역사 배우기를 오가는 탭. 두 화면 맨 위에 똑같이 놓는다
export default function LearnTabs() {
  return (
    <div className="learn-tabs" role="navigation" aria-label="배움">
      <span className="learn-label"><i className="bi bi-mortarboard-fill me-1" />배움</span>
      <NavLink to="/kids"><i className="bi bi-balloon-heart me-1" />문화 배우기<small>이야기 · 미션 · 제주어</small></NavLink>
      <NavLink to="/history"><i className="bi bi-hourglass-split me-1" />역사 배우기<small>스탬프 투어</small></NavLink>
    </div>
  )
}
