import { GEOMETRY_EPSILON, rotatePoint } from '@shared/lib'
import type { FurnitureItem, SceneState } from '../types'
import { getCatalogItem } from './catalog'
import { itemTopSurface, pointInsideItemFootprint } from './collision'
import { normalizeAngle } from './limits'

export function findItemSupport(item: FurnitureItem, items: readonly FurnitureItem[]): FurnitureItem | null {
  let support: FurnitureItem | null = null
  for (const candidate of items) {
    if (candidate.id === item.id || candidate.roomId !== item.roomId) continue
    if (getCatalogItem(candidate.kind).supportsDecor !== true) continue
    if (!pointInsideItemFootprint(item.position, candidate)) continue
    if (support && itemTopSurface(candidate) <= itemTopSurface(support)) continue
    support = candidate
  }
  return support
}

export function resolveSurfaceElevation(item: FurnitureItem, items: readonly FurnitureItem[]): number {
  const support = findItemSupport(item, items)
  return support ? itemTopSurface(support) : 0
}

export function settleSurfaceItems(scene: SceneState): SceneState {
  let changed = false
  const items = scene.items.map((item) => {
    if (getCatalogItem(item.kind).anchor !== 'surface') return item
    const elevation = resolveSurfaceElevation(item, scene.items)
    if (elevation === item.elevation) return item
    changed = true
    return { ...item, elevation }
  })

  return changed ? { ...scene, items } : scene
}

export function findCarriedItems(support: FurnitureItem, items: readonly FurnitureItem[]): readonly FurnitureItem[] {
  if (getCatalogItem(support.kind).supportsDecor !== true) return []
  return items.filter(
    (candidate) =>
      candidate.id !== support.id &&
      getCatalogItem(candidate.kind).anchor === 'surface' &&
      findItemSupport(candidate, items)?.id === support.id,
  )
}

export function carrySupportedItems(
  items: readonly FurnitureItem[],
  before: FurnitureItem,
  after: FurnitureItem,
): readonly FurnitureItem[] {
  const dx = after.position.x - before.position.x
  const dz = after.position.z - before.position.z
  const spin = after.rotation - before.rotation
  const moved =
    Math.abs(dx) >= GEOMETRY_EPSILON || Math.abs(dz) >= GEOMETRY_EPSILON || Math.abs(spin) >= GEOMETRY_EPSILON
  if (!moved && before.roomId === after.roomId) return items

  const carried = findCarriedItems(before, items)
  if (carried.length === 0) return items

  const carriedIds = new Set(carried.map((item) => item.id))
  return items.map((item) => {
    if (!carriedIds.has(item.id)) return item
    const local = { x: item.position.x - before.position.x, z: item.position.z - before.position.z }
    const spun = rotatePoint(local, spin)
    return {
      ...item,
      roomId: after.roomId,
      position: { x: after.position.x + spun.x, z: after.position.z + spun.z },
      rotation: normalizeAngle(item.rotation + spin),
    }
  })
}
