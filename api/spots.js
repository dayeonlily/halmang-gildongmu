// GET /api/spots?keyword=&type=&needs=stroller,nursing&budget=low&age=preschool&near=33.5,126.5&page=1&accessible=1 → 점수 매긴 추천 스팟
import { recommend } from '../server/recommend.js'

export default async function handler(req, res) {
  try {
    const { keyword = '', type = '', needs = '', budget = 'any', age = 'preschool', near = '', date = '', page = '1', accessible = '', limit = '12' } = req.query
    res.status(200).json(await recommend({
      keyword, contentTypeId: type, budget, age, date,
      near: (() => { const [lat, lng] = String(near).split(',').map(Number); return lat && lng ? { lat, lng } : null })(),
      page: Math.max(1, Number(page) || 1),
      limit: Math.min(30, Math.max(1, Number(limit) || 12)), // 한 번에 점수를 매길 후보 수 (홈 추천은 넉넉히)
      accessibleOnly: accessible === '1',
      needs: String(needs).split(',').filter(Boolean),
    }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
