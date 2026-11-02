// GET /api/spots?keyword=&type=&needs=stroller,nursing&budget=low&page=1&accessible=1 → 점수 매긴 추천 스팟
import { recommend } from '../server/recommend.js'

export default async function handler(req, res) {
  try {
    const { keyword = '', type = '', needs = '', budget = 'any', page = '1', accessible = '' } = req.query
    res.status(200).json(await recommend({
      keyword, contentTypeId: type, budget,
      page: Math.max(1, Number(page) || 1),
      accessibleOnly: accessible === '1',
      needs: String(needs).split(',').filter(Boolean),
    }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
