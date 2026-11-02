// 공공데이터포털(apis.data.go.kr) 공통 호출 — 세 API(관광·무장애·기상)가 함께 씁니다.
export async function dataGo(url, params) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) throw new Error('DATA_GO_KR_KEY 가 설정되지 않았어요 (.env.local 확인)')
  const qs = new URLSearchParams({ serviceKey: key, ...params })
  const r = await fetch(`${url}?${qs}`)
  const text = await r.text()
  let data
  try { data = JSON.parse(text) }
  catch { throw new Error('공공데이터 응답이 JSON이 아님: ' + text.replace(/\s+/g, ' ').slice(0, 140)) }
  const code = data?.response?.header?.resultCode
  // 성공 코드: 관광공사 '0000', 기상청 '00'
  if (code && code !== '0000' && code !== '00') throw new Error(`공공데이터 오류 ${code}: ${data.response.header.resultMsg}`)
  return data?.response?.body
}

export const toArray = (item) => (!item ? [] : Array.isArray(item) ? item : [item])
