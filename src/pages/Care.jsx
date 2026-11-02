import { useState } from 'react'
import { Accordion, Button, Col, Form, ProgressBar, Row } from 'react-bootstrap'
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

  const Item = ({ t }) => <Form.Check type="checkbox" id={`${ageBand}-${t}`} label={t} checked={!!checks[`${ageBand}:${t}`]} onChange={() => tick(t)} className="mb-2" />

  return (
    <>
      <PageTitle icon="clipboard2-heart" title="보호자 노트" sub="발달단계별 체크리스트와 응급 정보" />

      <div className="d-flex flex-wrap gap-2 mb-3">
        {AGE_BANDS.map((a) => (
          <Button key={a.key} size="sm" className="rounded-pill" variant={ageBand === a.key ? 'primary' : 'outline-primary'} onClick={() => setAgeBand(a.key)}>{a.label}</Button>
        ))}
      </div>

      <div className="soft-card p-3 mb-3">
        <div className="mb-2"><i className="bi bi-lightbulb me-1 text-primary" />{list.focus}</div>
        <ProgressBar now={(doneCount / all.length) * 100} label={`${doneCount}/${all.length}`} />
      </div>

      <Row className="g-3 mb-4">
        {list.groups.map((g) => (
          <Col md={6} key={g.title}><div className="soft-card p-3 h-100"><h5>{g.title}</h5>{g.items.map((t) => <Item key={t} t={t} />)}</div></Col>
        ))}
        <Col md={12}><div className="soft-card p-3"><h5><i className="bi bi-universal-access me-1" />접근성 확인 (유모차·휠체어)</h5>{ACCESS_CHECK.map((t) => <Item key={t} t={t} />)}</div></Col>
      </Row>

      <h3 className="mb-3"><i className="bi bi-heart-pulse me-2 text-danger" />응급 정보</h3>
      <Row xs={2} md={3} lg={5} className="g-2 mb-3">
        {EMERGENCY.map((e) => (
          <Col key={e.tel}>
            <a href={`tel:${e.tel}`} className={`btn btn-${e.tone} w-100 h-100 text-start py-3`}>
              <div className="display-font fs-3 lh-1"><i className="bi bi-telephone-fill me-2 fs-5" />{e.name}</div>
              <div className="small mt-1">{e.desc}</div>
            </a>
          </Col>
        ))}
      </Row>
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
