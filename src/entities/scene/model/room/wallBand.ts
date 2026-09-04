import { GEOMETRY_EPSILON } from '@shared/lib'
import type { RoomDefinition, Vec2, WallOpening } from '../types'
import { polygonSignedArea } from './polygon'
import { getSolidWallSpans, WALL_SPAN_EPSILON } from './wallPieces'
import { getWallSegments } from './walls'

const MITER_LIMIT = 4

export interface WallBandQuad {
  readonly wallIndex: number
  readonly outerStart: Vec2
  readonly outerEnd: Vec2
  readonly innerEnd: Vec2
  readonly innerStart: Vec2
}

interface Corner {
  fromPrevious: Vec2
  fromCurrent: Vec2
  miter: Vec2 | null
}

function offsetCorner(vertex: Vec2, previous: Vec2, current: Vec2, distance: number): Corner {
  const fromPrevious = { x: vertex.x + previous.x * distance, z: vertex.z + previous.z * distance }
  const fromCurrent = { x: vertex.x + current.x * distance, z: vertex.z + current.z * distance }
  const bisectorX = previous.x + current.x
  const bisectorZ = previous.z + current.z
  const bisectorLength = Math.hypot(bisectorX, bisectorZ)
  if (bisectorLength < GEOMETRY_EPSILON) return { fromPrevious, fromCurrent, miter: null }

  const projection = (bisectorX * previous.x + bisectorZ * previous.z) / bisectorLength
  if (projection < 1 / MITER_LIMIT) return { fromPrevious, fromCurrent, miter: null }

  const scale = distance / (projection * bisectorLength)
  return {
    fromPrevious,
    fromCurrent,
    miter: { x: vertex.x + bisectorX * scale, z: vertex.z + bisectorZ * scale },
  }
}

export function buildWallBandQuads(
  room: RoomDefinition,
  openings: readonly WallOpening[],
  thickness: number,
): WallBandQuad[] {
  const walls = getWallSegments(room)
  const count = walls.length
  if (count < 3 || thickness <= 0) return []

  const inwardSign = polygonSignedArea(room.vertices) < 0 ? -1 : 1
  const half = thickness / 2
  const normals = walls.map((wall) => ({
    x: -Math.sin(wall.angle) * inwardSign,
    z: Math.cos(wall.angle) * inwardSign,
  }))

  const corner = (vertexIndex: number, distance: number): Corner => {
    const previous = normals[(vertexIndex + count - 1) % count] ?? { x: 0, z: inwardSign }
    const current = normals[vertexIndex % count] ?? previous
    const vertex = walls[vertexIndex % count]?.start ?? { x: 0, z: 0 }
    return offsetCorner(vertex, previous, current, distance)
  }

  const quads: WallBandQuad[] = []
  for (const wall of walls) {
    const normal = normals[wall.index] ?? { x: 0, z: inwardSign }
    const direction = { x: Math.cos(wall.angle), z: Math.sin(wall.angle) }
    const start = corner(wall.index, -half)
    const end = corner(wall.index + 1, -half)
    const innerStartCorner = corner(wall.index, half)
    const innerEndCorner = corner(wall.index + 1, half)
    const alongWall = (distance: number, side: number): Vec2 => ({
      x: wall.start.x + direction.x * distance + normal.x * side,
      z: wall.start.z + direction.z * distance + normal.z * side,
    })

    const wallOpenings = openings.filter((opening) => opening.wallIndex === wall.index)
    for (const span of getSolidWallSpans(wall.length, wallOpenings)) {
      const atStart = span.start <= WALL_SPAN_EPSILON
      const atEnd = span.end >= wall.length - WALL_SPAN_EPSILON
      quads.push({
        wallIndex: wall.index,
        outerStart: atStart ? (start.miter ?? start.fromCurrent) : alongWall(span.start, -half),
        outerEnd: atEnd ? (end.miter ?? end.fromPrevious) : alongWall(span.end, -half),
        innerEnd: atEnd ? (innerEndCorner.miter ?? innerEndCorner.fromPrevious) : alongWall(span.end, half),
        innerStart: atStart ? (innerStartCorner.miter ?? innerStartCorner.fromCurrent) : alongWall(span.start, half),
      })
    }
  }

  return quads
}
