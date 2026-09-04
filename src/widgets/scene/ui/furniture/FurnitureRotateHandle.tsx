import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'

const HANDLE_GEOMETRY = new THREE.SphereGeometry(0.5, 16, 12)
const GRAB_GEOMETRY = new THREE.SphereGeometry(0.5, 8, 6)

const HANDLE_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.olivePlan,
  transparent: true,
  depthTest: false,
  toneMapped: false,
})

const GRAB_MATERIAL = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
  depthTest: false,
})

const HANDLE_SIZE = 0.15
const GRAB_SIZE = 0.34
const CORNER_MARGIN = 0.2

interface Props {
  width: number
  depth: number
  height: number
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}

export function FurnitureRotateHandle({ width, depth, height, onPointerDown }: Props) {
  const x = width / 2 + CORNER_MARGIN
  const z = -(depth / 2 + CORNER_MARGIN)

  return (
    <group position={[x, height, z]} onPointerDown={onPointerDown}>
      <mesh
        geometry={HANDLE_GEOMETRY}
        material={HANDLE_MATERIAL}
        scale={HANDLE_SIZE}
        renderOrder={PLAN_ORDER.handles}
        dispose={null}
      />
      <mesh
        geometry={GRAB_GEOMETRY}
        material={GRAB_MATERIAL}
        scale={GRAB_SIZE}
        renderOrder={PLAN_ORDER.handles + 1}
        dispose={null}
      />
    </group>
  )
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    HANDLE_GEOMETRY.dispose()
    GRAB_GEOMETRY.dispose()
    HANDLE_MATERIAL.dispose()
    GRAB_MATERIAL.dispose()
  })
}
