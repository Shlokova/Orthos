import type { NudgeDirection, NudgeStep } from '../editorTypes'
import { nudgeSelection as nudgeScene, rotateSelection as rotateScene } from '../selection/selectionTransforms'
import type { SceneUpdateMode } from '../session/SceneSession'
import type { EditorActionContext } from './context'

export function createInteractionActions({ store, session }: EditorActionContext) {
  const syncActiveRoomToSelection = (): void => {
    const { selection, scene } = store.state
    if (selection?.type === 'room') {
      store.patch({ activeRoomId: selection.id })
      return
    }
    if (selection?.type === 'item') {
      const item = scene.items.find((candidate) => candidate.id === selection.id)
      if (item) store.patch({ activeRoomId: item.roomId })
      return
    }
    if (selection?.type === 'opening') {
      const opening = scene.openings.find((candidate) => candidate.id === selection.id)
      if (opening) store.patch({ activeRoomId: opening.roomId })
    }
  }

  return {
    nudgeSelection(direction: NudgeDirection, step: NudgeStep = 'coarse', mode: SceneUpdateMode = 'commit'): void {
      const { scene, selection } = store.state
      if (store.replaceScene(nudgeScene(scene, selection, direction, step), mode)) {
        syncActiveRoomToSelection()
      }
    },

    rotateSelection(deltaRadians: number, mode: SceneUpdateMode = 'commit'): void {
      const { scene, selection } = store.state
      if (store.replaceScene(rotateScene(scene, selection, deltaRadians), mode)) {
        syncActiveRoomToSelection()
      }
    },

    beginTransaction(): boolean {
      if (!session.beginTransaction(store.state.scene)) return false
      store.patch({ isTransacting: true })
      return true
    },

    endTransaction(): void {
      const scene = session.endTransaction(store.state.scene)
      if (scene) store.restoreScene(scene, { isTransacting: false })
      else store.patch({ isTransacting: false })
    },

    cancelTransaction(): void {
      const scene = session.cancelTransaction()
      if (scene) store.restoreScene(scene, { isTransacting: false })
      else store.patch({ isTransacting: false })
    },

    undo(): void {
      const scene = session.undo(store.state.scene)
      if (scene) store.restoreScene(scene)
    },

    redo(): void {
      const scene = session.redo(store.state.scene)
      if (scene) store.restoreScene(scene)
    },
  }
}
