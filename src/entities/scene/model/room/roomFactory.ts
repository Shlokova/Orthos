import { clamp, distanceBetween } from '@shared/lib'
import type { RoomDefinition, Vec2 } from '../types'
import { DEFAULT_ROOM_HEIGHT, MAX_ROOM_VERTICES, MIN_DRAWN_EDGE, ROOM_LIMITS, ROOM_NAME_MAX_LENGTH } from './limits'
import { isRoomShapeWithinLimits, isSimplePolygon, polygonSignedArea } from './polygon'

export function createRectangularRoom(
  width = 8,
  depth = 6,
  height = DEFAULT_ROOM_HEIGHT,
  center: Vec2 = { x: 0, z: 0 },
  name = 'Living room',
  id: string = crypto.randomUUID(),
): RoomDefinition {
  const safeWidth = clamp(width, ROOM_LIMITS.width.min, ROOM_LIMITS.width.max)
  const safeDepth = clamp(depth, ROOM_LIMITS.depth.min, ROOM_LIMITS.depth.max)
  return {
    id,
    name,
    height: clamp(height, ROOM_LIMITS.height.min, ROOM_LIMITS.height.max),
    vertices: [
      { x: center.x - safeWidth / 2, z: center.z - safeDepth / 2 },
      { x: center.x + safeWidth / 2, z: center.z - safeDepth / 2 },
      { x: center.x + safeWidth / 2, z: center.z + safeDepth / 2 },
      { x: center.x - safeWidth / 2, z: center.z + safeDepth / 2 },
    ],
  }
}

export function createLShapedRoom(
  width = 7,
  depth = 6,
  height = DEFAULT_ROOM_HEIGHT,
  center: Vec2 = { x: 0, z: 0 },
  name = 'L-shaped room',
  id: string = crypto.randomUUID(),
): RoomDefinition {
  const safeWidth = clamp(width, ROOM_LIMITS.width.min, ROOM_LIMITS.width.max)
  const safeDepth = clamp(depth, ROOM_LIMITS.depth.min, ROOM_LIMITS.depth.max)
  const cutWidth = Math.max(1.5, safeWidth * 0.42)
  const cutDepth = Math.max(1.5, safeDepth * 0.42)
  const left = center.x - safeWidth / 2
  const right = center.x + safeWidth / 2
  const top = center.z - safeDepth / 2
  const bottom = center.z + safeDepth / 2
  return {
    id,
    name,
    height: clamp(height, ROOM_LIMITS.height.min, ROOM_LIMITS.height.max),
    vertices: [
      { x: left, z: top },
      { x: right, z: top },
      { x: right, z: bottom - cutDepth },
      { x: left + cutWidth, z: bottom - cutDepth },
      { x: left + cutWidth, z: bottom },
      { x: left, z: bottom },
    ],
  }
}

export function cloneRoom(room: RoomDefinition): RoomDefinition {
  return { ...room, vertices: room.vertices.map((vertex) => ({ ...vertex })) }
}

export function normalizeRoom(room: RoomDefinition): RoomDefinition {
  const vertices = room.vertices
    .slice(0, MAX_ROOM_VERTICES)
    .filter((vertex) => Number.isFinite(vertex.x) && Number.isFinite(vertex.z))
    .map((vertex) => ({ x: vertex.x, z: vertex.z }))
  return {
    ...room,
    name: room.name.trim().slice(0, ROOM_NAME_MAX_LENGTH) || 'Room',
    height: clamp(room.height, ROOM_LIMITS.height.min, ROOM_LIMITS.height.max),
    vertices: vertices.length >= 3 ? vertices : createRectangularRoom().vertices,
  }
}

export function createRoomFromVertices(
  sourceVertices: readonly Vec2[],
  height = DEFAULT_ROOM_HEIGHT,
  name = 'Drawn room',
  id: string = crypto.randomUUID(),
): RoomDefinition | null {
  const vertices: Vec2[] = []
  for (const point of sourceVertices.slice(0, MAX_ROOM_VERTICES)) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.z)) continue
    const previous = vertices.at(-1)
    if (previous && distanceBetween(point, previous) < MIN_DRAWN_EDGE) continue
    vertices.push({ x: point.x, z: point.z })
  }

  if (vertices.length > 2) {
    const first = vertices[0]
    const last = vertices.at(-1)
    if (first && last && distanceBetween(first, last) < MIN_DRAWN_EDGE) vertices.pop()
  }

  if (!isSimplePolygon(vertices) || !isRoomShapeWithinLimits(vertices)) return null
  const normalizedVertices = polygonSignedArea(vertices) < 0 ? [...vertices].reverse() : vertices
  return {
    id,
    name: name.trim() || 'Drawn room',
    height: clamp(height, ROOM_LIMITS.height.min, ROOM_LIMITS.height.max),
    vertices: normalizedVertices,
  }
}
