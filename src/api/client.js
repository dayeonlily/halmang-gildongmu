// 화면 → 우리 서버 함수(/api/...) 호출 모음.
// 공공데이터 API는 브라우저에서 직접 부르지 않습니다 (키 노출 + CORS) → 반드시 /api 를 거칩니다.

async function readJson(r) {
  let data
  try { data = await r.json() }
  catch { throw new Error(`서버 응답이 JSON이 아님 (${r.status})`) }
  if (!r.ok) throw new Error(data.error || r.statusText)
  return data
}

const get = async (path) => readJson(await fetch(path))
const post = async (path, body) => readJson(await fetch(path, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
}))

export const ping = () => get('/api/hello')

export const fetchSpots = ({ keyword = '', type = '', needs = [], budget = 'any', age = 'preschool', near = null, date = '', page = 1, accessible = false, limit = 12 } = {}) =>
  get(`/api/spots?keyword=${encodeURIComponent(keyword)}&type=${type}&needs=${needs.join(',')}&budget=${budget}&age=${age}&near=${near ? `${near.lat},${near.lng}` : ''}&date=${date}&page=${page}&accessible=${accessible ? 1 : 0}&limit=${limit}`)
export const fetchPicks = ({ needs = [], budget = 'any', age = 'preschool' } = {}) =>
  get(`/api/picks?needs=${needs.join(',')}&budget=${budget}&age=${age}`)
export const fetchDetail = (id, type = '12') => get(`/api/detail?id=${encodeURIComponent(id)}&type=${type}`)
export const fetchAccess =(id) => get(`/api/access?id=${encodeURIComponent(id)}`)
export const fetchWeather = (place = '제주시') => get(`/api/weather?place=${encodeURIComponent(place)}`)

export const askHalmang = (message, history, profile) => post('/api/agent', { message, history, profile })
