import { GEOMETRY_EPSILON } from '@shared/lib'
import type { RoomDefinition, WallOpening } from '../types'
import { getWallSegment, openingWorldPosition, projectPointToClosestWall } from './walls'

const SHARED_WALL_DISTANCE = 0.2
const PARALLEL_TOLERANCE = 0.02

export function collectRoomWallOpenings(
  room: RoomDefinition,
  rooms: readonly RoomDefinition[],
  openings: readonly WallOpening[],
): WallOpening[] {
  const collected: WallOpening[] = []

  for (const opening of openings) {
    if (opening.roomId === room.id) {
      collected.push(opening)
      continue
    }

    const source = rooms.find((candidate) => candidate.id === opening.roomId)
    if (!source) continue

    const frame = openingWorldPosition(opening, source)
    const projection = projectPointToClosestWall(room, frame.position)
    if (projection.distance > SHARED_WALL_DISTANCE) continue

    const wall = getWallSegment(room, projection.wallIndex)
    if (Math.abs(Math.sin(wall.angle - frame.angle)) > PARALLEL_TOLERANCE) continue

    const half = opening.width / 2 / Math.max(wall.length, GEOMETRY_EPSILON)
    if (projection.offset - half < -GEOMETRY_EPSILON || projection.offset + half > 1 + GEOMETRY_EPSILON) continue

    collected.push({
      ...opening,
      roomId: room.id,
      wallIndex: projection.wallIndex,
      offset: projection.offset,
    })
  }

  return collected
}
