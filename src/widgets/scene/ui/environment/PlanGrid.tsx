import type { Bounds2D } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { GEOMETRY_EPSILON } from '@shared/lib'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function createGridGeometry(bounds: Bounds2D, step: number, skipEvery?: number): THREE.BufferGeometry {
  const positions: number[] = []
  const firstX = Math.ceil(bounds.minX / step) * step
  const firstZ = Math.ceil(bounds.minZ / step) * step
  const shouldSkip = (value: number) =>
    skipEvery ? Math.abs(value / skipEvery - Math.round(value / skipEvery)) < 1e-6 : false

  for (let x = firstX; x <= bounds.maxX + GEOMETRY_EPSILON; x += step) {
    if (shouldSkip(x)) continue
    positions.push(x, 0.008, bounds.minZ, x, 0.008, bounds.maxZ)
  }
  for (let z = firstZ; z <= bounds.maxZ + GEOMETRY_EPSILON; z += step) {
    if (shouldSkip(z)) continue
    positions.push(bounds.minX, 0.008, z, bounds.maxX, 0.008, z)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

function GridLayer({
  bounds,
  step,
  skipEvery,
  color,
  opacity,
}: {
  bounds: Bounds2D
  step: number
  skipEvery?: number
  color: string
  opacity: number
}) {
  const geometry = useMemo(() => createGridGeometry(bounds, step, skipEvery), [bounds, skipEvery, step])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <lineSegments geometry={geometry} renderOrder={2}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  )
}

export function PlanGrid({ bounds }: { bounds: Bounds2D }) {
  return (
    <group>
      <GridLayer bounds={bounds} step={0.25} skipEvery={1} color={SCENE_THEME.palette.gridMinor} opacity={0.18} />
      <GridLayer bounds={bounds} step={1} color={SCENE_THEME.palette.gridMajor} opacity={0.3} />
    </group>
  )
}
