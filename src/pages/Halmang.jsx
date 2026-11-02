import { useEffect, useRef, useState } from 'react'
import { Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import { useAppStore } from '../store/useAppStore'

const TOOL_LABEL = {
  search_spots: ['장소 검색 (관광정보+무장애+날씨)', 'search'],
  get_accessibility: ['무장애 상세', 'universal-access'],
  get_weather: ['기상청 예보', 'cloud-sun'],
  tell_story: ['할망 이야기', 'book'],
  get_kids_content: ['아이 미션·체크리스트', 'balloon-heart'],
}
const SUGGEST = [
  '내일 서귀포에 비 오면 유모차로 갈 수 있는 실내 장소 추천해줘',
  '해녀 문화를 5살 아이에게 쉽게 알려줄 수 있는 곳이 있을까?',
  '설문대할망 이야기를 들려줘',
  '휠체어 가능한 무료 관광지 알려줘',
]

export default function Halmang() {
  const messages = useAppStore((s) => s.messages)
  const loading = useAppStore((s) => s.chatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const [input, setInput] = useState('')
  const box = useRef(null)

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }) }, [messages, loading])

  function submit(e) {
    e?.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim()); setInput('')
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <PageTitle icon="chat-heart" title="할망에게 묻기" sub="공공데이터 API를 도구로 직접 확인해서 답하는 AI 에이전트" />
      <div className="soft-card chat-box mb-3" ref={box}>
        {messages.length === 0 && (
          <div>
            <div className="msg assistant">아이고, 우리 강아지들 왔구나! 😊 어디 갈지, 날씨는 어떤지, 옛이야기까지 뭐든 물어보라이.</div>
            <div className="d-flex flex-column gap-2 align-items-start">
              {SUGGEST.map((s) => <Button key={s} size="sm" variant="outline-primary" className="rounded-pill text-start" onClick={() => sendMessage(s)}>{s}</Button>)}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            {m.steps?.length > 0 && (
              <div className="d-flex flex-wrap gap-1 mb-1">
                {m.steps.map((s, j) => {
                  const [label, icon] = TOOL_LABEL[s.tool] ?? [s.tool, 'tools']
                  return <Badge key={j} bg={s.error ? 'danger' : 'secondary'} title={JSON.stringify(s.args)}><i className={`bi bi-${icon} me-1`} />{label} · {s.error ? '오류' : `${s.count}건`}</Badge>
                })}
              </div>
            )}
            <div className={`msg ${m.role}`}>{m.text}</div>
            {m.fallback && <div className="small text-muted mb-2"><i className="bi bi-arrow-repeat me-1" />할망의 AI(Claude)를 쓸 수 없어 Gemini가 대신 답했어요</div>}
          </div>
        ))}
        {loading && <div className="small text-muted"><Spinner size="sm" className="me-2" />할망이 공공데이터를 확인하는 중...</div>}
      </div>
      <Form onSubmit={submit}>
        <InputGroup>
          <Form.Control value={input} onChange={(e) => setInput(e.target.value)} placeholder="할망에게 물어보세요" />
          <Button type="submit" disabled={loading}><i className="bi bi-send" /></Button>
        </InputGroup>
      </Form>
    </div>
  )
}
