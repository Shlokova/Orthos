import type { SceneState } from '@entities/scene'
import type { Selection } from '../editorTypes'

function canKeepSelection(selection: Selection, scene: SceneState): boolean {
  if (!selection) return true
  if (selection.type === 'item') return scene.items.some((item) => item.id === selection.id)
  if (selection.type === 'opening') return scene.openings.some((opening) => opening.id === selection.id)
  return scene.rooms.some((room) => room.id === selection.id)
}

export function restoreActiveRoomId(activeRoomId: string, scene: SceneState): string {
  if (scene.rooms.some((room) => room.id === activeRoomId)) return activeRoomId
  return scene.rooms[0]?.id ?? activeRoomId
}

export function restoreSelection(selection: Selection, scene: SceneState, activeRoomId: string): Selection {
  return canKeepSelection(selection, scene) ? selection : { type: 'room', id: activeRoomId }
}
