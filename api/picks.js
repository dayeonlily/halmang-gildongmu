// GET /api/picks?needs=stroller&budget=low&age=toddler → 홈 "오늘 우리 가족이 가기 좋은 곳" 3곳
import { homePicks } from '../server/picks.js'

export default async function handler(req, res) {
  try {
    const { needs = '', budget = 'any', age = 'preschool' } = req.query
    const result = await homePicks({ needs: String(needs).split(',').filter(Boolean), budget, age })
    res.setHeader('Cache-Control', result.degraded ? 'public, s-maxage=60' : 'public, s-maxage=600, stale-while-revalidate=3600')
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
