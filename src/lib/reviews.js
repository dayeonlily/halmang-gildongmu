import { supabase } from './supabase'

// 한 장소의 후기: 후기에 저장된 "그날 걸은 길(route)"에 이 장소가 들어 있는 것들.
// 로그인하지 않으면 공개 후기만, 로그인하면 내가 쓴 비공개 후기도 함께 온다 (DB 의 RLS 가 걸러 준다).
export async function fetchPlaceReviews(contentId, limit = 6) {
  if (!supabase) return []
  const { data, error } = await supabase.from('trip_reviews').select('*')
    .filter('route', 'cs', JSON.stringify([{ id: String(contentId) }])) // route 는 JSON 칸이라 contains() 대신 JSON 문자열로 포함 검사
    .order('created_at', { ascending: false }).limit(limit)
  return error ? [] : data // 표가 아직 없거나 오류면 빈 목록으로 조용히
}
