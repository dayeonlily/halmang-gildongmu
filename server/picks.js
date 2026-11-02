// 홈 "오늘 우리 가족이 가기 좋은 곳": 가족 정보(아이 나이·필요한 것·예산)로 점수를 매겨 3곳을 고른다.
// 관광지·체험·문화시설을 여러 쪽씩 모아 한꺼번에 점수를 비교하고, 나들이 장소가 아닌 곳(마트·골프·숙소 등)은 뺀다.
import { recommend } from './recommend.js'
import { AGE_LABEL } from '../shared/lore.js'

const TYPES = ['12', '28', '14'] // 관광지 · 레포츠·체험 · 문화시설
const NOT_OUTING = /마트|슈퍼|백화점|서점|편의점|스토어|쇼핑|면세|골프|리조트|호텔|펜션|모텔|민박|게스트하우스|병원|약국|주유|세차|공사|관리사무소|지하상가|시장\s*주차|파트먼트|편집숍|셀렉트\s*숍|탐방안내소|안내소|탐방로\s*입구|매표소|주차장|화장실|휴게소|정류장|갤러리\s*카페/
const cache = new Map() // 같은 가족 조건은 10분간 같은 답을 돌려준다 (공공데이터 호출을 아끼려고)

// 여러 조회에서 못 불러온 정보를 하나로 합친다
const mergeDegraded = (list) => {
  const quota = [...new Set(list.flatMap((d) => d?.quota ?? []))], other = [...new Set(list.flatMap((d) => d?.other ?? []))]
  return quota.length || other.length ? { quota, other } : null
}

const dayNumber = () => Math.floor((Date.now() + 9 * 3600e3) / 86400000)

// 종류마다 하루에 두 쪽씩, 날마다 다른 쪽을 본다. 범위를 넘어 비어 있으면 1쪽으로
async function pool(type, { needs, budget, age }, day) {
  const pages = [(day % 7) + 1] // 종류마다 하루 한 쪽(25곳): 처음 열 때 걸리는 시간을 줄인다
  const lists = await Promise.all(pages.map(async (page) => {
    const r = await recommend({ contentTypeId: type, needs, budget, age, page, limit: 15 }).catch(() => null)
    return r?.items?.length ? r : recommend({ contentTypeId: type, needs, budget, age, page: 1, limit: 15 }).catch(() => null)
  }))
  return lists.filter(Boolean)
}

// 점수 구성에서 가장 높은 항목으로 "왜 추천인지" 한 줄을 만든다
const REASON = { access: '이동하기 편해요', kids: '아이에게 잘 맞아요', safety: '오늘 날씨·공기에 안전해요', price: '비용 부담이 적어요', crowd: '덜 붐빌 예정이에요', near: '가까워요' }
const NOT_A_REASON = /나쁨|높음|위험|휴무|붐빌|계단|경사|미등록|부담|언급|오르막|날것|매운/ // 추천 이유에는 좋은 점만
function reasonOf(p) {
  const best = Object.entries(p.scores).filter(([k]) => REASON[k]).sort((a, b) => b[1] - a[1])[0]
  return [best ? REASON[best[0]] : '', ...p.notes.filter((n) => !/^\d|km$/.test(n) && !NOT_A_REASON.test(n))].filter(Boolean).slice(0, 3)
}

export async function homePicks({ needs = [], budget = 'any', age = 'preschool', count = 3 } = {}) {
  const key = JSON.stringify([needs.slice().sort(), budget, age, dayNumber()])
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < (hit.value.degraded ? 60e3 : 10 * 60e3)) return hit.value

  const day = dayNumber()
  const results = (await Promise.all(TYPES.map((t) => pool(t, { needs, budget, age }, day)))).flat()
  const seen = new Set()
  const all = results.flatMap((r) => r.items).filter((p) => (seen.has(p.id) ? false : seen.add(p.id)))
  // 나들이 장소가 아닌 곳을 빼고, 아이 맞춤 점수가 낮거나 오늘 쉬는 곳도 뺀다
  const young = age === 'infant' || age === 'toddler'
  // 영아·걸음마기는 레포츠(활동) 종류를 홈 추천에서 빼되, 체험·동물·농장처럼 어린아이가 즐기는 곳은 남긴다
  const youngOk = (p) => !young || p.type !== '28' || /체험|키즈|농장|목장|동물|공원|정원|놀이/.test(p.title)
  const fit = all.filter((p) => !NOT_OUTING.test(p.title) && youngOk(p) && p.scores.kids >= 50 && !p.notes.some((n) => /휴무/.test(n)))
  fit.sort((a, b) => b.rank - a.rank)

  // 같은 종류가 3곳을 다 차지하지 않게: 한 종류는 최대 2곳, 나머지는 점수순
  const picks = []
  const perType = {}
  for (const p of fit) {
    if ((perType[p.type] ?? 0) >= 2) continue
    picks.push(p); perType[p.type] = (perType[p.type] ?? 0) + 1
    if (picks.length >= count) break
  }
  const value = {
    basis: { age, ageLabel: AGE_LABEL[age] ?? '', needs, budget },
    items: picks.map((p) => ({ ...p, reasons: reasonOf(p) })),
    degraded: mergeDegraded(results.map((r) => r.degraded)),
    env: results[0]?.env ?? null, weather: results[0]?.weather ?? null, pooled: all.length,
  }
  cache.set(key, { at: Date.now(), value })
  return value
}
