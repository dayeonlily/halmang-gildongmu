import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 할망 마스코트 ─────────────────────────────────────────
// 2등신에 가까운 비율: 머리가 키의 절반이 넘고 몸·팔다리는 짧고 통통하다.
// 질감은 만화처럼 3단계로 끊어지는 툰 셰이딩 + 스티커 윤곽선.
// 한복 치마·저고리·고름, 쪽 찐 은빛 머리와 비녀, 손에는 한라봉.
const OUTLINE = '#7a4a35'

// 툰 셰이딩용 3단계 명암 (밝음 · 중간 · 그림자)
function useToonTones() {
  return useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([185, 185, 185, 255, 232, 232, 232, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat)
    t.minFilter = t.magFilter = THREE.NearestFilter
    t.needsUpdate = true
    return t
  }, [])
}

// 윤곽선: 같은 모양을 살짝 키워서 뒤집어 그리면 둘레에 선이 생긴다
function Outlined({ children, geometry, color, tones, outline = 0.035, position, rotation, scale = [1, 1, 1], vertexColors = false }) {
  const s = scale.map((v) => v * (1 + outline))
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} scale={scale} castShadow>
        <meshToonMaterial color={vertexColors ? '#ffffff' : color} vertexColors={vertexColors} gradientMap={tones} />
      </mesh>
      <mesh geometry={geometry} scale={s}><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
      {children}
    </group>
  )
}

function Ball({ r = 0.1, color, position, scale = [1, 1, 1], tones }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[r, 32, 24]} /><meshToonMaterial color={color} gradientMap={tones} />
    </mesh>
  )
}

// 통통한 종 모양 치마 (밑단은 둥글게, 위쪽일수록 연한 산호색)
function useSkirt() {
  return useMemo(() => {
    const curve = new THREE.SplineCurve([
      new THREE.Vector2(0.001, 0.04), new THREE.Vector2(0.3, 0.04), new THREE.Vector2(0.45, 0.08), new THREE.Vector2(0.5, 0.17),
      new THREE.Vector2(0.47, 0.3), new THREE.Vector2(0.38, 0.46), new THREE.Vector2(0.3, 0.6), new THREE.Vector2(0.25, 0.7),
    ])
    const geo = new THREE.LatheGeometry(curve.getPoints(40), 56)
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3)
    const lo = new THREE.Color('#f2705a'), hi = new THREE.Color('#ff9f87'), c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) { c.copy(lo).lerp(hi, Math.min(1, Math.max(0, (pos.getY(i) - 0.04) / 0.66))); col.set([c.r, c.g, c.b], i * 3) }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    geo.computeVertexNormals()
    return geo
  }, [])
}

// 바닥에 깔리는 부드러운 그림자 (가장자리가 번지는 원)
function SoftShadow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const g = c.getContext('2d'), grd = g.createRadialGradient(64, 64, 4, 64, 64, 62)
    grd.addColorStop(0, 'rgba(60,35,20,.36)'); grd.addColorStop(1, 'rgba(60,35,20,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.02]}>
      <planeGeometry args={[1.5, 1.1]} /><meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

const Capsule = ({ r, len, color, tones, position, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow>
    <capsuleGeometry args={[r, len, 8, 16]} /><meshToonMaterial color={color} gradientMap={tones} />
  </mesh>
)

export default function Halmang({ speaking = false, position = [0, 0, 0], scale = 1, shadow = true }) {
  const root = useRef(), head = useRef(), armR = useRef(), bun = useRef(), mouthOpen = useRef(), smile = useRef()
  const eyeL = useRef(), eyeR = useRef()
  const skirt = useSkirt()
  const tones = useToonTones()
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 48, 36), [])

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime
    if (root.current) { // 숨 쉬듯 살짝 늘었다 줄어듦 + 통통 튀기
      root.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.025
      root.current.scale.set(scale * (1 - Math.sin(t * 4) * 0.008), scale * (1 + Math.sin(t * 4) * 0.016), scale)
    }
    if (head.current) { // 마우스 쪽을 슬쩍 쳐다보며 고개를 갸웃
      head.current.rotation.y += (pointer.x * 0.5 - head.current.rotation.y) * 0.08
      head.current.rotation.x += (-pointer.y * 0.2 - head.current.rotation.x) * 0.08
      head.current.rotation.z = Math.sin(t * 1.3) * 0.05
    }
    if (armR.current) armR.current.rotation.z = -0.95 + Math.sin(t * 3.4) * 0.28 // 손 흔들기
    if (bun.current) bun.current.rotation.z = Math.sin(t * 1.3 + 1) * 0.08
    const blink = (t % 3.4) > 3.28 ? 0.12 : 1 // 3초마다 깜빡
    for (const e of [eyeL, eyeR]) if (e.current) e.current.scale.y = blink
    const talk = speaking ? 0.35 + Math.abs(Math.sin(t * 11)) * 0.9 : 0
    if (mouthOpen.current) { mouthOpen.current.visible = speaking; mouthOpen.current.scale.set(1, talk, 1) }
    if (smile.current) smile.current.visible = !speaking
  })

  return (
    <group ref={root} position={position} scale={scale}>
      {shadow && <SoftShadow />}

      {/* 꽃신 */}
      <Ball r={0.08} color="#ffb7a3" tones={tones} position={[-0.17, 0.065, 0.2]} scale={[1, 0.7, 1.35]} />
      <Ball r={0.08} color="#ffb7a3" tones={tones} position={[0.17, 0.065, 0.2]} scale={[1, 0.7, 1.35]} />

      {/* 치마(작고 통통한 몸) */}
      <Outlined geometry={skirt} tones={tones} vertexColors outline={0.014} />

      {/* 저고리 + 고름(리본): 머리 아래로 살짝 보이는 가슴께 */}
      <Outlined geometry={sphere} color="#fff3d4" tones={tones} position={[0, 0.7, 0.01]} scale={[0.27, 0.2, 0.22]} outline={0.06} />
      <group position={[0.01, 0.62, 0.2]}>
        <Ball r={0.032} color="#f2705a" tones={tones} position={[0, 0, 0.01]} />
        <Ball r={0.055} color="#f2705a" tones={tones} position={[-0.065, 0.012, 0]} scale={[1, 0.55, 0.5]} />
        <Ball r={0.055} color="#f2705a" tones={tones} position={[0.065, 0.012, 0]} scale={[1, 0.55, 0.5]} />
        <Capsule r={0.018} len={0.1} color="#f2705a" tones={tones} position={[-0.025, -0.08, 0]} rotation={[0, 0, 0.12]} />
        <Capsule r={0.018} len={0.09} color="#f2705a" tones={tones} position={[0.03, -0.08, 0]} rotation={[0, 0, -0.1]} />
      </group>

      {/* 한라봉을 든 왼팔 (화면 왼쪽): 짧고 통통하게 */}
      <group position={[-0.27, 0.66, 0.06]} rotation={[0, 0, 0.7]}>
        <Capsule r={0.07} len={0.1} color="#fff3d4" tones={tones} position={[0, -0.1, 0]} />
        <Ball r={0.065} color="#ffdcb8" tones={tones} position={[0, -0.2, 0.02]} />
      </group>
      <group position={[-0.43, 0.43, 0.2]}>
        <Ball r={0.115} color="#ff9f1c" tones={tones} scale={[1, 0.92, 1]} />
        <Ball r={0.032} color="#ff9f1c" tones={tones} position={[0, 0.105, 0]} />
        <mesh position={[0.045, 0.125, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.45, 0.5]}><sphereGeometry args={[0.065, 16, 12]} /><meshToonMaterial color="#5aa04a" gradientMap={tones} /></mesh>
      </group>

      {/* 손 흔드는 오른팔 (화면 오른쪽): 머리 옆으로 쏙 올라오는 짧은 팔 */}
      <group position={[0.28, 0.66, 0.06]}>
        <group ref={armR} rotation={[0, 0, -0.95]}>
          <Capsule r={0.07} len={0.2} color="#fff3d4" tones={tones} position={[0, 0.17, 0]} />
          <Ball r={0.075} color="#ffdcb8" tones={tones} position={[0, 0.34, 0]} />
        </group>
      </group>

      {/* 머리: 키의 절반이 넘는 큰 머리 */}
      <group ref={head} position={[0, 1.12, 0]} scale={1.28}>
        <Outlined geometry={sphere} color="#ffdcb8" tones={tones} scale={[0.43, 0.39, 0.4]} outline={0.04}>
          {/* 단순하고 또렷한 눈 */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.15, -0.04, 0.35]}>
              <group ref={s < 0 ? eyeL : eyeR}>
                <mesh scale={[0.9, 1.35, 0.55]}><sphereGeometry args={[0.05, 24, 20]} /><meshBasicMaterial color="#2b1b14" /></mesh>
                <mesh position={[0.016, 0.03, 0.026]}><sphereGeometry args={[0.016, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
              </group>
            </group>
          ))}
        </Outlined>

        {/* 큼직한 볼터치 · 작은 코 · 웃는 입 / 말할 때는 벌어지는 입 */}
        <mesh position={[-0.255, -0.13, 0.275]} rotation={[0, -0.7, 0]} scale={[1, 0.7, 0.3]}><sphereGeometry args={[0.08, 20, 16]} /><meshBasicMaterial color="#ff9aa2" transparent opacity={0.75} /></mesh>
        <mesh position={[0.255, -0.13, 0.275]} rotation={[0, 0.7, 0]} scale={[1, 0.7, 0.3]}><sphereGeometry args={[0.08, 20, 16]} /><meshBasicMaterial color="#ff9aa2" transparent opacity={0.75} /></mesh>
        <Ball r={0.024} color="#f0b48c" tones={tones} position={[0, -0.09, 0.385]} scale={[1, 0.85, 0.8]} />
        <mesh ref={smile} position={[0, -0.13, 0.372]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.055, 0.011, 10, 24, Math.PI]} /><meshBasicMaterial color="#b0543f" /></mesh>
        <group ref={mouthOpen} position={[0, -0.15, 0.368]} visible={false}>
          <mesh scale={[1, 1, 0.5]}><sphereGeometry args={[0.05, 20, 16]} /><meshBasicMaterial color="#8a2f2f" /></mesh>
          <mesh position={[0, -0.018, 0.02]} scale={[0.9, 0.5, 0.4]}><sphereGeometry args={[0.036, 16, 12]} /><meshBasicMaterial color="#ff8a8a" /></mesh>
        </group>

        {/* 귀 */}
        <Ball r={0.06} color="#ffdcb8" tones={tones} position={[-0.425, -0.03, -0.01]} scale={[0.6, 1, 1]} />
        <Ball r={0.06} color="#ffdcb8" tones={tones} position={[0.425, -0.03, -0.01]} scale={[0.6, 1, 1]} />

        {/* 은빛 머리: 뒤로 젖혀 이마가 드러나는 모양 + 옆머리 + 쪽 + 비녀 */}
        <group rotation={[-0.72, 0, 0]} position={[0, 0.03, -0.03]}>
          <mesh scale={[0.455, 0.42, 0.435]} castShadow>
            <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshToonMaterial color="#efece6" gradientMap={tones} side={THREE.DoubleSide} />
          </mesh>
          <mesh scale={[0.47, 0.435, 0.45]}><sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
        </group>
        <Ball r={0.085} color="#efece6" tones={tones} position={[-0.4, 0.06, -0.06]} />
        <Ball r={0.085} color="#efece6" tones={tones} position={[0.4, 0.06, -0.06]} />
        <group ref={bun} position={[0, 0.41, -0.22]}>
          <Ball r={0.15} color="#efece6" tones={tones} />
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.02]}><capsuleGeometry args={[0.012, 0.34, 6, 10]} /><meshStandardMaterial color="#e6b422" metalness={0.5} roughness={0.35} /></mesh>
          <Ball r={0.026} color="#e53935" tones={tones} position={[0.2, 0, 0.02]} />
          <Ball r={0.026} color="#e53935" tones={tones} position={[-0.2, 0, 0.02]} />
        </group>
      </group>
    </group>
  )
}
