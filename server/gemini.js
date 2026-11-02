// Claude 를 쓸 수 없을 때(크레딧 소진·키 오류·사용량 초과·서버 장애) 대신 답하는 Gemini 에이전트.
// Claude 와 같은 도구(tools)·같은 시스템 지침을 쓰고, SDK 없이 REST 로 부른다.
// 키는 주소(URL)에 넣지 않고 헤더(x-goog-api-key)로 보낸다.

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
// 모델은 .env 의 GEMINI_MODEL 로 바꿀 수 있고, 없는 모델이면(404) 다음 것으로 넘어간다
const modelList = () => [...new Set([process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash'].filter(Boolean))]

// JSON Schema(Claude 도구 설명서) → Gemini 가 받는 스키마(타입은 대문자, 쓰지 않는 항목은 뺀다)
function toGeminiSchema(s) {
  if (!s || typeof s !== 'object') return s
  const out = { type: String(s.type ?? 'string').toUpperCase() }
  if (s.description) out.description = s.description
  if (s.enum) out.enum = s.enum
  if (s.properties) out.properties = Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, toGeminiSchema(v)]))
  if (s.items) out.items = toGeminiSchema(s.items)
  if (s.required?.length) out.required = s.required
  return out
}

class GeminiError extends Error {
  constructor(status, message) { super(message); this.status = status; this.provider = 'gemini' }
}

async function generate(model, body) {
  let r
  try {
    r = await fetch(`${BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify(body),
    })
  } catch (e) { throw new GeminiError(0, `Gemini 에 연결하지 못했어요: ${e.message}`) }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = data?.error?.message ?? `Gemini 오류 (${r.status})`
    // 잘못된 키는 Google 이 400 으로 돌려준다 → 키 오류(401)로 바꿔서 안내 문구가 맞게 나오게 한다
    throw new GeminiError(r.status === 400 && /API key not valid|API_KEY_INVALID/i.test(`${msg} ${JSON.stringify(data?.error?.details ?? '')}`) ? 401 : r.status, msg)
  }
  return data
}

// 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
export async function runGemini({ message, history, system, tools, exec, steps, maxTurns = 6, tooMany }) {
  const declarations = tools.map((t) => ({ name: t.name, description: t.description, parameters: toGeminiSchema(t.input_schema) }))
  const contents = [
    ...history.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: String(m.content ?? '') }] })),
    { role: 'user', parts: [{ text: message }] },
  ]
  let model = modelList()[0]
  const fallbackModels = modelList().slice(1)

  for (let turn = 0; turn < maxTurns; turn++) {
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      tools: [{ functionDeclarations: declarations }],
      generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
    }
    let data
    for (;;) {
      try { data = await generate(model, body); break }
      catch (e) { if (e.status === 404 && fallbackModels.length) { model = fallbackModels.shift(); continue } throw e }
    }
    const content = data.candidates?.[0]?.content
    const parts = content?.parts ?? []
    const calls = parts.filter((p) => p.functionCall)
    if (!calls.length) {
      const text = parts.map((p) => p.text ?? '').join('').trim()
      if (text) return text
      const why = data.promptFeedback?.blockReason ?? data.candidates?.[0]?.finishReason
      throw new GeminiError(502, `Gemini 가 빈 답을 보냈어요${why ? ` (${why})` : ''}`)
    }
    contents.push(content) // 모델이 보낸 도구 호출을 그대로 이어 붙인다 (서명 등 포함)
    const responses = []
    for (const { functionCall: c } of calls) {
      const raw = await exec(c.name, c.args, steps)
      let parsed
      try { parsed = JSON.parse(raw) } catch { parsed = raw }
      responses.push({ functionResponse: { name: c.name, response: { result: parsed } } })
    }
    contents.push({ role: 'user', parts: responses })
  }
  return tooMany
}
