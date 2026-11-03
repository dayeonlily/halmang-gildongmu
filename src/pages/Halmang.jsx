import { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import PageTitle from '../components/PageTitle'
import HalmangMascot from '../components/art/Mascot'
import halmangUrl from '../assets/halmang.webp'
import { useAppStore } from '../store/useAppStore'

// 할망이 어떤 정보를 확인해서 답했는지 (도구 이름 → 사람이 읽는 이름)
const TOOL_LABEL = {
  search_spots: ['장소 검색', 'search'],
  get_accessibility: ['베리어프리 상세', 'universal-access'],
  get_weather: ['날씨 예보', 'cloud-sun'],
  tell_story: ['옛이야기', 'book'],
  get_kids_content: ['아이 미션·체크리스트', 'balloon-heart'],
  get_history_tour: ['역사 배우기 코스', 'hourglass-split'],
}
// 처음 화면에서 누르면 바로 묻는 질문 카드
const SUGGEST = [
  { icon: 'umbrella', title: '비 오는 날 실내 코스', q: '내일 서귀포에 비 오면 유모차로 갈 수 있는 실내 장소 추천해줘' },
  { icon: 'water', title: '해녀 문화 쉽게 알려주기', q: '해녀 문화를 5살 아이에게 쉽게 알려줄 수 있는 곳이 있을까?' },
  { icon: 'book', title: '옛이야기 듣기', q: '설문대할망 이야기를 들려줘' },
  { icon: 'universal-access', title: '휠체어 되는 무료 관광지', q: '휠체어 가능한 무료 관광지 알려줘' },
  { icon: 'hourglass-split', title: '아이와 가는 역사 코스', q: '초등 저학년 아이와 가기 좋은 제주 역사 장소를 알려줘' },
  { icon: 'backpack', title: '우리 아이 오늘의 미션', q: '우리 아이 나이에 맞는 미션을 알려줘' },
]
// 할망이 직접 확인하는 정보 (왼쪽 소개 카드)
const KNOWS = [
  ['geo-alt', '장소·관광정보', '한국관광공사'],
  ['universal-access', '베리어프리 정보', '유모차·휠체어·수유실'],
  ['cloud-sun', '날씨·미세먼지·자외선', '기상청·에어코리아'],
  ['book', '제주 옛이야기·역사', '할망이 구연'],
]

const Avatar = ({ role }) => role === 'assistant'
  ? <div className="ask-avatar" style={{ backgroundImage: `url(${halmangUrl})` }} aria-hidden="true" />
  : <div className="ask-avatar user" aria-hidden="true"><i className="bi bi-person-fill" /></div>

export default function Halmang() {
  const messages = useAppStore((s) => s.messages)
  const loading = useAppStore((s) => s.chatLoading)
  const sendMessage = useAppStore((s) => s.sendMessage)
  const retryMessage = useAppStore((s) => s.retryMessage)
  const clearChat = useAppStore((s) => s.clearChat)
  const [input, setInput] = useState('')
  const box = useRef(null)

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }) }, [messages, loading])

  function submit(e) {
    e?.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim()); setInput('')
  }
  // Enter 로 보내고, Shift+Enter 는 줄바꿈 (한글 입력 중 Enter 는 글자 확정이라 보내지 않는다)
  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e) }

  return (
    <>
      <PageTitle icon="chat-heart" title="할망에게 묻기" sub="여행 장소, 날씨, 아이 놀이, 옛이야기까지 뭐든 물어보세요" />

      <div className="ask-layout">
        {/* 왼쪽: 할망 소개 (좁은 화면에서는 위에 작게) */}
        <aside className="ask-side">
          <div className="ask-mascot"><HalmangMascot pose="wave" speaking={loading} className="ask-mascot-img" label="설문대할망" /></div>
          <div className="ask-name">설문대할망</div>
          <div className={`ask-status ${loading ? 'busy' : ''}`}>{loading ? '공공데이터를 확인하는 중…' : '무엇이든 물어보라이'}</div>
          <div className="ask-knows">
            <div className="ask-knows-title">할망이 직접 확인해요</div>
            {KNOWS.map(([icon, name, src]) => (
              <div key={name} className="ask-know"><i className={`bi bi-${icon}`} /><div><b>{name}</b><small>{src}</small></div></div>
            ))}
          </div>
        </aside>

        {/* 오른쪽: 대화 */}
        <section className="ask-chat">
          <div className="ask-chat-head">
            <span><i className="bi bi-chat-dots me-2" />대화</span>
            {messages.length > 0 && <button type="button" className="ask-clear" onClick={clearChat} disabled={loading}><i className="bi bi-arrow-counterclockwise me-1" />새 대화</button>}
          </div>

          <div className="ask-scroll" ref={box} aria-live="polite">
            {messages.length === 0 ? (
              <div className="ask-welcome">
                <div className="ask-row assistant">
                  <Avatar role="assistant" />
                  <div className="ask-col"><div className="ask-bubble assistant">아이고, 우리 강아지들 왔구나! 😊 어디 갈지, 날씨는 어떤지, 옛이야기까지 뭐든 물어보라이.</div></div>
                </div>
                <div className="ask-suggest-title">이런 걸 물어보세요</div>
                <div className="ask-suggest">
                  {SUGGEST.map((s) => (
                    <button type="button" key={s.q} className="ask-card" onClick={() => sendMessage(s.q)} disabled={loading}>
                      <i className={`bi bi-${s.icon}`} /><span><b>{s.title}</b><small>{s.q}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            ) : messages.map((m, i) => (
              <div key={i} className={`ask-row ${m.role}`}>
                <Avatar role={m.role} />
                <div className="ask-col">
                  {m.steps?.length > 0 && (
                    <div className="ask-steps" aria-label="할망이 확인한 것">
                      <span className="ask-steps-label">확인한 것</span>
                      {m.steps.map((s, j) => {
                        const [label, icon] = TOOL_LABEL[s.tool] ?? [s.tool, 'tools']
                        return <span key={j} className={`ask-step ${s.error ? 'err' : ''}`} title={JSON.stringify(s.args)}><i className={`bi bi-${icon} me-1`} />{label}{!s.error && s.count > 0 ? ` ${s.count}건` : ''}{s.error ? ' · 오류' : ''}</span>
                      })}
                    </div>
                  )}
                  <div className={`ask-bubble ${m.role} ${m.error ? 'error' : ''}`}>
                    {m.error && <div className="ask-err-title"><i className="bi bi-exclamation-triangle-fill me-1" />지금은 답하기 어려워요</div>}
                    {m.text}
                    {m.error && <div className="mt-2"><Button size="sm" variant="outline-danger" className="rounded-pill" onClick={retryMessage} disabled={loading}><i className="bi bi-arrow-repeat me-1" />다시 시도</Button></div>}
                  </div>
                  {m.fallback && <div className="ask-note"><i className="bi bi-arrow-repeat me-1" />할망의 AI(Claude)를 쓸 수 없어 Gemini가 대신 답했어요</div>}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ask-row assistant">
                <Avatar role="assistant" />
                <div className="ask-col"><div className="ask-bubble assistant ask-typing"><span /><span /><span /><em>할망이 확인하는 중…</em></div></div>
              </div>
            )}
          </div>

          <form className="ask-form" onSubmit={submit}>
            <textarea className="ask-input" rows={2} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} placeholder="할망에게 물어보세요 (예: 내일 비 오면 어디가 좋아?)" aria-label="질문 입력" />
            <Button type="submit" size="lg" className="ask-send" disabled={loading || !input.trim()}><i className="bi bi-send-fill me-2" />보내기</Button>
          </form>
          <div className="ask-disclaimer">할망의 답은 공공데이터를 바탕으로 한 참고용이에요. 운영시간·요금은 방문 전에 한 번 더 확인해 주세요.</div>
        </section>
      </div>
    </>
  )
}
