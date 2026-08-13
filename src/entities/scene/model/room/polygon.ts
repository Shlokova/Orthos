import { distanceBetween, GEOMETRY_EPSILON } from '@shared/lib'
import type { Bounds2D, RoomDefinition, Vec2 } from '../types'
import { MAX_ROOM_VERTICES, MIN_ROOM_AREA, MIN_ROOM_EDGE, ROOM_LIMITS } from './limits'

function polygonVertex(vertices: readonly Vec2[], index: number): Vec2 {
  const length = vertices.length
  if (length === 0) return { x: 0, z: 0 }
  return vertices[((index % length) + length) % length] ?? { x: 0, z: 0 }
}

export function polygonSignedArea(vertices: readonly Vec2[]): number {
  let area = 0
  for (let index = 0; index < vertices.length; index += 1) {
    const current = polygonVertex(vertices, index)
    const next = polygonVertex(vertices, index + 1)
    area += current.x * next.z - next.x * current.z
  }
  return area / 2
}

export function roomArea(room: RoomDefinition): number {
  return Math.abs(polygonSignedArea(room.vertices))
}

export function getBounds(vertices: readonly Vec2[]): Bounds2D {
  if (vertices.length === 0) {
    return { minX: -1, maxX: 1, minZ: -1, maxZ: 1, width: 2, depth: 2, center: { x: 0, z: 0 } }
  }

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY
  for (const vertex of vertices) {
    minX = Math.min(minX, vertex.x)
    maxX = Math.max(maxX, vertex.x)
    minZ = Math.min(minZ, vertex.z)
    maxZ = Math.max(maxZ, vertex.z)
  }

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: Math.max(GEOMETRY_EPSILON, maxX - minX),
    depth: Math.max(GEOMETRY_EPSILON, maxZ - minZ),
    center: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
  }
}

export function polygonCentroid(vertices: readonly Vec2[]): Vec2 {
  const signedArea = polygonSignedArea(vertices)
  if (Math.abs(signedArea) < GEOMETRY_EPSILON) return getBounds(vertices).center

  let x = 0
  let z = 0
  for (let index = 0; index < vertices.length; index += 1) {
    const current = polygonVertex(vertices, index)
    const next = polygonVertex(vertices, index + 1)
    const cross = current.x * next.z - next.x * current.z
    x += (current.x + next.x) * cross
    z += (current.z + next.z) * cross
  }

  const divisor = 6 * signedArea
  return { x: x / divisor, z: z / divisor }
}

export function getRoomBounds(room: RoomDefinition): Bounds2D {
  return getBounds(room.vertices)
}

export function getPlanBounds(rooms: readonly RoomDefinition[]): Bounds2D {
  return getBounds(rooms.flatMap((room) => room.vertices))
}

const ON_SEGMENT_TOLERANCE = 1e-6

function pointOnSegment(point: Vec2, start: Vec2, end: Vec2): boolean {
  const dx = end.x - start.x
  const dz = end.z - start.z
  const lengthSquared = dx * dx + dz * dz
  if (lengthSquared <= GEOMETRY_EPSILON) return distanceBetween(point, start) <= ON_SEGMENT_TOLERANCE

  const cross = (point.z - start.z) * dx - (point.x - start.x) * dz
  if (Math.abs(cross) > ON_SEGMENT_TOLERANCE * Math.sqrt(lengthSquared)) return false

  const dot = (point.x - start.x) * dx + (point.z - start.z) * dz
  if (dot < -GEOMETRY_EPSILON) return false
  return dot <= lengthSquared + GEOMETRY_EPSILON
}

export function pointInPolygon(point: Vec2, vertices: readonly Vec2[], includeBoundary = true): boolean {
  if (vertices.length < 3) return false

  let inside = false
  for (let index = 0; index < vertices.length; index += 1) {
    const current = polygonVertex(vertices, index)
    const previous = polygonVertex(vertices, index - 1)
    if (pointOnSegment(point, previous, current)) return includeBoundary

    const crossesHorizontalRay = current.z > point.z !== previous.z > point.z
    if (!crossesHorizontalRay) continue

    const crossingX = ((previous.x - current.x) * (point.z - current.z)) / (previous.z - current.z) + current.x
    if (point.x < crossingX) inside = !inside
  }
  return inside
}

function orientation(first: Vec2, second: Vec2, third: Vec2): number {
  return (second.x - first.x) * (third.z - first.z) - (second.z - first.z) * (third.x - first.x)
}

export function segmentsIntersect(firstStart: Vec2, firstEnd: Vec2, secondStart: Vec2, secondEnd: Vec2): boolean {
  const o1 = orientation(firstStart, firstEnd, secondStart)
  const o2 = orientation(firstStart, firstEnd, secondEnd)
  const o3 = orientation(secondStart, secondEnd, firstStart)
  const o4 = orientation(secondStart, secondEnd, firstEnd)
  const properIntersection =
    ((o1 > GEOMETRY_EPSILON && o2 < -GEOMETRY_EPSILON) || (o1 < -GEOMETRY_EPSILON && o2 > GEOMETRY_EPSILON)) &&
    ((o3 > GEOMETRY_EPSILON && o4 < -GEOMETRY_EPSILON) || (o3 < -GEOMETRY_EPSILON && o4 > GEOMETRY_EPSILON))
  if (properIntersection) return true
  if (Math.abs(o1) <= GEOMETRY_EPSILON && pointOnSegment(secondStart, firstStart, firstEnd)) return true
  if (Math.abs(o2) <= GEOMETRY_EPSILON && pointOnSegment(secondEnd, firstStart, firstEnd)) return true
  if (Math.abs(o3) <= GEOMETRY_EPSILON && pointOnSegment(firstStart, secondStart, secondEnd)) return true
  return Math.abs(o4) <= GEOMETRY_EPSILON && pointOnSegment(firstEnd, secondStart, secondEnd)
}

function segmentsProperlyIntersect(firstStart: Vec2, firstEnd: Vec2, secondStart: Vec2, secondEnd: Vec2): boolean {
  const o1 = orientation(firstStart, firstEnd, secondStart)
  const o2 = orientation(firstStart, firstEnd, secondEnd)
  const o3 = orientation(secondStart, secondEnd, firstStart)
  const o4 = orientation(secondStart, secondEnd, firstEnd)
  return (
    ((o1 > GEOMETRY_EPSILON && o2 < -GEOMETRY_EPSILON) || (o1 < -GEOMETRY_EPSILON && o2 > GEOMETRY_EPSILON)) &&
    ((o3 > GEOMETRY_EPSILON && o4 < -GEOMETRY_EPSILON) || (o3 < -GEOMETRY_EPSILON && o4 > GEOMETRY_EPSILON))
  )
}

export function polygonEdges(vertices: readonly Vec2[]): Array<readonly [Vec2, Vec2]> {
  return vertices.map((vertex, index) => [vertex, polygonVertex(vertices, index + 1)] as const)
}

export function polygonBoundaryProperlyIntersects(
  firstVertices: readonly Vec2[],
  secondVertices: readonly Vec2[],
): boolean {
  const firstEdges = polygonEdges(firstVertices)
  const secondEdges = polygonEdges(secondVertices)
  return firstEdges.some(([firstStart, firstEnd]) =>
    secondEdges.some(([secondStart, secondEnd]) =>
      segmentsProperlyIntersect(firstStart, firstEnd, secondStart, secondEnd),
    ),
  )
}

export function isRoomShapeWithinLimits(vertices: readonly Vec2[]): boolean {
  const bounds = getBounds(vertices)
  return (
    bounds.width >= ROOM_LIMITS.width.min - GEOMETRY_EPSILON &&
    bounds.width <= ROOM_LIMITS.width.max + GEOMETRY_EPSILON &&
    bounds.depth >= ROOM_LIMITS.depth.min - GEOMETRY_EPSILON &&
    bounds.depth <= ROOM_LIMITS.depth.max + GEOMETRY_EPSILON
  )
}

export function isSimplePolygon(vertices: readonly Vec2[]): boolean {
  if (vertices.length < 3 || vertices.length > MAX_ROOM_VERTICES) return false
  if (!vertices.every((vertex) => Number.isFinite(vertex.x) && Number.isFinite(vertex.z))) return false
  if (Math.abs(polygonSignedArea(vertices)) < MIN_ROOM_AREA) return false

  for (let index = 0; index < vertices.length; index += 1) {
    const first = polygonVertex(vertices, index)
    const second = polygonVertex(vertices, index + 1)
    if (distanceBetween(first, second) < MIN_ROOM_EDGE) return false

    for (let other = index + 1; other < vertices.length; other += 1) {
      if (other === (index + 1) % vertices.length || (other + 1) % vertices.length === index) continue
      const third = polygonVertex(vertices, other)
      const fourth = polygonVertex(vertices, other + 1)
      if (segmentsIntersect(first, second, third, fourth)) return false
    }
  }
  return true
}

export function findInteriorPointNear(room: RoomDefinition, desired: Vec2, step = 0.25): Vec2 {
  if (pointInPolygon(desired, room.vertices)) return desired
  const bounds = getRoomBounds(room)
  let best = polygonCentroid(room.vertices)
  let bestDistance = Number.POSITIVE_INFINITY

  for (let z = bounds.minZ + step / 2; z < bounds.maxZ; z += step) {
    for (let x = bounds.minX + step / 2; x < bounds.maxX; x += step) {
      const candidate = { x, z }
      if (!pointInPolygon(candidate, room.vertices)) continue
      const distance = distanceBetween({ x, z }, desired)
      if (distance < bestDistance) {
        bestDistance = distance
        best = candidate
      }
    }
  }
  return best
}
