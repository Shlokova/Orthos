import type { FurnitureItem } from '../../types'
import type { AnchorStrategy } from './types'

export const floorAnchor: AnchorStrategy = {
  anchor: 'floor',
  editableElevation: false,
  rotatable: true,
  defaultElevation: () => 0,
  place(item: FurnitureItem): FurnitureItem {
    return item.elevation === 0 ? item : { ...item, elevation: 0 }
  },
}
