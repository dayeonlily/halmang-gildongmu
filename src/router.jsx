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
import Reviews from './pages/Reviews'
import HistoryTour from './pages/HistoryTour'
import Halmang from './pages/Halmang'
import NotFound from './pages/NotFound'

// 메뉴 목록 — 레일(데스크톱) · 서랍(모바일)에 모두 표시. tab: true 인 항목은 모바일 하단 탭에도 표시
export const NAV_ITEMS = [
  { to: '/', label: '홈', icon: 'house-heart', tab: true },
  { to: '/explore', group: '여행', label: '여행지 찾기', short: '찾기', icon: 'compass', tab: true },
  { to: '/basket', group: '여행', label: '여행 일정', short: '일정', icon: 'calendar2-check', tab: true },
  { to: '/reviews', group: '여행', label: '여행 후기', icon: 'journal-richtext' },
  // 배움(교육): 문화와 역사를 같은 말로 묶는다 — 놀멍 배우멍 걸으멍
  { to: '/kids', group: '배움', label: '문화 배우기', short: '배우기', icon: 'balloon-heart', tab: true },
  { to: '/history', group: '배움', label: '역사 배우기', icon: 'hourglass-split' },
  { to: '/halmang', group: '도움', label: '할망에게 묻기', short: '묻기', icon: 'chat-heart', tab: true },
  { to: '/care', group: '도움', label: '보호자 노트', icon: 'clipboard2-heart' },
  { to: '/profile', group: '도움', label: '우리 가족', icon: 'people' },
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
      { path: 'reviews', element: <Reviews /> },
      { path: 'history', element: <HistoryTour /> },
      { path: 'halmang', element: <Halmang /> },
      { element: <RequireAuth />, children: [ // 로그인해야 볼 수 있는 페이지
        { path: 'profile', element: <Profile /> },
        { path: 'basket', element: <Basket /> },
      ] },
    ],
  },
])
