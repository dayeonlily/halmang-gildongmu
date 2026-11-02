// ④ 에어코리아 대기오염정보 · ⑤ 기상청 생활기상지수(자외선) · ⑥ 한국관광공사 관광지 집중률 예측
// 장소마다가 아니라 "오늘 제주 전체" 또는 "장소 이름"으로 한 번씩 받아 두고 점수 계산에 함께 쓴다.
import { dataGo, toArray } from './dataGo.js'
import { crowdSnapshot } from './placeData.js'

const cache = new Map() // 키 → { at, value } (서버가 켜져 있는 동안만 기억)
async function cached(key, ttlMs, load) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value
  const value = await load()
  cache.set(key, { at: Date.now(), value })
  return value
}

const kstNow = () => new Date(Date.now() + 9 * 3600e3)
export const todayYmd = () => kstNow().toISOString().slice(0, 10).replaceAll('-', '')

// ── 에어코리아: 제주 측정소들의 중간값 ─────────────────────────
const median = (xs) => { const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : null }
const grade10 = (v) => (v == null ? 0 : v <= 30 ? 1 : v <= 80 ? 2 : v <= 150 ? 3 : 4)  // 좋음·보통·나쁨·매우나쁨
const grade25 = (v) => (v == null ? 0 : v <= 15 ? 1 : v <= 35 ? 2 : v <= 75 ? 3 : 4)
const GRADE_LABEL = ['정보 없음', '좋음', '보통', '나쁨', '매우 나쁨']

export const getAir = () => cached('air', 20 * 60e3, async () => {
  const body = await dataGo('https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty', {
    sidoName: '제주', returnType: 'json', numOfRows: '40', pageNo: '1', ver: '1.3',
  })
  const items = toArray(body?.items)
  const pm10 = median(items.map((x) => Number(x.pm10Value))), pm25 = median(items.map((x) => Number(x.pm25Value)))
  const grade = Math.max(grade10(pm10), grade25(pm25))
  return { pm10, pm25, grade, label: GRADE_LABEL[grade], time: items[0]?.dataTime ?? '' }
})

// ── 기상청 자외선지수: 오늘 낮(9~17시) 가장 센 값 ───────────────
const UV_AREA = { '제주시': '5011000000', '서귀포시': '5013000000' }
const uvLabel = (v) => (v >= 11 ? '위험' : v >= 8 ? '매우 높음' : v >= 6 ? '높음' : v >= 3 ? '보통' : '낮음')
export const getUv = (place = '제주시') => cached(`uv:${place}`, 30 * 60e3, async () => {
  const kst = kstNow(), ymd = todayYmd(), hh = String(kst.getUTCHours()).padStart(2, '0')
  const body = await dataGo('https://apis.data.go.kr/1360000/LivingWthrIdxServiceV5/getUVIdxV5', {
    areaNo: UV_AREA[place] ?? UV_AREA['제주시'], time: ymd + hh, dataType: 'JSON',
  })
  const it = toArray(body?.items?.item)[0]
  if (!it) return null
  // it.date = 발표 시각(YYYYMMDDHH), h0·h3·h6… = 발표 후 N시간째의 지수
  const base = Date.UTC(+it.date.slice(0, 4), +it.date.slice(4, 6) - 1, +it.date.slice(6, 8), +it.date.slice(8, 10))
  const slots = Object.entries(it).filter(([k, v]) => /^h\d+$/.test(k) && v !== '').map(([k, v]) => {
    const t = new Date(base + Number(k.slice(1)) * 3600e3) // 발표 시각은 한국 시간 값을 그대로 UTC 로 쓴 것이라 이 값도 한국 시간
    return { day: t.toISOString().slice(0, 10).replaceAll('-', ''), hour: t.getUTCHours(), v: Number(v) }
  })
  const day = slots.some((s) => s.day === ymd && s.hour >= 9 && s.hour <= 17) ? ymd : slots.find((s) => s.hour >= 9 && s.hour <= 17)?.day
  const max = Math.max(0, ...slots.filter((s) => s.day === day && s.hour >= 9 && s.hour <= 17).map((s) => s.v))
  return { max, label: uvLabel(max) }
})

// ── 관광지 집중률 예측: 장소 이름 → { 날짜: 집중률(%) } ─────────
// 값이 클수록 그 장소가 평소보다 붐빌 것으로 예상한다는 뜻 (0~100)
const normName = (s) => String(s ?? '').replace(/\[[^\]]*\]|\([^)]*\)/g, '').replace(/[\s·・]/g, '').toLowerCase()
export async function loadCrowd() {
  const U = 'https://apis.data.go.kr/B551011/TatsCnctrRateService/tatsCnctrRatedList'
  const C = { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json', areaCd: '50', numOfRows: '1000' }
  const map = new Map()
  for (const signguCd of ['50110', '50130']) { // 제주시 · 서귀포시
    const first = await dataGo(U, { ...C, signguCd, pageNo: '1' })
    const pages = Math.min(10, Math.ceil(Number(first?.totalCount ?? 0) / 1000))
    const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, i) => dataGo(U, { ...C, signguCd, pageNo: String(i + 2) })))
    for (const b of [first, ...rest]) for (const x of toArray(b?.items?.item)) {
      const k = normName(x.tAtsNm)
      if (!map.has(k)) map.set(k, new Map())
      map.get(k).set(x.baseYmd, Number(x.cnctrRate))
    }
  }
  return map
}
// 미리 받아 둔 예측이 오늘을 덮으면 그걸 쓰고, 아니면 공공데이터에서 직접 받는다
export const getCrowdTable = async () => crowdSnapshot(todayYmd()) ?? cached('crowd', 6 * 3600e3, loadCrowd)

// 장소 이름으로 그날의 집중률을 찾는다 (이름이 같거나, 한쪽이 다른 쪽을 포함하는 경우)
export function crowdFor(table, title, ymd) {
  if (!table) return null
  const key = normName(title)
  let days = table.get(key)
  if (!days && key.length >= 3) for (const [k, v] of table) if (k.length >= 3 && (k.includes(key) || key.includes(k))) { days = v; break }
  const r = days?.get(ymd)
  return Number.isFinite(r) ? r : null
}
