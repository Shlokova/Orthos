import type { FurnitureItem } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'
import { NativePolyline } from '../../primitives/NativePolyline'

const UNIT_PLANE = new THREE.PlaneGeometry(1, 1)
const UNIT_CIRCLE = new THREE.CircleGeometry(0.5, 24)
const MATERIAL_CACHE = new Map<string, THREE.MeshBasicMaterial>()

export const OUTLINE = SCENE_THEME.palette.outline
export const DETAIL = SCENE_THEME.palette.detail

function getPlanMaterial(color: string, opacity = 1): THREE.MeshBasicMaterial {
  const key = `${color}:${opacity}`
  const cached = MATERIAL_CACHE.get(key)
  if (cached) return cached
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
  MATERIAL_CACHE.set(key, material)
  return material
}

export interface PlanSymbolProps {
  item: FurnitureItem
  color: string
  width: number
  depth: number
  insetW: number
  insetD: number
  detailOrder: number
  outlineOrder: number
}

interface RectProps {
  x?: number
  z?: number
  width: number
  depth: number
  color: string
  y?: number
  opacity?: number
  renderOrder: number
}

export function Rect({ x = 0, z = 0, width, depth, color, y = 0.02, opacity = 1, renderOrder }: RectProps) {
  return (
    <mesh
      geometry={UNIT_PLANE}
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      scale={[width, depth, 1]}
      renderOrder={renderOrder}
      dispose={null}
      material={getPlanMaterial(color, opacity)}
    />
  )
}

interface CircleProps {
  x?: number
  z?: number
  diameter: number
  color: string
  y?: number
  renderOrder: number
}

export function Circle({ x = 0, z = 0, diameter, color, y = 0.035, renderOrder }: CircleProps) {
  return (
    <mesh
      geometry={UNIT_CIRCLE}
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      scale={[diameter, diameter, 1]}
      renderOrder={renderOrder}
      dispose={null}
      material={getPlanMaterial(color)}
    />
  )
}

interface LineProps {
  points: [number, number, number][]
  color?: string
  y?: number
  renderOrder: number
}

export function Line({ points, color = DETAIL, y = 0.07, renderOrder }: LineProps) {
  return (
    <NativePolyline
      points={points.map(([x, , z]) => [x, y, z])}
      color={color}
      depthTest={false}
      renderOrder={renderOrder}
    />
  )
}

export function footprintOutline(width: number, depth: number): [number, number, number][] {
  return [
    [-width / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2],
    [width / 2, 0, depth / 2],
    [-width / 2, 0, depth / 2],
  ]
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    UNIT_PLANE.dispose()
    UNIT_CIRCLE.dispose()
    for (const material of MATERIAL_CACHE.values()) material.dispose()
    MATERIAL_CACHE.clear()
  })
}
