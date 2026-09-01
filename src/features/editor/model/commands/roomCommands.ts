import {
  addRoomVertex,
  clampOpeningToWall,
  constrainItemToRooms,
  createLShapedRoom,
  createRectangularRoom,
  createRoomFromVertices,
  DEFAULT_ROOM_HEIGHT,
  type FurnitureItem,
  findOverlappingRoom,
  getCatalogItem,
  getItemAnchorStrategy,
  getPlanBounds,
  getRoomBounds,
  getWallSegment,
  itemFitsRoomAt,
  MAX_ROOM_VERTICES,
  MAX_ROOMS,
  MIN_ROOM_EDGE,
  normalizeRoom,
  type RoomDefinition,
  type RoomResizeHandle,
  reflowRoomOpenings,
  reindexOpeningsAfterVertexInsert,
  reindexOpeningsAfterVertexRemoval,
  removeRoomVertex,
  resizeRoomBounds,
  resizeRoomFromHandle as resizeRoomFromHandleGeometry,
  type SceneState,
  settleSurfaceItems,
  translateRoom,
  updateRoomVertex,
  type Vec2,
  type WallOpening,
} from '@entities/scene'
import { GEOMETRY_EPSILON } from '@shared/lib'
import { NEW_ROOM_DEFAULTS } from '../../config/editorConfig'
import type { RoomShape } from '../editorTypes'

export type RoomPatch = Partial<Pick<RoomDefinition, 'name' | 'height' | 'vertices'>>

export interface RoomCommandResult {
  scene: SceneState
  notice?: string
}

function overlapNotice(blocking: RoomDefinition): string {
  return `${blocking.name} is in the way. Rooms may share a wall, but cannot overlap.`
}

const shapeNotice = `A room must stay a simple, non-crossing shape with walls of at least ${MIN_ROOM_EDGE} m.`

function findRoom(scene: SceneState, roomId: string): RoomDefinition | null {
  return scene.rooms.find((room) => room.id === roomId) ?? null
}

function replaceRoom(scene: SceneState, room: RoomDefinition): RoomCommandResult {
  const blocking = findOverlappingRoom(room, scene.rooms)
  if (blocking) return { scene, notice: overlapNotice(blocking) }

  const rooms = scene.rooms.map((entry) => (entry.id === room.id ? room : entry))
  const roomOpenings = scene.openings.filter((opening) => opening.roomId === room.id)
  const reflowedOpenings = reflowRoomOpenings(roomOpenings, room)
  if (!reflowedOpenings) {
    return { scene, notice: 'The doors and windows no longer fit these walls. Move or remove one and try again.' }
  }

  const openings = [...scene.openings.filter((opening) => opening.roomId !== room.id), ...reflowedOpenings]
  const items: FurnitureItem[] = []
  for (const item of scene.items) {
    if (item.roomId !== room.id) {
      items.push(item)
      continue
    }
    if (getCatalogItem(item.kind).anchor === 'wall') {
      const siblings = [...items, ...scene.items.slice(items.length + 1)]
      const mounted = getItemAnchorStrategy(item.kind).place(item, {
        room,
        siblings,
        reach: 'anywhere',
      })
      items.push(mounted ?? item)
      continue
    }
    items.push(constrainItemToRooms(item, item, rooms))
  }

  const trapped = items.find((item) => {
    const assignedRoom = rooms.find((candidate) => candidate.id === item.roomId)
    return !assignedRoom || !itemFitsRoomAt(item, assignedRoom)
  })
  if (trapped) return { scene, notice: `${trapped.name} would not fit in the room any more.` }

  return { scene: settleSurfaceItems({ ...scene, rooms, items, openings }) }
}

export function patchRoom(scene: SceneState, roomId: string, patch: RoomPatch): RoomCommandResult {
  const room = findRoom(scene, roomId)
  return room ? replaceRoom(scene, normalizeRoom({ ...room, ...patch })) : { scene }
}

export function resizeRoom(scene: SceneState, roomId: string, width: number, depth: number): RoomCommandResult {
  const room = findRoom(scene, roomId)
  if (!room) return { scene }
  const resized = resizeRoomBounds(room, width, depth)
  if (resized === room) return { scene, notice: shapeNotice }
  return replaceRoom(scene, resized)
}

export function resizeRoomFromHandle(
  scene: SceneState,
  roomId: string,
  handle: RoomResizeHandle,
  point: Vec2,
): RoomCommandResult {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.z)) return { scene }
  const room = findRoom(scene, roomId)
  if (!room) return { scene }
  const nextRoom = resizeRoomFromHandleGeometry(room, handle, point)
  if (nextRoom === room) return { scene }
  return replaceRoom(scene, nextRoom)
}

export function moveRoom(scene: SceneState, roomId: string, center: Vec2): RoomCommandResult {
  if (!Number.isFinite(center.x) || !Number.isFinite(center.z)) return { scene }
  const active = findRoom(scene, roomId)
  if (!active) return { scene }
  const bounds = getRoomBounds(active)
  const offset = { x: center.x - bounds.center.x, z: center.z - bounds.center.z }
  if (Math.abs(offset.x) < GEOMETRY_EPSILON && Math.abs(offset.z) < GEOMETRY_EPSILON) return { scene }
  const room = translateRoom(active, offset)
  const blocking = findOverlappingRoom(room, scene.rooms)
  if (blocking) return { scene, notice: overlapNotice(blocking) }
  return {
    scene: {
      ...scene,
      rooms: scene.rooms.map((entry) => (entry.id === active.id ? room : entry)),
      items: scene.items.map((item) =>
        item.roomId === active.id
          ? { ...item, position: { x: item.position.x + offset.x, z: item.position.z + offset.z } }
          : item,
      ),
    },
  }
}

export function replaceRoomShape(scene: SceneState, roomId: string, shape: RoomShape): RoomCommandResult {
  const active = findRoom(scene, roomId)
  if (!active) return { scene }
  const bounds = getRoomBounds(active)
  const room =
    shape === 'rectangle'
      ? createRectangularRoom(bounds.width, bounds.depth, active.height, bounds.center, active.name, active.id)
      : createLShapedRoom(bounds.width, bounds.depth, active.height, bounds.center, active.name, active.id)
  const openings =
    room.vertices.length === active.vertices.length
      ? scene.openings
          .filter((opening) => opening.roomId === active.id)
          .map((opening) => clampOpeningToWall(opening, room))
      : []
  return replaceRoom(
    {
      ...scene,
      openings: [...scene.openings.filter((opening) => opening.roomId !== active.id), ...openings],
    },
    room,
  )
}

export function addDrawnRoom(scene: SceneState, vertices: readonly Vec2[], id: string): RoomCommandResult {
  if (scene.rooms.length >= MAX_ROOMS) {
    return { scene, notice: `A plan can hold at most ${MAX_ROOMS} rooms.` }
  }
  const room = createRoomFromVertices(vertices, DEFAULT_ROOM_HEIGHT, NEW_ROOM_DEFAULTS.name(scene.rooms.length), id)
  if (!room) {
    return { scene, notice: 'The room must be a simple, non-crossing shape at least 1 × 1 m.' }
  }
  const overlapping = findOverlappingRoom(room, scene.rooms)
  if (overlapping) {
    return { scene, notice: `The outline overlaps ${overlapping.name}. Rooms may share a wall, but cannot intersect.` }
  }
  return { scene: { ...scene, rooms: [...scene.rooms, room] } }
}

export function addRoom(scene: SceneState, shape: RoomShape, id: string): RoomCommandResult {
  if (scene.rooms.length >= MAX_ROOMS) return { scene, notice: `A plan can hold at most ${MAX_ROOMS} rooms.` }
  const planBounds = getPlanBounds(scene.rooms)
  const center = { x: planBounds.maxX + 3.5, z: planBounds.center.z }
  const room =
    shape === 'rectangle'
      ? createRectangularRoom(
          NEW_ROOM_DEFAULTS.rectangle.width,
          NEW_ROOM_DEFAULTS.rectangle.depth,
          DEFAULT_ROOM_HEIGHT,
          center,
          NEW_ROOM_DEFAULTS.name(scene.rooms.length),
          id,
        )
      : createLShapedRoom(
          NEW_ROOM_DEFAULTS.lShape.width,
          NEW_ROOM_DEFAULTS.lShape.depth,
          DEFAULT_ROOM_HEIGHT,
          center,
          NEW_ROOM_DEFAULTS.name(scene.rooms.length),
          id,
        )
  return { scene: { ...scene, rooms: [...scene.rooms, room] } }
}

export function removeRoom(scene: SceneState, id: string): RoomCommandResult {
  if (!scene.rooms.some((room) => room.id === id)) return { scene }
  if (scene.rooms.length <= 1) return { scene, notice: 'A plan needs at least one room.' }
  return {
    scene: {
      rooms: scene.rooms.filter((room) => room.id !== id),
      items: scene.items.filter((item) => item.roomId !== id),
      openings: scene.openings.filter((opening) => opening.roomId !== id),
    },
  }
}

export function patchRoomVertex(scene: SceneState, roomId: string, index: number, vertex: Vec2): RoomCommandResult {
  const active = findRoom(scene, roomId)
  if (!active) return { scene }
  const room = updateRoomVertex(active, index, vertex)
  if (room === active) return { scene }
  return replaceRoom(scene, room)
}

function withRoomOpenings(scene: SceneState, roomId: string, openings: readonly WallOpening[]): SceneState {
  return { ...scene, openings: [...scene.openings.filter((opening) => opening.roomId !== roomId), ...openings] }
}

export function insertRoomVertex(scene: SceneState, roomId: string, wallIndex: number): RoomCommandResult {
  const active = findRoom(scene, roomId)
  if (!active) return { scene }
  const room = addRoomVertex(active, wallIndex)
  if (room === active) {
    return {
      scene,
      notice:
        active.vertices.length >= MAX_ROOM_VERTICES
          ? `A room can have at most ${MAX_ROOM_VERTICES} corners.`
          : shapeNotice,
    }
  }
  const roomOpenings = scene.openings.filter((opening) => opening.roomId === active.id)
  const wall = getWallSegment(active, wallIndex)
  return replaceRoom(
    withRoomOpenings(scene, active.id, reindexOpeningsAfterVertexInsert(roomOpenings, wall.index)),
    room,
  )
}

export function deleteRoomVertex(scene: SceneState, roomId: string, index: number): RoomCommandResult {
  const active = findRoom(scene, roomId)
  if (!active) return { scene }
  const room = removeRoomVertex(active, index)
  if (room === active) {
    return { scene, notice: active.vertices.length <= 3 ? 'A room needs at least three corners.' : shapeNotice }
  }
  const roomOpenings = scene.openings.filter((opening) => opening.roomId === active.id)
  return replaceRoom(
    withRoomOpenings(scene, active.id, reindexOpeningsAfterVertexRemoval(roomOpenings, active, index)),
    room,
  )
}
