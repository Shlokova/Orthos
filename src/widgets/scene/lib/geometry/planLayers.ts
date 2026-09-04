import { type FurnitureItem, getCatalogItem } from '@entities/scene'

const PLAN_ITEM_SLOTS = 8

const WALL_BAND_ELEVATION = 1

const PLAN_PICK_BAND = { min: 0.03, max: 0.09 } as const

export const PLAN_ORDER = {
  grid: 2,
  floor: 3,
  clearance: 5,
  groundItems: 100,
  wallBand: 2000,
  mountedItems: 2100,
  openings: 4000,
  dimensions: 4100,
  selection: 4150,
  handles: 4200,
  drawing: 4300,
} as const

export interface PlanItemLayer {
  readonly order: number
  readonly y: number
}

export const PLAN_ITEM_FALLBACK: PlanItemLayer = {
  order: PLAN_ORDER.groundItems,
  y: (PLAN_PICK_BAND.min + PLAN_PICK_BAND.max) / 2,
}

export function buildPlanItemLayers(items: readonly FurnitureItem[]): ReadonlyMap<string, PlanItemLayer> {
  const ranked = items.map((item, index) => ({
    id: item.id,
    walkable: getCatalogItem(item.kind).walkable === true ? 0 : 1,
    elevation: item.elevation,
    area: item.size.width * item.size.depth,
    index,
  }))

  ranked.sort(
    (first, second) =>
      first.walkable - second.walkable ||
      first.elevation - second.elevation ||
      second.area - first.area ||
      first.index - second.index,
  )

  const span = PLAN_PICK_BAND.max - PLAN_PICK_BAND.min
  const layers = new Map<string, PlanItemLayer>()
  let ground = 0
  let mounted = 0
  for (const [rank, entry] of ranked.entries()) {
    const order =
      entry.elevation < WALL_BAND_ELEVATION
        ? PLAN_ORDER.groundItems + ground++ * PLAN_ITEM_SLOTS
        : PLAN_ORDER.mountedItems + mounted++ * PLAN_ITEM_SLOTS
    layers.set(entry.id, { order, y: PLAN_PICK_BAND.min + ((rank + 1) / (ranked.length + 1)) * span })
  }
  return layers
}
