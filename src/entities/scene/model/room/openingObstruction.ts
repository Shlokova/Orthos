import { getCatalogItem } from '@entities/scene'
import { GEOMETRY_EPSILON, rotatePoint } from '@shared/lib'
import { orientedRectanglesIntersect } from '../furniture/collision'
import type { FurnitureItem, RoomDefinition, Vec2, WallOpening } from '../types'
import { polygonSignedArea } from './polygon'
import { openingSpan } from './wallPieces'
import { getWallSegment } from './walls'

const OPENING_DEPTH = 0.24
const DOOR_SWING_SLACK = 0.02

interface ObstructionZone {
  position: Vec2
  rotation: number
  size: { width: number; depth: number }
  minY: number
  maxY: number
}

function wallInteriorNormal(room: RoomDefinition, wallIndex: number): Vec2 {
  const wall = getWallSegment(room, wallIndex)
  const normal = rotatePoint({ x: 0, z: 1 }, wall.angle)
  return polygonSignedArea(room.vertices) < 0 ? { x: -normal.x, z: -normal.z } : normal
}

export function getOpeningZones(opening: WallOpening, room: RoomDefinition): ObstructionZone[] {
  const wall = getWallSegment(room, opening.wallIndex)
  const span = openingSpan(opening, wall.length)
  const centreDistance = (span.start + span.end) / 2
  const ratio = centreDistance / Math.max(wall.length, GEOMETRY_EPSILON)
  const normal = wallInteriorNormal(room, opening.wallIndex)
  const onWall: Vec2 = {
    x: wall.start.x + (wall.end.x - wall.start.x) * ratio,
    z: wall.start.z + (wall.end.z - wall.start.z) * ratio,
  }

  const zones: ObstructionZone[] = [
    {
      position: onWall,
      rotation: wall.angle,
      size: { width: opening.width, depth: OPENING_DEPTH },
      minY: opening.sillHeight,
      maxY: opening.sillHeight + opening.height,
    },
  ]

  if (opening.kind === 'door') {
    const reach = opening.width
    zones.push({
      position: { x: onWall.x + normal.x * (reach / 2), z: onWall.z + normal.z * (reach / 2) },
      rotation: wall.angle,
      size: { width: opening.width, depth: reach },
      minY: 0,
      maxY: opening.sillHeight + opening.height,
    })
  }

  return zones
}

function itemZones(item: FurnitureItem): ObstructionZone[] {
  const definition = getCatalogItem(item.kind)
  if (definition.collisionParts?.length === 0) return []
  const parts = definition.collisionParts ?? [{ minY: 0, maxY: 1 }]
  return parts.map((part) => {
    const localOffset = {
      x: (part.offset?.x ?? 0) * item.size.width,
      z: (part.offset?.z ?? 0) * item.size.depth,
    }
    const offset = rotatePoint(localOffset, item.rotation)
    return {
      position: { x: item.position.x + offset.x, z: item.position.z + offset.z },
      rotation: item.rotation,
      size: {
        width: item.size.width * (part.widthScale ?? 1),
        depth: item.size.depth * (part.depthScale ?? 1),
      },
      minY: item.elevation + item.height * part.minY,
      maxY: item.elevation + item.height * part.maxY,
    }
  })
}

export function itemObstructsOpening(item: FurnitureItem, opening: WallOpening, room: RoomDefinition): boolean {
  if (item.roomId !== opening.roomId || opening.roomId !== room.id) return false
  if (getCatalogItem(item.kind).walkable === true) return false

  const zones = getOpeningZones(opening, room)
  return itemZones(item).some((itemZone) =>
    zones.some((zone) => {
      const verticalOverlap =
        itemZone.maxY > zone.minY + GEOMETRY_EPSILON && zone.maxY > itemZone.minY + GEOMETRY_EPSILON
      return verticalOverlap && orientedRectanglesIntersect(itemZone, zone, 0, DOOR_SWING_SLACK)
    }),
  )
}
