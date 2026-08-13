import { FurnitureFactory, type FurnitureItem, type FurnitureKind } from '@entities/scene'
import {
  addItem as addItemCommand,
  duplicateItem as duplicateItemCommand,
  patchItem,
  removeItem as removeItemCommand,
} from '../commands/itemCommands'
import type { SceneUpdateMode } from '../session/SceneSession'
import type { EditorActionContext } from './context'

export function createItemActions({ store, idGenerator }: EditorActionContext) {
  const factory = new FurnitureFactory(() => idGenerator.next())

  const findItem = (id: string): FurnitureItem | undefined =>
    store.state.scene.items.find((candidate) => candidate.id === id)

  const focusItem = (id: string): void => {
    const item = findItem(id)
    if (!item) return
    store.patch({ activeRoomId: item.roomId, selection: { type: 'item', id } })
  }

  const syncActiveRoom = (id: string): void => {
    const item = findItem(id)
    if (item) store.patch({ activeRoomId: item.roomId })
  }

  return {
    addItem(kind: FurnitureKind): void {
      const result = addItemCommand(store.state.scene, store.state.activeRoomId, kind, factory)
      store.replaceScene(result.scene, 'commit')
      if (result.selectedItemId) focusItem(result.selectedItemId)
      if (result.notice) store.notify(result.notice)
    },

    updateItem(id: string, patch: Partial<FurnitureItem>, mode: SceneUpdateMode = 'commit'): void {
      if (store.replaceScene(patchItem(store.state.scene, id, patch), mode)) syncActiveRoom(id)
    },

    removeItem(id: string): void {
      store.replaceScene(removeItemCommand(store.state.scene, id), 'commit')
      const { selection, activeRoomId } = store.state
      if (selection?.type === 'item' && selection.id === id) {
        store.patch({ selection: { type: 'room', id: activeRoomId } })
      }
    },

    duplicateItem(id: string): void {
      const result = duplicateItemCommand(store.state.scene, id, () => idGenerator.next())
      store.replaceScene(result.scene, 'commit')
      if (result.selectedItemId) focusItem(result.selectedItemId)
      if (result.notice) store.notify(result.notice)
    },
  }
}
