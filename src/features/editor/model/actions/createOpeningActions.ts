import type { OpeningKind, WallOpening } from '@entities/scene'
import {
  addOpening as addOpeningCommand,
  patchOpening,
  removeOpening as removeOpeningCommand,
} from '../commands/openingCommands'
import type { SceneUpdateMode } from '../session/SceneSession'
import type { EditorActionContext } from './context'

export function createOpeningActions({ store, idGenerator }: EditorActionContext) {
  return {
    addOpening(kind: OpeningKind): void {
      const result = addOpeningCommand(store.state.scene, store.state.activeRoomId, kind, idGenerator.next())
      store.replaceScene(result.scene, 'commit')
      if (result.selectedOpeningId) {
        store.patch({ selection: { type: 'opening', id: result.selectedOpeningId } })
      }
      if (result.notice) store.notify(result.notice)
    },

    updateOpening(id: string, patch: Partial<WallOpening>, mode: SceneUpdateMode = 'commit'): void {
      store.replaceScene(patchOpening(store.state.scene, id, patch), mode)
    },

    removeOpening(id: string): void {
      store.replaceScene(removeOpeningCommand(store.state.scene, id), 'commit')
      store.patch({ selection: { type: 'room', id: store.state.activeRoomId } })
    },
  }
}
