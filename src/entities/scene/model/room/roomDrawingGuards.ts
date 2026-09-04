import { distanceBetween, GEOMETRY_EPSILON } from '@shared/lib'
import type { RoomDefinition, Vec2 } from '../types'
import { pointInPolygon, polygonEdges } from './polygon'
import { projectPointToClosestWall } from './walls'

const DRAWING_MAGNET_DISTANCE = 0.3

const SEGMENT_SAMPLES = 24

export type DrawingMagnetKind = 'vertex' | 'wall'

export interface DrawingMagnet {
  point: Vec2
  kind: DrawingMagnetKind
  roomId: string
}

export function findRoomMagnet(
  rooms: readonly RoomDefinition[],
  point: Vec2,
  tolerance = DRAWING_MAGNET_DISTANCE,
): DrawingMagnet | null {
  let best: (DrawingMagnet & { distance: number }) | null = null

  for (const room of rooms) {
    for (const vertex of room.vertices) {
      const distance = distanceBetween(point, vertex)
      if (distance <= tolerance && (!best || distance < best.distance)) {
        best = { point: vertex, kind: 'vertex', roomId: room.id, distance }
      }
    }
  }
  if (best) return { point: best.point, kind: best.kind, roomId: best.roomId }

  for (const room of rooms) {
    const projection = projectPointToClosestWall(room, point)
    if (projection.distance <= tolerance && (!best || projection.distance < best.distance)) {
      best = { point: projection.point, kind: 'wall', roomId: room.id, distance: projection.distance }
    }
  }

  return best ? { point: best.point, kind: best.kind, roomId: best.roomId } : null
}

export function findRoomContainingPoint(rooms: readonly RoomDefinition[], point: Vec2): RoomDefinition | null {
  return rooms.find((room) => pointInPolygon(point, room.vertices, false)) ?? null
}

function turn(origin: Vec2, from: Vec2, to: Vec2): number {
  return (from.x - origin.x) * (to.z - origin.z) - (from.z - origin.z) * (to.x - origin.x)
}

function straddles(start: Vec2, end: Vec2, first: Vec2, second: Vec2): boolean {
  const left = turn(start, end, first)
  const right = turn(start, end, second)
  return (
    (left > GEOMETRY_EPSILON && right < -GEOMETRY_EPSILON) || (left < -GEOMETRY_EPSILON && right > GEOMETRY_EPSILON)
  )
}

function segmentsProperlyCross(start: Vec2, end: Vec2, edgeStart: Vec2, edgeEnd: Vec2): boolean {
  return straddles(start, end, edgeStart, edgeEnd) && straddles(edgeStart, edgeEnd, start, end)
}

export function findRoomCrossedBySegment(
  rooms: readonly RoomDefinition[],
  start: Vec2,
  end: Vec2,
): RoomDefinition | null {
  for (const room of rooms) {
    for (const [edgeStart, edgeEnd] of polygonEdges(room.vertices)) {
      if (segmentsProperlyCross(start, end, edgeStart, edgeEnd)) return room
    }
    for (let step = 1; step < SEGMENT_SAMPLES; step += 1) {
      const ratio = step / SEGMENT_SAMPLES
      const sample = { x: start.x + (end.x - start.x) * ratio, z: start.z + (end.z - start.z) * ratio }
      if (pointInPolygon(sample, room.vertices, false)) return room
    }
  }
  return null
}
