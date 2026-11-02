import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Nav } from 'react-bootstrap'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export default function Login() {
  const { signIn, signUp, user, profile, profileLoaded } = useAppStore()
  const nav = useNavigate()
  const from = useLocation().state?.from
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'up' ? 'up' : 'in') // 시작 화면의 '회원가입' 버튼은 가입 탭으로
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // 로그인되면: 가족 정보를 다 불러온 뒤에 판단한다.
  // 처음 가입한 사람(정보 없음)만 가족 정보 입력으로, 이미 입력한 사람은 바로 원래 가려던 곳으로
  useEffect(() => {
    if (user && profileLoaded) nav(profile ? (from ?? '/explore') : '/profile', { replace: true })
  }, [user, profile, profileLoaded, from, nav])

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setMsg('')
    if (mode === 'in') await signIn(email, pw)
    else {
      const r = await signUp(email, pw)
      if (r.ok && r.needsConfirm) setMsg('가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.')
    }
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 440 }} className="mx-auto">
      <PageTitle icon="person-heart" title={mode === 'in' ? '다시 만나서 반가워요' : '할망 길동무 가족 되기'} sub="이메일로 간단히 시작해요" />
      {!isSupabaseReady && <Alert variant="warning">Supabase 설정(.env.local)이 없어서 로그인할 수 없어요. 관리자에게 문의하세요.</Alert>}
      <Card className="soft-card border-0">
        <Card.Body>
          <Nav variant="pills" className="mb-3" activeKey={mode} onSelect={setMode} fill>
            <Nav.Item><Nav.Link eventKey="in">로그인</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="up">회원가입</Nav.Link></Nav.Item>
          </Nav>
          <Form onSubmit={submit}>
            <Form.Group className="mb-3"><Form.Label>이메일</Form.Label>
              <Form.Control type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>비밀번호 (6자 이상)</Form.Label>
              <Form.Control type="password" required minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={pw} onChange={(e) => setPw(e.target.value)} /></Form.Group>
            {msg && <Alert variant="success" className="py-2 small">{msg}</Alert>}
            <Button type="submit" className="w-100" disabled={busy || !!user}>{busy || user ? '잠시만요...' : mode === 'in' ? '로그인' : '가입하기'}</Button>
            {mode === 'up' && <div className="small text-muted mt-2">가입하면 우리 가족 정보를 한 번만 물어봐요. 나중에 메뉴의 '우리 가족'에서 언제든 고칠 수 있어요.</div>}
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
