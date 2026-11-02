import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'

// 오래 열어 둔 탭은 예전 화면 코드를 계속 쓴다. 새 버전이 배포되면(메인 스크립트 이름이 바뀜) 새로고침을 안내한다.
const BUNDLE = /assets\/index-[^"'\s]+\.js/
export const bundleOf = (text) => text.match(BUNDLE)?.[0] ?? null

export default function NewVersionBanner() {
  const [stale, setStale] = useState(false)

  useEffect(() => {
    if (import.meta.env.DEV) return undefined // 개발 서버는 알아서 갱신된다
    const mine = bundleOf([...document.scripts].map((s) => s.src).join(' '))
    if (!mine) return undefined
    let off = false
    const check = async () => {
      try {
        const html = await (await fetch('/', { cache: 'no-store' })).text()
        const live = bundleOf(html)
        if (!off && live && live !== mine) setStale(true)
      } catch { /* 네트워크 오류는 다음에 다시 확인 */ }
    }
    const onVisible = () => { if (document.visibilityState === 'visible') check() } // 탭으로 돌아올 때마다
    document.addEventListener('visibilitychange', onVisible)
    const timer = setInterval(check, 10 * 60e3)
    check()
    return () => { off = true; document.removeEventListener('visibilitychange', onVisible); clearInterval(timer) }
  }, [])

  if (!stale) return null
  return (
    <div className="new-version" role="status">
      <i className="bi bi-arrow-repeat me-2" />새 버전이 나왔어요. 새로고침하면 최신 화면으로 바뀌어요.
      <Button size="sm" variant="light" className="ms-3 rounded-pill fw-bold" onClick={() => window.location.reload()}>새로고침</Button>
    </div>
  )
}
