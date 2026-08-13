import { clamp, GEOMETRY_EPSILON } from '@shared/lib'
import type { RoomDefinition, WallOpening } from '../types'
import { openingSpan } from './wallPieces'
import { clampOpeningToWall, getWallSegment, getWallSegments } from './walls'

const OPENING_GAP = 0.1

export type OpeningPlacementScope = 'same-wall' | 'any-wall'

function openingRange(opening: WallOpening, room: RoomDefinition) {
  return openingSpan(opening, getWallSegment(room, opening.wallIndex).length)
}

export function openingsOverlap(
  first: WallOpening,
  second: WallOpening,
  room: RoomDefinition,
  gap = OPENING_GAP,
): boolean {
  if (first.wallIndex !== second.wallIndex) return false
  const firstRange = openingRange(first, room)
  const secondRange = openingRange(second, room)
  return firstRange.end + gap > secondRange.start && secondRange.end + gap > firstRange.start
}

function openingHasConflict(opening: WallOpening, room: RoomDefinition, siblings: readonly WallOpening[]): boolean {
  return siblings.some(
    (candidate) =>
      candidate.id !== opening.id && candidate.roomId === opening.roomId && openingsOverlap(opening, candidate, room),
  )
}

function closestFreePlacementOnWall(
  requested: WallOpening,
  room: RoomDefinition,
  siblings: readonly WallOpening[],
  wallIndex: number,
): WallOpening | null {
  const base = clampOpeningToWall({ ...requested, wallIndex }, room)
  const wall = getWallSegment(room, wallIndex)
  const minOffset = clampOpeningToWall({ ...base, offset: 0 }, room).offset
  const maxOffset = clampOpeningToWall({ ...base, offset: 1 }, room).offset
  const desiredDistance = clamp(base.offset, minOffset, maxOffset) * wall.length
  const minDistance = minOffset * wall.length
  const maxDistance = maxOffset * wall.length
  const onWall = siblings.filter(
    (opening) => opening.id !== requested.id && opening.roomId === requested.roomId && opening.wallIndex === wallIndex,
  )

  const candidateDistances = new Set<number>([desiredDistance, minDistance, maxDistance])
  for (const sibling of onWall) {
    const center = sibling.offset * wall.length
    candidateDistances.add(center - sibling.width / 2 - OPENING_GAP - base.width / 2)
    candidateDistances.add(center + sibling.width / 2 + OPENING_GAP + base.width / 2)
  }

  const candidates = [...candidateDistances]
    .map((distance) => clamp(distance, minDistance, maxDistance))
    .sort((first, second) => Math.abs(first - desiredDistance) - Math.abs(second - desiredDistance))

  for (const distance of candidates) {
    const candidate = clampOpeningToWall({ ...base, offset: distance / Math.max(wall.length, 1e-6) }, room)
    if (!openingHasConflict(candidate, room, onWall)) return candidate
  }
  return null
}

export function placeOpeningWithoutOverlap(
  requested: WallOpening,
  room: RoomDefinition,
  siblings: readonly WallOpening[],
  scope: OpeningPlacementScope = 'same-wall',
): WallOpening | null {
  const wallCount = room.vertices.length
  if (wallCount === 0) return null

  const requestedWall = clamp(Math.round(requested.wallIndex), 0, wallCount - 1)
  const wallOrder = [requestedWall]
  if (scope === 'any-wall') {
    for (let distance = 1; distance < wallCount; distance += 1) {
      wallOrder.push((requestedWall + distance) % wallCount)
    }
  }

  for (const wallIndex of wallOrder) {
    const placed = closestFreePlacementOnWall(requested, room, siblings, wallIndex)
    if (placed) return placed
  }
  return null
}

export function reindexOpeningsAfterVertexInsert(openings: readonly WallOpening[], wallIndex: number): WallOpening[] {
  return openings.map((opening) => {
    if (opening.wallIndex < wallIndex) return opening
    if (opening.wallIndex > wallIndex) return { ...opening, wallIndex: opening.wallIndex + 1 }
    return opening.offset <= 0.5
      ? { ...opening, offset: opening.offset * 2 }
      : { ...opening, wallIndex: wallIndex + 1, offset: (opening.offset - 0.5) * 2 }
  })
}

export function reindexOpeningsAfterVertexRemoval(
  openings: readonly WallOpening[],
  room: RoomDefinition,
  index: number,
): WallOpening[] {
  const vertexCount = room.vertices.length
  if (vertexCount < 3) return [...openings]

  const walls = getWallSegments(room)
  const previousIndex = (index - 1 + vertexCount) % vertexCount
  const mergedIndex = index === 0 ? vertexCount - 2 : index - 1
  const headLength = walls[previousIndex]?.length ?? 0
  const tailLength = walls[index]?.length ?? 0
  const mergedLength = Math.max(headLength + tailLength, GEOMETRY_EPSILON)

  return openings.map((opening) => {
    if (opening.wallIndex === previousIndex) {
      return { ...opening, wallIndex: mergedIndex, offset: (opening.offset * headLength) / mergedLength }
    }
    if (opening.wallIndex === index) {
      return {
        ...opening,
        wallIndex: mergedIndex,
        offset: (headLength + opening.offset * tailLength) / mergedLength,
      }
    }
    return opening.wallIndex < index ? opening : { ...opening, wallIndex: opening.wallIndex - 1 }
  })
}

export function reflowRoomOpenings(openings: readonly WallOpening[], room: RoomDefinition): WallOpening[] | null {
  const resolved: WallOpening[] = []
  for (const opening of openings) {
    const placed = placeOpeningWithoutOverlap({ ...opening, roomId: room.id }, room, resolved, 'any-wall')
    if (!placed) return null
    resolved.push(placed)
  }
  return resolved
}
