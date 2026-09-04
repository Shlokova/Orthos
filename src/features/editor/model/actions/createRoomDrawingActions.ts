import type { Vec2 } from '@entities/scene'
import { addDrawnRoom } from '../commands/roomCommands'
import {
  addRoomDrawingPoint as addPointToDraft,
  createRoomDrawingDraft,
  previewRoomDrawing as previewDraftPointer,
  undoRoomDrawingPoint as undoDraftPoint,
} from '../room-drawing/RoomDrawingSession'
import type { EditorActionContext } from './context'

export function createRoomDrawingActions({ store, idGenerator }: EditorActionContext) {
  const finishRoomDrawing = (): void => {
    const draft = store.state.roomDrawing
    if (!draft) return
    if (draft.vertices.length < 3) {
      store.notify('Place at least three corners before finishing the room.')
      return
    }

    const roomId = idGenerator.next()
    const result = addDrawnRoom(store.state.scene, draft.vertices, roomId)
    if (result.notice) {
      store.notify(result.notice)
      return
    }

    store.replaceScene(result.scene, 'commit')
    store.patch({
      activeRoomId: roomId,
      roomDrawing: null,
      roomEditTool: 'transform',
      selection: { type: 'room', id: roomId },
    })
    store.notify('Room created.')
  }

  return {
    beginRoomDrawing(): void {
      store.patch({ viewMode: 'top', roomEditTool: 'corners', selection: null, roomDrawing: createRoomDrawingDraft() })
      store.notify('Click to place wall corners. Return to the first point or press Enter to finish.')
    },

    previewRoomDrawing(point: Vec2): void {
      const draft = store.state.roomDrawing
      if (!draft) return
      store.patch({ roomDrawing: previewDraftPointer(draft, point, store.state.scene.rooms) })
    },

    addRoomDrawingPoint(point: Vec2): void {
      const draft = store.state.roomDrawing
      if (!draft) return
      const update = addPointToDraft(draft, point, store.state.scene.rooms)
      if (update.shouldFinish) {
        finishRoomDrawing()
        return
      }
      store.patch({ roomDrawing: update.draft })
      if (update.notice) store.notify(update.notice)
    },

    undoRoomDrawingPoint(): void {
      const draft = store.state.roomDrawing
      if (!draft) return
      const roomDrawing = undoDraftPoint(draft)
      store.patch({ roomDrawing })
      store.notify(roomDrawing.vertices.length ? 'Last corner removed.' : 'Place the first room corner.')
    },

    finishRoomDrawing,

    cancelRoomDrawing(): void {
      if (!store.state.roomDrawing) return
      store.patch({ roomDrawing: null, roomEditTool: 'transform' })
      store.notify('Room drawing cancelled.')
    },
  }
}
