import { GEOMETRY_EPSILON, rotatePoint } from '@shared/lib'
import { pointInPolygon, polygonBoundaryProperlyIntersects } from '../room'
import type { FurnitureItem, RoomDefinition, Vec2 } from '../types'
import { getCatalogItem } from './catalog'

interface CollisionVolume {
  minY: number
  maxY: number
  position: Vec2
  rotation: number
  size: { width: number; depth: number }
}

const FURNITURE_CONTACT_SLACK = 0.02

export function getRectangleCorners(item: Pick<FurnitureItem, 'size' | 'position' | 'rotation'>, padding = 0): Vec2[] {
  const halfWidth = Math.max(0, item.size.width / 2 + padding)
  const halfDepth = Math.max(0, item.size.depth / 2 + padding)
  const localCorners: Vec2[] = [
    { x: -halfWidth, z: -halfDepth },
    { x: halfWidth, z: -halfDepth },
    { x: halfWidth, z: halfDepth },
    { x: -halfWidth, z: halfDepth },
  ]

  return localCorners.map((corner) => {
    const rotated = rotatePoint(corner, item.rotation)
    return { x: rotated.x + item.position.x, z: rotated.z + item.position.z }
  })
}

function project(points: readonly Vec2[], axis: Vec2): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const point of points) {
    const value = point.x * axis.x + point.z * axis.z
    min = Math.min(min, value)
    max = Math.max(max, value)
  }
  return { min, max }
}

function rectangleAxes(rotation: number): readonly [Vec2, Vec2] {
  const widthAxis = rotatePoint({ x: 1, z: 0 }, rotation)
  const depthAxis = rotatePoint({ x: 0, z: 1 }, rotation)
  return [widthAxis, depthAxis]
}

export function orientedRectanglesIntersect(
  first: Pick<FurnitureItem, 'size' | 'position' | 'rotation'>,
  second: Pick<FurnitureItem, 'size' | 'position' | 'rotation'>,
  padding = 0,
  slack = 0,
): boolean {
  const firstCorners = getRectangleCorners(first, padding)
  const secondCorners = getRectangleCorners(second, padding)
  const axes = [...rectangleAxes(first.rotation), ...rectangleAxes(second.rotation)]
  const threshold = Math.max(GEOMETRY_EPSILON, slack)

  return axes.every((axis) => {
    const firstProjection = project(firstCorners, axis)
    const secondProjection = project(secondCorners, axis)
    return (
      firstProjection.max > secondProjection.min + threshold && secondProjection.max > firstProjection.min + threshold
    )
  })
}

export function isItemInsideRoom(item: FurnitureItem, room: RoomDefinition): boolean {
  if (item.roomId !== room.id) return false
  const corners = getRectangleCorners(item)
  return (
    corners.every((corner) => pointInPolygon(corner, room.vertices, true)) &&
    !polygonBoundaryProperlyIntersects(corners, room.vertices)
  )
}

export function isItemVerticallyInsideRoom(item: FurnitureItem, room: RoomDefinition): boolean {
  return item.elevation + item.height <= room.height + GEOMETRY_EPSILON
}

function getCollisionVolumes(item: FurnitureItem): CollisionVolume[] {
  const definition = getCatalogItem(item.kind)
  if (definition.collisionParts?.length === 0) return []
  const parts = definition.collisionParts ?? [{ minY: 0, maxY: 1 }]
  return parts.map((part) => {
    const localOffset = {
      x: (part.offset?.x ?? 0) * item.size.width,
      z: (part.offset?.z ?? 0) * item.size.depth,
    }
    const offset = rotatePoint(localOffset, item.rotation)
    return {
      minY: item.elevation + item.height * part.minY,
      maxY: item.elevation + item.height * part.maxY,
      position: { x: item.position.x + offset.x, z: item.position.z + offset.z },
      rotation: item.rotation,
      size: {
        width: item.size.width * (part.widthScale ?? 1),
        depth: item.size.depth * (part.depthScale ?? 1),
      },
    }
  })
}

function getFootprintRadius(item: Pick<FurnitureItem, 'size'>): number {
  return Math.hypot(item.size.width, item.size.depth) / 2
}

function footprintsCanReach(first: FurnitureItem, second: FurnitureItem): boolean {
  const dx = first.position.x - second.position.x
  const dz = first.position.z - second.position.z
  const reach = getFootprintRadius(first) + getFootprintRadius(second)
  return dx * dx + dz * dz <= reach * reach
}

export function furnitureItemsIntersect3D(first: FurnitureItem, second: FurnitureItem): boolean {
  if (first.roomId !== second.roomId) return false
  if (!footprintsCanReach(first, second)) return false
  const firstVolumes = getCollisionVolumes(first)
  const secondVolumes = getCollisionVolumes(second)

  return firstVolumes.some((firstVolume) =>
    secondVolumes.some((secondVolume) => {
      const verticalOverlap =
        firstVolume.maxY > secondVolume.minY + GEOMETRY_EPSILON &&
        secondVolume.maxY > firstVolume.minY + GEOMETRY_EPSILON
      return verticalOverlap && orientedRectanglesIntersect(firstVolume, secondVolume, 0, FURNITURE_CONTACT_SLACK)
    }),
  )
}

export function itemBlocksClearance(item: FurnitureItem): boolean {
  if (item.elevation > GEOMETRY_EPSILON) return false
  return getCatalogItem(item.kind).walkable !== true && item.height > 0.08
}

export function itemTopSurface(item: FurnitureItem): number {
  return item.elevation + item.height
}

export function pointInsideItemFootprint(point: Vec2, item: FurnitureItem): boolean {
  return pointInPolygon(point, getRectangleCorners(item), true)
}
