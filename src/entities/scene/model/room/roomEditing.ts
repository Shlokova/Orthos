import { clamp } from '@shared/lib'
import type { RoomDefinition, Vec2 } from '../types'
import { DEGENERATE_EXTENT, MAX_ROOM_VERTICES, ROOM_LIMITS } from './limits'
import { getRoomBounds, isRoomShapeWithinLimits, isSimplePolygon } from './polygon'
import { getWallSegment } from './walls'

export type RoomResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

export const ROOM_RESIZE_HANDLES: readonly RoomResizeHandle[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']

export function updateRoomVertex(room: RoomDefinition, index: number, vertex: Vec2): RoomDefinition {
  const vertices = room.vertices.map((current, currentIndex) =>
    currentIndex === index ? { ...vertex } : { ...current },
  )
  return isSimplePolygon(vertices) && isRoomShapeWithinLimits(vertices) ? { ...room, vertices } : room
}

export function addRoomVertex(room: RoomDefinition, wallIndex: number): RoomDefinition {
  if (room.vertices.length >= MAX_ROOM_VERTICES) return room
  const { start, end, index } = getWallSegment(room, wallIndex)
  const vertices = [...room.vertices]
  vertices.splice(index + 1, 0, { x: (start.x + end.x) / 2, z: (start.z + end.z) / 2 })
  return isSimplePolygon(vertices) && isRoomShapeWithinLimits(vertices) ? { ...room, vertices } : room
}

export function removeRoomVertex(room: RoomDefinition, index: number): RoomDefinition {
  if (room.vertices.length <= 3) return room
  const vertices = room.vertices.filter((_, currentIndex) => currentIndex !== index)
  return isSimplePolygon(vertices) && isRoomShapeWithinLimits(vertices) ? { ...room, vertices } : room
}

export function resizeRoomBounds(room: RoomDefinition, width: number, depth: number): RoomDefinition {
  const bounds = getRoomBounds(room)
  if (bounds.width <= DEGENERATE_EXTENT || bounds.depth <= DEGENERATE_EXTENT) return room

  const targetWidth = clamp(width, ROOM_LIMITS.width.min, ROOM_LIMITS.width.max)
  const targetDepth = clamp(depth, ROOM_LIMITS.depth.min, ROOM_LIMITS.depth.max)
  const scaleX = targetWidth / bounds.width
  const scaleZ = targetDepth / bounds.depth
  const vertices = room.vertices.map((vertex) => ({
    x: bounds.center.x + (vertex.x - bounds.center.x) * scaleX,
    z: bounds.center.z + (vertex.z - bounds.center.z) * scaleZ,
  }))
  return isSimplePolygon(vertices) && isRoomShapeWithinLimits(vertices) ? { ...room, vertices } : room
}

export function translateRoom(room: RoomDefinition, offset: Vec2): RoomDefinition {
  return {
    ...room,
    vertices: room.vertices.map((vertex) => ({ x: vertex.x + offset.x, z: vertex.z + offset.z })),
  }
}

export function resizeRoomFromHandle(room: RoomDefinition, handle: RoomResizeHandle, point: Vec2): RoomDefinition {
  const bounds = getRoomBounds(room)
  let minX = bounds.minX
  let maxX = bounds.maxX
  let minZ = bounds.minZ
  let maxZ = bounds.maxZ

  if (handle.includes('w')) minX = Math.min(point.x, maxX - ROOM_LIMITS.width.min)
  if (handle.includes('e')) maxX = Math.max(point.x, minX + ROOM_LIMITS.width.min)
  if (handle.includes('n')) minZ = Math.min(point.z, maxZ - ROOM_LIMITS.depth.min)
  if (handle.includes('s')) maxZ = Math.max(point.z, minZ + ROOM_LIMITS.depth.min)

  if (maxX - minX > ROOM_LIMITS.width.max) {
    if (handle.includes('w')) minX = maxX - ROOM_LIMITS.width.max
    else maxX = minX + ROOM_LIMITS.width.max
  }
  if (maxZ - minZ > ROOM_LIMITS.depth.max) {
    if (handle.includes('n')) minZ = maxZ - ROOM_LIMITS.depth.max
    else maxZ = minZ + ROOM_LIMITS.depth.max
  }

  const nextWidth = maxX - minX
  const nextDepth = maxZ - minZ
  const vertices = room.vertices.map((vertex) => {
    const u = (vertex.x - bounds.minX) / bounds.width
    const v = (vertex.z - bounds.minZ) / bounds.depth
    return { x: minX + u * nextWidth, z: minZ + v * nextDepth }
  })

  return isSimplePolygon(vertices) && isRoomShapeWithinLimits(vertices) ? { ...room, vertices } : room
}

export function getRoomResizeHandlePositions(room: RoomDefinition): Record<RoomResizeHandle, Vec2> {
  const bounds = getRoomBounds(room)
  return {
    n: { x: bounds.center.x, z: bounds.minZ },
    ne: { x: bounds.maxX, z: bounds.minZ },
    e: { x: bounds.maxX, z: bounds.center.z },
    se: { x: bounds.maxX, z: bounds.maxZ },
    s: { x: bounds.center.x, z: bounds.maxZ },
    sw: { x: bounds.minX, z: bounds.maxZ },
    w: { x: bounds.minX, z: bounds.center.z },
    nw: { x: bounds.minX, z: bounds.minZ },
  }
}
