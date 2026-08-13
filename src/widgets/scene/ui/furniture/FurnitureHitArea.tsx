import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

const HIT_PLANE = new THREE.PlaneGeometry(1, 1)
const HIT_BOX = new THREE.BoxGeometry(1, 1, 1)

const HIT_MATERIAL = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
  depthTest: false,
  side: THREE.DoubleSide,
})

const PLAN_HIT_HEIGHT = 0.08

interface PlanHitAreaProps {
  width: number
  depth: number
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}

export function PlanHitArea({ width, depth, onPointerDown }: PlanHitAreaProps) {
  return (
    <mesh
      geometry={HIT_PLANE}
      material={HIT_MATERIAL}
      position={[0, PLAN_HIT_HEIGHT, 0]}
      rotation-x={-Math.PI / 2}
      scale={[width, depth, 1]}
      renderOrder={-1}
      dispose={null}
      onPointerDown={onPointerDown}
    />
  )
}

interface VolumeHitAreaProps {
  width: number
  depth: number
  height: number
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}

export function VolumeHitArea({ width, depth, height, onPointerDown }: VolumeHitAreaProps) {
  return (
    <mesh
      geometry={HIT_BOX}
      material={HIT_MATERIAL}
      position={[0, height / 2, 0]}
      scale={[width, height, depth]}
      renderOrder={-1}
      dispose={null}
      onPointerDown={onPointerDown}
    />
  )
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    HIT_PLANE.dispose()
    HIT_BOX.dispose()
    HIT_MATERIAL.dispose()
  })
}
