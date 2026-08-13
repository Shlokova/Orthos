import type { FurnitureItem } from '@entities/scene'
import type { FurnitureMaterials } from '../../../lib/furniture/FurnitureMaterials'

export interface FurnitureModelProps {
  item: FurnitureItem
  materials: FurnitureMaterials
}
