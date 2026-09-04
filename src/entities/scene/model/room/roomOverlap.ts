import type { RoomDefinition, Vec2 } from '../types'
import { getBounds, pointInPolygon, polygonBoundaryProperlyIntersects, polygonCentroid, polygonEdges } from './polygon'

function boundsOverlap(first: readonly Vec2[], second: readonly Vec2[]): boolean {
  const a = getBounds(first)
  const b = getBounds(second)
  return a.minX < b.maxX && b.minX < a.maxX && a.minZ < b.maxZ && b.minZ < a.maxZ
}

function edgeMidpoints(vertices: readonly Vec2[]): Vec2[] {
  return polygonEdges(vertices).map(([start, end]) => ({
    x: (start.x + end.x) / 2,
    z: (start.z + end.z) / 2,
  }))
}

function hasPointInside(probes: readonly Vec2[], polygon: readonly Vec2[]): boolean {
  return probes.some((point) => pointInPolygon(point, polygon, false))
}

function interiorSample(vertices: readonly Vec2[]): Vec2 | null {
  const centroid = polygonCentroid(vertices)
  return pointInPolygon(centroid, vertices, false) ? centroid : null
}

function polygonsOverlap(first: readonly Vec2[], second: readonly Vec2[]): boolean {
  if (first.length < 3 || second.length < 3) return false
  if (!boundsOverlap(first, second)) return false
  if (polygonBoundaryProperlyIntersects(first, second)) return true

  if (hasPointInside(first, second) || hasPointInside(second, first)) return true
  if (hasPointInside(edgeMidpoints(first), second)) return true
  if (hasPointInside(edgeMidpoints(second), first)) return true

  const firstInterior = interiorSample(first)
  if (firstInterior && pointInPolygon(firstInterior, second, false)) return true
  const secondInterior = interiorSample(second)
  return Boolean(secondInterior && pointInPolygon(secondInterior, first, false))
}

function roomsOverlap(first: RoomDefinition, second: RoomDefinition): boolean {
  return polygonsOverlap(first.vertices, second.vertices)
}

export function findOverlappingRoom(room: RoomDefinition, rooms: readonly RoomDefinition[]): RoomDefinition | null {
  return rooms.find((candidate) => candidate.id !== room.id && roomsOverlap(room, candidate)) ?? null
}

export function findRoomOverlappingPolygon(
  vertices: readonly Vec2[],
  rooms: readonly RoomDefinition[],
): RoomDefinition | null {
  return rooms.find((candidate) => polygonsOverlap(vertices, candidate.vertices)) ?? null
}
