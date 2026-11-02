// 장소 정보를 미리 받아 파일(server/data/places.json)에 모아 두는 스크립트.
//   node scripts/build-place-cache.mjs [--max 800] [--types 12,28,14,15,39,32] [--refresh-days 120]
// · 공공데이터는 하루에 부를 수 있는 횟수가 정해져 있어서, 이미 받은 장소는 건너뛰고 새 장소부터 채운다.
// · 한도를 넘었다는 응답(429)이 오면 거기서 멈추고 지금까지 받은 것을 저장한다 → 다음 날 이어서 채운다.
// · 집중률 예측(server/data/crowd.json)은 하루 한 번 통째로 새로 받는다.
// 매일 한국 시간 00:30(한도 초기화 직후)에 GitHub Actions 가 자동으로 실행한다 (.github/workflows/place-cache.yml).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'server', 'data')

// 종류별 우선순위: 아이와 가기 좋은 곳(관광지·체험·문화시설·행사)을 먼저, 음식점·숙박은 나중에
export const DEFAULT_TYPES = ['12', '28', '14', '15', '39', '32']
const OVERVIEW_MAX = 1200 // 소개글은 성인 전용·계단·유모차 같은 말을 찾는 데만 쓰므로 앞부분만 저장해 파일을 가볍게
const cut = (v, n = 160) => (typeof v === 'string' ? v.slice(0, n) : v)

const slim = (o) => (o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, k === 'flags' ? v : cut(v)])) : o)

// 장소 하나의 저장용 모양: { ty, ov, in, ac, at }
export async function fetchPlace(p, fetchers) {
  const [ov, intro, ac] = await Promise.all([fetchers.overview(p), fetchers.intro(p), fetchers.access(p)])
  const { id: _id, ...access } = ac ?? { registered: false }
  return { ty: p.type, ov: String(ov ?? '').slice(0, OVERVIEW_MAX), in: slim(intro ?? {}), ac: slim(access), at: Date.now() }
}

// 핵심 동작. 시험하기 쉽게 목록·조회 함수를 밖에서 받는다.
export async function buildPlaceCache({ listPlaces, fetchers, store, max = 800, types = DEFAULT_TYPES, refreshDays = 120, concurrency = 4, save, log = console.log }) {
  const staleBefore = Date.now() - refreshDays * 86400e3
  const todo = []
  for (const type of types) {
    let list = []
    try { list = await listPlaces(type) }
    catch (e) { log(`  종류 ${type} 목록을 못 받았어요: ${e.message}`); if (e.quota) break; continue }
    const fresh = list.filter((p) => !store[p.id])
    const stale = list.filter((p) => store[p.id] && store[p.id].at < staleBefore)
    log(`  종류 ${type}: 전체 ${list.length}곳 · 새로 받을 ${fresh.length}곳 · 오래돼 다시 받을 ${stale.length}곳`)
    todo.push(...fresh, ...stale)
  }

  const queue = todo.slice(0, max)
  let done = 0, failed = 0, quotaHit = false, sinceSave = 0
  const worker = async () => {
    while (queue.length && !quotaHit) {
      const p = queue.shift()
      try {
        store[p.id] = await fetchPlace(p, fetchers)
        done++; sinceSave++
        if (sinceSave >= 50) { save(store); sinceSave = 0 } // 중간에 끊겨도 잃지 않게 50곳마다 저장
      } catch (e) {
        if (e.quota) { if (!quotaHit) log(`  ⚠ 하루 호출 한도에 도달했어요 — 여기서 멈추고 저장해요 (내일 이어서)`); quotaHit = true } else { failed++; log(`  ✗ ${p.title}(${p.id}): ${e.message}`) }
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
  save(store)
  return { done, failed, quotaHit, remaining: todo.length - done - failed, total: Object.keys(store).length }
}

// 집중률 예측을 가볍게 줄여 저장: 이름 → 첫 날부터의 집중률 배열
export function packCrowd(table) {
  const dates = [...new Set([...table.values()].flatMap((m) => [...m.keys()]))].sort()
  if (!dates.length) return null
  const at = (ymd) => Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8))
  const base = dates[0], days = Math.round((at(dates.at(-1)) - at(base)) / 86400e3) + 1
  const places = {}
  for (const [name, m] of table) {
    const arr = Array.from({ length: days }, () => null)
    for (const [ymd, v] of m) arr[Math.round((at(ymd) - at(base)) / 86400e3)] = Math.round(v * 10) / 10
    places[name] = arr
  }
  return { base, days, updated: new Date().toISOString(), places }
}

// ── 명령줄 실행 ─────────────────────────────────────────────
async function main() {
  const arg = (name, fallback) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : fallback }
  const envFile = path.join(ROOT, '.env.local') // 내 컴퓨터에서 돌릴 때는 .env.local 의 키를 쓴다 (GitHub 에서는 비밀값으로 들어온다)
  if (!process.env.DATA_GO_KR_KEY && fs.existsSync(envFile)) for (const l of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) { const m = l.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].trim() }
  if (!process.env.DATA_GO_KR_KEY) { console.error('DATA_GO_KR_KEY 가 없어요 (.env.local 또는 환경 변수)'); process.exit(1) }

  const { searchTour, fetchIntro, fetchOverview } = await import('../server/tour.js')
  const { fetchAccess } = await import('../server/access.js')
  const { loadCrowd } = await import('../server/environment.js')
  const placesFile = path.join(DATA, 'places.json'), crowdFile = path.join(DATA, 'crowd.json')
  const store = JSON.parse(fs.readFileSync(placesFile, 'utf8'))
  const write = (file, obj) => fs.writeFileSync(file, JSON.stringify(obj) + '\n')

  const types = String(arg('types', DEFAULT_TYPES.join(','))).split(',').filter(Boolean)
  console.log(`장소 정보 채우기 시작 — 저장된 ${Object.keys(store).length}곳`)
  const result = await buildPlaceCache({
    store, types, max: Number(arg('max', 800)), refreshDays: Number(arg('refresh-days', 120)),
    listPlaces: async (type) => { // 종류별 전체 목록 (목록 조회는 한 번에 많이 받아 호출 수가 적다)
      const out = []
      for (let page = 1; page <= 20; page++) {
        const r = await searchTour({ contentTypeId: type, page, rows: 200 })
        out.push(...r.items)
        if (out.length >= r.total || !r.items.length) break
      }
      return out
    },
    fetchers: { overview: fetchOverview, intro: fetchIntro, access: fetchAccess },
    save: (s) => write(placesFile, s),
  })
  console.log(`장소 정보: ${result.done}곳 새로 저장 · 실패 ${result.failed}곳 · 남은 ${result.remaining}곳 · 총 ${result.total}곳${result.quotaHit ? ' (한도에 도달해 멈춤)' : ''}`)

  try { // 집중률 예측은 하루 한 번 통째로
    const packed = packCrowd(await loadCrowd())
    if (packed) { write(crowdFile, packed); console.log(`집중률 예측: ${Object.keys(packed.places).length}곳 × ${packed.days}일 (${packed.base}~)`) }
  } catch (e) { console.log(`집중률 예측은 이번에 못 받았어요(${e.message}) — 이전 파일을 그대로 둡니다`) }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1) })
