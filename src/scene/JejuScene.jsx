import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { BOUNDS, HALLA, buildTerrain, terrainHeight, toXZ } from './terrain'

export { toXZ }

const scoreColor = (s) => (s >= 70 ? '#43a047' : s >= 50 ? '#f9a825' : '#e53935')
const FOG = '#cfe3ee'

// ── 지형: 실제 해안선 + 높이맵(한라산·오름·성산일출봉·산방산) ──
function Terrain() {
  const { geo } = useMemo(buildTerrain, [])
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.95} metalness={0} />
    </mesh>
  )
}

// ── 숲: 인스턴싱으로 나무 수천 그루를 한 번에 그림 ────────────
function Forest() {
  const { trees } = useMemo(buildTerrain, [])
  const low = useRef(), high = useRef()
  useEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color()
    const greens = ['#2f6b34', '#3f7c3d', '#4b8a3f', '#5a9444']
    trees.forEach(([x, y, z, s, r], i) => {
      q.setFromEuler(new THREE.Euler(0, r * 6.28, 0))
      m.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (1 + r * 0.6), s))
      low.current.setMatrixAt(i, m)
      m.compose(new THREE.Vector3(x, y + s * 0.62, z), q, new THREE.Vector3(s * 0.7, s * (0.9 + r * 0.5), s * 0.7))
      high.current.setMatrixAt(i, m)
      c.set(greens[Math.floor(r * 4) % 4])
      low.current.setColorAt(i, c); high.current.setColorAt(i, c)
    })
    for (const ref of [low, high]) { ref.current.instanceMatrix.needsUpdate = true; ref.current.instanceColor.needsUpdate = true }
  }, [trees])
  return (
    <>
      <instancedMesh ref={low} args={[null, null, trees.length]} castShadow>
        <coneGeometry args={[0.5, 1.2, 6]} /><meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={high} args={[null, null, trees.length]}>
        <coneGeometry args={[0.5, 1.1, 6]} /><meshStandardMaterial roughness={1} flatShading />
      </instancedMesh>
    </>
  )
}

// ── 바다: 해안 거리로 색이 변하는 물 + 반짝임 + 해안 거품 ─────
const waterVert = `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`
const waterFrag = `
uniform float uTime; uniform sampler2D uDepth; uniform vec4 uBounds; uniform vec3 uFog; varying vec3 vW;
void main(){
  vec2 uv = vec2((vW.x-uBounds.x)/(uBounds.y-uBounds.x), (uBounds.w-vW.z)/(uBounds.w-uBounds.z));
  float inB = step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
  float depth = mix(1., texture2D(uDepth, clamp(uv,0.,1.)).r, inB);
  vec3 col = mix(vec3(0.36,0.86,0.80), vec3(0.03,0.30,0.55), smoothstep(0.0,0.55,depth));
  vec2 p = vW.xz; float t = uTime;
  float w1 = sin(p.x*7.+t*1.1)*sin(p.y*6.-t*0.9);
  float w2 = sin((p.x*1.3+p.y)*13.+t*1.7);
  float w3 = sin((p.x-p.y*1.2)*22.-t*2.3);
  float n = w1*.5 + w2*.3 + w3*.2;
  col += pow(max(0., n*.5+.5), 5.) * 0.14;
  float foam = smoothstep(0.075, 0.0, depth + 0.02*w3 + 0.015*w2);
  col = mix(col, vec3(1.), foam*(0.55 + 0.25*sin(t*1.6 + p.x*10.)));
  vec3 V = normalize(cameraPosition - vW);
  col = mix(col, vec3(0.72,0.86,0.96), pow(1.-max(V.y,0.), 3.)*0.5);
  col = mix(col, uFog, smoothstep(9., 24., length(cameraPosition - vW)));
  float a = max(mix(0.62, 0.98, smoothstep(0.0, 0.22, depth)), foam*0.9);
  gl_FragColor = vec4(col, a);
}`
function Water() {
  const { depthTex } = useMemo(buildTerrain, [])
  const mat = useRef()
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uDepth: { value: depthTex }, uFog: { value: new THREE.Color(FOG) },
    uBounds: { value: new THREE.Vector4(BOUNDS.minX, BOUNDS.maxX, BOUNDS.minZ, BOUNDS.maxZ) },
  }), [depthTex])
  useFrame(({ clock }) => { if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[70, 70]} />
      <shaderMaterial ref={mat} vertexShader={waterVert} fragmentShader={waterFrag} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  )
}

function Cloud({ x, y, z, s = 1, speed = 0.05 }) {
  const g = useRef()
  useFrame(({ clock }) => { if (g.current) g.current.position.x = x + Math.sin(clock.elapsedTime * speed) * 1.4 })
  const puffs = [[0, 0, 0, 0.36], [0.34, -0.05, 0.06, 0.3], [-0.34, -0.06, 0, 0.28], [0.12, 0.12, 0, 0.26], [-0.1, 0.06, 0.18, 0.24], [0.5, -0.1, -0.05, 0.2]]
  return (
    <group ref={g} position={[x, y, z]} scale={s}>
      {puffs.map(([a, b, c, r], i) => (
        <mesh key={i} position={[a, b, c]}><sphereGeometry args={[r, 14, 12]} /><meshStandardMaterial color="#fff" transparent opacity={0.9} roughness={1} /></mesh>
      ))}
    </group>
  )
}

// ── 추천 스팟 핀: 지형 위에 서고, 점수 색 + 퍼지는 링 ─────────
function Pin({ spot, selected, onSelect }) {
  const body = useRef(), ring = useRef()
  const [hover, setHover] = useState(false)
  const [x, z] = useMemo(() => toXZ(spot.lat, spot.lng), [spot.lat, spot.lng])
  const y = useMemo(() => terrainHeight(x, z), [x, z])
  const color = scoreColor(spot.scores?.total ?? 0)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (body.current) body.current.position.y = 0.05 + (selected ? Math.abs(Math.sin(t * 4)) * 0.12 : Math.sin(t * 2 + x) * 0.012)
    if (ring.current) { const k = (t * 0.8 + x) % 1; ring.current.scale.setScalar(0.6 + k * 1.6); ring.current.material.opacity = (selected ? 0.8 : 0.35) * (1 - k) }
  })
  return (
    <group position={[x, y, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.07, 0.09, 32]} /><meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <group ref={body} scale={selected || hover ? 1.4 : 1}
        onClick={(e) => { e.stopPropagation(); onSelect?.(spot.id) }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}>
        <mesh position={[0, 0.22, 0]} castShadow><sphereGeometry args={[0.095, 24, 18]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.55 : 0.2} roughness={0.35} /></mesh>
        <mesh position={[0, 0.07, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.06, 0.2, 16]} /><meshStandardMaterial color={color} roughness={0.4} /></mesh>
        {(selected || hover) && (
          <Html center distanceFactor={4.5} position={[0, 0.55, 0]} style={{ pointerEvents: 'none' }}>
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
      <mesh position={[0, 0.38, 0]} castShadow><coneGeometry args={[0.42, 0.78, 28]} /><meshStandardMaterial color="#ef6c57" roughness={0.7} /></mesh>
      <mesh position={[0, 0.82, 0]} castShadow><cylinderGeometry args={[0.2, 0.26, 0.3, 24]} /><meshStandardMaterial color="#fff1c9" /></mesh>
      <mesh position={[0, 0.9, 0.17]} rotation={[0.25, 0, 0]}><boxGeometry args={[0.1, 0.18, 0.02]} /><meshStandardMaterial color="#ef6c57" /></mesh>
      <mesh position={[0, 1.2, 0]} castShadow><sphereGeometry args={[0.26, 28, 24]} /><meshStandardMaterial color="#ffd9b3" /></mesh>
      <mesh position={[0, 1.32, -0.04]} scale={[1, 0.75, 1]}><sphereGeometry args={[0.27, 28, 20, 0, Math.PI * 2, 0, Math.PI / 1.9]} /><meshStandardMaterial color="#cfd2d6" /></mesh>
      <mesh position={[0, 1.55, -0.12]}><sphereGeometry args={[0.11, 16, 14]} /><meshStandardMaterial color="#cfd2d6" /></mesh>
      <mesh position={[0, 1.5, -0.12]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.012, 0.012, 0.3, 8]} /><meshStandardMaterial color="#c9a227" /></mesh>
      <mesh position={[-0.09, 1.22, 0.23]}><sphereGeometry args={[0.028, 10, 10]} /><meshStandardMaterial color="#3b2a22" /></mesh>
      <mesh position={[0.09, 1.22, 0.23]}><sphereGeometry args={[0.028, 10, 10]} /><meshStandardMaterial color="#3b2a22" /></mesh>
      <mesh position={[-0.15, 1.15, 0.2]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#ff9e9e" /></mesh>
      <mesh position={[0.15, 1.15, 0.2]}><sphereGeometry args={[0.04, 10, 10]} /><meshStandardMaterial color="#ff9e9e" /></mesh>
      <mesh ref={mouth} position={[0, 1.12, 0.245]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} /><meshStandardMaterial color="#8c3b2a" /></mesh>
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

// 땅에 붙은 그림자(할망 발밑)
function BlobShadow({ position, r = 0.4 }) {
  return (
    <mesh position={[position[0], position[1] + 0.006, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 24]} /><meshBasicMaterial color="#1c2a1c" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  )
}

// 선택한 핀으로 카메라가 부드럽게 다가감
function CameraRig({ controls, focus }) {
  const camera = useThree((s) => s.camera)
  const home = useMemo(() => new THREE.Vector3(0, 0.15, 0), [])
  const want = useMemo(() => new THREE.Vector3(), [])
  const until = useRef(0)
  useEffect(() => { until.current = performance.now() + (focus ? 1400 : 0) }, [focus])
  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return
    want.set(...(focus ?? home.toArray()))
    c.target.lerp(want, 1 - Math.exp(-dt * 4))
    if (focus && performance.now() < until.current) {
      const off = camera.position.clone().sub(c.target)
      off.setLength(THREE.MathUtils.lerp(off.length(), 3.2, 1 - Math.exp(-dt * 3)))
      camera.position.copy(c.target).add(off)
    }
  })
  return null
}

function Lights({ shadows }) {
  return (
    <>
      <hemisphereLight args={['#cfe8ff', '#7d8a5c', 0.65]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 7.5, 3.5]} intensity={2.1} color="#fff1dc" castShadow={shadows}
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-5.5} shadow-camera-right={5.5} shadow-camera-top={4} shadow-camera-bottom={-4}
        shadow-camera-near={1} shadow-camera-far={22} shadow-bias={-0.0004} shadow-normalBias={0.02} />
    </>
  )
}

// ── 제주 3D 지도 ─────────────────────────────────────────
// spots: [{id,title,lat,lng,scores}] · hero: 홈 화면용(할망·구름·천천히 자동 회전)
export function IslandScene({ spots = [], selectedId, onSelect, hero = false, height = 420 }) {
  const controls = useRef()
  const shadows = typeof window !== 'undefined' && window.innerWidth > 700 // 폰은 그림자를 꺼서 가볍게
  const halmangAt = useMemo(() => { const [x, z] = toXZ(33.455, 126.44); return [x, terrainHeight(x, z), z] }, [])
  const focus = useMemo(() => {
    const s = spots.find((p) => p.id === selectedId)
    if (!s) return null
    const [x, z] = toXZ(s.lat, s.lng)
    return [x, terrainHeight(x, z) + 0.1, z]
  }, [spots, selectedId])

  return (
    <div className="scene-wrap" style={{ height }}>
      <Canvas shadows={shadows} camera={{ position: hero ? [0.5, 2.9, 6.4] : [0, 4.6, 5.8], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
        <fog attach="fog" args={[FOG, 9, 24]} />
        <Sky distance={450000} sunPosition={[5, 7, 3.5]} turbidity={3.5} rayleigh={1.1} mieCoefficient={0.004} mieDirectionalG={0.85} />
        <Lights shadows={shadows} />
        <Water />
        <Terrain />
        <Forest />
        <Cloud x={-2.4} y={2.6} z={-1.6} s={1.2} />
        <Cloud x={2.6} y={3.0} z={0.4} s={1.5} speed={0.07} />
        <Cloud x={0.4} y={3.4} z={-2.8} s={1.0} speed={0.04} />
        {hero && <><BlobShadow position={halmangAt} r={0.28} /><Halmang position={halmangAt} scale={0.62} /></>}
        {spots.map((s) => <Pin key={s.id} spot={s} selected={s.id === selectedId} onSelect={onSelect} />)}
        <OrbitControls ref={controls} enablePan={false} enableDamping minDistance={2.2} maxDistance={11} maxPolarAngle={Math.PI / 2.1}
          autoRotate={hero && !selectedId} autoRotateSpeed={0.45} target={[HALLA[0] * 0.2, 0.15, HALLA[1] * 0.2]} />
        <CameraRig controls={controls} focus={focus} />
      </Canvas>
    </div>
  )
}

// 이야기 들려주는 할망 (작은 캔버스)
export function HalmangBuddy({ speaking = false, height = 220, bare = false }) {
  return (
    <div className="scene-wrap buddy" style={{ height, ...(bare ? { background: 'transparent', border: 'none' } : {}) }}>
      <Canvas camera={{ position: [0, 1.1, 3.1], fov: 38 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <hemisphereLight args={['#fff4dc', '#e8b97a', 0.8]} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} />
        <Halmang speaking={speaking} position={[0, -0.1, 0]} scale={1.4} />
        <OrbitControls enableZoom={false} enablePan={false} target={[0, 0.85, 0]} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  )
}
