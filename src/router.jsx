import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import RequireAuth from './layouts/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import Basket from './pages/Basket'
import Kids from './pages/Kids'
import Care from './pages/Care'
import Halmang from './pages/Halmang'
import NotFound from './pages/NotFound'

// 메뉴 목록 — 레일(데스크톱) · 서랍(모바일)에 모두 표시. tab: true 인 항목은 모바일 하단 탭에도 표시
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house-heart', tab: true },
  { to: '/explore', label: '길동무 찾기', icon: 'compass', tab: true },
  { to: '/basket', label: '여행 바구니', icon: 'basket2', tab: true },
  { to: '/kids', label: '아이와 함께', icon: 'balloon-heart', tab: true },
  { to: '/halmang', label: '할망에게 묻기', icon: 'chat-heart', tab: true },
  { to: '/care', label: '보호자 노트', icon: 'clipboard2-heart' },
  { to: '/profile', label: '우리 가족', icon: 'people' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'explore', element: <Explore /> },
      { path: 'kids', element: <Kids /> },
      { path: 'care', element: <Care /> },
      { path: 'halmang', element: <Halmang /> },
      { element: <RequireAuth />, children: [ // 로그인해야 볼 수 있는 페이지
        { path: 'profile', element: <Profile /> },
        { path: 'basket', element: <Basket /> },
      ] },
    ],
  },
])
