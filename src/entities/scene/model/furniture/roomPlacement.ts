import { distanceBetween } from '@shared/lib'
import { getRoomBounds, pointInPolygon, polygonCentroid } from '../room'
import type { FurnitureItem, RoomDefinition, Vec2 } from '../types'
import { isItemInsideRoom } from './collision'

const BINARY_SEARCH_STEPS = 18
const POSITION_SEARCH_STEP = 0.25
const MAX_RADIAL_RINGS = 48

function placeInRoom(item: FurnitureItem, room: RoomDefinition, position: Vec2): FurnitureItem {
  return { ...item, roomId: room.id, position: { ...position } }
}

export function itemFitsRoomAt(item: FurnitureItem, room: RoomDefinition, position: Vec2 = item.position): boolean {
  return isItemInsideRoom(placeInRoom(item, room, position), room)
}

export function findRoomContainingItem(
  item: Pick<FurnitureItem, 'position'>,
  rooms: readonly RoomDefinition[],
): RoomDefinition | null {
  return rooms.find((room) => pointInPolygon(item.position, room.vertices, false)) ?? null
}

function orderedCandidateRooms(item: FurnitureItem, rooms: readonly RoomDefinition[]): RoomDefinition[] {
  const preferred = rooms.find((room) => room.id === item.roomId)
  const result: RoomDefinition[] = []
  for (const room of [preferred, findRoomContainingItem(item, rooms), ...rooms]) {
    if (room && !result.some((candidate) => candidate.id === room.id)) result.push(room)
  }
  return result
}

function furthestValidPosition(item: FurnitureItem, room: RoomDefinition, from: Vec2, to: Vec2): Vec2 | null {
  if (!itemFitsRoomAt(item, room, from)) return null
  if (itemFitsRoomAt(item, room, to)) return { ...to }

  let low = 0
  let high = 1
  for (let step = 0; step < BINARY_SEARCH_STEPS; step += 1) {
    const ratio = (low + high) / 2
    const candidate = {
      x: from.x + (to.x - from.x) * ratio,
      z: from.z + (to.z - from.z) * ratio,
    }
    if (itemFitsRoomAt(item, room, candidate)) low = ratio
    else high = ratio
  }

  return {
    x: from.x + (to.x - from.x) * low,
    z: from.z + (to.z - from.z) * low,
  }
}

function nearestValidPosition(item: FurnitureItem, room: RoomDefinition, desired: Vec2): Vec2 | null {
  const directCandidates = [desired, polygonCentroid(room.vertices), getRoomBounds(room).center]
  let best: Vec2 | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  const consider = (candidate: Vec2) => {
    if (!itemFitsRoomAt(item, room, candidate)) return
    const distance = distanceBetween(candidate, desired)
    if (distance < bestDistance) {
      best = { ...candidate }
      bestDistance = distance
    }
  }

  directCandidates.forEach(consider)
  if (bestDistance <= POSITION_SEARCH_STEP) return best

  const bounds = getRoomBounds(room)
  const maxDistance = Math.hypot(bounds.width, bounds.depth)
  const ringLimit = Math.min(MAX_RADIAL_RINGS, Math.ceil(maxDistance / POSITION_SEARCH_STEP))
  for (let ring = 1; ring <= ringLimit; ring += 1) {
    const distance = ring * POSITION_SEARCH_STEP
    for (let step = -ring; step <= ring; step += 1) {
      const offset = step * POSITION_SEARCH_STEP
      consider({ x: desired.x + offset, z: desired.z - distance })
      consider({ x: desired.x + offset, z: desired.z + distance })
      if (Math.abs(step) === ring) continue
      consider({ x: desired.x - distance, z: desired.z + offset })
      consider({ x: desired.x + distance, z: desired.z + offset })
    }
    if (best && bestDistance <= distance + POSITION_SEARCH_STEP * 0.5) return best
  }

  return best
}

export function constrainItemToRooms(
  previous: FurnitureItem,
  desired: FurnitureItem,
  rooms: readonly RoomDefinition[],
): FurnitureItem {
  for (const room of orderedCandidateRooms(desired, rooms)) {
    if (itemFitsRoomAt(desired, room)) return placeInRoom(desired, room, desired.position)
  }

  const previousRoom = rooms.find((room) => room.id === previous.roomId)
  if (previousRoom) {
    const alongDrag = furthestValidPosition(desired, previousRoom, previous.position, desired.position)
    if (alongDrag) return placeInRoom(desired, previousRoom, alongDrag)

    const nearest = nearestValidPosition(desired, previousRoom, desired.position)
    if (nearest) return placeInRoom(desired, previousRoom, nearest)
  }

  for (const room of rooms) {
    const nearest = nearestValidPosition(desired, room, desired.position)
    if (nearest) return placeInRoom(desired, room, nearest)
  }
  return previous
}
