import { useState } from 'react'
import { Accordion, Col, Row } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import { ACCESS_CHECK, AGE_BANDS, CHECKLISTS, EMERGENCY, FIRST_AID } from '../../shared/lore'
import { useAppStore } from '../store/useAppStore'

// 체크 상태는 이 기기에만 저장 (여행 준비물 체크 용도)
const KEY = 'halmang-checks'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) ?? {} } catch { return {} } }

export default function Care() {
  const ageBand = useAppStore((s) => s.ageBand)
  const setAgeBand = useAppStore((s) => s.setAgeBand)
  const [checks, setChecks] = useState(load)
  const list = CHECKLISTS[ageBand]
  const all = [...list.groups.flatMap((g) => g.items), ...ACCESS_CHECK]
  const doneCount = all.filter((t) => checks[`${ageBand}:${t}`]).length

  function tick(item) {
    const next = { ...checks, [`${ageBand}:${item}`]: !checks[`${ageBand}:${item}`] }
    setChecks(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* 저장 실패는 무시 */ }
  }

  const Item = ({ t }) => {
    const on = !!checks[`${ageBand}:${t}`]
    return (
      <button type="button" className={`care-item ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => tick(t)}>
        <span className="care-box"><i className="bi bi-check-lg" /></span><span>{t}</span>
      </button>
    )
  }
  const pct = Math.round((doneCount / all.length) * 100)

  return (
    <>
      <PageTitle icon="clipboard2-heart" title="보호자 노트" sub="아이 나이에 맞는 준비물 체크와 응급 정보를 한곳에" />

      <div className="care-top mb-3">
        <div className="fam-seg" role="group" aria-label="아이 연령대">
          {AGE_BANDS.map((a) => <button type="button" key={a.key} className={ageBand === a.key ? 'on' : ''} aria-pressed={ageBand === a.key} onClick={() => setAgeBand(a.key)}>{a.short}</button>)}
        </div>
        <div className="care-progress">
          <div className="care-ring" style={{ '--p': pct }}><b>{pct}%</b></div>
          <div className="care-progress-t"><b>준비 {doneCount}/{all.length}</b><span>{doneCount === all.length ? '준비 끝! 즐거운 여행 되세요' : '하나씩 눌러 체크해요 (이 기기에 저장돼요)'}</span></div>
        </div>
      </div>

      <div className="care-focus mb-3"><i className="bi bi-lightbulb-fill" /><span>{list.focus}</span></div>

      <Row className="g-3 mb-4">
        {list.groups.map((g) => (
          <Col md={6} key={g.title}><section className="hb-card h-100"><h3 className="care-h">{g.title}</h3><div className="care-list">{g.items.map((t) => <Item key={t} t={t} />)}</div></section></Col>
        ))}
        <Col md={12}><section className="hb-card"><h3 className="care-h"><i className="bi bi-universal-access me-2" />접근성 확인 <small>유모차·휠체어</small></h3><div className="care-list two">{ACCESS_CHECK.map((t) => <Item key={t} t={t} />)}</div></section></Col>
      </Row>

      <h3 className="care-sec"><i className="bi bi-heart-pulse-fill me-2" />응급 정보</h3>
      <div className="care-sos mb-3">
        {EMERGENCY.map((e) => (
          <a key={e.tel} href={`tel:${e.tel}`} className={`care-sos-card ${e.tone}`}>
            <i className="bi bi-telephone-fill" /><b>{e.name}</b><span>{e.desc}</span>
          </a>
        ))}
      </div>
      <Accordion className="mb-3">
        {FIRST_AID.map((f, i) => (
          <Accordion.Item eventKey={String(i)} key={f.title}><Accordion.Header>{f.title}</Accordion.Header><Accordion.Body>{f.body}</Accordion.Body></Accordion.Item>
        ))}
      </Accordion>
      <p className="small text-muted">
        <i className="bi bi-info-circle me-1" />일반적인 안전 안내이며 의학적 진단·치료를 대신하지 않아요. 응급실 찾기: <a href="https://www.e-gen.or.kr" target="_blank" rel="noreferrer">응급의료포털 (e-gen.or.kr)</a>
      </p>
    </>
  )
}
