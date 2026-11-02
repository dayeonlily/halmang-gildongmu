// GET /api/spots?keyword=&type=&needs=stroller,nursing&budget=low → 점수 매긴 추천 스팟
import { recommend } from '../server/recommend.js'

export default async function handler(req, res) {
  try {
    const { keyword = '', type = '', needs = '', budget = 'any' } = req.query
    res.status(200).json(await recommend({
      keyword, contentTypeId: type, budget,
      needs: String(needs).split(',').filter(Boolean),
    }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
