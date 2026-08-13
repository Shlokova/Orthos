import {
  clampOpeningToWall,
  FURNITURE_CATALOG,
  FURNITURE_LIMITS,
  type FurnitureItem,
  findOverlappingRoom,
  getRoomBounds,
  isHexColor,
  isItemInsideRoom,
  isItemVerticallyInsideRoom,
  isSimplePolygon,
  MAX_ROOMS,
  MAX_SCENE_ITEMS,
  MAX_SCENE_OPENINGS,
  openingsOverlap,
  ROOM_LIMITS,
  ROOM_NAME_MAX_LENGTH,
  type RoomDefinition,
  type SceneState,
  type WallOpening,
} from '@entities/scene'
import { GEOMETRY_EPSILON } from '@shared/lib'

const furnitureKinds: ReadonlySet<string> = new Set(FURNITURE_CATALOG.map((item) => item.kind))
const openingKinds: ReadonlySet<string> = new Set(['door', 'window'])

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0
}

function isVec2(value: unknown): value is { x: number; z: number } {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.z)
}

function isRoomDefinition(value: unknown): value is RoomDefinition {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || value.id.length === 0) return false
  if (typeof value.name !== 'string' || value.name.length === 0 || value.name.length > ROOM_NAME_MAX_LENGTH)
    return false
  if (!isFiniteNumber(value.height) || value.height < ROOM_LIMITS.height.min || value.height > ROOM_LIMITS.height.max)
    return false
  if (!Array.isArray(value.vertices) || value.vertices.length < 3 || !value.vertices.every(isVec2)) return false
  if (!isSimplePolygon(value.vertices)) return false

  const room: RoomDefinition = {
    id: value.id,
    name: value.name,
    height: value.height,
    vertices: value.vertices,
  }
  const bounds = getRoomBounds(room)
  return (
    bounds.width >= ROOM_LIMITS.width.min &&
    bounds.width <= ROOM_LIMITS.width.max &&
    bounds.depth >= ROOM_LIMITS.depth.min &&
    bounds.depth <= ROOM_LIMITS.depth.max
  )
}

function isFurnitureItem(value: unknown): value is FurnitureItem {
  if (!isRecord(value)) return false
  if (typeof value.id !== 'string' || value.id.length === 0) return false
  if (typeof value.roomId !== 'string' || value.roomId.length === 0) return false
  if (typeof value.name !== 'string' || value.name.length === 0 || value.name.length > FURNITURE_LIMITS.nameLength)
    return false
  if (typeof value.kind !== 'string' || !furnitureKinds.has(value.kind)) return false
  if (typeof value.color !== 'string' || !isHexColor(value.color)) return false
  if (!isFiniteNumber(value.rotation)) return false
  if (
    !isPositiveNumber(value.height) ||
    value.height < FURNITURE_LIMITS.height.min ||
    value.height > FURNITURE_LIMITS.height.max
  )
    return false
  if (!isVec2(value.position)) return false
  return (
    isRecord(value.size) &&
    isFiniteNumber(value.size.width) &&
    value.size.width >= FURNITURE_LIMITS.width.min &&
    value.size.width <= FURNITURE_LIMITS.width.max &&
    isFiniteNumber(value.size.depth) &&
    value.size.depth >= FURNITURE_LIMITS.depth.min &&
    value.size.depth <= FURNITURE_LIMITS.depth.max
  )
}

function isWallOpening(value: unknown): value is WallOpening {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.roomId === 'string' &&
    value.roomId.length > 0 &&
    typeof value.kind === 'string' &&
    openingKinds.has(value.kind) &&
    Number.isInteger(value.wallIndex) &&
    isFiniteNumber(value.offset) &&
    value.offset >= 0 &&
    value.offset <= 1 &&
    isPositiveNumber(value.width) &&
    isPositiveNumber(value.height) &&
    isFiniteNumber(value.sillHeight) &&
    value.sillHeight >= 0
  )
}

export function isSceneState(value: unknown): value is SceneState {
  if (!isRecord(value)) return false
  if (
    !Array.isArray(value.rooms) ||
    value.rooms.length === 0 ||
    value.rooms.length > MAX_ROOMS ||
    !value.rooms.every(isRoomDefinition)
  )
    return false
  if (!Array.isArray(value.items) || value.items.length > MAX_SCENE_ITEMS || !value.items.every(isFurnitureItem))
    return false
  if (
    !Array.isArray(value.openings) ||
    value.openings.length > MAX_SCENE_OPENINGS ||
    !value.openings.every(isWallOpening)
  )
    return false

  const rooms = value.rooms
  const items = value.items
  const openings = value.openings
  const roomsById = new Map(rooms.map((room) => [room.id, room]))

  if (
    !items.every((item) => {
      const room = roomsById.get(item.roomId)
      return room && isItemInsideRoom(item, room) && isItemVerticallyInsideRoom(item, room)
    })
  )
    return false

  if (
    !openings.every((opening) => {
      const room = roomsById.get(opening.roomId)
      if (!room || opening.wallIndex < 0 || opening.wallIndex >= room.vertices.length) return false
      const clamped = clampOpeningToWall(opening, room)
      return (
        Math.abs(clamped.offset - opening.offset) < GEOMETRY_EPSILON &&
        Math.abs(clamped.width - opening.width) < GEOMETRY_EPSILON &&
        Math.abs(clamped.height - opening.height) < GEOMETRY_EPSILON &&
        Math.abs(clamped.sillHeight - opening.sillHeight) < GEOMETRY_EPSILON
      )
    })
  )
    return false

  if (rooms.some((room, index) => findOverlappingRoom(room, rooms.slice(index + 1)))) return false

  if (!hasUniqueIds({ rooms, items, openings })) return false

  return rooms.every((room) => {
    const roomOpenings = openings.filter((opening) => opening.roomId === room.id)
    return roomOpenings.every((first, firstIndex) =>
      roomOpenings.slice(firstIndex + 1).every((second) => !openingsOverlap(first, second, room)),
    )
  })
}

function hasUniqueIds(scene: SceneState): boolean {
  const ids = new Set<string>()
  for (const entity of [...scene.rooms, ...scene.items, ...scene.openings]) {
    if (ids.has(entity.id)) return false
    ids.add(entity.id)
  }
  return true
}

export function assertUniqueIds(scene: SceneState): void {
  if (!hasUniqueIds(scene)) throw new Error('Invalid scene: duplicate entity id')
}
