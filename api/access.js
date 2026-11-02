// GET /api/access?id=콘텐츠ID → 베리어프리 상세 (유모차·휠체어·수유실…)
import { getAccess } from '../server/access.js'

export default async function handler(req, res) {
  try {
    res.status(200).json(await getAccess({ id: req.query.id }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
