import { clamp, GEOMETRY_EPSILON, rotatePoint, snap } from '@shared/lib'
import { polygonSignedArea } from '../room/polygon'
import { getWallSegment, projectPointToClosestWall } from '../room/walls'
import type { FurnitureItem, RoomDefinition, Vec2 } from '../types'
import { isItemInsideRoom } from './collision'

export const WALL_ITEM_STICKY_BIAS = 0.035

export type WallMountScope = 'same-wall' | 'any-wall'

export interface WallMount {
  wallIndex: number
  position: Vec2
  rotation: number
  distance: number
}

export function wallInwardNormal(room: RoomDefinition, wallIndex: number): Vec2 {
  const wall = getWallSegment(room, wallIndex)
  const normal = rotatePoint({ x: 0, z: 1 }, wall.angle)
  return polygonSignedArea(room.vertices) < 0 ? { x: -normal.x, z: -normal.z } : normal
}

export function getItemWallIndex(item: Pick<FurnitureItem, 'position'>, room: RoomDefinition): number {
  return projectPointToClosestWall(room, item.position).wallIndex
}

function wallItemDistance(item: Pick<FurnitureItem, 'position'>, room: RoomDefinition, wallIndex: number): number {
  const wall = getWallSegment(room, wallIndex)
  const dx = wall.end.x - wall.start.x
  const dz = wall.end.z - wall.start.z
  const lengthSquared = dx * dx + dz * dz
  if (lengthSquared < GEOMETRY_EPSILON) return 0
  const ratio = ((item.position.x - wall.start.x) * dx + (item.position.z - wall.start.z) * dz) / lengthSquared
  return ratio * wall.length
}

function mountAt(item: FurnitureItem, room: RoomDefinition, wallIndex: number, distance: number): WallMount {
  const wall = getWallSegment(room, wallIndex)
  const ratio = distance / Math.max(wall.length, GEOMETRY_EPSILON)
  const normal = wallInwardNormal(room, wallIndex)
  const inset = item.size.depth / 2
  return {
    wallIndex,
    distance,
    rotation: wall.angle,
    position: {
      x: wall.start.x + (wall.end.x - wall.start.x) * ratio + normal.x * inset,
      z: wall.start.z + (wall.end.z - wall.start.z) * ratio + normal.z * inset,
    },
  }
}

function mountOnWall(
  item: FurnitureItem,
  room: RoomDefinition,
  wallIndex: number,
  desiredDistance: number,
): WallMount | null {
  const wall = getWallSegment(room, wallIndex)
  const halfWidth = item.size.width / 2
  const minDistance = halfWidth
  const maxDistance = wall.length - halfWidth
  if (maxDistance < minDistance) return null

  const distance = clamp(snap(desiredDistance), minDistance, maxDistance)
  const mount = mountAt(item, room, wallIndex, distance)
  const candidate: FurnitureItem = { ...item, position: mount.position, rotation: mount.rotation }
  return isItemInsideRoom(candidate, room) ? mount : null
}

export function mountItemOnWall(
  item: FurnitureItem,
  room: RoomDefinition,
  scope: WallMountScope = 'same-wall',
  preferredWallIndex?: number,
): WallMount | null {
  const wallCount = room.vertices.length
  if (wallCount === 0) return null

  const projection = projectPointToClosestWall(room, item.position, preferredWallIndex, WALL_ITEM_STICKY_BIAS)
  const wallOrder = [projection.wallIndex]
  if (preferredWallIndex !== undefined && preferredWallIndex !== projection.wallIndex) {
    wallOrder.push(preferredWallIndex)
  }
  if (scope === 'any-wall') {
    for (let step = 1; step < wallCount; step += 1) {
      const wallIndex = (projection.wallIndex + step) % wallCount
      if (!wallOrder.includes(wallIndex)) wallOrder.push(wallIndex)
    }
  }

  for (const wallIndex of wallOrder) {
    const desiredDistance =
      wallIndex === projection.wallIndex
        ? projection.offset * projection.wallLength
        : wallItemDistance(item, room, wallIndex)
    const mount = mountOnWall(item, room, wallIndex, desiredDistance)
    if (mount) return mount
  }
  return null
}
