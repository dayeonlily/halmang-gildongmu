// 공공데이터포털(apis.data.go.kr) 공통 호출 — 관광·무장애·기상·대기·집중률 API 가 함께 씁니다.

// 하루 호출 한도(개발 계정)를 넘기면 포털이 `OpenAPI_ServiceResponse` 형태의 오류를 돌려준다.
// 이걸 빈 결과로 착각하면 점수가 조용히 나빠지므로, 알아볼 수 있는 오류(quota=true)로 던진다.
class DataGoError extends Error {
  constructor(message, { code, quota = false, status = 502 } = {}) { super(message); this.code = code; this.quota = quota; this.status = status }
}

// 한도가 찬 API 는 잠시 다시 부르지 않는다 (불러 봐야 또 429 이고, 호출만 낭비한다). 주소(쿼리 제외) → 풀리는 시각
const blockedUntil = new Map()
const BLOCK_MS = 10 * 60e3

export async function dataGo(url, params) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local 확인)')
  if ((blockedUntil.get(url) ?? 0) > Date.now()) throw new DataGoError('공공데이터 하루 호출 한도를 넘어 잠시 쉬는 중이에요', { code: '22', quota: true, status: 429 })

  const qs = new URLSearchParams({ serviceKey: key, ...params })
  // 응답이 없이 매달리는 요청 하나가 전체를 막지 않게: 8초 안에 못 받으면 끊고 한 번 더 시도한다
  const get = () => fetch(`${url}?${qs}`, { signal: AbortSignal.timeout(8000) })
  let r
  try { r = await get() } catch { r = await get() }
  const text = await r.text()
  let data
  try { data = JSON.parse(text) }
  catch { throw new DataGoError('공공데이터 응답이 JSON이 아님: ' + text.replace(/\s+/g, ' ').slice(0, 140)) }

  const gate = data?.OpenAPI_ServiceResponse?.cmmMsgHeader // 호출 자체가 거절된 경우 (한도 초과·키 문제 등)
  if (gate) {
    const quota = gate.returnReasonCode === '22'
    if (quota) blockedUntil.set(url, Date.now() + BLOCK_MS)
    throw new DataGoError(`공공데이터 오류 ${gate.returnReasonCode}: ${gate.returnAuthMsg ?? gate.errMsg}`, { code: gate.returnReasonCode, quota, status: quota ? 429 : 502 })
  }
  const code = data?.response?.header?.resultCode
  // 성공 코드: 관광공사 '0000', 기상청 '00'
  if (code && code !== '0000' && code !== '00') throw new DataGoError(`공공데이터 오류 ${code}: ${data.response.header.resultMsg}`, { code })
  return data?.response?.body
}

export const toArray = (item) => (!item ? [] : Array.isArray(item) ? item : [item])
