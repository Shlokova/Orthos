import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'

const ARROW_GEOMETRY = new THREE.ConeGeometry(0.5, 1, 10)
const SHAFT_GEOMETRY = new THREE.CylinderGeometry(0.5, 0.5, 1, 8)
const GRAB_GEOMETRY = new THREE.BoxGeometry(1, 1, 1)

const HANDLE_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.olivePlan,
  depthTest: false,
  toneMapped: false,
})

const GRAB_MATERIAL = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
  depthTest: false,
})

const ARROW_RADIUS = 0.05
const ARROW_LENGTH = 0.09
const SHAFT_RADIUS = 0.012
const REACH = 0.16
const GRAB_WIDTH = 0.22

interface Props {
  width: number
  centerY: number
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}

export function HeightHandle({ width, centerY, onPointerDown }: Props) {
  const x = width / 2 + REACH
  const shaftLength = REACH * 2

  return (
    <group position={[x, centerY, 0]} onPointerDown={onPointerDown}>
      <mesh
        geometry={SHAFT_GEOMETRY}
        material={HANDLE_MATERIAL}
        scale={[SHAFT_RADIUS * 2, shaftLength, SHAFT_RADIUS * 2]}
        renderOrder={40}
        dispose={null}
      />
      {[1, -1].map((sign) => (
        <mesh
          key={sign}
          geometry={ARROW_GEOMETRY}
          material={HANDLE_MATERIAL}
          position={[0, (sign * (shaftLength + ARROW_LENGTH)) / 2, 0]}
          rotation={[sign > 0 ? 0 : Math.PI, 0, 0]}
          scale={[ARROW_RADIUS * 2, ARROW_LENGTH, ARROW_RADIUS * 2]}
          renderOrder={40}
          dispose={null}
        />
      ))}
      <mesh
        geometry={GRAB_GEOMETRY}
        material={GRAB_MATERIAL}
        scale={[GRAB_WIDTH, shaftLength + ARROW_LENGTH * 2 + 0.06, GRAB_WIDTH]}
        renderOrder={41}
        dispose={null}
      />
    </group>
  )
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    ARROW_GEOMETRY.dispose()
    SHAFT_GEOMETRY.dispose()
    GRAB_GEOMETRY.dispose()
    HANDLE_MATERIAL.dispose()
    GRAB_MATERIAL.dispose()
  })
}
