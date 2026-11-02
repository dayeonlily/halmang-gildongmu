// 장소 상세 — 관광정보(공통·소개·이미지) + 무장애 정보를 한 번에 모아 화면에 줍니다.
import { dataGo, toArray } from './dataGo.js'
import { getAccess } from './access.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'
const COMMON = { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json' }

// 태그 제거 · <br> 은 줄바꿈으로 · 빈 값/0 은 버림
const clean = (v) => String(v ?? '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()
const real = (v) => { const s = clean(v); return s && s !== '0' && s !== '-' ? s : '' }

// 유형별 "이용 정보" 필드 → 화면에 보여줄 이름
const FIELDS = {
  12: [['usetime', '이용시간'], ['restdate', '쉬는 날'], ['useseason', '이용 시기'], ['parking', '주차'], ['expguide', '체험 안내'], ['infocenter', '문의']],
  14: [['usetimeculture', '이용시간'], ['restdateculture', '쉬는 날'], ['usefee', '이용요금'], ['spendtime', '소요 시간'], ['parkingculture', '주차'], ['parkingfee', '주차요금'], ['infocenterculture', '문의']],
  15: [['eventstartdate', '시작일'], ['eventenddate', '종료일'], ['eventplace', '장소'], ['playtime', '공연 시간'], ['usetimefestival', '이용요금'], ['program', '프로그램'], ['sponsor1', '주최'], ['sponsor1tel', '주최 연락처']],
  28: [['usetimeleports', '이용시간'], ['restdateleports', '쉬는 날'], ['usefeeleports', '이용요금'], ['openperiod', '운영 기간'], ['reservation', '예약'], ['parkingleports', '주차'], ['parkingfeeleports', '주차요금'], ['infocenterleports', '문의']],
  32: [['checkintime', '입실'], ['checkouttime', '퇴실'], ['roomcount', '객실 수'], ['chkcooking', '취사'], ['parkinglodging', '주차'], ['subfacility', '부대시설'], ['infocenterlodging', '문의']],
  39: [['firstmenu', '대표 메뉴'], ['treatmenu', '취급 메뉴'], ['opentimefood', '영업시간'], ['restdatefood', '쉬는 날'], ['packing', '포장'], ['reservationfood', '예약'], ['parkingfood', '주차'], ['infocenterfood', '문의']],
}

export async function getDetail({ id, type = '12' }) {
  const ids = { ...COMMON, contentId: String(id) }
  const [common, intro, info, images, access] = await Promise.all([
    dataGo(`${BASE}/detailCommon2`, ids).catch(() => null),
    dataGo(`${BASE}/detailIntro2`, { ...ids, contentTypeId: String(type) }).catch(() => null),
    dataGo(`${BASE}/detailInfo2`, { ...ids, contentTypeId: String(type) }).catch(() => null),
    dataGo(`${BASE}/detailImage2`, { ...ids, imageYN: 'Y' }).catch(() => null),
    getAccess({ id }).catch(() => ({ id: String(id), registered: false })),
  ])
  const c = toArray(common?.items?.item)[0] ?? {}
  const i = toArray(intro?.items?.item)[0] ?? {}

  const facts = (FIELDS[type] ?? FIELDS[12]).map(([k, label]) => [label, real(i[k])]).filter(([, v]) => v)
  if (String(type) === '39' && real(i.kidsfacility) === '1') facts.push(['어린이 놀이시설', '있음'])
  // 입장료·화장실 등 추가 안내 (infoname/infotext)
  for (const x of toArray(info?.items?.item).slice(0, 6)) {
    const name = real(x.infoname), text = real(x.infotext)
    if (name && text && !facts.some(([l]) => l === name)) facts.push([name, text])
  }

  const homepage = /href="([^"]+)"/.exec(String(c.homepage ?? ''))?.[1] || clean(c.homepage).split(/\s/).find((w) => /^https?:\/\//.test(w)) || ''
  const gallery = toArray(images?.items?.item).map((x) => x.originimgurl || x.smallimageurl).filter(Boolean).slice(0, 8)

  return {
    id: String(id), type: String(type),
    overview: clean(c.overview),
    tel: real(c.tel) || real(i.infocenter || i.infocenterculture || i.infocenterfood || i.infocenterleports || i.infocenterlodging),
    homepage,
    gallery: gallery.length ? gallery : [c.firstimage].filter(Boolean),
    facts,
    access,
  }
}
