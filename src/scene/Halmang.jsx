import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 할망 마스코트 ─────────────────────────────────────────
// 2등신에 가까운 비율: 머리가 키의 절반이 넘고 몸·팔다리는 짧고 통통하다.
// 질감은 만화처럼 3단계로 끊어지는 툰 셰이딩 + 스티커 윤곽선.
// 설문대할망: 쪽 찐 은빛 머리와 파란 비녀, 분홍 저고리에 보라 고름·소맷부리, 연두 치마, 흰 버선,
// 한 손에는 흙이 담긴 대나무 삼태기. (2D 이야기 그림과 같은 캐릭터)
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
      new THREE.Vector2(0.47, 0.3), new THREE.Vector2(0.37, 0.4), new THREE.Vector2(0.3, 0.5), new THREE.Vector2(0.255, 0.56),
    ])
    const geo = new THREE.LatheGeometry(curve.getPoints(40), 56)
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3)
    const lo = new THREE.Color('#8fb89a'), hi = new THREE.Color('#b0d2b5'), hem = new THREE.Color('#e9aaa4'), c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      c.copy(lo).lerp(hi, Math.min(1, Math.max(0, (y - 0.04) / 0.52)))
      if (y < 0.12) c.lerp(hem, 1 - Math.max(0, (y - 0.04) / 0.08)) // 밑단은 분홍 속치마
      col.set([c.r, c.g, c.b], i * 3)
    }
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

// 삼태기에서 흙이 졸졸 떨어지는 알갱이
function SoilDrops() {
  const refs = useRef([])
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const k = (clock.elapsedTime * 0.7 + i * 0.2) % 1
      m.position.set(-0.21 - k * 0.07 + (i % 2) * 0.012, 0.03 - k * 0.38, 0.02 + (i % 3) * 0.015)
      m.scale.setScalar(1 - k * 0.5)
    })
  })
  return Array.from({ length: 5 }, (_, i) => (
    <mesh key={i} ref={(el) => { refs.current[i] = el }}><sphereGeometry args={[0.017 + (i % 3) * 0.005, 8, 8]} /><meshBasicMaterial color="#9b7653" /></mesh>
  ))
}

const Capsule = ({ r, len, color, tones, position, rotation }) => (
  <mesh position={position} rotation={rotation} castShadow>
    <capsuleGeometry args={[r, len, 8, 16]} /><meshToonMaterial color={color} gradientMap={tones} />
  </mesh>
)

export default function Halmang({ speaking = false, position = [0, 0, 0], scale = 1, shadow = true }) {
  const root = useRef(), head = useRef(), armR = useRef(), bun = useRef(), mouthOpen = useRef(), smile = useRef()
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
    const talk = speaking ? 0.35 + Math.abs(Math.sin(t * 11)) * 0.9 : 0
    if (mouthOpen.current) { mouthOpen.current.visible = speaking; mouthOpen.current.scale.set(1, talk, 1) }
    if (smile.current) smile.current.visible = !speaking
  })

  return (
    <group ref={root} position={position} scale={scale}>
      {shadow && <SoftShadow />}

      {/* 꽃신 */}
      {[-1, 1].map((k) => (
        <group key={k}>
          <Ball r={0.085} color="#ffffff" tones={tones} position={[k * 0.17, 0.07, 0.2]} scale={[1, 0.7, 1.35]} />
          <Ball r={0.062} color="#9b7653" tones={tones} position={[k * 0.18, 0.055, 0.27]} scale={[1, 0.7, 1.3]} />
        </group>
      ))}

      {/* 치마(작고 통통한 몸) */}
      <Outlined geometry={skirt} tones={tones} vertexColors outline={0.014} />

      {/* 저고리 + 고름(리본): 머리 아래로 살짝 보이는 가슴께 */}
      <Outlined geometry={sphere} color="#eaa7ba" tones={tones} position={[0, 0.66, 0.01]} scale={[0.29, 0.2, 0.23]} outline={0.06} />
      <group position={[0.01, 0.6, 0.22]}>
        <Ball r={0.032} color="#a79bd4" tones={tones} position={[0, 0, 0.01]} />
        <Ball r={0.055} color="#a79bd4" tones={tones} position={[-0.065, 0.012, 0]} scale={[1, 0.55, 0.5]} />
        <Ball r={0.055} color="#a79bd4" tones={tones} position={[0.065, 0.012, 0]} scale={[1, 0.55, 0.5]} />
        <Capsule r={0.02} len={0.15} color="#a79bd4" tones={tones} position={[-0.025, -0.1, 0]} rotation={[0, 0, 0.12]} />
        <Capsule r={0.02} len={0.13} color="#a79bd4" tones={tones} position={[0.03, -0.09, 0]} rotation={[0, 0, -0.1]} />
      </group>

      {/* 한라봉을 든 왼팔 (화면 왼쪽): 짧고 통통하게 */}
      <group position={[-0.27, 0.66, 0.06]} rotation={[0, 0, 0.7]}>
        <Capsule r={0.07} len={0.1} color="#eaa7ba" tones={tones} position={[0, -0.1, 0]} />
        <Ball r={0.085} color="#a79bd4" tones={tones} position={[0, -0.185, 0.02]} />
        <Ball r={0.062} color="#ffdcb8" tones={tones} position={[0, -0.2, 0.03]} />
      </group>
      <group position={[-0.45, 0.42, 0.2]} rotation={[0, 0, 0.32]}>
        <mesh scale={[1, 0.34, 0.78]} castShadow><sphereGeometry args={[0.23, 32, 20]} /><meshToonMaterial color="#dcc47d" gradientMap={tones} /></mesh>
        <mesh position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.78, 1]}><torusGeometry args={[0.215, 0.018, 10, 36]} /><meshToonMaterial color="#b99a4e" gradientMap={tones} /></mesh>
        <mesh position={[0, 0.06, 0]} scale={[1, 0.42, 0.78]}><sphereGeometry args={[0.185, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshToonMaterial color="#9b7653" gradientMap={tones} /></mesh>
        <SoilDrops />
      </group>

      {/* 손 흔드는 오른팔 (화면 오른쪽): 머리 옆으로 쏙 올라오는 짧은 팔 */}
      <group position={[0.28, 0.66, 0.06]}>
        <group ref={armR} rotation={[0, 0, -0.95]}>
          <Capsule r={0.07} len={0.2} color="#eaa7ba" tones={tones} position={[0, 0.17, 0]} />
          <Ball r={0.092} color="#a79bd4" tones={tones} position={[0, 0.325, 0]} />
          <Ball r={0.07} color="#ffdcb8" tones={tones} position={[0, 0.34, 0.01]} />
        </group>
      </group>

      {/* 머리: 키의 절반이 넘는 큰 머리 */}
      <group ref={head} position={[0, 1.2, 0]} scale={1.28}>
        <Outlined geometry={sphere} color="#ffdcb8" tones={tones} scale={[0.43, 0.39, 0.4]} outline={0.04}>
          {/* 은은한 눈웃음 + 눈썹 + 눈가 주름 */}
          {[-1, 1].map((k) => (
            <group key={k} position={[k * 0.15, -0.045, 0.388]}>
              <mesh><torusGeometry args={[0.04, 0.0095, 8, 20, Math.PI]} /><meshBasicMaterial color="#4a3a33" /></mesh>
              <mesh position={[0, 0.075, -0.004]} rotation={[0, 0, k * 0.16 + Math.PI / 2]}><capsuleGeometry args={[0.008, 0.06, 4, 8]} /><meshBasicMaterial color="#bdb8b0" /></mesh>
              <mesh position={[k * 0.062, -0.002, -0.006]} rotation={[0, 0, k * -0.35]}><capsuleGeometry args={[0.004, 0.026, 4, 6]} /><meshBasicMaterial color="#d4aa90" /></mesh>
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
            <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshToonMaterial color="#d3d3da" gradientMap={tones} side={THREE.DoubleSide} />
          </mesh>
          <mesh scale={[0.47, 0.435, 0.45]}><sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52]} /><meshBasicMaterial color={OUTLINE} side={THREE.BackSide} /></mesh>
        </group>
        <Ball r={0.085} color="#d3d3da" tones={tones} position={[-0.4, 0.06, -0.06]} />
        <Ball r={0.085} color="#d3d3da" tones={tones} position={[0.4, 0.06, -0.06]} />
        <group ref={bun} position={[0, 0.41, -0.22]}>
          <Ball r={0.15} color="#d3d3da" tones={tones} />
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.02]}><capsuleGeometry args={[0.012, 0.34, 6, 10]} /><meshStandardMaterial color="#6ec1d9" metalness={0.3} roughness={0.35} /></mesh>
          <Ball r={0.03} color="#6ec1d9" tones={tones} position={[0.2, 0, 0.02]} />
          <Ball r={0.03} color="#6ec1d9" tones={tones} position={[-0.2, 0, 0.02]} />
        </group>
      </group>
    </group>
  )
}
