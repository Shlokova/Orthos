import { FURNITURE_SWATCHES } from '@shared/config/theme'
import type { FurnitureItem, FurnitureKind } from '../types'

const swatches = FURNITURE_SWATCHES

const FURNITURE_COLOR_OPTIONS: readonly string[] = Object.values(swatches)

interface FurnitureColorChoice {
  name: string
  color: string
}

export const FURNITURE_COLOR_CHOICES: readonly FurnitureColorChoice[] = [
  { name: 'Olive', color: swatches.olive },
  { name: 'Leaf', color: swatches.leaf },
  { name: 'Warm oak', color: swatches.warmWood },
  { name: 'Walnut', color: swatches.darkWood },
  { name: 'Sand', color: swatches.sand },
  { name: 'Cream', color: swatches.cream },
]

const FURNITURE_KIND_COLOR: Readonly<Record<FurnitureKind, string>> = {
  sofa: swatches.leaf,
  armchair: swatches.sand,
  desk: swatches.warmWood,
  bed: swatches.cream,
  cabinet: swatches.warmWood,
  bookshelf: swatches.darkWood,
  wardrobe: swatches.cream,
  table: swatches.warmWood,
  'coffee-table': swatches.darkWood,
  chair: swatches.darkWood,
  bench: swatches.warmWood,
  rug: swatches.sand,
  vase: swatches.cream,
  'photo-frame': swatches.darkWood,
  plant: swatches.leaf,
  'table-lamp': swatches.sand,
  books: swatches.olive,
  shelf: swatches.warmWood,
  painting: swatches.darkWood,
  mirror: swatches.cream,
  'wall-clock': swatches.olive,
  'wall-tv': swatches.darkWood,
  'wall-lamp': swatches.cream,
  'ceiling-lamp': swatches.cream,
}

const FURNITURE_COLOR_SET = new Set(FURNITURE_COLOR_OPTIONS)

export function resolveFurnitureColor(item: Pick<FurnitureItem, 'kind' | 'color'>): string {
  const normalized = item.color.toLowerCase()
  return FURNITURE_COLOR_SET.has(normalized) ? normalized : FURNITURE_KIND_COLOR[item.kind]
}
