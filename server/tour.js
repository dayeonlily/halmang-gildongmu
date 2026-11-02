// ① 한국관광공사 국문 관광정보 서비스 (KorService2) — "어디에 뭐가 있나"
import { dataGo, toArray } from './dataGo.js'
import { snapshotOf } from './placeData.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'
const BASE_WITH = 'https://apis.data.go.kr/B551011/KorWithService2' // 베리어프리 정보가 등록된 장소만
// 제주 = 법정동 코드 50. (구버전 areaCode=39 는 제주 데이터의 일부만 돌려줘서 lDongRegnCd 를 씁니다)
const COMMON = { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json', lDongRegnCd: '50' }

// 장소 목록 검색. accessibleOnly=true 면 베리어프리 여행정보에 등록된 장소만.
// 반환: { items, total }  (total = 조건에 맞는 전체 건수 → "더보기" 판단용)
async function searchOne({ keyword = '', contentTypeId = '', page = 1, rows = 12, accessibleOnly = false } = {}) {
  const params = { ...COMMON, numOfRows: String(rows), pageNo: String(page), arrange: 'Q' } // Q = 최근 수정순(대표이미지 있는 것) — 제목순이면 가나다 앞쪽 장소만 보여서
  if (contentTypeId) params.contentTypeId = String(contentTypeId)
  if (keyword) params.keyword = keyword
  const base = accessibleOnly ? BASE_WITH : BASE
  const body = await dataGo(`${base}/${keyword ? 'searchKeyword2' : 'areaBasedList2'}`, params)
  const items = toArray(body?.items?.item).map((p) => ({
    id: String(p.contentid), type: String(p.contenttypeid), title: p.title,
    addr: [p.addr1, p.addr2].filter(Boolean).join(' '), image: p.firstimage || p.firstimage2 || '',
    lng: Number(p.mapx), lat: Number(p.mapy), tel: p.tel || '',
  }))
  return { items, total: Number(body?.totalCount ?? items.length) }
}

// 장소 소개 정보(detailIntro2): 요금·주차·유모차 대여·체험 연령·숙소 방/부대시설 등 장소마다 다른 값
// (지역 코드는 붙이지 않는다 — 붙이면 빈 응답이 온다). 종류마다 필드 이름 뒤에 culture/leports/food/lodging 이 붙어서 한데 모은다.
const SUFFIX = ['', 'culture', 'leports', 'food', 'lodging', 'shopping']
const pick = (d, base) => { for (const s of SUFFIX) { const v = d[base + s]; if (v) return v } return '' }
const text = (v) => String(v ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const yesNo = (v) => { const s = text(v); return !s ? '' : /^(가능|있음|유|무료|예)/.test(s) ? 'yes' : /^(불가|없음|무|안)/.test(s) ? 'no' : '' }
const memo = new Map()
const remember = (key, load) => { if (!memo.has(key)) memo.set(key, load().catch((e) => { memo.delete(key); throw e })); return memo.get(key) }

// 소개글(detailCommon2): 장소마다 다른 설명 — 계단·경사·유모차·아이 같은 말이 점수 신호가 된다
export async function fetchOverview({ id }) {
  const body = await dataGo(`${BASE}/detailCommon2`, { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json', contentId: String(id) })
  return text(toArray(body?.items?.item)[0]?.overview).slice(0, 2000)
}
// 미리 받아 둔 파일에 있으면 공공데이터를 부르지 않는다
export const getOverview = (p) => {
  const s = snapshotOf(p.id)
  return typeof s?.ov === 'string' ? Promise.resolve(s.ov) : remember(`ov:${p.id}`, () => fetchOverview(p))
}

export const getIntro = (p) => (snapshotOf(p.id)?.in ? Promise.resolve(snapshotOf(p.id).in) : remember(`in:${p.id}`, () => fetchIntro(p)))
export async function fetchIntro({ id, type }) {
  const body = await dataGo(`${BASE}/detailIntro2`, { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json', contentId: String(id), contentTypeId: String(type) })
  const d = toArray(body?.items?.item)[0] ?? {}
  return {
    fee: text(d.usefee || d.usefeeleports),
    parking: yesNo(pick(d, 'parking')), carriage: yesNo(pick(d, 'chkbabycarriage')),
    expage: text(d.expagerange || d.expagerangeleports), exp: text(d.expguide),
    kidsfac: yesNo(d.kidsfacility), room: text(d.roomtype), sub: text(d.subfacility),
    menu: text(`${d.firstmenu ?? ''} ${d.treatmenu ?? ''}`), rest: text(pick(d, 'restdate')),
  }
}

// 검색어를 쉼표로 이어 쓰면(예: "숲길,둘레길,곶자왈") 각각 검색해 번갈아 섞어 돌려준다 → 테마 검색
export async function searchTour(opts = {}) {
  const kws = String(opts.keyword ?? '').split(',').map((k) => k.trim()).filter(Boolean)
  if (kws.length <= 1) return searchOne({ ...opts, keyword: kws[0] ?? '' })
  // 검색어마다 rows/검색어수 개씩만 받아 합치면 한 페이지가 rows 개 안팎이 되고, 다음 페이지도 빠짐없이 이어진다
  const rows = Math.max(2, Math.ceil((opts.rows ?? 12) / kws.length))
  const parts = await Promise.all(kws.map((keyword) => searchOne({ ...opts, keyword, rows }).catch(() => ({ items: [], total: 0 }))))
  const seen = new Set(), items = []
  for (let i = 0; parts.some((p) => i < p.items.length); i++) {
    for (const p of parts) {
      const it = p.items[i]
      if (it && !seen.has(it.id)) { seen.add(it.id); items.push(it) }
    }
  }
  return { items, total: parts.reduce((n, p) => n + p.total, 0) }
}
