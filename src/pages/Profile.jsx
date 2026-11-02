import { useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import { youngestBand, AGE_BANDS, BUDGETS, NEEDS } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const GUARDIAN_AGES = [['20s', '20대'], ['30s', '30대'], ['40s', '40대'], ['50s', '50대 이상 (조부모 포함)']]

// 선택 버튼 (여러 개 / 한 개)
function Toggle({ on, onClick, icon, children }) {
  return (
    <Button type="button" variant={on ? 'primary' : 'outline-primary'} size="sm" className="rounded-pill" onClick={onClick}>
      {icon && <i className={`bi bi-${icon} me-1`} />}{children}
    </Button>
  )
}

export default function Profile() {
  const { profile, saveProfile, user, setAgeBand } = useAppStore()
  const editing = Boolean(profile) // 이미 저장한 가족 정보가 있으면 '수정' 화면
  const nav = useNavigate()
  const [f, setF] = useState({ display_name: '', guardian_age: '30s', child_age_bands: [], needs: [], budget: 'any' })
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (profile) setF({ display_name: profile.display_name, guardian_age: profile.guardian_age, child_age_bands: profile.child_age_bands, needs: profile.needs, budget: profile.budget }) }, [profile])

  const flip = (key, v) => setF((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }))

  async function submit(e) {
    e.preventDefault()
    if (f.child_age_bands.length === 0) return useAppStore.getState().toast('아이 연령대를 하나 이상 골라 주세요', 'warning')
    setBusy(true)
    const wasNew = !profile
    const ok = await saveProfile(f)
    setBusy(false)
    if (!ok) return
    setAgeBand(youngestBand(f.child_age_bands)) // 아이가 여럿이면 가장 어린 아이 기준
    if (wasNew) nav('/explore') // 처음 입력한 뒤에만 추천 화면으로. 수정할 때는 이 화면에 머문다
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageTitle icon="people" title={editing ? '우리 가족 정보 수정' : '우리 가족 알려주기'} sub={editing ? `${user?.email} · 바꾼 내용은 저장해야 반영돼요` : '처음 한 번만 입력하면 돼요. 나중에 이 메뉴에서 언제든 고칠 수 있어요'} />
      <Form onSubmit={submit}>
        <Card className="soft-card border-0 mb-3"><Card.Body>
          <Form.Group className="mb-3"><Form.Label className="fw-bold">부르는 이름</Form.Label>
            <Form.Control maxLength={20} placeholder="예) 하윤이네" value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} /></Form.Group>
          <Form.Group><Form.Label className="fw-bold">보호자 연령대</Form.Label>
            <Form.Select value={f.guardian_age} onChange={(e) => setF({ ...f, guardian_age: e.target.value })}>
              {GUARDIAN_AGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Form.Select></Form.Group>
        </Card.Body></Card>

        <Card className="soft-card border-0 mb-3"><Card.Body>
          <div className="fw-bold mb-2">아이 연령대 <span className="text-muted fw-normal small">(여러 명이면 모두 선택)</span></div>
          <div className="d-flex flex-wrap gap-2">
            {AGE_BANDS.map((a) => <Toggle key={a.key} icon={a.icon} on={f.child_age_bands.includes(a.key)} onClick={() => flip('child_age_bands', a.key)}>{a.label}</Toggle>)}
          </div>
        </Card.Body></Card>

        <Card className="soft-card border-0 mb-3"><Card.Body>
          <div className="fw-bold mb-2">접근성 필요 <span className="text-muted fw-normal small">(추천 점수에 반영돼요)</span></div>
          <div className="d-flex flex-wrap gap-2">
            {NEEDS.map((n) => <Toggle key={n.key} icon={n.icon} on={f.needs.includes(n.key)} onClick={() => flip('needs', n.key)}>{n.label}</Toggle>)}
          </div>
        </Card.Body></Card>

        <Card className="soft-card border-0 mb-4"><Card.Body>
          <div className="fw-bold mb-2">1인당 입장료 예산</div>
          <div className="d-flex flex-wrap gap-2">
            {BUDGETS.map((b) => <Toggle key={b.key} on={f.budget === b.key} onClick={() => setF({ ...f, budget: b.key })}>{b.label}</Toggle>)}
          </div>
        </Card.Body></Card>

        <Button type="submit" size="lg" disabled={busy}><i className="bi bi-check2-circle me-2" />{busy ? '저장 중...' : editing ? '수정 저장' : '저장하고 추천 받기'}</Button>
      </Form>
    </div>
  )
}
