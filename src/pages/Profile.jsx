import { useEffect, useMemo, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import PageTitle from '../components/PageTitle'
import Avatar, { AVATARS } from '../components/art/Avatars'
import { youngestBand, AGE_BANDS, BUDGETS, NEEDS } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

const GUARDIAN_AGES = [['20s', '20대'], ['30s', '30대'], ['40s', '40대'], ['50s', '50대 이상']]
// 필요한 것을 고르면 추천에서 어떻게 달라지는지 한 줄로
const NEED_DESC = {
  stroller: '계단·경사가 적은 곳을 우선해요',
  wheelchair: '휠체어로 다니기 편한 곳을 우선해요',
  nursing: '수유실·기저귀 교환대가 있는 곳을 우선해요',
  sensory: '북적이지 않는 한적한 곳을 우선해요',
}
const EMPTY = { display_name: '', guardian_age: '30s', child_age_bands: [], needs: [], budget: 'any' }
const fromProfile = (p) => (p ? { display_name: p.display_name, guardian_age: p.guardian_age, child_age_bands: p.child_age_bands, needs: p.needs, budget: p.budget } : EMPTY)

// 번호가 붙은 단계 카드 (아이와 함께 화면과 같은 모양)
const Step = ({ no, title, sub, children }) => (
  <section className="kids-step mb-3">
    <div className="kids-step-title"><span className="kids-no">{no}</span>{title}{sub && <span className="kids-step-sub">{sub}</span>}</div>
    {children}
  </section>
)

export default function Profile() {
  const { profile, saveProfile, user, setAgeBand, avatar, setAvatar } = useAppStore()
  const editing = Boolean(profile) // 이미 저장한 가족 정보가 있으면 '수정' 화면
  const nav = useNavigate()
  const [f, setF] = useState(() => fromProfile(profile))
  const [busy, setBusy] = useState(false)
  const [picking, setPicking] = useState(false)

  useEffect(() => { setF(fromProfile(profile)) }, [profile])

  const flip = (key, v) => setF((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }))
  const dirty = editing && JSON.stringify(f) !== JSON.stringify(fromProfile(profile))
  const base = youngestBand(f.child_age_bands) // 아이가 여럿이면 가장 어린 아이 기준
  const ageOf = (k) => AGE_BANDS.find((a) => a.key === k)
  const kids = useMemo(() => AGE_BANDS.filter((a) => f.child_age_bands.includes(a.key)), [f.child_age_bands])

  async function submit(e) {
    e.preventDefault()
    if (f.child_age_bands.length === 0) return useAppStore.getState().toast('아이 연령대를 하나 이상 골라 주세요', 'warning')
    setBusy(true)
    const wasNew = !profile
    const ok = await saveProfile(f)
    setBusy(false)
    if (!ok) return
    setAgeBand(base)
    if (wasNew) nav('/explore') // 처음 입력한 뒤에만 추천 화면으로. 수정할 때는 이 화면에 머문다
  }

  return (
    <>
      <PageTitle icon="people" title={editing ? '우리 가족 정보' : '우리 가족 알려주기'} sub={editing ? `${user?.email} · 바꾼 내용은 저장해야 반영돼요` : '처음 한 번만 입력하면 돼요. 나중에 이 메뉴에서 언제든 고칠 수 있어요'} />

      <Form onSubmit={submit} className="fam-layout">
        <div>
          <Step no="1" title="우리 가족을 소개해 주세요">
            <Form.Label className="fam-label" htmlFor="fam-name">부르는 이름</Form.Label>
            <Form.Control id="fam-name" size="lg" maxLength={20} placeholder="예) 하윤이네" value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} />
            <div className="fam-label mt-3">보호자 연령대</div>
            <div className="fam-seg" role="group" aria-label="보호자 연령대">
              {GUARDIAN_AGES.map(([k, l]) => <button type="button" key={k} className={f.guardian_age === k ? 'on' : ''} aria-pressed={f.guardian_age === k} onClick={() => setF({ ...f, guardian_age: k })}>{l}</button>)}
            </div>
          </Step>

          <Step no="2" title="아이는 몇 살이에요?" sub="여러 명이면 모두 고르세요 — 가장 어린 아이에게 맞춰 추천해요">
            <div className="fam-tiles age" role="group" aria-label="아이 연령대">
              {AGE_BANDS.map((a) => {
                const on = f.child_age_bands.includes(a.key)
                return (
                  <button type="button" key={a.key} className={`fam-tile ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => flip('child_age_bands', a.key)}>
                    <i className={`bi bi-${a.icon}`} /><b>{a.short}</b><small>{a.label.match(/\(.*\)/)?.[0] ?? ''}</small>
                    {on && <span className="fam-check"><i className="bi bi-check-lg" /></span>}
                  </button>
                )
              })}
            </div>
          </Step>

          <Step no="3" title="필요한 것이 있나요?" sub="고르면 추천 점수에 반영돼요 (없으면 건너뛰세요)">
            <div className="fam-tiles need" role="group" aria-label="필요한 것">
              {NEEDS.map((n) => {
                const on = f.needs.includes(n.key)
                return (
                  <button type="button" key={n.key} className={`fam-tile wide ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => flip('needs', n.key)}>
                    <i className={`bi bi-${n.icon}`} /><span><b>{n.label}</b><small>{NEED_DESC[n.key]}</small></span>
                    {on && <span className="fam-check"><i className="bi bi-check-lg" /></span>}
                  </button>
                )
              })}
            </div>
          </Step>

          <Step no="4" title="1인당 입장료는 어느 정도가 좋아요?">
            <div className="fam-seg" role="group" aria-label="예산">
              {BUDGETS.map((b) => <button type="button" key={b.key} className={f.budget === b.key ? 'on' : ''} aria-pressed={f.budget === b.key} onClick={() => setF({ ...f, budget: b.key })}>{b.label}</button>)}
            </div>
          </Step>
        </div>

        {/* 오른쪽: 고른 내용이 바로 보이는 가족 카드 + 저장 */}
        <aside className="fam-side">
          <div className="fam-card">
            <div className="fam-avatar-wrap">
              <button type="button" className="fam-avatar-btn" onClick={() => setPicking((v) => !v)} aria-expanded={picking} aria-label="캐릭터 바꾸기">
                <Avatar kind={avatar} size={110} />
                <span className="fam-avatar-edit"><i className={`bi bi-${picking ? 'x-lg' : 'pencil-fill'}`} /></span>
              </button>
              <button type="button" className="fam-avatar-link" onClick={() => setPicking((v) => !v)}>{picking ? '닫기' : '캐릭터 바꾸기'}</button>
              {picking && (
                <div className="fam-avatars" role="group" aria-label="우리 가족 캐릭터">
                  {AVATARS.map((a) => (
                    <button type="button" key={a.key} className={avatar === a.key ? 'on' : ''} aria-pressed={avatar === a.key} onClick={() => { setAvatar(a.key); setPicking(false) }}>
                      <Avatar kind={a.key} size={56} /><span>{a.label}</span>
                    </button>
                  ))}
                  <div className="fam-avatars-note">이 기기에 저장돼요</div>
                </div>
              )}
            </div>
            <div className="fam-card-name">{f.display_name.trim() || '우리 가족'}<small>{editing ? '' : ' (입력 중)'}</small></div>
            <dl className="fam-summary">
              <div><dt>보호자</dt><dd>{GUARDIAN_AGES.find(([k]) => k === f.guardian_age)?.[1]}</dd></div>
              <div><dt>아이</dt><dd>{kids.length ? kids.map((k) => <span key={k.key} className={`fam-chip ${k.key === base ? 'base' : ''}`}>{k.short}{k.key === base && kids.length > 1 ? ' · 기준' : ''}</span>) : <span className="fam-empty">아직 안 골랐어요</span>}</dd></div>
              <div><dt>필요한 것</dt><dd>{f.needs.length ? f.needs.map((k) => <span key={k} className="fam-chip">{NEEDS.find((n) => n.key === k)?.label}</span>) : <span className="fam-empty">없음</span>}</dd></div>
              <div><dt>예산</dt><dd><span className="fam-chip">{BUDGETS.find((b) => b.key === f.budget)?.label}</span></dd></div>
            </dl>
            <div className="fam-note"><i className="bi bi-stars me-1" />{base ? `${ageOf(base)?.short} 아이 기준으로 홈 추천과 여행지 찾기 점수를 매겨요.` : '아이 나이를 고르면 맞춤 추천이 시작돼요.'}</div>
          </div>
          <div className="fam-savebar">
            {dirty && <span className="fam-dirty"><i className="bi bi-pencil-fill me-1" />저장하지 않은 변경이 있어요</span>}
            <Button type="submit" size="lg" className="fam-save" disabled={busy || (editing && !dirty)}><i className="bi bi-check2-circle me-2" />{busy ? '저장 중...' : editing ? (dirty ? '수정 저장' : '저장됨') : '저장하고 추천 받기'}</Button>
          </div>
        </aside>
      </Form>
    </>
  )
}
