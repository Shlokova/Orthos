export type FurnitureKind =
  | 'sofa'
  | 'armchair'
  | 'desk'
  | 'bed'
  | 'cabinet'
  | 'bookshelf'
  | 'wardrobe'
  | 'table'
  | 'coffee-table'
  | 'chair'
  | 'bench'
  | 'rug'

export interface Vec2 {
  readonly x: number
  readonly z: number
}

export interface Size2D {
  readonly width: number
  readonly depth: number
}

export interface Bounds2D {
  readonly minX: number
  readonly maxX: number
  readonly minZ: number
  readonly maxZ: number
  readonly width: number
  readonly depth: number
  readonly center: Vec2
}

export interface RoomDefinition {
  readonly id: string
  readonly name: string
  readonly height: number
  readonly vertices: readonly Vec2[]
}

export type OpeningKind = 'door' | 'window'

export interface WallOpening {
  readonly id: string
  readonly roomId: string
  readonly kind: OpeningKind
  readonly wallIndex: number
  readonly offset: number
  readonly width: number
  readonly height: number
  readonly sillHeight: number
}

export interface FurnitureItem {
  readonly id: string
  readonly roomId: string
  readonly kind: FurnitureKind
  readonly name: string
  readonly position: Vec2
  readonly rotation: number
  readonly size: Size2D
  readonly height: number
  readonly color: string
}

export interface SceneState {
  readonly rooms: readonly RoomDefinition[]
  readonly items: readonly FurnitureItem[]
  readonly openings: readonly WallOpening[]
}

type ValidationIssueType = 'collision' | 'out-of-bounds' | 'vertical-bounds' | 'opening-overlap'

export interface ValidationIssue {
  readonly type: ValidationIssueType
  readonly itemIds: readonly string[]
  readonly message: string
}
