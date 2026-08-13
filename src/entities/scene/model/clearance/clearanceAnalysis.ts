import { getRectangleCorners, itemBlocksClearance, orientedRectanglesIntersect } from '../furniture/collision'
import { pointInPolygon, polygonBoundaryProperlyIntersects } from '../room'
import type { FurnitureItem, RoomDefinition } from '../types'

const FLOOR_CLEARANCE_BUFFER = 0.28
export const FURNITURE_CLEARANCE_PADDING = FLOOR_CLEARANCE_BUFFER / 2

type ClearanceIssueType = 'wall-buffer' | 'furniture-buffer'

interface ClearanceIssue {
  type: ClearanceIssueType
  itemIds: readonly string[]
}

interface ClearanceAnalysis {
  blockingItemCount: number
  issueItemIds: ReadonlySet<string>
  issues: readonly ClearanceIssue[]
}

function paddedFootprintInsideRoom(item: FurnitureItem, room: RoomDefinition, padding: number): boolean {
  const corners = getRectangleCorners(item, padding)
  return (
    corners.every((corner) => pointInPolygon(corner, room.vertices, true)) &&
    !polygonBoundaryProperlyIntersects(corners, room.vertices)
  )
}

export function analyzeClearance(
  room: RoomDefinition,
  items: readonly FurnitureItem[],
  buffer = FLOOR_CLEARANCE_BUFFER,
): ClearanceAnalysis {
  const blockers = items.filter((item) => item.roomId === room.id && itemBlocksClearance(item))
  const issues: ClearanceIssue[] = []
  const issueItemIds = new Set<string>()

  for (const item of blockers) {
    if (!paddedFootprintInsideRoom(item, room, buffer)) {
      issues.push({ type: 'wall-buffer', itemIds: [item.id] })
      issueItemIds.add(item.id)
    }
  }

  for (const [firstIndex, first] of blockers.entries()) {
    for (const second of blockers.slice(firstIndex + 1)) {
      if (!orientedRectanglesIntersect(first, second, buffer / 2)) continue
      issues.push({ type: 'furniture-buffer', itemIds: [first.id, second.id] })
      issueItemIds.add(first.id)
      issueItemIds.add(second.id)
    }
  }

  return {
    blockingItemCount: blockers.length,
    issueItemIds,
    issues,
  }
}
