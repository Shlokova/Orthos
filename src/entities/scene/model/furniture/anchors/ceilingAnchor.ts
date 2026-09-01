import { clamp } from '@shared/lib'
import type { FurnitureItem } from '../../types'
import type { AnchorContext, AnchorStrategy } from './types'

export const ceilingAnchor: AnchorStrategy = {
  anchor: 'ceiling',
  editableElevation: true,
  rotatable: true,
  defaultElevation(item: FurnitureItem, context: AnchorContext): number {
    return Math.max(0, context.room.height - item.height)
  },
  place(item: FurnitureItem, context: AnchorContext): FurnitureItem {
    const elevation = clamp(item.elevation, 0, Math.max(0, context.room.height - item.height))
    return elevation === item.elevation ? item : { ...item, elevation }
  },
}
