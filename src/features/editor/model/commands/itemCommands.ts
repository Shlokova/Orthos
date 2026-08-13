import {
  FURNITURE_LIMITS,
  type FurnitureFactory,
  type FurnitureItem,
  type FurnitureKind,
  furnitureItemsIntersect3D,
  getRoomBounds,
  isHexColor,
  itemFitsRoomAt,
  MAX_SCENE_ITEMS,
  normalizeAngle,
  type RoomDefinition,
  type SceneState,
} from '@entities/scene'
import { clamp, snap } from '@shared/lib'

interface ItemCommandResult {
  scene: SceneState
  selectedItemId?: string
  notice?: string
}

const PLACEMENT_STEP = 0.4
const MAX_PLACEMENT_RINGS = 14

function roomForItem(scene: SceneState, item: FurnitureItem): RoomDefinition | null {
  return scene.rooms.find((room) => room.id === item.roomId) ?? null
}

function hasFurnitureCollision(item: FurnitureItem, items: readonly FurnitureItem[], ignoredId?: string): boolean {
  return items.some((candidate) => candidate.id !== ignoredId && furnitureItemsIntersect3D(item, candidate))
}

function isAvailablePlacement(
  item: FurnitureItem,
  room: RoomDefinition,
  items: readonly FurnitureItem[],
  ignoredId?: string,
): boolean {
  return itemFitsRoomAt(item, room) && !hasFurnitureCollision(item, items, ignoredId)
}

function radialOffsets(): { x: number; z: number }[] {
  const offsets = [{ x: 0, z: 0 }]
  for (let ring = 1; ring <= MAX_PLACEMENT_RINGS; ring += 1) {
    const distance = ring * PLACEMENT_STEP
    offsets.push(
      { x: distance, z: 0 },
      { x: -distance, z: 0 },
      { x: 0, z: distance },
      { x: 0, z: -distance },
      { x: distance, z: distance },
      { x: distance, z: -distance },
      { x: -distance, z: distance },
      { x: -distance, z: -distance },
    )
  }
  return offsets
}

const PLACEMENT_OFFSETS = radialOffsets()

function findAvailablePlacement(
  item: FurnitureItem,
  room: RoomDefinition,
  items: readonly FurnitureItem[],
  ignoredId?: string,
): FurnitureItem | null {
  for (const offset of PLACEMENT_OFFSETS) {
    const candidate: FurnitureItem = {
      ...item,
      position: {
        x: snap(item.position.x + offset.x),
        z: snap(item.position.z + offset.z),
      },
    }
    if (isAvailablePlacement(candidate, room, items, ignoredId)) return candidate
  }

  const bounds = getRoomBounds(room)
  const step = Math.max(0.4, Math.min(item.size.width, item.size.depth) * 0.45)
  const halfWidth = item.size.width / 2
  const halfDepth = item.size.depth / 2
  for (let z = bounds.minZ + halfDepth; z <= bounds.maxZ - halfDepth; z += step) {
    for (let x = bounds.minX + halfWidth; x <= bounds.maxX - halfWidth; x += step) {
      const candidate: FurnitureItem = {
        ...item,
        position: { x: snap(x), z: snap(z) },
      }
      if (isAvailablePlacement(candidate, room, items, ignoredId)) return candidate
    }
  }
  return null
}

export function addItem(
  scene: SceneState,
  roomId: string,
  kind: FurnitureKind,
  factory: FurnitureFactory,
): ItemCommandResult {
  if (scene.items.length >= MAX_SCENE_ITEMS) return { scene, notice: 'The scene item limit has been reached.' }
  const room = scene.rooms.find((entry) => entry.id === roomId)
  if (!room) return { scene, notice: 'The selected room is no longer available.' }

  const created = factory.create(kind, room, scene.items.filter((entry) => entry.roomId === room.id).length)
  const item = findAvailablePlacement(created, room, scene.items)
  if (!item) return { scene, notice: `There is not enough free floor space for ${created.name}.` }

  return {
    scene: { ...scene, items: [...scene.items, item] },
    selectedItemId: item.id,
  }
}

export function patchItem(scene: SceneState, id: string, patch: Partial<FurnitureItem>): SceneState {
  const index = scene.items.findIndex((item) => item.id === id)
  if (index < 0) return scene

  const item = scene.items[index]
  if (!item) return scene
  const requestedSize = patch.size ?? item.size
  const requestedPosition = patch.position ?? item.position
  const desired: FurnitureItem = {
    ...item,
    ...patch,
    id: item.id,
    kind: item.kind,
    name: (patch.name ?? item.name).trim().slice(0, FURNITURE_LIMITS.nameLength) || item.name,
    color: isHexColor(patch.color ?? item.color) ? (patch.color ?? item.color) : item.color,
    position:
      Number.isFinite(requestedPosition.x) && Number.isFinite(requestedPosition.z)
        ? { ...requestedPosition }
        : { ...item.position },
    size: {
      width: clamp(requestedSize.width, FURNITURE_LIMITS.width.min, FURNITURE_LIMITS.width.max),
      depth: clamp(requestedSize.depth, FURNITURE_LIMITS.depth.min, FURNITURE_LIMITS.depth.max),
    },
    height: clamp(patch.height ?? item.height, FURNITURE_LIMITS.height.min, FURNITURE_LIMITS.height.max),
    rotation: normalizeAngle(patch.rotation ?? item.rotation),
  }

  const room = roomForItem(scene, desired)
  if (!room || !itemFitsRoomAt(desired, room)) return scene

  const items = scene.items.slice()
  items[index] = desired
  return { ...scene, items }
}

export function removeItem(scene: SceneState, id: string): SceneState {
  if (!scene.items.some((item) => item.id === id)) return scene
  return { ...scene, items: scene.items.filter((item) => item.id !== id) }
}

export function duplicateItem(scene: SceneState, id: string, createId: () => string): ItemCommandResult {
  if (scene.items.length >= MAX_SCENE_ITEMS) return { scene, notice: 'The scene item limit has been reached.' }
  const source = scene.items.find((item) => item.id === id)
  if (!source) return { scene }
  const room = roomForItem(scene, source)
  if (!room) return { scene, notice: 'The selected room is no longer available.' }

  const desired: FurnitureItem = {
    ...source,
    id: createId(),
    name: `${source.name} copy`.slice(0, FURNITURE_LIMITS.nameLength),
    position: { x: source.position.x + PLACEMENT_STEP, z: source.position.z + PLACEMENT_STEP },
    size: { ...source.size },
  }
  const duplicate = findAvailablePlacement(desired, room, scene.items)
  if (!duplicate) return { scene, notice: `There is not enough free floor space to duplicate ${source.name}.` }

  return {
    scene: { ...scene, items: [...scene.items, duplicate] },
    selectedItemId: duplicate.id,
  }
}
