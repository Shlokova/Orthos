import {
  clampOpeningToWall,
  collectRoomWallOpenings,
  type FurnitureItem,
  furnitureItemsIntersect3D,
  isItemInsideRoom,
  isItemVerticallyInsideRoom,
  itemObstructsOpening,
  openingsOverlap,
  type RoomDefinition,
  type ValidationIssue,
  type WallOpening,
} from '@entities/scene'

interface PlacementRule {
  validate(
    items: readonly FurnitureItem[],
    rooms: readonly RoomDefinition[],
    openings?: readonly WallOpening[],
  ): ValidationIssue[]
}

interface BoundsCacheEntry {
  room: RoomDefinition
  issues: ValidationIssue[]
}

export class BoundsRule implements PlacementRule {
  private readonly cache = new WeakMap<FurnitureItem, BoundsCacheEntry>()

  validate(items: readonly FurnitureItem[], rooms: readonly RoomDefinition[]): ValidationIssue[] {
    const roomsById = new Map(rooms.map((room) => [room.id, room]))
    return items.flatMap((item) => {
      const room = roomsById.get(item.roomId)
      if (!room) {
        return [
          {
            type: 'out-of-bounds' as const,
            itemIds: [item.id],
            message: `${item.name} is not assigned to an existing room`,
          },
        ]
      }

      const cached = this.cache.get(item)
      if (cached?.room === room) return cached.issues

      const issues: ValidationIssue[] = []
      if (!isItemInsideRoom(item, room)) {
        issues.push({type: 'out-of-bounds', itemIds: [item.id], message: `${item.name} crosses the room polygon`})
      }
      if (!isItemVerticallyInsideRoom(item, room)) {
        issues.push({type: 'vertical-bounds', itemIds: [item.id], message: `${item.name} is taller than the room`})
      }
      this.cache.set(item, {room, issues})
      return issues
    })
  }
}

const MAX_INCREMENTAL_CHANGE_RATIO = 0.25

function pairKey(first: string, second: string): string {
  return first < second ? `${first}|${second}` : `${second}|${first}`
}

function collisionIssue(first: FurnitureItem, second: FurnitureItem): ValidationIssue {
  return {
    type: 'collision',
    itemIds: [first.id, second.id],
    message: `${first.name} intersects ${second.name}`,
  }
}

function sortByPairOrder(issues: ValidationIssue[], order: ReadonlyMap<string, number>): ValidationIssue[] {
  const positionOf = (issue: ValidationIssue, slot: number): number =>
    order.get(issue.itemIds[slot] ?? '') ?? Number.MAX_SAFE_INTEGER

  return issues.sort(
    (first, second) => positionOf(first, 0) - positionOf(second, 0) || positionOf(first, 1) - positionOf(second, 1),
  )
}

export class CollisionRule implements PlacementRule {
  private previousItems: readonly FurnitureItem[] | null = null
  private previousIssues: ValidationIssue[] = []

  validate(items: readonly FurnitureItem[]): ValidationIssue[] {
    if (this.previousItems === items) return this.previousIssues

    const changed = this.changedSincePrevious(items)
    const order = new Map(items.map((item, index) => [item.id, index]))
    const issues = changed ? this.revalidateChanged(items, changed, order) : this.validateEveryPair(items, order)

    this.previousItems = items
    this.previousIssues = issues
    return issues
  }

  private changedSincePrevious(items: readonly FurnitureItem[]): FurnitureItem[] | null {
    const previous = this.previousItems
    if (!previous || previous.length !== items.length) return null

    const limit = Math.max(1, Math.floor(items.length * MAX_INCREMENTAL_CHANGE_RATIO))
    const changed: FurnitureItem[] = []
    for (const [index, item] of items.entries()) {
      const before = previous[index]
      if (!before || before.id !== item.id) return null
      if (before === item) continue
      changed.push(item)
      if (changed.length > limit) return null
    }
    return changed
  }

  private validateEveryPair(items: readonly FurnitureItem[], order: ReadonlyMap<string, number>): ValidationIssue[] {
    const issues: ValidationIssue[] = []
    for (let index = 0; index < items.length; index += 1) {
      const first = items[index]
      if (!first) continue
      for (let other = index + 1; other < items.length; other += 1) {
        const second = items[other]
        if (second && furnitureItemsIntersect3D(first, second)) {
          issues.push(collisionIssue(first, second))
        }
      }
    }
    return sortByPairOrder(issues, order)
  }

  private revalidateChanged(
    items: readonly FurnitureItem[],
    changed: readonly FurnitureItem[],
    order: ReadonlyMap<string, number>,
  ): ValidationIssue[] {
    const changedIds = new Set(changed.map((item) => item.id))
    const issues = this.previousIssues.filter((issue) => !issue.itemIds.some((id) => changedIds.has(id)))

    const checked = new Set<string>()
    for (const item of changed) {
      for (const other of items) {
        if (other.id === item.id) continue
        const key = pairKey(item.id, other.id)
        if (checked.has(key)) continue
        checked.add(key)
        if (!furnitureItemsIntersect3D(item, other)) continue
        const itemIsEarlier = (order.get(item.id) ?? 0) < (order.get(other.id) ?? 0)
        issues.push(itemIsEarlier ? collisionIssue(item, other) : collisionIssue(other, item))
      }
    }
    return sortByPairOrder(issues, order)
  }
}

export class OpeningRule implements PlacementRule {
  private previousRooms: readonly RoomDefinition[] | null = null
  private previousOpenings: readonly WallOpening[] | null = null
  private previousIssues: ValidationIssue[] = []

  validate(
    _items: readonly FurnitureItem[],
    rooms: readonly RoomDefinition[],
    openings: readonly WallOpening[] = [],
  ): ValidationIssue[] {
    if (this.previousRooms === rooms && this.previousOpenings === openings) return this.previousIssues

    const issues: ValidationIssue[] = []
    for (const room of rooms) {
      const roomOpenings = openings
        .filter((opening) => opening.roomId === room.id)
        .map((opening) => clampOpeningToWall(opening, room))
      for (const [firstIndex, first] of roomOpenings.entries()) {
        for (let other = firstIndex + 1; other < roomOpenings.length; other += 1) {
          const second = roomOpenings[other]
          if (!second || !openingsOverlap(first, second, room)) continue
          issues.push({
            type: 'opening-overlap',
            itemIds: [first.id, second.id],
            message: `${first.kind} overlaps another opening on wall ${first.wallIndex + 1}`,
          })
        }
      }
    }

    this.previousRooms = rooms
    this.previousOpenings = openings
    this.previousIssues = issues
    return issues
  }
}

interface RoomWallOpenings {
  roomsById: ReadonlyMap<string, RoomDefinition>
  openingsByRoom: ReadonlyMap<string, readonly WallOpening[]>
}

export class OpeningObstructionRule implements PlacementRule {
  private previousItems: readonly FurnitureItem[] | null = null
  private previousRooms: readonly RoomDefinition[] | null = null
  private previousOpenings: readonly WallOpening[] | null = null
  private previousIssues: ValidationIssue[] = []
  private layoutRooms: readonly RoomDefinition[] | null = null
  private layoutOpenings: readonly WallOpening[] | null = null
  private layout: RoomWallOpenings = {roomsById: new Map(), openingsByRoom: new Map()}

  validate(
    items: readonly FurnitureItem[],
    rooms: readonly RoomDefinition[],
    openings: readonly WallOpening[] = [],
  ): ValidationIssue[] {
    if (this.previousItems === items && this.previousRooms === rooms && this.previousOpenings === openings) {
      return this.previousIssues
    }

    const {roomsById, openingsByRoom} = this.resolveLayout(rooms, openings)
    const issues: ValidationIssue[] = []
    for (const item of items) {
      const room = roomsById.get(item.roomId)
      if (!room) continue
      for (const opening of openingsByRoom.get(item.roomId) ?? []) {
        if (!itemObstructsOpening(item, opening, room)) continue
        issues.push({
          type: 'opening-blocked',
          itemIds: [item.id, opening.id],
          message: `${item.name} blocks the ${opening.kind}`,
        })
      }
    }

    this.previousItems = items
    this.previousRooms = rooms
    this.previousOpenings = openings
    this.previousIssues = issues
    return issues
  }

  private resolveLayout(rooms: readonly RoomDefinition[], openings: readonly WallOpening[]): RoomWallOpenings {
    if (this.layoutRooms === rooms && this.layoutOpenings === openings) return this.layout

    this.layout = {
      roomsById: new Map(rooms.map((room) => [room.id, room])),
      openingsByRoom: new Map(rooms.map((room) => [room.id, collectRoomWallOpenings(room, rooms, openings)])),
    }
    this.layoutRooms = rooms
    this.layoutOpenings = openings
    return this.layout
  }
}

export class PlacementValidator {
  constructor(private readonly rules: PlacementRule[]) {
  }

  validate(
    items: readonly FurnitureItem[],
    rooms: readonly RoomDefinition[],
    openings: readonly WallOpening[] = [],
  ): ValidationIssue[] {
    return this.rules.flatMap((rule) => rule.validate(items, rooms, openings))
  }
}
