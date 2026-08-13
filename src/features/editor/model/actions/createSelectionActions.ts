import type { EditorActionContext } from './context'

export function createSelectionActions({ store }: EditorActionContext) {
  return {
    select(id: string | null): void {
      if (!id) {
        store.patch({ selection: null })
        return
      }
      const item = store.state.scene.items.find((candidate) => candidate.id === id)
      if (!item) return
      store.patch({ activeRoomId: item.roomId, selection: { type: 'item', id } })
    },

    selectRoom(id: string): void {
      if (!store.state.scene.rooms.some((room) => room.id === id)) return
      store.patch({ activeRoomId: id, selection: { type: 'room', id } })
    },

    selectOpening(id: string | null): void {
      if (!id) {
        store.patch({ selection: null })
        return
      }
      const opening = store.state.scene.openings.find((candidate) => candidate.id === id)
      if (!opening) return
      store.patch({ activeRoomId: opening.roomId, selection: { type: 'opening', id } })
    },

    showEditorNotice(message: string): void {
      store.notify(message)
    },

    clearEditorNotice(): void {
      store.patch({ editorNotice: null })
    },
  }
}
