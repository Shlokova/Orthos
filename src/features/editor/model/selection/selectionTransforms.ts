import { getRoomBounds, getWallSegment, type SceneState } from '@entities/scene'
import { snap } from '@shared/lib'
import { patchItem } from '../commands/itemCommands'
import { patchOpening } from '../commands/openingCommands'
import { moveRoom } from '../commands/roomCommands'
import type { NudgeDirection, NudgeStep, Selection } from '../editorTypes'

export function nudgeSelection(
  scene: SceneState,
  selection: Selection,
  direction: NudgeDirection,
  nudgeStep: NudgeStep = 'coarse',
): SceneState {
  if (!selection) return scene
  const step = nudgeStep === 'fine' ? 0.05 : 0.25
  const dx = direction === 'west' ? -step : direction === 'east' ? step : 0
  const dz = direction === 'north' ? -step : direction === 'south' ? step : 0

  if (selection.type === 'item') {
    const item = scene.items.find((candidate) => candidate.id === selection.id)
    if (!item) return scene
    return patchItem(scene, item.id, {
      position: {
        x: snap(item.position.x + dx, step),
        z: snap(item.position.z + dz, step),
      },
    })
  }

  if (selection.type === 'room') {
    const room = scene.rooms.find((candidate) => candidate.id === selection.id)
    if (!room) return scene
    const center = getRoomBounds(room).center
    return moveRoom(scene, room.id, { x: center.x + dx, z: center.z + dz }).scene
  }

  const opening = scene.openings.find((candidate) => candidate.id === selection.id)
  const room = opening && scene.rooms.find((candidate) => candidate.id === opening.roomId)
  if (!opening || !room) return scene
  const wall = getWallSegment(room, opening.wallIndex)
  const sign = direction === 'west' || direction === 'north' ? -1 : 1
  return patchOpening(scene, opening.id, {
    offset: opening.offset + (sign * step) / Math.max(0.5, wall.length),
  })
}

export function rotateSelection(scene: SceneState, selection: Selection, deltaRadians: number): SceneState {
  if (selection?.type !== 'item') return scene
  const item = scene.items.find((candidate) => candidate.id === selection.id)
  if (!item) return scene
  return patchItem(scene, item.id, { rotation: item.rotation + deltaRadians })
}
