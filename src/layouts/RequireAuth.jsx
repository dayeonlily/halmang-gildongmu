import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loading } from '../components/Status'
import { useAppStore } from '../store/useAppStore'

// 로그인하지 않으면 /login 으로 보내고, 로그인 뒤 원래 가려던 곳으로 돌려보냅니다
export default function RequireAuth() {
  const user = useAppStore((s) => s.user)
  const ready = useAppStore((s) => s.authReady)
  const loc = useLocation()
  if (!ready) return <Loading />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  return <Outlet />
}
