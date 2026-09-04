import { clamp, distanceBetween, GEOMETRY_EPSILON, rotatePoint } from '@shared/lib'
import type { RoomDefinition, Vec2, WallOpening } from '../types'
import { polygonCentroid, polygonSignedArea } from './polygon'

export interface WallSegment {
  index: number
  start: Vec2
  end: Vec2
  length: number
  center: Vec2
  angle: number
}

interface WallProjection {
  wallIndex: number
  offset: number
  point: Vec2
  distance: number
  wallLength: number
}

export function getWallSegments(room: RoomDefinition): WallSegment[] {
  return room.vertices.map((start, index) => {
    const end = room.vertices[(index + 1) % room.vertices.length] ?? start
    return {
      index,
      start,
      end,
      length: distanceBetween(start, end),
      center: { x: (start.x + end.x) / 2, z: (start.z + end.z) / 2 },
      angle: Math.atan2(end.z - start.z, end.x - start.x),
    }
  })
}

export function getWallSegment(room: RoomDefinition, wallIndex: number): WallSegment {
  const walls = getWallSegments(room)
  const first = walls[0]
  if (!first) throw new Error('A room must contain at least one wall')
  return walls[clamp(Math.round(wallIndex), 0, walls.length - 1)] ?? first
}

export function wallInwardNormal(room: RoomDefinition, wallIndex: number): Vec2 {
  const wall = getWallSegment(room, wallIndex)
  const normal = rotatePoint({ x: 0, z: 1 }, wall.angle)
  return polygonSignedArea(room.vertices) < 0 ? { x: -normal.x, z: -normal.z } : normal
}

export function openingWorldPosition(
  opening: WallOpening,
  room: RoomDefinition,
): { position: Vec2; angle: number; wallLength: number } {
  const wall = getWallSegment(room, opening.wallIndex)
  const offset = clamp(opening.offset, 0, 1)
  return {
    position: {
      x: wall.start.x + (wall.end.x - wall.start.x) * offset,
      z: wall.start.z + (wall.end.z - wall.start.z) * offset,
    },
    angle: wall.angle,
    wallLength: wall.length,
  }
}

export const OPENING_LIMITS = {
  minWidth: 0.45,
  minHeight: 0.4,
  minSillHeight: 0.2,
  wallMargin: 0.3,
  headClearance: 0.1,
} as const

export interface OpeningLimits {
  width: { min: number; max: number }
  height: { min: number; max: number }
  sillHeight: { min: number; max: number }
}

export function getOpeningLimits(opening: WallOpening, room: RoomDefinition): OpeningLimits {
  const wall = getWallSegment(room, opening.wallIndex)
  const headroom = room.height - OPENING_LIMITS.headClearance
  const isDoor = opening.kind === 'door'
  const minSillHeight = isDoor ? 0 : OPENING_LIMITS.minSillHeight
  const maxSillHeight = isDoor ? 0 : Math.max(minSillHeight, headroom - OPENING_LIMITS.minHeight)
  const sillHeight = clamp(opening.sillHeight, minSillHeight, maxSillHeight)

  return {
    width: {
      min: OPENING_LIMITS.minWidth,
      max: Math.max(OPENING_LIMITS.minWidth, wall.length - OPENING_LIMITS.wallMargin),
    },
    height: { min: OPENING_LIMITS.minHeight, max: Math.max(OPENING_LIMITS.minHeight, headroom - sillHeight) },
    sillHeight: { min: minSillHeight, max: maxSillHeight },
  }
}

export function clampOpeningToWall(opening: WallOpening, room: RoomDefinition): WallOpening {
  const wall = getWallSegment(room, opening.wallIndex)
  const limits = getOpeningLimits(opening, room)
  const width = clamp(opening.width, limits.width.min, limits.width.max)
  const margin = Math.min(0.49, width / 2 / Math.max(wall.length, GEOMETRY_EPSILON) + 0.03)
  const sillHeight = clamp(opening.sillHeight, limits.sillHeight.min, limits.sillHeight.max)
  const height = clamp(opening.height, limits.height.min, limits.height.max)

  return {
    ...opening,
    wallIndex: wall.index,
    offset: clamp(opening.offset, margin, 1 - margin),
    width,
    height,
    sillHeight,
  }
}

export function projectPointToClosestWall(
  room: RoomDefinition,
  point: Vec2,
  preferredWallIndex?: number,
  stickyBias = 0.12,
): WallProjection {
  const walls = getWallSegments(room)
  let best: WallProjection | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (const wall of walls) {
    const dx = wall.end.x - wall.start.x
    const dz = wall.end.z - wall.start.z
    const lengthSquared = dx * dx + dz * dz
    const offset =
      lengthSquared < GEOMETRY_EPSILON
        ? 0.5
        : clamp(((point.x - wall.start.x) * dx + (point.z - wall.start.z) * dz) / lengthSquared, 0, 1)
    const projected = {
      x: wall.start.x + dx * offset,
      z: wall.start.z + dz * offset,
    }
    const distance = distanceBetween(point, projected)
    const score = distance - (wall.index === preferredWallIndex ? stickyBias : 0)
    if (score < bestScore) {
      bestScore = score
      best = { wallIndex: wall.index, offset, point: projected, distance, wallLength: wall.length }
    }
  }

  return (
    best ?? {
      wallIndex: 0,
      offset: 0.5,
      point: polygonCentroid(room.vertices),
      distance: Number.POSITIVE_INFINITY,
      wallLength: 0,
    }
  )
}
