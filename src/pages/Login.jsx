import { useEffect, useState } from 'react'
import { Alert, Button, Card, Form, Nav } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { isSupabaseReady } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'

export default function Login() {
  const { signIn, signUp, user, profile } = useAppStore()
  const nav = useNavigate()
  const from = useLocation().state?.from
  const [mode, setMode] = useState('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  // 로그인되면: 프로필이 없으면 가족 정보 입력으로, 있으면 원래 가려던 곳으로
  useEffect(() => {
    if (user) nav(from ?? (profile ? '/explore' : '/profile'), { replace: true })
  }, [user, profile, from, nav])

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
      {!isSupabaseReady && <Alert variant="warning">Supabase 설정(.env.local)이 없어서 로그인할 수 없어요. <b>연결 점검</b> 메뉴를 확인하세요.</Alert>}
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
            <Button type="submit" className="w-100" disabled={busy}>{busy ? '잠시만요...' : mode === 'in' ? '로그인' : '가입하기'}</Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
