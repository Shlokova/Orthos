import { FURNITURE_SWATCHES } from '@shared/config/theme'
import type { FurnitureKind, Size2D, Vec2 } from '../types'

type FurnitureCategory = 'Living' | 'Work' | 'Bedroom' | 'Storage' | 'Dining'

interface CollisionPartDefinition {
  minY: number
  maxY: number
  widthScale?: number
  depthScale?: number
  offset?: Vec2
}

export interface CatalogItem {
  kind: FurnitureKind
  name: string
  icon: string
  category: FurnitureCategory
  size: Size2D
  height: number
  color: string
  walkable?: boolean
  collisionParts?: readonly CollisionPartDefinition[]
}

const TABLE_PARTS: readonly CollisionPartDefinition[] = [
  { minY: 0.84, maxY: 1, widthScale: 1, depthScale: 1 },
  { minY: 0, maxY: 0.84, widthScale: 0.12, depthScale: 0.12, offset: { x: -0.43, z: -0.4 } },
  { minY: 0, maxY: 0.84, widthScale: 0.12, depthScale: 0.12, offset: { x: 0.43, z: -0.4 } },
  { minY: 0, maxY: 0.84, widthScale: 0.12, depthScale: 0.12, offset: { x: -0.43, z: 0.4 } },
  { minY: 0, maxY: 0.84, widthScale: 0.12, depthScale: 0.12, offset: { x: 0.43, z: 0.4 } },
]

const CHAIR_PARTS: readonly CollisionPartDefinition[] = [{ minY: 0, maxY: 0.55, widthScale: 0.9, depthScale: 0.9 }]

export const FURNITURE_CATALOG = [
  {
    kind: 'sofa',
    name: 'Sofa',
    icon: '▰',
    category: 'Living',
    size: { width: 2.2, depth: 0.9 },
    height: 0.85,
    color: FURNITURE_SWATCHES.leaf,
  },
  {
    kind: 'armchair',
    name: 'Armchair',
    icon: '▣',
    category: 'Living',
    size: { width: 0.92, depth: 0.9 },
    height: 0.9,
    color: FURNITURE_SWATCHES.sand,
  },
  {
    kind: 'coffee-table',
    name: 'Coffee table',
    icon: '▭',
    category: 'Living',
    size: { width: 1.1, depth: 0.62 },
    height: 0.43,
    color: FURNITURE_SWATCHES.darkWood,
    collisionParts: TABLE_PARTS,
  },
  {
    kind: 'rug',
    name: 'Rug',
    icon: '▱',
    category: 'Living',
    size: { width: 2.4, depth: 1.7 },
    height: 0.025,
    color: FURNITURE_SWATCHES.sand,
    walkable: true,
    collisionParts: [],
  },
  {
    kind: 'desk',
    name: 'Desk',
    icon: '⌑',
    category: 'Work',
    size: { width: 1.5, depth: 0.7 },
    height: 0.78,
    color: FURNITURE_SWATCHES.warmWood,
    collisionParts: TABLE_PARTS,
  },
  {
    kind: 'chair',
    name: 'Chair',
    icon: '□',
    category: 'Work',
    size: { width: 0.55, depth: 0.55 },
    height: 0.9,
    color: FURNITURE_SWATCHES.darkWood,
    collisionParts: CHAIR_PARTS,
  },
  {
    kind: 'bed',
    name: 'Bed',
    icon: '▤',
    category: 'Bedroom',
    size: { width: 2, depth: 1.6 },
    height: 0.85,
    color: FURNITURE_SWATCHES.cream,
  },
  {
    kind: 'bench',
    name: 'Bench',
    icon: '▬',
    category: 'Bedroom',
    size: { width: 1.3, depth: 0.45 },
    height: 0.48,
    color: FURNITURE_SWATCHES.warmWood,
  },
  {
    kind: 'cabinet',
    name: 'Cabinet',
    icon: '▥',
    category: 'Storage',
    size: { width: 1.2, depth: 0.45 },
    height: 2,
    color: FURNITURE_SWATCHES.warmWood,
  },
  {
    kind: 'bookshelf',
    name: 'Bookshelf',
    icon: '▦',
    category: 'Storage',
    size: { width: 1, depth: 0.35 },
    height: 1.9,
    color: FURNITURE_SWATCHES.darkWood,
  },
  {
    kind: 'wardrobe',
    name: 'Wardrobe',
    icon: '▮',
    category: 'Storage',
    size: { width: 1.6, depth: 0.62 },
    height: 2.2,
    color: FURNITURE_SWATCHES.cream,
  },
  {
    kind: 'table',
    name: 'Dining table',
    icon: '◇',
    category: 'Dining',
    size: { width: 1.4, depth: 1 },
    height: 0.75,
    color: FURNITURE_SWATCHES.warmWood,
    collisionParts: TABLE_PARTS,
  },
] as const satisfies readonly CatalogItem[]

export function getCatalogItem(kind: FurnitureKind): CatalogItem {
  const item = FURNITURE_CATALOG.find((candidate) => candidate.kind === kind)
  if (!item) throw new Error(`Unknown furniture kind: ${kind}`)
  return item
}
