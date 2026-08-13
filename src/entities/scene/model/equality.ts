import { vec2Equal } from '@shared/lib'
import { furnitureItemsEqual } from './furniture/equality'
import type { RoomDefinition, SceneState, WallOpening } from './types'

function roomDefinitionsEqual(first: RoomDefinition, second: RoomDefinition): boolean {
  return (
    first === second ||
    (first.id === second.id &&
      first.name === second.name &&
      first.height === second.height &&
      first.vertices.length === second.vertices.length &&
      first.vertices.every((vertex, index) => {
        const other = second.vertices[index]
        return other !== undefined && vec2Equal(vertex, other)
      }))
  )
}

function wallOpeningsEqual(first: WallOpening, second: WallOpening): boolean {
  return (
    first === second ||
    (first.id === second.id &&
      first.roomId === second.roomId &&
      first.kind === second.kind &&
      first.wallIndex === second.wallIndex &&
      first.offset === second.offset &&
      first.width === second.width &&
      first.height === second.height &&
      first.sillHeight === second.sillHeight)
  )
}

function arraysEqual<T>(
  first: readonly T[],
  second: readonly T[],
  equals: (firstValue: T, secondValue: T) => boolean,
): boolean {
  if (first === second) return true
  return (
    first.length === second.length &&
    first.every((value, index) => {
      const other = second[index]
      return other !== undefined && equals(value, other)
    })
  )
}

export function scenesEqual(first: SceneState, second: SceneState): boolean {
  if (first === second) return true
  return (
    arraysEqual(first.rooms, second.rooms, roomDefinitionsEqual) &&
    arraysEqual(first.items, second.items, furnitureItemsEqual) &&
    arraysEqual(first.openings, second.openings, wallOpeningsEqual)
  )
}
