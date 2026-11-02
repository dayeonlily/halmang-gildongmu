import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 할망 마스코트 ─────────────────────────────────────────
// 둥글고 통통한 비율(머리가 몸의 절반), 큰 눈과 하이라이트, 볼터치, 스티커 같은 윤곽선.
// 한복 치마·저고리·고름, 쪽 찐 은빛 머리와 비녀, 손에는 한라봉.
const OUTLINE = '#7a4a35'

// 윤곽선: 같은 모양을 살짝 키워서 뒤집어 그리면 둘레에 선이 생긴다
function Outlined({ children, geometry, color, outline = 0.028, position, rotation, scale = [1, 1, 1], roughness = 0.55, sheen = 0.5, vertexColors = false }) {
  const s = scale.map((v) => v * (1 + outline))
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} scale={scale} castShadow>
        <meshPhysicalMaterial color={vertexColors ? '#ffffff' : color} vertexColors={vertexColors} roughness={roughness} sheen={sheen} sheenRoughness={0.6} sheenColor="#fff3e6" />
      </mesh>
      <mesh geometry={geometry} scale={s}><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
      {children}
    </group>
  )
}

const Ball = ({ r = 0.1, color, position, scale = [1, 1, 1], rough = 0.6 }) => (
  <mesh position={position} scale={scale} castShadow>
    <sphereGeometry args={[r, 32, 24]} /><meshStandardMaterial color={color} roughness={rough} />
  </mesh>
)

// 부드러운 종 모양 치마 (밑단은 둥글게, 위쪽일수록 연한 산호색)
function useSkirt() {
  return useMemo(() => {
    const curve = new THREE.SplineCurve([
      new THREE.Vector2(0.001, 0.05), new THREE.Vector2(0.3, 0.05), new THREE.Vector2(0.47, 0.085), new THREE.Vector2(0.55, 0.17),
      new THREE.Vector2(0.53, 0.28), new THREE.Vector2(0.44, 0.47), new THREE.Vector2(0.33, 0.67), new THREE.Vector2(0.27, 0.8), new THREE.Vector2(0.25, 0.88),
    ])
    const geo = new THREE.LatheGeometry(curve.getPoints(48), 64)
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3)
    const lo = new THREE.Color('#f2705a'), hi = new THREE.Color('#ff9f87'), c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) { c.copy(lo).lerp(hi, Math.min(1, Math.max(0, (pos.getY(i) - 0.05) / 0.8))); col.set([c.r, c.g, c.b], i * 3) }
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
    grd.addColorStop(0, 'rgba(60,35,20,.38)'); grd.addColorStop(1, 'rgba(60,35,20,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.02]}>
      <planeGeometry args={[1.5, 1.2]} /><meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

export default function Halmang({ speaking = false, position = [0, 0, 0], scale = 1, shadow = true }) {
  const root = useRef(), head = useRef(), armR = useRef(), bun = useRef(), mouthOpen = useRef(), smile = useRef()
  const eyeL = useRef(), eyeR = useRef(), browL = useRef(), browR = useRef()
  const skirt = useSkirt()
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 48, 36), [])

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime
    if (root.current) { // 숨 쉬듯 살짝 늘었다 줄어듦 + 통통 튀기
      root.current.position.y = position[1] + Math.abs(Math.sin(t * 2)) * 0.02
      root.current.scale.set(scale * (1 - Math.sin(t * 4) * 0.006), scale * (1 + Math.sin(t * 4) * 0.012), scale)
    }
    if (head.current) { // 마우스 쪽을 슬쩍 쳐다보며 고개를 갸웃
      head.current.rotation.y += (pointer.x * 0.5 - head.current.rotation.y) * 0.08
      head.current.rotation.x += (-pointer.y * 0.2 - head.current.rotation.x) * 0.08
      head.current.rotation.z = Math.sin(t * 1.3) * 0.045
    }
    if (armR.current) armR.current.rotation.z = -2.45 + Math.sin(t * 3.4) * 0.3
    if (bun.current) bun.current.rotation.z = Math.sin(t * 1.3 + 1) * 0.08
    const blink = (t % 3.4) > 3.28 ? 0.12 : 1 // 3초마다 깜빡
    for (const e of [eyeL, eyeR]) if (e.current) e.current.scale.y = blink
    const talk = speaking ? 0.35 + Math.abs(Math.sin(t * 11)) * 0.9 : 0
    if (mouthOpen.current) { mouthOpen.current.visible = speaking; mouthOpen.current.scale.set(1, talk, 1) }
    if (smile.current) smile.current.visible = !speaking
    for (const b of [browL, browR]) if (b.current) b.current.position.y = 1.395 + (speaking ? Math.sin(t * 6) * 0.008 + 0.01 : 0)
  })

  return (
    <group ref={root} position={position} scale={scale}>
      {shadow && <SoftShadow />}

      {/* 꽃신 */}
      <Ball r={0.085} color="#ffb7a3" position={[-0.15, 0.075, 0.2]} scale={[1, 0.7, 1.35]} />
      <Ball r={0.085} color="#ffb7a3" position={[0.15, 0.075, 0.2]} scale={[1, 0.7, 1.35]} />

      {/* 치마 */}
      <Outlined geometry={skirt} vertexColors outline={0.012} roughness={0.7} sheen={0.7} />

      {/* 저고리 + 동정(흰 깃) + 고름(리본) */}
      <Outlined geometry={sphere} color="#fff3d4" position={[0, 0.98, 0]} scale={[0.29, 0.25, 0.23]} outline={0.05}>
        <mesh position={[-0.05, 0.1, 0.205]} rotation={[0.3, 0, 0.55]}><capsuleGeometry args={[0.018, 0.17, 6, 12]} /><meshStandardMaterial color="#ffffff" roughness={0.6} /></mesh>
        <mesh position={[0.05, 0.1, 0.205]} rotation={[0.3, 0, -0.55]}><capsuleGeometry args={[0.018, 0.17, 6, 12]} /><meshStandardMaterial color="#ffffff" roughness={0.6} /></mesh>
      </Outlined>
      <group position={[0.01, 1.0, 0.25]}>
        <Ball r={0.035} color="#f2705a" position={[0, 0, 0.01]} />
        <Ball r={0.06} color="#f2705a" position={[-0.07, 0.015, 0]} scale={[1, 0.55, 0.5]} />
        <Ball r={0.06} color="#f2705a" position={[0.07, 0.015, 0]} scale={[1, 0.55, 0.5]} />
        <mesh position={[-0.025, -0.1, 0]} rotation={[0, 0, 0.12]}><capsuleGeometry args={[0.02, 0.14, 6, 12]} /><meshStandardMaterial color="#f2705a" roughness={0.6} /></mesh>
        <mesh position={[0.03, -0.1, 0]} rotation={[0, 0, -0.1]}><capsuleGeometry args={[0.02, 0.12, 6, 12]} /><meshStandardMaterial color="#f2705a" roughness={0.6} /></mesh>
      </group>

      {/* 한라봉을 든 왼팔 (화면 왼쪽) */}
      <group position={[-0.27, 0.96, 0.02]} rotation={[0, 0, 0.55]}>
        <mesh position={[0, -0.12, 0]}><capsuleGeometry args={[0.065, 0.17, 8, 16]} /><meshStandardMaterial color="#fff3d4" roughness={0.6} /></mesh>
        <Ball r={0.06} color="#ffdcb8" position={[0, -0.27, 0.02]} />
      </group>
      <group position={[-0.36, 0.69, 0.14]}>
        <Ball r={0.105} color="#ff9f1c" position={[0, 0, 0]} scale={[1, 0.92, 1]} rough={0.5} />
        <Ball r={0.03} color="#ff9f1c" position={[0, 0.095, 0]} />
        <mesh position={[0.04, 0.115, 0]} rotation={[0, 0, -0.9]} scale={[1, 0.45, 0.5]}><sphereGeometry args={[0.06, 16, 12]} /><meshStandardMaterial color="#5aa04a" roughness={0.6} /></mesh>
      </group>

      {/* 손 흔드는 오른팔 (화면 오른쪽) */}
      <group position={[0.27, 0.98, 0.02]}>
        <group ref={armR} rotation={[0, 0, -2.45]}>
          <mesh position={[0, 0.12, 0]}><capsuleGeometry args={[0.065, 0.17, 8, 16]} /><meshStandardMaterial color="#fff3d4" roughness={0.6} /></mesh>
          <Ball r={0.065} color="#ffdcb8" position={[0, 0.27, 0]} />
        </group>
      </group>

      {/* 머리 */}
      <group ref={head} position={[0, 1.3, 0]} scale={1.2}>
        <Outlined geometry={sphere} color="#ffdcb8" scale={[0.43, 0.39, 0.4]} outline={0.04} roughness={0.5} sheen={0.8}>
          {/* 큰 눈 + 반짝이는 하이라이트 */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.15, -0.05, 0.35]}>
              <group ref={s < 0 ? eyeL : eyeR}>
                <mesh scale={[1, 1.25, 0.55]}><sphereGeometry args={[0.06, 24, 20]} /><meshStandardMaterial color="#2b1b14" roughness={0.25} /></mesh>
                <mesh position={[0.02, 0.03, 0.03]}><sphereGeometry args={[0.02, 12, 12]} /><meshBasicMaterial color="#ffffff" /></mesh>
                <mesh position={[-0.016, -0.023, 0.032]}><sphereGeometry args={[0.009, 10, 10]} /><meshBasicMaterial color="#ffffff" /></mesh>
              </group>
            </group>
          ))}
        </Outlined>

        {/* 눈썹 */}
        <mesh ref={browL} position={[-0.15, 1.395 - 1.25, 0.35]} rotation={[0, 0, 0.18]}><capsuleGeometry args={[0.012, 0.07, 6, 10]} /><meshStandardMaterial color="#cfcac3" roughness={0.8} /></mesh>
        <mesh ref={browR} position={[0.15, 1.395 - 1.25, 0.35]} rotation={[0, 0, -0.18]}><capsuleGeometry args={[0.012, 0.07, 6, 10]} /><meshStandardMaterial color="#cfcac3" roughness={0.8} /></mesh>

        {/* 볼터치 · 코 · 웃는 입 / 말할 때는 벌어지는 입 */}
        <mesh position={[-0.255, -0.13, 0.28]} rotation={[0, -0.7, 0]} scale={[1, 0.62, 0.3]}><sphereGeometry args={[0.07, 20, 16]} /><meshBasicMaterial color="#ff9aa2" transparent opacity={0.65} /></mesh>
        <mesh position={[0.255, -0.13, 0.28]} rotation={[0, 0.7, 0]} scale={[1, 0.62, 0.3]}><sphereGeometry args={[0.07, 20, 16]} /><meshBasicMaterial color="#ff9aa2" transparent opacity={0.65} /></mesh>
        <Ball r={0.028} color="#f0b48c" position={[0, -0.1, 0.385]} scale={[1, 0.85, 0.8]} />
        <mesh ref={smile} position={[0, -0.135, 0.372]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.062, 0.011, 10, 24, Math.PI]} /><meshStandardMaterial color="#9a4a38" roughness={0.5} /></mesh>
        <group ref={mouthOpen} position={[0, -0.16, 0.368]} visible={false}>
          <mesh scale={[1, 1, 0.5]}><sphereGeometry args={[0.055, 20, 16]} /><meshStandardMaterial color="#8a2f2f" roughness={0.4} /></mesh>
          <mesh position={[0, -0.02, 0.02]} scale={[0.9, 0.5, 0.4]}><sphereGeometry args={[0.04, 16, 12]} /><meshStandardMaterial color="#ff8a8a" roughness={0.5} /></mesh>
        </group>

        {/* 귀 */}
        <Ball r={0.06} color="#ffdcb8" position={[-0.425, -0.03, -0.01]} scale={[0.6, 1, 1]} />
        <Ball r={0.06} color="#ffdcb8" position={[0.425, -0.03, -0.01]} scale={[0.6, 1, 1]} />

        {/* 은빛 머리: 뒤로 젖혀 이마가 드러나는 모자 모양 + 옆머리 + 쪽 + 비녀 */}
        <group rotation={[-0.72, 0, 0]} position={[0, 0.03, -0.03]}>
          <mesh scale={[0.455, 0.42, 0.435]} castShadow>
            <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshPhysicalMaterial color="#efece6" roughness={0.7} sheen={0.6} sheenColor="#ffffff" side={THREE.DoubleSide} />
          </mesh>
          <mesh scale={[0.468, 0.433, 0.448]}><sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
        </group>
        <Ball r={0.085} color="#efece6" position={[-0.4, 0.06, -0.06]} rough={0.8} />
        <Ball r={0.085} color="#efece6" position={[0.4, 0.06, -0.06]} rough={0.8} />
        <group ref={bun} position={[0, 0.41, -0.22]}>
          <Ball r={0.15} color="#efece6" rough={0.75} />
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.02]}><capsuleGeometry args={[0.012, 0.34, 6, 10]} /><meshStandardMaterial color="#e6b422" metalness={0.5} roughness={0.35} /></mesh>
          <Ball r={0.026} color="#e53935" position={[0.2, 0, 0.02]} />
          <Ball r={0.026} color="#e53935" position={[-0.2, 0, 0.02]} />
        </group>
      </group>
    </group>
  )
}
