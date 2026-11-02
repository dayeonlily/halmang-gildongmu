import { useEffect, useState } from 'react'
import { Badge, Button, Container, Offcanvas, Toast, ToastContainer } from 'react-bootstrap'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import NewVersionBanner from '../components/NewVersionBanner'
import { NAV_ITEMS } from '../router'
import { useAppStore } from '../store/useAppStore'

function NavList({ onPick }) {
  const basketCount = useAppStore((s) => s.basket.length)
  return (
    <nav className="nav flex-column gap-1">
      {NAV_ITEMS.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link" onClick={onPick}>
          <i className={`bi bi-${n.icon}`} />{n.label}
          {n.to === '/basket' && basketCount > 0 && <Badge bg="light" text="dark" pill className="ms-auto">{basketCount}</Badge>}
        </NavLink>
      ))}
    </nav>
  )
}

// 지금 보고 있는 화면의 버전 (배포한 커밋 번호). 최신인지 확인할 때 쓴다
const VersionStamp = ({ className = '' }) => <div className={`opacity-50 ${className}`} style={{ fontSize: '.72rem' }} title={`빌드 ${__BUILD_TIME__} (한국 시간)`}>버전 {__APP_VERSION__}</div>

function Account() {
  const user = useAppStore((s) => s.user)
  const profile = useAppStore((s) => s.profile)
  const signOut = useAppStore((s) => s.signOut)
  const nav = useNavigate()
  if (!user) return <Button variant="primary" size="sm" className="w-100" onClick={() => nav('/login')}><i className="bi bi-box-arrow-in-right me-1" />로그인 · 회원가입</Button>
  return (
    <div>
      <div className="mb-1 text-truncate"><i className="bi bi-person-circle me-1" />{profile?.display_name || user.email}</div>
      <Button variant="outline-light" size="sm" className="w-100" onClick={signOut}>로그아웃</Button>
    </div>
  )
}

export default function RootLayout() {
  const toasts = useAppStore((s) => s.toasts)
  const initAuth = useAppStore((s) => s.initAuth)
  const basket = useAppStore((s) => s.basket.length)
  const user = useAppStore((s) => s.user)
  const authReady = useAppStore((s) => s.authReady)
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => { initAuth() }, [initAuth])

  // 로그인 전 첫 화면(/)과 로그인·회원가입(/login)은 메뉴 없이 그 화면만 보여 준다
  if (pathname === '/login' || (pathname === '/' && (!authReady || !user))) {
    return (
      <>
        <NewVersionBanner />
        <Outlet />
        <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 2000 }}>
          {toasts.map((t) => (
            <Toast key={t.id} bg={t.variant}><Toast.Body className={t.variant === 'warning' ? '' : 'text-white'}>{t.message}</Toast.Body></Toast>
          ))}
        </ToastContainer>
      </>
    )
  }

  return (
    <div className="app-shell">
      <NewVersionBanner />
      {/* 데스크톱: 좌측 레일 */}
      <aside className="rail">
        <Link to="/" className="brand"><img src="/favicon.svg" alt="" />할망 길동무</Link>
        <NavList />
        <div className="rail-foot">
          <Account />
          <div className="mt-3 opacity-50" style={{ fontSize: '.72rem' }}>데이터: 한국관광공사 · 기상청 · 에어코리아 (공공데이터포털)</div>
          <VersionStamp className="mt-1" />
        </div>
      </aside>

      {/* 모바일: 상단바 + 서랍 + 하단 탭 */}
      <header className="topbar">
        <Link to="/" className="text-white text-decoration-none display-font fs-5"><img src="/favicon.svg" alt="" width="28" className="me-2" />할망 길동무</Link>
        <Button variant="link" className="text-white fs-4 p-0" onClick={() => setOpen(true)} aria-label="메뉴"><i className="bi bi-list" /></Button>
      </header>
      <Offcanvas show={open} onHide={() => setOpen(false)} placement="end" className="drawer" style={{ background: '#2f3a3f', color: '#fff' }}>
        <Offcanvas.Header closeButton closeVariant="white"><Offcanvas.Title className="display-font">메뉴</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <NavList onPick={() => setOpen(false)} />
          <div className="mt-auto pt-3"><Account /><VersionStamp className="mt-2" /></div>
        </Offcanvas.Body>
      </Offcanvas>
      <nav className="tabbar">
        {NAV_ITEMS.filter((n) => n.tab).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}>
            <i className={`bi bi-${n.icon}`} />{n.label.replace('할망에게 ', '').replace('여행 ', '').replace('길동무 ', '')}
            {n.to === '/basket' && basket > 0 && <Badge bg="danger" pill className="count">{basket}</Badge>}
          </NavLink>
        ))}
      </nav>

      <main className="main-area">
        <Container style={{ maxWidth: 1180 }}><Outlet /></Container>
      </main>

      <ToastContainer position="bottom-end" className="p-3 position-fixed" style={{ zIndex: 2000, bottom: 64 }}>
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant}><Toast.Body className={t.variant === 'warning' ? '' : 'text-white'}>{t.message}</Toast.Body></Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
