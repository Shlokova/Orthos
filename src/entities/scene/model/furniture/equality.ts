import { vec2Equal } from '@shared/lib'
import type { FurnitureItem } from '../types'

export function furnitureItemsEqual(first: FurnitureItem, second: FurnitureItem): boolean {
  if (first === second) return true
  return (
    first.id === second.id &&
    first.roomId === second.roomId &&
    first.kind === second.kind &&
    first.name === second.name &&
    vec2Equal(first.position, second.position) &&
    first.rotation === second.rotation &&
    first.size.width === second.size.width &&
    first.size.depth === second.size.depth &&
    first.height === second.height &&
    first.color === second.color
  )
}
