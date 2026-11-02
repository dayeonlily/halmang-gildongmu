// 미리 받아 둔 장소 정보(소개글·소개정보·무장애)와 집중률 예측 — 공공데이터를 매번 부르지 않으려고 파일로 들고 있는다.
// 파일은 `node scripts/build-place-cache.mjs`(매일 GitHub 이 자동으로 실행)가 하루 한도 안에서 조금씩 채운다.
// 여기 없는 장소만 서버가 공공데이터를 직접 부르고, 그 결과는 서버가 켜져 있는 동안만 기억한다.
import places from './data/places.json' with { type: 'json' }
import crowd from './data/crowd.json' with { type: 'json' }

// 장소 하나: { ty: 종류, ov: 소개글, in: 소개정보, ac: 무장애 정보, at: 받은 시각(ms) }
export const snapshotOf = (id) => places[String(id)] ?? null
export const snapshotSize = () => Object.keys(places).length

// 집중률: { base: 'YYYYMMDD'(첫 날), days: 날 수, places: { 정규화한 이름: [첫 날부터의 집중률…] } } → Map(이름 → Map(날짜 → 집중률))
const addDays = (ymd, n) => new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8) + n)).toISOString().slice(0, 10).replaceAll('-', '')
let crowdMap
export function crowdSnapshot(todayYmd) {
  if (!crowd?.base || !crowd.places || !(crowd.days > 0)) return null
  if (todayYmd < crowd.base || todayYmd > addDays(crowd.base, crowd.days - 1)) return null // 오늘이 범위를 벗어나면(너무 오래됨) 쓰지 않는다
  if (!crowdMap) {
    crowdMap = new Map()
    for (const [name, arr] of Object.entries(crowd.places)) {
      const days = new Map()
      arr.forEach((v, i) => { if (v != null) days.set(addDays(crowd.base, i), v) })
      crowdMap.set(name, days)
    }
  }
  return crowdMap
}
