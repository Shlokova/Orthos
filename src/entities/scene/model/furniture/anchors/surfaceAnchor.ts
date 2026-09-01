import type { FurnitureItem } from '../../types'
import { resolveSurfaceElevation } from '../support'
import type { AnchorContext, AnchorStrategy } from './types'

export const surfaceAnchor: AnchorStrategy = {
  anchor: 'surface',
  editableElevation: false,
  rotatable: true,
  defaultElevation(item: FurnitureItem, context: AnchorContext): number {
    return resolveSurfaceElevation(item, context.siblings)
  },
  place(item: FurnitureItem, context: AnchorContext): FurnitureItem {
    const elevation = resolveSurfaceElevation(item, context.siblings)
    return elevation === item.elevation ? item : { ...item, elevation }
  },
}
