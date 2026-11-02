// ③ 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0) — 오늘 나가도 되나?
import { dataGo, toArray } from './dataGo.js'

const URL_ = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst'
const GRID = { '제주시': [53, 38], '서귀포시': [52, 33] } // 기상청 격자(nx, ny)
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' }
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' }

// 발표시각 02·05·08·11·14·17·20·23시 (발표 10분 뒤부터 조회 가능 → 15분 여유)
function baseDateTime() {
  const kst = new Date(Date.now() + 9 * 3600e3 - 15 * 60e3)
  let h = [23, 20, 17, 14, 11, 8, 5, 2].find((x) => x <= kst.getUTCHours())
  let day = kst
  if (h === undefined) { day = new Date(kst.getTime() - 24 * 3600e3); h = 23 }
  return { base_date: day.toISOString().slice(0, 10).replaceAll('-', ''), base_time: String(h).padStart(2, '0') + '00' }
}

export const placeByLat = (lat) => (Number(lat) < 33.36 ? '서귀포시' : '제주시')

export async function getWeather({ place = '제주시' } = {}) {
  const [nx, ny] = GRID[place] ?? GRID['제주시']
  const body = await dataGo(URL_, {
    dataType: 'JSON', numOfRows: '300', pageNo: '1', nx: String(nx), ny: String(ny), ...baseDateTime(),
  })
  const slots = {}
  for (const it of toArray(body?.items?.item)) (slots[`${it.fcstDate} ${it.fcstTime}`] ??= {})[it.category] = it.fcstValue
  const rows = Object.entries(slots).slice(0, 6).map(([time, v]) => ({
    time, temp: Number(v.TMP), sky: SKY[v.SKY] ?? String(v.SKY),
    rain: PTY[v.PTY] ?? String(v.PTY), pop: Number(v.POP), wind: Number(v.WSD),
  }))
  const pop = Math.max(0, ...rows.map((r) => r.pop || 0))
  const temp = rows[0]?.temp
  const wet = rows.some((r) => r.rain !== '없음') || pop >= 60
  const hot = temp >= 30, cold = temp <= 3, windy = rows.some((r) => r.wind >= 9)
  const advice = wet ? '비·눈 예보 — 실내 위주로, 유모차 우비를 챙겨요'
    : hot ? '더워요 — 그늘·실내 쉼터를 자주 들러요'
    : cold ? '추워요 — 아이 체온 유지, 짧은 코스로'
    : windy ? '바람이 세요 — 해안·오름은 피하는 게 좋아요'
    : '야외 나들이 좋은 날이에요'
  return { place, rows, summary: { pop, temp, wet, hot, cold, windy, advice } }
}
