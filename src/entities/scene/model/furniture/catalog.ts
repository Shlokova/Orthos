import { FURNITURE_SWATCHES } from '@shared/config/theme'
import type { FurnitureAnchor, FurnitureFamily, FurnitureKind, Size2D, Vec2 } from '../types'

export type FurnitureCategory = 'Living' | 'Work' | 'Bedroom' | 'Storage' | 'Dining' | 'Decor' | 'Lighting'

interface CollisionPartDefinition {
  minY: number
  maxY: number
  widthScale?: number
  depthScale?: number
  offset?: Vec2
}

export interface LightEmitterDefinition {
  heightRatio: number
  intensity: number
  distance: number
}

export interface CatalogItem {
  kind: FurnitureKind
  name: string
  icon: string
  category: FurnitureCategory
  family: FurnitureFamily
  anchor: FurnitureAnchor
  size: Size2D
  height: number
  color: string
  walkable?: boolean
  supportsDecor?: boolean
  mountHeight?: number
  light?: LightEmitterDefinition
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
    family: 'furniture',
    anchor: 'floor',
    size: { width: 2.2, depth: 0.9 },
    height: 0.85,
    color: FURNITURE_SWATCHES.leaf,
  },
  {
    kind: 'armchair',
    name: 'Armchair',
    icon: '▣',
    category: 'Living',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 0.92, depth: 0.9 },
    height: 0.9,
    color: FURNITURE_SWATCHES.sand,
  },
  {
    kind: 'coffee-table',
    name: 'Coffee table',
    icon: '▭',
    category: 'Living',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.1, depth: 0.62 },
    height: 0.43,
    color: FURNITURE_SWATCHES.darkWood,
    collisionParts: TABLE_PARTS,
    supportsDecor: true,
  },
  {
    kind: 'rug',
    name: 'Rug',
    icon: '▱',
    category: 'Living',
    family: 'furniture',
    anchor: 'floor',
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
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.5, depth: 0.7 },
    height: 0.78,
    color: FURNITURE_SWATCHES.warmWood,
    collisionParts: TABLE_PARTS,
    supportsDecor: true,
  },
  {
    kind: 'chair',
    name: 'Chair',
    icon: '□',
    category: 'Work',
    family: 'furniture',
    anchor: 'floor',
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
    family: 'furniture',
    anchor: 'floor',
    size: { width: 2, depth: 1.6 },
    height: 0.85,
    color: FURNITURE_SWATCHES.cream,
  },
  {
    kind: 'bench',
    name: 'Bench',
    icon: '▬',
    category: 'Bedroom',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.3, depth: 0.45 },
    height: 0.48,
    color: FURNITURE_SWATCHES.warmWood,
  },
  {
    kind: 'cabinet',
    name: 'Cabinet',
    icon: '▥',
    category: 'Storage',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.2, depth: 0.45 },
    height: 2,
    color: FURNITURE_SWATCHES.warmWood,
    supportsDecor: true,
  },
  {
    kind: 'bookshelf',
    name: 'Bookshelf',
    icon: '▦',
    category: 'Storage',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1, depth: 0.35 },
    height: 1.9,
    color: FURNITURE_SWATCHES.darkWood,
    supportsDecor: true,
  },
  {
    kind: 'wardrobe',
    name: 'Wardrobe',
    icon: '▮',
    category: 'Storage',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.6, depth: 0.62 },
    height: 2.2,
    color: FURNITURE_SWATCHES.cream,
    supportsDecor: true,
  },
  {
    kind: 'table',
    name: 'Dining table',
    icon: '◇',
    category: 'Dining',
    family: 'furniture',
    anchor: 'floor',
    size: { width: 1.4, depth: 1 },
    height: 0.75,
    color: FURNITURE_SWATCHES.warmWood,
    collisionParts: TABLE_PARTS,
    supportsDecor: true,
  },
  {
    kind: 'vase',
    name: 'Vase',
    icon: '⬮',
    category: 'Decor',
    family: 'decor',
    anchor: 'surface',
    size: { width: 0.18, depth: 0.18 },
    height: 0.35,
    color: FURNITURE_SWATCHES.cream,
  },
  {
    kind: 'photo-frame',
    name: 'Photo frame',
    icon: '▢',
    category: 'Decor',
    family: 'decor',
    anchor: 'surface',
    size: { width: 0.16, depth: 0.06 },
    height: 0.2,
    color: FURNITURE_SWATCHES.darkWood,
  },
  {
    kind: 'plant',
    name: 'Potted plant',
    icon: '❦',
    category: 'Decor',
    family: 'decor',
    anchor: 'surface',
    size: { width: 0.3, depth: 0.3 },
    height: 0.6,
    color: FURNITURE_SWATCHES.leaf,
  },
  {
    kind: 'table-lamp',
    name: 'Table lamp',
    icon: '⌾',
    category: 'Lighting',
    family: 'lighting',
    anchor: 'surface',
    size: { width: 0.22, depth: 0.22 },
    height: 0.45,
    color: FURNITURE_SWATCHES.sand,
    light: { heightRatio: 0.82, intensity: 1.1, distance: 3.6 },
  },
  {
    kind: 'books',
    name: 'Book stack',
    icon: '≡',
    category: 'Decor',
    family: 'decor',
    anchor: 'surface',
    size: { width: 0.25, depth: 0.18 },
    height: 0.22,
    color: FURNITURE_SWATCHES.olive,
  },
  {
    kind: 'shelf',
    name: 'Wall shelf',
    icon: '▔',
    category: 'Storage',
    family: 'furniture',
    anchor: 'wall',
    size: { width: 0.9, depth: 0.25 },
    height: 0.06,
    color: FURNITURE_SWATCHES.warmWood,
    mountHeight: 1.2,
    supportsDecor: true,
  },
  {
    kind: 'painting',
    name: 'Painting',
    icon: '🖼',
    category: 'Decor',
    family: 'decor',
    anchor: 'wall',
    size: { width: 0.7, depth: 0.05 },
    height: 0.5,
    color: FURNITURE_SWATCHES.darkWood,
    mountHeight: 1.5,
  },
  {
    kind: 'mirror',
    name: 'Mirror',
    icon: '▯',
    category: 'Decor',
    family: 'decor',
    anchor: 'wall',
    size: { width: 0.5, depth: 0.05 },
    height: 0.9,
    color: FURNITURE_SWATCHES.cream,
    mountHeight: 1.1,
  },
  {
    kind: 'wall-clock',
    name: 'Wall clock',
    icon: '◷',
    category: 'Decor',
    family: 'decor',
    anchor: 'wall',
    size: { width: 0.3, depth: 0.05 },
    height: 0.3,
    color: FURNITURE_SWATCHES.olive,
    mountHeight: 2,
  },
  {
    kind: 'wall-tv',
    name: 'Wall TV',
    icon: '▭',
    category: 'Living',
    family: 'furniture',
    anchor: 'wall',
    size: { width: 1.2, depth: 0.08 },
    height: 0.7,
    color: FURNITURE_SWATCHES.darkWood,
    mountHeight: 1.1,
  },
  {
    kind: 'wall-lamp',
    name: 'Wall lamp',
    icon: '◐',
    category: 'Lighting',
    family: 'lighting',
    anchor: 'wall',
    size: { width: 0.24, depth: 0.18 },
    height: 0.3,
    color: FURNITURE_SWATCHES.cream,
    mountHeight: 1.7,
    light: { heightRatio: 0.5, intensity: 1.3, distance: 4 },
  },
  {
    kind: 'ceiling-lamp',
    name: 'Ceiling lamp',
    icon: '◍',
    category: 'Lighting',
    family: 'lighting',
    anchor: 'ceiling',
    size: { width: 0.42, depth: 0.42 },
    height: 0.55,
    color: FURNITURE_SWATCHES.cream,
    light: { heightRatio: 0.28, intensity: 2.4, distance: 7 },
  },
] as const satisfies readonly CatalogItem[]

export function getCatalogItem(kind: FurnitureKind): CatalogItem {
  const item = FURNITURE_CATALOG.find((candidate) => candidate.kind === kind)
  if (!item) throw new Error(`Unknown furniture kind: ${kind}`)
  return item
}

export function getFurnitureFamily(kind: FurnitureKind): FurnitureFamily {
  return getCatalogItem(kind).family
}

export function getFurnitureAnchor(kind: FurnitureKind): FurnitureAnchor {
  return getCatalogItem(kind).anchor
}
