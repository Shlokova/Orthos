import { findInteriorPointNear, getRoomBounds, polygonCentroid } from '../room'
import type { FurnitureItem, FurnitureKind, RoomDefinition } from '../types'
import { getCatalogItem } from './catalog'

const SPAWN_FACTORS = [-0.62, 0, 0.62] as const

export class FurnitureFactory {
  constructor(private readonly createId: () => string) {}

  create(kind: FurnitureKind, room: RoomDefinition, index: number): FurnitureItem {
    const definition = getCatalogItem(kind)
    const bounds = getRoomBounds(room)
    const column = index % SPAWN_FACTORS.length
    const row = Math.floor(index / SPAWN_FACTORS.length) % SPAWN_FACTORS.length
    const desired = {
      x: bounds.center.x + bounds.width * 0.34 * (SPAWN_FACTORS[column] ?? 0),
      z: bounds.center.z + bounds.depth * 0.34 * (SPAWN_FACTORS[row] ?? 0),
    }
    const position = findInteriorPointNear(room, desired)
    const center = polygonCentroid(room.vertices)

    return {
      id: this.createId(),
      roomId: room.id,
      kind,
      name: definition.name,
      position: Number.isFinite(position.x) ? position : center,
      rotation: 0,
      size: { ...definition.size },
      height: definition.height,
      color: definition.color,
    }
  }
}
