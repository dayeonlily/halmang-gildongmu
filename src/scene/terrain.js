import * as THREE from 'three'

// ── 좌표 ─────────────────────────────────────────────────
// 위도·경도 → 3D (1유닛 ≈ 10km, 북위 33.38 / 동경 126.55 가 원점, 북쪽이 -z)
export const toXZ = (lat, lng) => [(Number(lng) - 126.55) * 9.27, (33.38 - Number(lat)) * 11.1]

// 제주 해안선 (위도, 경도) — 시계 방향. 곡선으로 부드럽게 이어서 씁니다.
const COAST = [
  [33.515, 126.49], [33.52, 126.55], [33.53, 126.62], [33.555, 126.69], [33.56, 126.76], [33.54, 126.83], [33.515, 126.88],
  [33.47, 126.95], [33.43, 126.945], [33.37, 126.9], [33.31, 126.84], [33.28, 126.75], [33.255, 126.67], [33.24, 126.58],
  [33.245, 126.5], [33.25, 126.42], [33.235, 126.34], [33.225, 126.28], [33.205, 126.23], [33.2, 126.17], [33.27, 126.15],
  [33.335, 126.16], [33.4, 126.2], [33.44, 126.26], [33.465, 126.33], [33.485, 126.41],
].map(([lat, lng]) => toXZ(lat, lng))

// 부속 섬 (위도, 경도, 반지름): 우도·비양도·가파도·마라도·차귀도
const ISLETS = [[33.5, 126.953, 0.13], [33.42, 126.228, 0.04], [33.17, 126.27, 0.045], [33.114, 126.267, 0.04], [33.31, 126.12, 0.035]]
  .map(([lat, lng, r]) => [...toXZ(lat, lng), r])

export const HALLA = toXZ(33.362, 126.533)
const SEONGSAN = toXZ(33.458, 126.94)   // 성산일출봉
const SANBANG = toXZ(33.2395, 126.3135) // 산방산

export const BOUNDS = { minX: -4.4, maxX: 4.4, minZ: -3.2, maxZ: 3.2 }

// ── 수학 도우미 ──────────────────────────────────────────
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const hash = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s) }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
export function fbm(x, y, oct = 4) { let a = 0.5, f = 1, s = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= 0.5 } return s }
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

// ── 해안선 부호거리: 양수 = 육지 안쪽, 음수 = 바다 ────────────
const coastPts = new THREE.CatmullRomCurve3(COAST.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal').getPoints(260)
function polygonSigned(x, z) {
  let inside = false, best = Infinity
  for (let i = 0, j = coastPts.length - 1; i < coastPts.length; j = i++) {
    const a = coastPts[i], b = coastPts[j]
    if ((a.z > z) !== (b.z > z) && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inside = !inside
    const ex = b.x - a.x, ez = b.z - a.z
    const len2 = ex * ex + ez * ez
    if (len2 < 1e-12) continue // 닫힌 곡선의 끝점은 시작점과 같아 길이 0인 선분이 생김 (0 으로 나누면 NaN)
    const t = clamp(((x - a.x) * ex + (z - a.z) * ez) / len2)
    const dx = x - (a.x + ex * t), dz = z - (a.z + ez * t)
    best = Math.min(best, dx * dx + dz * dz)
  }
  return (inside ? 1 : -1) * Math.sqrt(best)
}
export function coastDistance(x, z) {
  let d = polygonSigned(x, z)
  for (const [ix, iz, r] of ISLETS) d = Math.max(d, r - Math.hypot(x - ix, z - iz))
  return d
}

// ── 오름 (작은 화산 언덕) 들: 육지 안쪽에 난수로 흩뿌림 ──────
const OREUMS = (() => {
  const r = rng(7), out = []
  for (let tries = 0; out.length < 110 && tries < 4000; tries++) {
    const x = BOUNDS.minX * 0.82 + r() * (BOUNDS.maxX - BOUNDS.minX) * 0.82
    const z = -1.6 + r() * 3.0
    if (polygonSigned(x, z) < 0.18 || Math.hypot(x - HALLA[0], z - HALLA[1]) < 0.55) continue
    out.push({ x, z, r: 0.05 + r() * 0.085, h: 0.035 + r() * 0.09, crater: r() > 0.55 })
  }
  return out
})()

// 땅의 높이 (바다는 음수 = 해저). 세로를 5배쯤 과장해서 입체감을 줍니다.
export function sampleTerrain(x, z) {
  const d = coastDistance(x, z)
  if (d <= 0) return { h: -0.2 * (1 - Math.exp(d * 4.5)), d }
  const dx = x - HALLA[0], dz = z - HALLA[1]
  const rr = Math.sqrt((dx / 3.7) ** 2 + (dz / 1.55) ** 2)
  let land = 0.5 * Math.pow(clamp(1 - rr), 1.55)                                   // 순상화산: 해안에서 완만히 솟음
  land += 0.62 * Math.exp(-(dx * dx + dz * dz) / (2 * 0.26 * 0.26))                // 한라산 정상부
  land -= 0.07 * Math.exp(-(dx * dx + dz * dz) / (2 * 0.05 * 0.05))                // 백록담
  for (const o of OREUMS) {
    const q = Math.hypot(x - o.x, z - o.z) / o.r
    if (q < 1) land += o.h * Math.pow(1 - q * q, 1.4) - (o.crater ? o.h * 0.35 * Math.exp(-q * q * 18) : 0)
  }
  const sx = x - SEONGSAN[0], sz = z - SEONGSAN[1]                                   // 성산일출봉: 분화구 둘레
  land += 0.17 * Math.exp(-((Math.hypot(sx, sz) - 0.1) ** 2) / (2 * 0.04 ** 2)) * smooth(0.22, 0.1, Math.hypot(sx, sz) + 0.0)
  const bx = x - SANBANG[0], bz = z - SANBANG[1]                                      // 산방산: 종 모양 용암돔
  land += 0.24 * Math.exp(-(bx * bx + bz * bz) / (2 * 0.06 * 0.06))
  land += (fbm(x * 3.2, z * 3.2) - 0.5) * 0.045 * smooth(0.05, 0.4, d)               // 잔 굴곡
  return { h: 0.012 * smooth(0, 0.03, d) + Math.max(0, land) * smooth(0.0, 0.12, d), d }
}
export const terrainHeight = (x, z) => Math.max(0, sampleTerrain(x, z).h)

// ── 색: 해변 모래 → 초원(유채) → 숲 → 암석 → 정상 ─────────
const C = (hex) => new THREE.Color(hex)
const COL = { sand: C('#e8d9aa'), shallow: C('#8fd1c1'), deep: C('#2c6f86'), grass: C('#86b866'), meadow: C('#a2c76b'), canola: C('#f2cf3b'), forest: C('#3f7c3d'), rock: C('#7b6c5f'), dark: C('#4a423c'), snow: C('#f1f4f6') }

function colorAt(h, d, slope, x, z, out) {
  if (d <= 0) return out.copy(COL.shallow).lerp(COL.deep, clamp(-d / 0.45))
  const n = fbm(x * 5, z * 5), n2 = fbm(x * 2.2 + 9, z * 2.2 - 4)
  out.copy(COL.grass).lerp(COL.meadow, n)
  if (n2 > 0.62 && h < 0.16) out.lerp(COL.canola, smooth(0.62, 0.7, n2) * 0.85)    // 유채꽃 밭
  out.lerp(COL.forest, smooth(0.07, 0.2, h) * (0.55 + n * 0.45))                    // 숲
  out.lerp(COL.rock, smooth(0.34, 0.5, h))
  out.lerp(COL.dark, smooth(0.45, 0.62, h) * n * 0.6)
  out.lerp(COL.snow, smooth(0.6, 0.7, h) * 0.9)
  out.lerp(COL.rock, smooth(0.3, 0.6, slope) * 0.75)                                // 가파른 곳은 암석
  out.lerp(COL.sand, 1 - smooth(0.0, 0.05, d))                                      // 해안 모래
  return out
}

// 지형 메쉬 + 숲 위치 (한 번만 계산해서 캐시)
let cache
export function buildTerrain() {
  if (cache) return cache
  const w = BOUNDS.maxX - BOUNDS.minX, hgt = BOUNDS.maxZ - BOUNDS.minZ
  const SX = 240, SZ = Math.round((SX * hgt) / w)
  const geo = new THREE.PlaneGeometry(w, hgt, SX, SZ).rotateX(-Math.PI / 2)
  const pos = geo.attributes.position, dist = new Float32Array(pos.count)
  for (let i = 0; i < pos.count; i++) {
    const s = sampleTerrain(pos.getX(i), pos.getZ(i))
    pos.setY(i, s.h); dist[i] = s.d
  }
  geo.computeVertexNormals()
  const nor = geo.attributes.normal, col = new Float32Array(pos.count * 3), tmp = new THREE.Color()
  const trees = []
  const r = rng(21)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = pos.getY(i), slope = 1 - nor.getY(i)
    colorAt(h, dist[i], slope, x, z, tmp)
    col.set([tmp.r, tmp.g, tmp.b], i * 3)
    // 숲: 중간 고도·완만한 땅·숲 노이즈가 높은 곳에 나무
    if (h > 0.05 && h < 0.46 && slope < 0.3 && fbm(x * 2.6 + 3, z * 2.6 + 1) > 0.5 && r() < 0.55 && trees.length < 2600) {
      trees.push([x + (r() - 0.5) * 0.03, h, z + (r() - 0.5) * 0.03, 0.03 + r() * 0.035, r()])
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))

  // 물 깊이 텍스처: 해안 0 → 먼 바다 1 (물 셰이더가 색·거품에 사용)
  const TW = 256, TH = Math.round((TW * hgt) / w), data = new Uint8Array(TW * TH * 4)
  for (let j = 0; j < TH; j++) for (let i = 0; i < TW; i++) {
    const x = BOUNDS.minX + ((i + 0.5) / TW) * w, z = BOUNDS.maxZ - ((j + 0.5) / TH) * hgt
    const d = coastDistance(x, z), v = d >= 0 ? 0 : clamp(-d / 0.8)
    data.set([Math.round(v * 255), 0, 0, 255], (j * TW + i) * 4)
  }
  const depthTex = new THREE.DataTexture(data, TW, TH, THREE.RGBAFormat)
  depthTex.magFilter = depthTex.minFilter = THREE.LinearFilter
  depthTex.needsUpdate = true

  return (cache = { geo, trees, depthTex })
}
