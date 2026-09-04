import type { FurnitureItem } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import type { FurnitureColors } from '@widgets/scene/lib/furniture/FurnitureMaterials'
import { useEffect, useMemo } from 'react'
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
    transparent: true,
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
  colors: FurnitureColors
  width: number
  depth: number
  insetW: number
  insetD: number
  fillOrder: number
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

interface EllipseProps {
  x?: number
  z?: number
  width: number
  depth: number
  color: string
  y?: number
  opacity?: number
  renderOrder: number
}

export function Ellipse({ x = 0, z = 0, width, depth, color, y = 0.04, opacity = 1, renderOrder }: EllipseProps) {
  return (
    <mesh
      geometry={UNIT_CIRCLE}
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      scale={[width, depth, 1]}
      renderOrder={renderOrder}
      dispose={null}
      material={getPlanMaterial(color, opacity)}
    />
  )
}

interface RoundedRectProps extends RectProps {
  radius: number
}

function roundedRectShape(width: number, depth: number, radius: number): THREE.Shape {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  const corner = Math.max(0.001, Math.min(radius, halfWidth * 0.95, halfDepth * 0.95))
  const shape = new THREE.Shape()
  shape.moveTo(-halfWidth + corner, -halfDepth)
  shape.lineTo(halfWidth - corner, -halfDepth)
  shape.quadraticCurveTo(halfWidth, -halfDepth, halfWidth, -halfDepth + corner)
  shape.lineTo(halfWidth, halfDepth - corner)
  shape.quadraticCurveTo(halfWidth, halfDepth, halfWidth - corner, halfDepth)
  shape.lineTo(-halfWidth + corner, halfDepth)
  shape.quadraticCurveTo(-halfWidth, halfDepth, -halfWidth, halfDepth - corner)
  shape.lineTo(-halfWidth, -halfDepth + corner)
  shape.quadraticCurveTo(-halfWidth, -halfDepth, -halfWidth + corner, -halfDepth)
  return shape
}

export function RoundedRect({
  x = 0,
  z = 0,
  width,
  depth,
  radius,
  color,
  y = 0.02,
  opacity = 1,
  renderOrder,
}: RoundedRectProps) {
  const geometry = useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(width, depth, radius), 6),
    [width, depth, radius],
  )
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh
      geometry={geometry}
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      renderOrder={renderOrder}
      material={getPlanMaterial(color, opacity)}
    />
  )
}

interface PolygonProps {
  points: readonly (readonly [number, number])[]
  color: string
  x?: number
  z?: number
  y?: number
  opacity?: number
  renderOrder: number
}

export function Polygon({ points, color, x = 0, z = 0, y = 0.04, opacity = 1, renderOrder }: PolygonProps) {
  const signature = points.map(([px, pz]) => `${px},${pz}`).join(';')
  // biome-ignore lint/correctness/useExhaustiveDependencies: the signature is the key for `points`
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    points.forEach(([px, pz], index) => {
      if (index === 0) shape.moveTo(px, pz)
      else shape.lineTo(px, pz)
    })
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [signature])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <mesh
      geometry={geometry}
      position={[x, y, z]}
      rotation-x={-Math.PI / 2}
      renderOrder={renderOrder}
      material={getPlanMaterial(color, opacity)}
    />
  )
}

export function arcPoints(
  radius: number,
  from: number,
  to: number,
  center: readonly [number, number] = [0, 0],
  segments = 14,
): [number, number, number][] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = from + ((to - from) * index) / segments
    return [center[0] + Math.cos(angle) * radius, 0, center[1] + Math.sin(angle) * radius]
  })
}

interface HatchProps {
  width: number
  depth: number
  spacing: number
  color?: string
  y?: number
  opacity?: number
  renderOrder: number
}

function createHatchGeometry(width: number, depth: number, spacing: number): THREE.BufferGeometry {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  const positions: number[] = []
  const span = width + depth

  for (let offset = -span / 2; offset <= span / 2; offset += spacing) {
    let startX = offset - halfDepth
    let startZ = -halfDepth
    let endX = offset + halfDepth
    let endZ = halfDepth
    if (startX < -halfWidth) {
      startZ += -halfWidth - startX
      startX = -halfWidth
    }
    if (endX > halfWidth) {
      endZ -= endX - halfWidth
      endX = halfWidth
    }
    if (startZ >= endZ) continue
    positions.push(startX, 0, startZ, endX, 0, endZ)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

export function Hatch({ width, depth, spacing, color = DETAIL, y = 0.045, opacity = 0.5, renderOrder }: HatchProps) {
  const geometry = useMemo(() => createHatchGeometry(width, depth, spacing), [width, depth, spacing])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <lineSegments geometry={geometry} position={[0, y, 0]} renderOrder={renderOrder}>
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
