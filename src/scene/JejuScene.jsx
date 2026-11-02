import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import * as THREE from 'three'

// ── 좌표 ─────────────────────────────────────────────────
// 위도·경도 → 3D (1유닛 ≈ 10km, 북위 33.38 / 동경 126.55 가 원점, 북쪽이 -z)
export const toXZ = (lat, lng) => [(Number(lng) - 126.55) * 9.27, (33.38 - Number(lat)) * 11.1]
const HALLA = toXZ(33.362, 126.533)

const scoreColor = (s) => (s >= 70 ? '#43a047' : s >= 50 ? '#f9a825' : '#e53935')

// ── 제주섬: 동서로 긴 타원 + 해안선 굴곡 ─────────────────
function Island() {
  const geo = useMemo(() => {
    const shape = new THREE.Shape()
    const N = 96
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2
      const wobble = 1 + 0.05 * Math.sin(3 * t + 0.6) + 0.035 * Math.sin(5 * t + 1.7) + 0.02 * Math.sin(9 * t)
      const x = Math.cos(t) * 3.7 * wobble
      const y = Math.sin(t) * 1.55 * wobble
      if (i === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 3, curveSegments: 48 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  return (
    <mesh geometry={geo} position={[0, -0.02, 0]}>
      <meshStandardMaterial color="#86b86a" roughness={0.9} />
    </mesh>
  )
}

// 한라산: 라테 곡선으로 둥글게 솟은 산 + 백록담 분화구
function Hallasan() {
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 24; i++) {
      const u = i / 24
      pts.push(new THREE.Vector2(0.14 + 1.5 * Math.pow(1 - u, 1.7), 0.02 + 1.05 * Math.pow(u, 0.75)))
    }
    return new THREE.LatheGeometry(pts, 40)
  }, [])
  return (
    <group position={[HALLA[0], 0.2, HALLA[1]]}>
      <mesh geometry={geo}><meshStandardMaterial color="#8a7a6a" roughness={1} flatShading /></mesh>
      <mesh position={[0, 1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 24]} /><meshStandardMaterial color="#4fc3c9" />
      </mesh>
      {/* 눈 덮인 정상 */}
      <mesh position={[0, 0.98, 0]}><coneGeometry args={[0.2, 0.12, 24, 1, true]} /><meshStandardMaterial color="#f5f5f5" side={THREE.DoubleSide} /></mesh>
    </group>
  )
}

// 오름들: 제주 곳곳의 작은 화산 언덕
const OREUMS = [
  [-2.2, 0.5, 0.35], [-1.3, -0.7, 0.28], [1.6, -0.5, 0.32], [2.4, 0.6, 0.26], [0.9, 0.9, 0.3], [-0.4, -1.0, 0.22], [2.9, -0.1, 0.22],
]
function Oreums() {
  return OREUMS.map(([x, z, s], i) => (
    <mesh key={i} position={[x, 0.2 + s * 0.45, z]} scale={[1, 0.8, 1]}>
      <sphereGeometry args={[s, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={i % 2 ? '#6f9d54' : '#7aa95d'} flatShading />
    </mesh>
  ))
}

// 바다: 살짝 일렁이는 물결 링
function Sea() {
  const ring = useRef()
  useFrame(({ clock }) => { if (ring.current) ring.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.8) * 0.015) })
  return (
    <group position={[0, -0.04, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[9, 64]} /><meshStandardMaterial color="#7fd0dc" roughness={0.35} metalness={0.1} /></mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[4.3, 4.55, 96]} /><meshBasicMaterial color="#d9f5f8" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

function Cloud({ x, y, z, speed = 0.05 }) {
  const g = useRef()
  useFrame(({ clock }) => { if (g.current) g.current.position.x = x + Math.sin(clock.elapsedTime * speed) * 1.2 })
  return (
    <group ref={g} position={[x, y, z]}>
      {[[0, 0, 0, 0.32], [0.3, -0.04, 0.05, 0.26], [-0.3, -0.05, 0, 0.24], [0.1, 0.1, 0, 0.22]].map(([a, b, c, r], i) => (
        <mesh key={i} position={[a, b, c]}><sphereGeometry args={[r, 12, 10]} /><meshStandardMaterial color="#fff" transparent opacity={0.92} /></mesh>
      ))}
    </group>
  )
}

// ── 추천 스팟 핀 (점수 색: 초록 70+, 노랑 50+, 빨강) ──────
function Pin({ spot, selected, onSelect }) {
  const g = useRef()
  const [hover, setHover] = useState(false)
  const [x, z] = toXZ(spot.lat, spot.lng)
  const color = scoreColor(spot.scores?.total ?? 0)
  useFrame(({ clock }) => {
    if (g.current) g.current.position.y = 0.34 + (selected ? Math.abs(Math.sin(clock.elapsedTime * 4)) * 0.25 : 0)
  })
  return (
    <group position={[x, 0, z]}>
      <group ref={g} scale={selected || hover ? 1.35 : 1}
        onClick={(e) => { e.stopPropagation(); onSelect?.(spot.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.13, 20, 16]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.5 : 0.15} /></mesh>
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.09, 0.22, 16]} /><meshStandardMaterial color={color} /></mesh>
        {(selected || hover) && (
          <Html center distanceFactor={9} position={[0, 0.62, 0]} style={{ pointerEvents: 'none' }}>
            <div className="scene-label">{spot.title} <b>{spot.scores?.total}</b></div>
          </Html>
        )}
      </group>
    </group>
  )
}

// ── 할망 캐릭터 (한복 원뿔 몸 + 쪽 찐 머리) ───────────────
export function Halmang({ speaking = false, position = [0, 0, 0], scale = 1 }) {
  const root = useRef(), arm = useRef(), mouth = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (root.current) root.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04
    if (arm.current) arm.current.rotation.z = -2.2 + Math.sin(t * 3.2) * 0.35
    if (mouth.current) mouth.current.scale.y = speaking ? 0.4 + Math.abs(Math.sin(t * 12)) * 0.9 : 1
  })
  return (
    <group ref={root} position={position} scale={scale}>
      {/* 치마 */}
      <mesh position={[0, 0.38, 0]}><coneGeometry args={[0.42, 0.78, 28]} /><meshStandardMaterial color="#ef6c57" roughness={0.7} /></mesh>
      {/* 저고리 */}
      <mesh position={[0, 0.82, 0]}><cylinderGeometry args={[0.2, 0.26, 0.3, 24]} /><meshStandardMaterial color="#fff1c9" /></mesh>
      <mesh position={[0, 0.9, 0.17]} rotation={[0.25, 0, 0]}><boxGeometry args={[0.1, 0.18, 0.02]} /><meshStandardMaterial color="#ef6c57" /></mesh>
      {/* 머리 */}
      <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.26, 28, 24]} /><meshStandardMaterial color="#ffd9b3" /></mesh>
      <mesh position={[0, 1.32, -0.04]} scale={[1, 0.75, 1]}><sphereGeometry args={[0.27, 28, 20, 0, Math.PI * 2, 0, Math.PI / 1.9]} /><meshStandardMaterial color="#cfd2d6" /></mesh>
      <mesh position={[0, 1.55, -0.12]}><sphereGeometry args={[0.11, 16, 14]} /><meshStandardMaterial color="#cfd2d6" /></mesh>
      <mesh position={[0, 1.5, -0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.3, 8]} /><meshStandardMaterial color="#c9a227" /></mesh>
      {/* 얼굴 */}
      <mesh position={[-0.09, 1.22, 0.23]}><sphereGeometry args={[0.028, 10, 10]} /><meshStandardMaterial color="#3b2a22" /></mesh>
      <mesh position={[0.09, 1.22, 0.23]}><sphereGeometry args={[0.028, 10, 10]} /><meshStandardMaterial color="#3b2a22" /></mesh>
      <mesh position={[-0.15, 1.15, 0.2]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#ff9e9e" /></mesh>
      <mesh position={[0.15, 1.15, 0.2]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#ff9e9e" /></mesh>
      <mesh ref={mouth} position={[0, 1.12, 0.245]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} /><meshStandardMaterial color="#8c3b2a" />
      </mesh>
      {/* 손 흔드는 팔 */}
      <group position={[0.24, 0.9, 0]}>
        <group ref={arm} rotation={[0, 0, -2.2]}>
          <mesh position={[0, 0.17, 0]}><capsuleGeometry args={[0.05, 0.22, 6, 12]} /><meshStandardMaterial color="#fff1c9" /></mesh>
          <mesh position={[0, 0.34, 0]}><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color="#ffd9b3" /></mesh>
        </group>
      </group>
      <mesh position={[-0.25, 0.8, 0.02]} rotation={[0, 0, 0.35]}><capsuleGeometry args={[0.05, 0.22, 6, 12]} /><meshStandardMaterial color="#fff1c9" /></mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 8, 5]} intensity={1.3} />
      <hemisphereLight args={['#bfe9ff', '#7a8f5a', 0.4]} />
    </>
  )
}

// ── 제주 3D 지도 ─────────────────────────────────────────
// spots: [{id,title,lat,lng,scores}] · hero: 홈 화면용(할망·구름·천천히 자동 회전)
export function IslandScene({ spots = [], selectedId, onSelect, hero = false, height = 420 }) {
  return (
    <div className="scene-wrap" style={{ height }}>
      <Canvas camera={{ position: hero ? [0, 3.6, 6.2] : [0, 5, 5.6], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#e9f7fb']} />
        <fog attach="fog" args={['#e9f7fb', 9, 18]} />
        <Lights />
        <Sea />
        <Island />
        <Hallasan />
        <Oreums />
        <Cloud x={-2} y={2.2} z={-1.2} />
        <Cloud x={2.2} y={2.6} z={0.6} speed={0.07} />
        {hero && <Halmang position={[-1.7, 0.2, 1.6]} scale={1.25} />}
        {spots.map((s) => <Pin key={s.id} spot={s} selected={s.id === selectedId} onSelect={onSelect} />)}
        <OrbitControls enablePan={false} minDistance={3.5} maxDistance={10} maxPolarAngle={Math.PI / 2.15}
          autoRotate={hero} autoRotateSpeed={0.5} target={[0, 0.2, 0]} />
      </Canvas>
    </div>
  )
}

// 이야기 들려주는 할망 (작은 캔버스)
export function HalmangBuddy({ speaking = false, height = 220 }) {
  return (
    <div className="scene-wrap buddy" style={{ height }}>
      <Canvas camera={{ position: [0, 1.1, 3.1], fov: 38 }} dpr={[1, 2]}>
        <Lights />
        <Halmang speaking={speaking} position={[0, -0.1, 0]} scale={1.4} />
        <OrbitControls enableZoom={false} enablePan={false} target={[0, 0.85, 0]} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  )
}
