import { clamp } from '@shared/lib'
import type { FurnitureItem } from '../../types'
import { mountItemOnWall } from '../wallMounting'
import type { AnchorContext, AnchorStrategy } from './types'

export const wallAnchor: AnchorStrategy = {
  anchor: 'wall',
  editableElevation: true,
  rotatable: false,
  defaultElevation(item: FurnitureItem, context: AnchorContext): number {
    return clamp(item.elevation, 0, Math.max(0, context.room.height - item.height))
  },
  place(item: FurnitureItem, context: AnchorContext): FurnitureItem | null {
    const elevation = wallAnchor.defaultElevation(item, context)
    const raised = elevation === item.elevation ? item : { ...item, elevation }
    const mount = mountItemOnWall(
      raised,
      context.room,
      context.reach === 'anywhere' ? 'any-wall' : 'same-wall',
      context.previousWallIndex,
    )
    return mount ? { ...raised, position: mount.position, rotation: mount.rotation } : null
  },
}
