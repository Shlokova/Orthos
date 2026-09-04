import {
  type AnchorReach,
  carrySupportedItems,
  FURNITURE_LIMITS,
  type FurnitureFactory,
  type FurnitureItem,
  type FurnitureKind,
  findRoomContainingItem,
  furnitureItemsIntersect3D,
  getCatalogItem,
  getItemAnchorStrategy,
  getItemWallIndex,
  getRoomBounds,
  isHexColor,
  itemFitsRoomAt,
  MAX_SCENE_ITEMS,
  normalizeAngle,
  type RoomDefinition,
  type SceneState,
  settleSurfaceItems,
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

function anchorItem(
  scene: SceneState,
  item: FurnitureItem,
  room: RoomDefinition,
  reach: AnchorReach,
  previousWallIndex?: number,
): FurnitureItem | null {
  return getItemAnchorStrategy(item.kind).place(item, {
    room,
    siblings: scene.items,
    reach,
    previousWallIndex,
  })
}

function anchorsToWall(item: FurnitureItem): boolean {
  return getCatalogItem(item.kind).anchor === 'wall'
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

  if (anchorsToWall(created)) {
    const mounted = anchorItem(scene, created, room, 'anywhere')
    if (!mounted) return { scene, notice: `There is no free wall space for ${created.name}.` }
    return {
      scene: { ...scene, items: [...scene.items, mounted] },
      selectedItemId: mounted.id,
    }
  }

  const placed = findAvailablePlacement(created, room, scene.items)
  if (!placed) return { scene, notice: `There is not enough free floor space for ${created.name}.` }
  const item = anchorItem(scene, placed, room, 'nearest') ?? placed

  return {
    scene: settleSurfaceItems({ ...scene, items: [...scene.items, item] }),
    selectedItemId: item.id,
  }
}

function candidateRooms(
  scene: SceneState,
  item: FurnitureItem,
  desired: FurnitureItem,
  roomWasChosen: boolean,
): RoomDefinition[] {
  const assigned = roomForItem(scene, desired)
  if (roomWasChosen) return assigned ? [assigned] : []

  const current = roomForItem(scene, item)
  const entered = findRoomContainingItem(desired, scene.rooms)
  const ordered = entered && entered.id !== current?.id ? [entered, current] : [current]
  return ordered.filter((room): room is RoomDefinition => room !== null)
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
    elevation: clamp(patch.elevation ?? item.elevation, FURNITURE_LIMITS.elevation.min, FURNITURE_LIMITS.elevation.max),
    rotation: normalizeAngle(patch.rotation ?? item.rotation),
  }

  for (const room of candidateRooms(scene, item, desired, patch.roomId !== undefined)) {
    const sameRoom = room.id === item.roomId
    const candidate = sameRoom ? desired : { ...desired, roomId: room.id }
    const placed = anchorItem(
      scene,
      candidate,
      room,
      'nearest',
      sameRoom && anchorsToWall(item) ? getItemWallIndex(item, room) : undefined,
    )
    if (!placed || !itemFitsRoomAt(placed, room)) continue

    const items = carrySupportedItems(scene.items, item, placed).slice()
    items[index] = placed
    return settleSurfaceItems({ ...scene, items })
  }

  return scene
}

export function removeItem(scene: SceneState, id: string): SceneState {
  if (!scene.items.some((item) => item.id === id)) return scene
  return settleSurfaceItems({ ...scene, items: scene.items.filter((item) => item.id !== id) })
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
  if (anchorsToWall(source)) {
    const mounted = anchorItem(scene, { ...desired, position: { ...source.position } }, room, 'anywhere')
    if (!mounted) return { scene, notice: `There is no free wall space to duplicate ${source.name}.` }
    return {
      scene: { ...scene, items: [...scene.items, mounted] },
      selectedItemId: mounted.id,
    }
  }

  const duplicate = findAvailablePlacement(desired, room, scene.items)
  if (!duplicate) return { scene, notice: `There is not enough free floor space to duplicate ${source.name}.` }

  return {
    scene: settleSurfaceItems({ ...scene, items: [...scene.items, duplicate] }),
    selectedItemId: duplicate.id,
  }
}
