// 세 API를 묶어 "접근성 · 안전 · 가격" 점수로 스팟을 추천한다 (각 0~100 → 가중 합산)
import { searchTour, getUseFee } from './tour.js'
import { getAccess } from './access.js'
import { getWeather, placeByLat } from './weather.js'

const INDOOR = new Set(['14', '38', '39']) // 문화시설·쇼핑·음식점
const BUDGET_LIMIT = { free: 0, low: 10000, mid: 30000, any: Infinity }

function accessScore(a, needs) {
  if (!a?.registered) return { score: 25, notes: ['무장애 정보 미등록'] }
  const f = a.flags, notes = []
  let score = 30, max = 30
  const want = (cond, key, w, label) => {
    if (!cond) return
    max += w
    if (f[key]) { score += w; notes.push(label) }
  }
  const stroller = needs.includes('stroller'), wheel = needs.includes('wheelchair')
  want(stroller, 'stroller', 25, '유모차 가능')
  want(wheel, 'wheelchair', 25, '휠체어 가능')
  want(stroller || wheel, 'elevator', 10, '엘리베이터')
  want(stroller || wheel, 'exit', 5, '출입구 단차 정보')
  want(needs.includes('nursing'), 'lactation', 20, '수유실')
  want(true, 'restroom', 10, '장애인 화장실')
  want(true, 'parking', 10, '장애인 주차')
  return { score: Math.round((score / max) * 100), notes }
}

function safetyScore(p, w) {
  const indoor = INDOOR.has(p.type)
  let s = 80
  if (w.wet) s += indoor ? 15 : -45
  if (w.hot) s += indoor ? 10 : -25
  if (w.cold) s += indoor ? 10 : -20
  if (w.windy && !indoor) s -= 15
  return { score: Math.max(0, Math.min(100, s)), indoor }
}

function priceScore(fee, budget) {
  if (fee == null || fee === '') return { score: 60, label: '요금 정보 없음', won: null }
  if (/무료/.test(fee) && !/유료|\d{3,}/.test(fee.replace(/무료/g, ''))) return { score: 100, label: '무료', won: 0 }
  const nums = [...fee.matchAll(/(\d{1,3}(?:,\d{3})+|\d{3,6})\s*원/g)].map((m) => Number(m[1].replace(/,/g, '')))
  if (!nums.length) return { score: 60, label: fee.slice(0, 24), won: null }
  const won = Math.min(...nums), limit = BUDGET_LIMIT[budget] ?? Infinity
  const score = limit === Infinity ? 80 : won <= limit ? 90 : Math.max(10, 90 - Math.round(((won - limit) / (limit || 10000)) * 40))
  return { score, label: `${won.toLocaleString()}원~`, won }
}

export async function recommend({ keyword = '', contentTypeId = '', needs = [], budget = 'any', limit = 9 } = {}) {
  const candidates = (await searchTour({ keyword, contentTypeId, rows: 20 })).filter((p) => p.lat && p.lng).slice(0, limit)
  const weatherByPlace = {}
  const getW = (place) => (weatherByPlace[place] ??= getWeather({ place }).catch(() => null))

  const items = await Promise.all(candidates.map(async (p) => {
    const [access, fee, wx] = await Promise.all([
      getAccess({ id: p.id }).catch(() => ({ id: p.id, registered: false })),
      getUseFee(p).catch(() => null),
      getW(placeByLat(p.lat)),
    ])
    const a = accessScore(access, needs)
    const s = safetyScore(p, wx?.summary ?? {})
    const c = priceScore(fee, budget)
    const total = Math.round(a.score * 0.45 + s.score * 0.3 + c.score * 0.25)
    return {
      ...p, access, indoor: s.indoor, price: c.label,
      scores: { access: a.score, safety: s.score, price: c.score, total }, notes: a.notes,
    }
  }))
  items.sort((x, y) => y.scores.total - x.scores.total)
  const w = await getW('제주시')
  return { weather: w?.summary ?? null, items }
}
