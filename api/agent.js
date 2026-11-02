// POST /api/agent — "할망" 에이전트: 공공데이터 API 3종 + 이야기·체크리스트를 도구로 쓴다
import Anthropic from '@anthropic-ai/sdk'
import { recommend } from '../server/recommend.js'
import { getAccess } from '../server/access.js'
import { getWeather } from '../server/weather.js'
import { STORIES, JEJU_WORDS, CHECKLISTS, AGE_BANDS, missionsFor, findStory } from '../shared/lore.js'

const MODEL = 'claude-sonnet-5-5'

// ① 도구 설명서 — Claude는 이 설명만 보고 "무슨 도구를 언제 쓸지" 정한다
const tools = [
  {
    name: 'search_spots',
    description: '한국관광공사 관광정보 + 무장애 여행정보 + 기상청 예보를 합쳐, 아이 동반 가족에게 맞는 제주 스팟을 접근성·안전·가격 점수순으로 추천한다',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '검색어 (예: 해녀, 오름, 박물관, 체험). 비우면 전체' },
        contentTypeId: { type: 'string', description: '12 관광지, 14 문화시설, 15 축제·행사, 39 음식점. 비우면 전체' },
        needs: { type: 'array', items: { type: 'string', enum: ['stroller', 'wheelchair', 'nursing', 'sensory'] } },
        budget: { type: 'string', enum: ['free', 'low', 'mid', 'any'] },
        accessibleOnly: { type: 'boolean', description: '무장애 여행정보에 등록된 장소만 보고 싶을 때 true' },
        page: { type: 'integer', description: '더 많은 결과가 필요할 때 2, 3...' },
      },
    },
  },
  {
    name: 'get_accessibility',
    description: '한 장소의 무장애 상세(유모차·휠체어·엘리베이터·수유실·화장실·주차)를 조회한다. contentId는 search_spots 결과의 id',
    input_schema: { type: 'object', properties: { contentId: { type: 'string' } }, required: ['contentId'] },
  },
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 향후 몇 시간 기온·하늘·강수확률과 아이 동반 조언을 조회한다',
    input_schema: { type: 'object', properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } }, required: ['place'] },
  },
  {
    name: 'tell_story',
    description: '제주 설화·문화 이야기(설문대할망, 오백장군, 해녀, 돌하르방, 영등할망)를 가져온다. id 없이 부르면 목록을 준다',
    input_schema: { type: 'object', properties: { id: { type: 'string', enum: STORIES.map((s) => s.id) } } },
  },
  {
    name: 'get_kids_content',
    description: '아이 연령대에 맞는 미션 카드, 제주어 카드, 보호자 체크리스트를 가져온다',
    input_schema: {
      type: 'object',
      properties: { ageBand: { type: 'string', enum: AGE_BANDS.map((a) => a.key) } },
      required: ['ageBand'],
    },
  },
]

// ② 도구 이름 → 실제 실행 함수
const runTool = {
  search_spots: async (i) => {
    const r = await recommend({ keyword: i.keyword, contentTypeId: i.contentTypeId, needs: i.needs ?? [], budget: i.budget ?? 'any', page: i.page ?? 1, accessibleOnly: Boolean(i.accessibleOnly), limit: 6 })
    return r.items.map((p) => ({
      id: p.id, title: p.title, addr: p.addr, type: p.type, indoor: p.indoor, price: p.price,
      scores: p.scores, notes: p.notes,
    }))
  },
  get_accessibility: (i) => getAccess({ id: i.contentId }),
  get_weather: (i) => getWeather({ place: i.place }),
  tell_story: (i) => {
    const s = i.id && findStory(i.id)
    return s ? { title: s.title, place: s.place, lines: s.lines } : STORIES.map((x) => ({ id: x.id, title: x.title, place: x.place }))
  },
  get_kids_content: (i) => ({
    missions: missionsFor(i.ageBand).map((m) => ({ title: m.title, text: m.text })),
    words: JEJU_WORDS.slice(0, 4),
    checklist: CHECKLISTS[i.ageBand],
  }),
}

function systemPrompt(profile) {
  const ages = (profile?.child_age_bands ?? []).map((k) => AGE_BANDS.find((a) => a.key === k)?.label).filter(Boolean)
  const lines = profile ? [
    `- 아이 연령대: ${ages.join(', ') || '미입력'}`,
    `- 접근성 필요: ${(profile.needs ?? []).join(', ') || '없음'}`,
    `- 예산: ${profile.budget ?? 'any'}`,
  ].join('\n') : '- (프로필 미입력)'
  return `너는 "할망 길동무" — 아이와 함께 제주를 걷는 가족을 돕는 다정한 제주 할망이다.
말투는 따뜻한 할망 어투(예: "~하주", "~켜", "~여")를 살짝 섞되 읽기 쉽게 한다.

[가족 정보]
${lines}

[규칙]
- 장소·접근성·날씨 정보는 반드시 도구로 확인한 뒤 답한다. 도구 결과에 없는 장소·시설·요금은 지어내지 않는다.
- 장소를 추천할 땐 접근성·안전·가격 점수 중 근거를 한 줄로 말하고, 가족의 접근성 필요(유모차·휠체어 등)를 우선한다.
- 비·더위·강풍이 있으면 실내 대안을 함께 제안한다.
- 이야기를 요청받으면 tell_story로 가져와 그 내용을 바탕으로 아이 눈높이에 맞게 구연한다.
- 의료·응급 상황은 진단하지 말고 119/1339 안내와 일반적인 안전 수칙만 알려 준다.
- 답은 한국어로, 6문장 이내로 짧게.`
}

const MAX_TURNS = 6
const TOO_MANY = '확인할 게 너무 많아 멈췄주. 질문을 조금만 좁혀 주겠어요?'

// 도구 실행 + 화면에 "할망이 무엇을 확인했는지" 보여줄 기록
async function exec(name, input, steps) {
  let result
  try { result = await runTool[name](input ?? {}) }
  catch (e) { result = { error: e.message } }
  steps.push({ tool: name, args: input, count: Array.isArray(result) ? result.length : 1, error: result?.error })
  return JSON.stringify(result).slice(0, 12000)
}

// ── Claude 에이전트 루프: 생각 → 도구 호출 → 결과 확인 → (반복) → 최종 답
async function runClaude({ message, history, profile, steps }) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const messages = [...history, { role: 'user', content: message }]
  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const r = await client.messages.create({ model: MODEL, max_tokens: 1200, system: systemPrompt(profile), tools, messages })
    if (r.stop_reason !== 'tool_use') return r.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
    messages.push({ role: 'assistant', content: r.content })
    const results = []
    for (const b of r.content) {
      if (b.type !== 'tool_use') continue
      results.push({ type: 'tool_result', tool_use_id: b.id, content: await exec(b.name, b.input, steps) })
    }
    messages.push({ role: 'user', content: results })
  }
  return TOO_MANY
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY 가 설정되지 않았어요 (.env.local 확인)' })
  const { message, history = [], profile = null } = req.body ?? {}
  if (!message) return res.status(400).json({ error: 'message 가 필요해요' })
  const steps = [] // 화면에 "할망이 무엇을 확인했는지" 보여주기용

  try {
    const answer = await runClaude({ message, history: history.slice(-10), profile, steps }) // 최근 10개만 → 비용 절약
    res.status(200).json({ answer, steps })
  } catch (e) {
    res.status(e.status ?? 500).json({ error: e.status === 429 ? '사용량이 많아요. 1분 뒤 다시 시도하세요.' : e.message })
  }
}
