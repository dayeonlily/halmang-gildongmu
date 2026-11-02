// 세 API를 묶어 "우리 가족 맞춤 점수"를 매긴다 (각 0~100 → 가중 합산)
//   접근성 30 · 아이 맞춤 25 · 날씨 안전 20 · 비용 15 · 테마 일치 10(테마를 골랐을 때) · 가까움 15(머무는 곳을 골랐을 때)
// 점수는 가족 설정(아이 나이·유모차/휠체어/수유·예산)과 지금 누른 테마에 따라 달라진다.
import { searchTour, getIntro, getOverview } from './tour.js'
import { getAccess } from './access.js'
import { getWeather, placeByLat } from './weather.js'
import { crowdFor, getAir, getCrowdTable, getUv, todayYmd } from './environment.js'

// 장소 하나의 조회가 늦어져도 전체를 기다리게 하지 않는다: ms 안에 못 받으면 fallback 값으로 계속 진행
// 못 불러온 정보를 issues 에 기록한다 (한도 초과 'quota' / 오류 'error' / 시간 초과 'slow') → 결과에 알려서 점수가 덜 정확하다는 걸 숨기지 않는다
const makeSoft = (issues) => (promise, fallback, label, ms = 6000) => new Promise((resolve) => {
  const timer = setTimeout(() => { if (!issues.has(label)) issues.set(label, 'slow'); resolve(fallback) }, ms)
  promise.then((v) => { clearTimeout(timer); resolve(v) }, (e) => { clearTimeout(timer); issues.set(label, e?.quota ? 'quota' : 'error'); resolve(fallback) })
})

const INDOOR = new Set(['14', '38', '39']) // 문화시설·쇼핑·음식점
const BUDGET_LIMIT = { free: 0, low: 10000, mid: 30000, any: Infinity }
export const WEIGHTS = { access: 30, kids: 25, safety: 20, price: 15, theme: 10, near: 15, crowd: 12 }

// ① 접근성: 선택한 필요(유모차·휠체어·수유)는 크게, 나머지 시설은 작게 → 시설이 많이 갖춰질수록 점수가 달라진다
function accessScore(a, needs, intro = {}) {
  if (!a?.registered) {
    // 무장애 정보가 없어도 소개 정보의 유모차 대여·주차로 조금씩 구분한다
    const notes = []
    let score = 25
    if (intro.carriage === 'yes') { score += 18; notes.push('유모차 대여') }
    else if (intro.carriage === 'no' && needs.includes('stroller')) score -= 8
    if (intro.parking === 'yes') { score += 8; notes.push('주차 가능') }
    else if (intro.parking === 'no' && (needs.includes('wheelchair') || needs.includes('stroller'))) score -= 5
    if (!notes.length) notes.push('무장애 정보 미등록')
    return { score: Math.max(5, score), notes }
  }
  const f = a.flags, notes = []
  let score = 30, max = 30
  const want = (key, need, big, small, label) => {
    const w = need ? big : small
    if (!w) return
    max += w
    if (f[key]) { score += w; if (label) notes.push(label) }
  }
  const stroller = needs.includes('stroller'), wheel = needs.includes('wheelchair'), nursing = needs.includes('nursing')
  want('stroller', stroller, 25, 8, '유모차 가능')
  want('wheelchair', wheel, 25, 6, '휠체어 가능')
  want('elevator', stroller || wheel, 10, 6, '엘리베이터')
  want('exit', stroller || wheel, 5, 3, '출입구 단차 정보')
  want('lactation', nursing, 20, 8, '수유실')
  want('restroom', true, 10, 10, '장애인 화장실')
  want('parking', true, 10, 10, '장애인 주차')
  return { score: Math.round((score / max) * 100), notes }
}

// ② 아이 맞춤: 아이 나이대에 따라 같은 장소도 점수가 다르다
// 아이와 함께 갈 수 없는 성인 대상 장소(성 테마 박물관·공원, 술집·주점·유흥 등)는 추천 목록에서 뺀다
const ADULT_TITLE = /건강과\s*성|성\s*박물관|성\s*문화|러브\s*랜드|러브랜드|섹스|에로|누드|19금|성인\s*(전용|용품|영화)|술\s*박물관|이자카야|포차|호프|주점|술집|\bpub\b|\bbar\b|와인\s*바|칵테일|라운지\s*바|룸\s*살롱|클럽|나이트|카지노|유흥/i
const ADULT_TEXT = /성인\s*(전용|만\s*(입장|관람|이용))|19\s*세\s*(미만|이상)|미성년자[^.。]{0,8}(출입|입장|관람|이용)[^.。]{0,4}(불가|금지|제한)|청소년\s*(관람|입장|출입|이용)\s*(불가|금지)|성(인)?\s*조각|성\s*(을|에)\s*(주제|테마)/
const isAdultOnly = (title, overview = '') => ADULT_TITLE.test(title) || ADULT_TEXT.test(overview)

// 아이 나이에 아직 이르거나 위험한 활동은 그 나이 가족에게는 목록에서 뺀다 (예: 영아·걸음마기에 장거리 트레킹·오프로드·카약·승마)
const BLOCK_YOUNG = /올레\s*\d|올레길|트레킹|둘레길\s*\d|오프로드|ATV|사륜|카트|서킷|레이싱|사격|카약|서핑|스쿠버|다이빙|패러|번지|짚라인|래프팅|요트|잠수함|승마|낚시|암벽|클라이밍|서바이벌|야간\s*투어|동굴|만장굴|쌍용굴|해안열두굴|열두굴/i
const BLOCK_PRESCHOOL = /올레\s*\d+\s*코스|오프로드|ATV|사륜|서킷|레이싱|사격|스쿠버|다이빙|패러|번지|래프팅|서바이벌|암벽|클라이밍/i
const BLOCK_LOWER = /사격|스쿠버|다이빙|패러|번지|서바이벌|암벽|클라이밍/i
const BLOCK_BY_AGE = { infant: BLOCK_YOUNG, toddler: BLOCK_YOUNG, preschool: BLOCK_PRESCHOOL, lower: BLOCK_LOWER }
const isAgeBlocked = (title, age) => Boolean(BLOCK_BY_AGE[age]?.test(title))

const KID_PLAY = /키즈|어린이|아이|체험|놀이|동물|목장|농장|공원|아쿠아|테마파크|승마|썰매/ // 영아·걸음마기: 박물관·미술관이라는 이름만으로는 아이 장소로 보지 않는다
const KID = /키즈|어린이|아이|체험|놀이|동물|목장|농장|공원|박물관|과학|아쿠아|테마파크|승마|썰매|미술관/
const ANIMAL_PARK = /동물|목장|농장|공원|해변|해수욕|아쿠아/
const TOUGH = /오름|올레|등반|한라산|트레킹|폭포|동굴|둘레길/
const CULTURE = /박물관|역사|유적|기념관|민속|문화|전시|항일|4·3|해녀/
const KID_FOOD = /돈가스|돈까스|우동|국수|피자|파스타|김밥|죽|순두부|오므라이스|함박|스테이크|볶음밥|치킨|계란|감귤|아이스크림|빵/
const SPICY_RAW = /회|횟|물회|육회|매운|마라|낙지|곱창|술|막걸리|이자카야|포차|훠궈/
const FAMILY_ROOM = /키즈|패밀리|온돌|수영장|풀|가족|스위트/
function kidsScore(p, a, ageBand, indoor, intro = {}) {
  const text = `${p.title} ${p.addr ?? ''}`
  const f = a?.flags ?? {}, notes = []
  let s = 50
  // 소개 정보에서 아이와 관련된 값: 체험 가능 연령·체험 안내·어린이 놀이방·유모차 대여·가족 객실
  if (/전\s*연령|누구|어린이|유아|아동|가족|연령\s*무관/.test(intro.expage)) { s += 10; notes.push('전 연령 체험') }
  if (intro.exp) s += 6
  if (intro.kidsfac === 'yes') { s += 14; notes.push('어린이 놀이방') }
  if (intro.carriage === 'yes' && (ageBand === 'infant' || ageBand === 'toddler')) s += 8
  if (p.type === '39') {
    if (KID_FOOD.test(intro.menu)) { s += 12; notes.push('아이가 먹기 좋은 메뉴') }
    if (SPICY_RAW.test(intro.menu + p.title) && (ageBand === 'infant' || ageBand === 'toddler')) { s -= 12; notes.push('날것·매운 메뉴 위주') }
    if (/카페|디저트|베이커리/.test(p.title + intro.menu) && ageBand !== 'upper') s += 4
  }
  if (p.type === '32' && FAMILY_ROOM.test(`${intro.room} ${intro.sub}`)) { s += 12; notes.push('가족 객실·부대시설') }
  const kid = (ageBand === 'infant' || ageBand === 'toddler' ? KID_PLAY : KID).test(text), tough = TOUGH.test(text)
  if (ageBand === 'infant') {
    if (indoor) { s += 12; notes.push('실내라 영아에게 편해요') }
    if (f.lactation) { s += 14; notes.push('수유실 있음') }
    if (f.babychair) { s += 8; notes.push('유아 의자') }
    if (f.stroller) s += 14
    if (a?.family) s += 6
    if (tough) { s -= 18; notes.push('걷기·오르막 부담') }
    if (kid) s += 6
  } else if (ageBand === 'toddler') {
    if (indoor) s += 6
    if (f.lactation) s += 6
    if (f.stroller) s += 10
    if (tough) { s -= 12; notes.push('걸음마기엔 오르막 부담') }
    if (kid) { s += 14; notes.push('아이 놀이·체험') }
    if (ANIMAL_PARK.test(text)) s += 6
  } else if (ageBand === 'lower') {
    if (kid) { s += 16; notes.push('아이 놀이·체험') }
    if (p.type === '28') { s += 10; notes.push('체험 활동') }
    if (ANIMAL_PARK.test(text)) s += 6
    if (/오름/.test(text)) s += 4
  } else if (ageBand === 'upper') {
    if (p.type === '28') { s += 12; notes.push('체험 활동') }
    if (p.type === '14') s += 10
    if (CULTURE.test(text)) { s += 8; notes.push('역사·문화 배움') }
    if (tough) { s += 8; notes.push('걷는 재미') }
    if (/키즈|유아/.test(text)) s -= 10
  } else { // 유아(기본)
    if (kid) { s += 18; notes.push('아이 놀이·체험') }
    if (p.type === '28') s += 8
    if (/해변|해수욕|숲|공원/.test(text)) s += 8
    if (tough) s -= 4
  }
  return { score: Math.max(0, Math.min(100, Math.round(s))), notes }
}

// 오늘(한국 시간) 정기 휴무인가: "매주 화요일" 같은 주간 휴무만 읽는다 ("첫째 주 월요일" 같은 건 판단하지 않음)
const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const dayChar = (ymd) => DAYS[new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8))).getUTCDay()]
function closedOn(rest, ymd) {
  if (!rest || /연중무휴|무휴/.test(rest)) return false
  const m = rest.match(/매주\s*([^※()]{0,14})/)
  return Boolean(m && new RegExp(`${dayChar(ymd)}(요일|,|·|/|\\s|$)`).test(`${m[1]} `))
}

// 미세먼지·자외선: 야외 장소의 안전 점수를 깎고, 아이가 어릴수록 더 깎는다 (환경 값은 오늘 기준)
function envPenalty(indoor, age, { air, uv }) {
  if (indoor) return { delta: air?.grade >= 3 ? 4 : 0, notes: [] }
  const young = age === 'infant' || age === 'toddler'
  let delta = 0
  const notes = []
  if (air?.grade === 3) { delta -= young ? 24 : 18; notes.push('미세먼지 나쁨') }
  else if (air?.grade === 4) { delta -= young ? 42 : 34; notes.push('미세먼지 매우 나쁨') }
  if (uv?.max >= 11) { delta -= young ? 22 : 18; notes.push('자외선 위험') }
  else if (uv?.max >= 8) { delta -= young ? 16 : 12; notes.push('자외선 매우 높음') }
  else if (uv?.max >= 6) { delta -= young ? 10 : 6; notes.push('자외선 높음') }
  return { delta, notes }
}

// 소개글에서 읽는 신호: 장소마다 설명이 달라서 같은 해변·오름이라도 점수가 갈린다
const hits = (re, text) => (text.match(re) ?? []).length
const T_KID = /아이|어린이|유아|가족|놀이|체험|동물|먹이|그네|잔디|모래놀이|물놀이/g
const T_EASY = /평탄|평지|완만|산책로|데크|산책하기 좋|걷기 좋|넓은 주차|쉬엄쉬엄|그늘/g
const T_HARD = /가파|급경사|경사가|계단|험한|험준|오르막|암벽|절벽|미끄|위험|등반|바위|돌길|자갈/g
const T_ACC = /유모차|휠체어|장애인|엘리베이터|경사로|편의시설|수유/g
const T_QUIET = /조용|한적|고즈넉|여유|사색|평화로운|호젓|힐링|치유/g
const T_LOUD = /북적|붐비|시끌|떠들썩|인파|혼잡|워터파크|테마파크|놀이공원|페스티벌|축제|카트|서킷|레이싱|ATV|메이즈|클럽/g
const T_HIST = /역사|유적|설화|전설|유네스코|세계|문화재|4·3|해녀|돌하르방/g
function textSignals(text, age, needs) {
  const kid = Math.min(3, hits(T_KID, text)), easy = Math.min(2, hits(T_EASY, text)), hard = Math.min(2, hits(T_HARD, text))
  const acc = Math.min(2, hits(T_ACC, text)), hist = Math.min(2, hits(T_HIST, text))
  const needsEase = needs.includes('stroller') || needs.includes('wheelchair')
  const quiet = Math.min(2, hits(T_QUIET, text)), loud = Math.min(2, hits(T_LOUD, text))
  const young = age === 'infant' || age === 'toddler'
  let kids = 0
  const notes = []
  if (young) { kids += easy * 5 - hard * 7 + kid * 3 }
  else if (age === 'upper') { kids += hist * 4 + kid * 2 - (hard ? 0 : 0) }
  else { kids += kid * 4 + easy * 2 - hard * 3 }
  if (hard && (young || needsEase)) notes.push('소개글에 계단·경사 언급')
  else if (easy && (young || needsEase)) notes.push('걷기 편한 곳')
  if (needs.includes('sensory')) { // 조용한 환경을 원하면: 한적한 곳은 가점, 북적이는 곳은 감점
    kids += quiet * 5 - loud * 7
    if (quiet) notes.push('조용한 분위기')
    if (loud) notes.push('북적이는 편')
  }
  let access = 0
  if (needsEase) access += easy * 4 - hard * 6
  access += acc * 5
  if (acc) notes.push('소개글에 유모차·편의시설 언급')
  return { kids, access, notes, len: text.length }
}

// ③ 날씨·운영 안전 (기상청 예보 + 미세먼지 + 자외선 + 정기 휴무)
function safetyScore(p, w, intro = {}, { ymd, age, env = {} } = {}) {
  const indoor = INDOOR.has(p.type)
  let s = 80
  if (w.wet) s += indoor ? 15 : -45
  if (w.hot) s += indoor ? 10 : -25
  if (w.cold) s += indoor ? 10 : -20
  if (w.windy && !indoor) s -= 15
  if (!indoor && TOUGH.test(p.title) && (w.wet || w.windy)) s -= 10
  // 같은 날씨여도 강수확률·쾌적한 기온(약 15~25도)에서 벗어난 만큼 야외는 조금씩 깎는다
  if (!indoor) { s -= Math.round((w.pop ?? 0) * 0.15); if (w.temp != null) s -= Math.round(Math.max(0, Math.abs(w.temp - 20) - 5) * 0.8) }
  else if ((w.pop ?? 0) >= 30 || (w.temp != null && Math.abs(w.temp - 20) > 10)) s += 3
  const e = envPenalty(indoor, age, env)
  s += e.delta
  const closed = closedOn(intro.rest, ymd)
  if (closed) s = Math.min(s, 10)
  return { score: Math.max(0, Math.min(100, s)), indoor, closed, notes: e.notes }
}

// ④ 비용: 예산 안이면 높게, 넘으면 낮게. 예산 상관없음이어도 값이 낮을수록 높게 매겨 구분한다
const NATURE_FREE = /오름|올레|숲|곶자왈|해변|해수욕|해안|공원|폭포|둘레길|산책로|전망대/
function priceScore(fee, budget, p) {
  if (fee == null || fee === '') {
    if (p.type === '12' && NATURE_FREE.test(p.title)) return { score: 80, label: '자연 장소(대개 무료)', won: null }
    const t = `${p.title} ${p.menu ?? ''}`
    if (p.type === '39' && /횟집|한우|스시|초밥|오마카세|코스|정식|스테이크|전복|갈치조림|고등어회|랍스터/.test(t)) return { score: 40, label: '비싼 편(추정)', won: null }
    if (p.type === '39' && /국수|분식|김밥|해장국|순대|백반|토스트|빵집|베이커리|칼국수|순두부|돈가스/.test(t)) return { score: 78, label: '가성비 좋은 편(추정)', won: null }
    if (p.type === '32' && /호텔|리조트|풀빌라/.test(t)) return { score: 35, label: '숙박비 높은 편(추정)', won: null }
    if (p.type === '32' && /게스트하우스|민박|캠핑|도미토리/.test(t)) return { score: 75, label: '숙박비 낮은 편(추정)', won: null }
    return { score: 60, label: '요금 정보 없음', won: null }
  }
  if (/무료/.test(fee) && !/유료|\d{3,}/.test(fee.replace(/무료/g, ''))) return { score: 100, label: '무료', won: 0 }
  const nums = [...fee.matchAll(/(\d{1,3}(?:,\d{3})+|\d{3,6})\s*원/g)].map((m) => Number(m[1].replace(/,/g, '')))
  if (!nums.length) return { score: 60, label: fee.slice(0, 24), won: null }
  const won = Math.min(...nums), limit = BUDGET_LIMIT[budget] ?? Infinity
  const score = limit === Infinity
    ? Math.max(50, 92 - Math.round(won / 1200))
    : won <= limit ? Math.round(95 - (won / (limit || 1)) * 12) : Math.max(10, 80 - Math.round(((won - limit) / (limit || 10000)) * 45))
  return { score: Math.max(0, Math.min(100, score)), label: `${won.toLocaleString()}원~`, won }
}

// ⑤ 테마 일치: 고른 테마·검색어가 장소 이름·주소에 들어 있는가
function themeScore(p, keyword) {
  const kws = String(keyword ?? '').split(',').map((k) => k.trim()).filter(Boolean)
  if (!kws.length) return null
  if (kws.some((k) => p.title.includes(k))) return 100
  if (kws.some((k) => (p.addr ?? '').includes(k))) return 70
  return 45
}

const rad = (d) => (d * Math.PI) / 180
const distKm = (a, b) => { const x = rad(b.lat - a.lat), y = rad(b.lng - a.lng); const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)) }
// ⑥ 가까움: 머무는 곳(또는 내 여행 바구니 중심)에서 8km 이내면 만점, 50km 가까이 멀면 20점
const nearScore = (km) => Math.max(10, Math.min(100, Math.round(100 - Math.max(0, km - 8) * (80 / 42))))

// 못 불러온 정보를 화면에 알릴 형태로: { quota: [한도 초과로 못 받은 것], other: [그 밖의 이유로 못 받은 것] }
const degradedOf = (issues) => {
  if (!issues.size) return null
  const pick = (f) => [...issues].filter(([, v]) => f(v)).map(([k]) => k)
  return { quota: pick((v) => v === 'quota'), other: pick((v) => v !== 'quota') }
}

export async function recommend({ keyword = '', contentTypeId = '', needs = [], budget = 'any', age = 'preschool', near = null, date = '', page = 1, limit = 12, accessibleOnly = false } = {}) {
  // 방문 날짜: 집중률 예측과 정기 휴무 판단에 쓴다 (지난 날짜나 이상한 값이면 오늘)
  const W = needs.includes('sensory') ? { ...WEIGHTS, crowd: WEIGHTS.crowd * 2 } : WEIGHTS // 조용한 환경 선호: 덜 붐비는 곳을 더 중요하게
  const issues = new Map()
  const soft = makeSoft(issues)
  const today = todayYmd()
  const ymd = /^\d{8}$/.test(date) && date >= today ? date : today
  const [found, air, uvJeju, uvSeogwipo, crowdTable] = await Promise.all([
    searchTour({ keyword, contentTypeId, page, rows: limit, accessibleOnly }),
    soft(getAir(), null, '미세먼지', 7000), soft(getUv('제주시'), null, '자외선', 7000), soft(getUv('서귀포시'), null, '자외선', 7000), soft(getCrowdTable(), null, '혼잡 예측', 7000), // 환경 정보가 늦으면 그 항목만 빼고 진행
  ])
  const allCandidates = found.items.filter((p) => p.lat && p.lng)
  const candidates = allCandidates.filter((p) => !isAdultOnly(p.title) && !isAgeBlocked(p.title, age)) // 이름으로 먼저 거른다 (소개글은 아래에서 한 번 더)
  const weatherByPlace = {}
  const getW = (place) => (weatherByPlace[place] ??= getWeather({ place }).catch(() => null))

  const enriched = await Promise.all(candidates.map(async (p) => {
    const [access, intro, wx, overview] = await Promise.all([
      soft(getAccess({ id: p.id }), { id: p.id, registered: false }, '무장애 정보'),
      soft(getIntro(p), {}, '요금·주차 정보'),
      soft(getW(placeByLat(p.lat)), null, '기상 예보'),
      soft(getOverview(p), '', '소개글'),
    ])
    if (isAdultOnly(p.title, overview)) return null // 소개글에 성인 전용·미성년자 출입 금지 등이 있는 곳
    const ts = textSignals(`${p.title}. ${overview}`, age, needs)
    const a0 =accessScore(access, needs, intro)
    const a = { score: Math.max(0, Math.min(100, a0.score + ts.access)), notes: a0.notes }
    const s = safetyScore(p, wx?.summary ?? {}, intro, { ymd, age, env: { air, uv: placeByLat(p.lat) === '서귀포시' ? uvSeogwipo : uvJeju } })
    const rate = crowdFor(crowdTable, p.title, ymd) // 집중률: 클수록 붐빈다
    const crowdNote = rate == null ? [] : rate >= 80 ? [`붐빌 예정(${Math.round(rate)}%)`] : rate <= 30 ? ['한산할 예정'] : []
    const k0 = kidsScore(p, access, age, s.indoor, intro)
    const k = { score: Math.max(0, Math.min(100, k0.score + ts.kids)), notes: k0.notes }
    const c = priceScore(intro.fee, budget, { ...p, menu: intro.menu })
    const t = themeScore(p, keyword)
    const km = near ? distKm(near, p) : null
    const parts = { access: a.score, kids: k.score, safety: s.score, price: c.score, ...(t == null ? {} : { theme: t }), ...(km == null ? {} : { near: nearScore(km) }), ...(rate == null ? {} : { crowd: Math.max(0, Math.min(100, Math.round(100 - rate))) }) }
    const wsum = Object.keys(parts).reduce((n, key) => n + W[key], 0)
    const exact = Object.entries(parts).reduce((n, [key, v]) => n + v * W[key], 0) / wsum
    const total = Math.round(exact) // 화면에는 정수만, 정렬은 소수까지 가진 rank 로
    return {
      ...p, access, indoor: s.indoor, price: c.label,
      rank: exact + Math.min(overview.length, 1500) / 1e5, // 정렬용(같은 점수면 소개 정보가 충실한 곳이 앞에)
      scores: { ...parts, total }, notes: [...(s.closed ? [ymd === today ? '오늘 휴무' : '그날 휴무'] : []), ...s.notes, ...crowdNote, ...(km == null ? [] : [`${km < 10 ? km.toFixed(1) : Math.round(km)}km`]), ...a.notes, ...k.notes, ...ts.notes].slice(0, 5), distanceKm: km == null ? null : Math.round(km * 10) / 10,
    }
  }))
  const items = enriched.filter(Boolean)
  const hiddenAdult = allCandidates.length - items.length // 성인 대상이라 뺀 장소 수
  items.sort((x, y) => y.rank - x.rank)
  const w = await getW('제주시')
  const weights = Object.fromEntries(Object.entries(W).filter(([key]) => (key !== 'theme' || String(keyword).trim()) && (key !== 'near' || near)))
  return { weather: w?.summary ?? null, items, total: found.total, page, hasMore: page * limit < found.total, hiddenAdult, degraded: degradedOf(issues), basis: { age, needs, budget, weights, date: ymd }, env: { air, uv: uvJeju } }
}
