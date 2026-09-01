import type { FurnitureAnchor, FurnitureItem, RoomDefinition } from '../../types'

export interface AnchorContext {
  room: RoomDefinition
  siblings: readonly FurnitureItem[]
  reach: AnchorReach
  previousWallIndex?: number | undefined
}

export type AnchorReach = 'nearest' | 'anywhere'

export interface AnchorStrategy {
  readonly anchor: FurnitureAnchor
  readonly editableElevation: boolean
  readonly rotatable: boolean
  place(item: FurnitureItem, context: AnchorContext): FurnitureItem | null
  defaultElevation(item: FurnitureItem, context: AnchorContext): number
}
