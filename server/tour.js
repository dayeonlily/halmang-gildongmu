// ① 한국관광공사 국문 관광정보 서비스 (KorService2) — "어디에 뭐가 있나"
import { dataGo, toArray } from './dataGo.js'

const BASE = 'https://apis.data.go.kr/B551011/KorService2'
const COMMON = { MobileOS: 'ETC', MobileApp: 'HalmangGildongmu', _type: 'json', areaCode: '39' } // 39 = 제주

export async function searchTour({ keyword = '', contentTypeId = '', rows = 12 } = {}) {
  const params = { ...COMMON, numOfRows: String(rows), pageNo: '1' }
  if (contentTypeId) params.contentTypeId = String(contentTypeId)
  if (keyword) params.keyword = keyword
  const body = await dataGo(`${BASE}/${keyword ? 'searchKeyword2' : 'areaBasedList2'}`, params)
  return toArray(body?.items?.item).map((p) => ({
    id: String(p.contentid), type: String(p.contenttypeid), title: p.title,
    addr: p.addr1, image: p.firstimage || p.firstimage2 || '',
    lng: Number(p.mapx), lat: Number(p.mapy), tel: p.tel || '',
  }))
}

// 문화시설(14)만 이용요금 필드가 있어 "무료/유료" 가격 기준에 사용
export async function getUseFee({ id, type }) {
  if (String(type) !== '14') return null
  const body = await dataGo(`${BASE}/detailIntro2`, { ...COMMON, contentId: String(id), contentTypeId: '14' })
  const fee = toArray(body?.items?.item)[0]?.usefee ?? ''
  return String(fee).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
