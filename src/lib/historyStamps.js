import { useAppStore } from '../store/useAppStore'

// 역사 스탬프: 로그인하면 계정(Supabase mission_stamps)에, 아니면 앱 저장소의 localStamps(이 기기)에.
// 어디서 호출해도 같은 값을 보도록 둘 다 앱 저장소(zustand)에 둔다.
export function useHistoryStamps() {
  const user = useAppStore((s) => s.user)
  const dbStamps = useAppStore((s) => s.stamps)
  const localStamps = useAppStore((s) => s.localStamps)
  const toggleDb = useAppStore((s) => s.toggleStamp)
  const toggleLocal = useAppStore((s) => s.toggleLocalStamp)
  return { stamps: user ? dbStamps : localStamps, toggle: user ? toggleDb : toggleLocal, guest: !user }
}
