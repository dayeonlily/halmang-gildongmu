// GET /api/detail?id=콘텐츠ID&type=12 → 소개·사진·이용정보·베리어프리 상세
import { getDetail } from '../server/detail.js'

export default async function handler(req, res) {
  try {
    const { id, type = '12' } = req.query
    if (!id) return res.status(400).json({ error: 'id 가 필요해요' })
    res.status(200).json(await getDetail({ id, type }))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
