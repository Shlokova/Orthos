import type { FurnitureAnchor, FurnitureKind } from '../../types'
import { getCatalogItem } from '../catalog'
import { ceilingAnchor } from './ceilingAnchor'
import { floorAnchor } from './floorAnchor'
import { surfaceAnchor } from './surfaceAnchor'
import type { AnchorStrategy } from './types'
import { wallAnchor } from './wallAnchor'

const STRATEGIES: Readonly<Record<FurnitureAnchor, AnchorStrategy>> = {
  floor: floorAnchor,
  surface: surfaceAnchor,
  wall: wallAnchor,
  ceiling: ceilingAnchor,
}

export function getItemAnchorStrategy(kind: FurnitureKind): AnchorStrategy {
  return STRATEGIES[getCatalogItem(kind).anchor]
}

export type { AnchorContext, AnchorReach, AnchorStrategy } from './types'
