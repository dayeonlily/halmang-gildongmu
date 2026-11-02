// ② 한국관광공사 무장애 여행정보 (KorWithService2) — 유모차·휠체어·수유실 등
import { dataGo, toArray } from './dataGo.js'
import { snapshotOf } from './placeData.js'

const BASE = 'https://apis.data.go.kr/B551011/KorWithService2'
const COMMON = { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json' }

const clean = (v) => String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const has = (v) => { const s = clean(v); return s !== '' && !/^(없음|없습니다|불가|미운영|해당없음)/.test(s) }

const memo = new Map()
export const getAccess = ({ id }) => {
  const s = snapshotOf(id) // 미리 받아 둔 파일에 있으면 공공데이터를 부르지 않는다
  if (s?.ac) return Promise.resolve({ id: String(id), ...s.ac })
  if (!memo.has(id)) memo.set(id, fetchAccess({ id }).catch((e) => { memo.delete(id); throw e })); return memo.get(id) }

export async function fetchAccess({ id }) {
  const body = await dataGo(`${BASE}/detailWithTour2`, { ...COMMON, contentId: String(id) })
  const d = toArray(body?.items?.item)[0]
  if (!d) return { id: String(id), registered: false }
  const f = {
    stroller: clean(d.stroller), wheelchair: clean(d.wheelchair), elevator: clean(d.elevator),
    restroom: clean(d.restroom), parking: clean(d.parking), exit: clean(d.exit),
    lactation: clean(d.lactationroom), babychair: clean(d.babysparechair), family: clean(d.infantsfamilyetc),
    route: clean(d.publictransport), helpdog: clean(d.helpdog), etc: clean(d.handicapetc),
  }
  return {
    id: String(id), registered: true, ...f,
    flags: {
      stroller: has(f.stroller), wheelchair: has(f.wheelchair), elevator: has(f.elevator),
      restroom: has(f.restroom), parking: has(f.parking), exit: has(f.exit),
      lactation: has(f.lactation), babychair: has(f.babychair),
    },
  }
}
