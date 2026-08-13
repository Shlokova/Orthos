import type { RoomResizeHandle, Vec2 } from '@entities/scene'
import {
  addRoom as addRoomCommand,
  deleteRoomVertex,
  insertRoomVertex,
  moveRoom as moveRoomCommand,
  patchRoom,
  patchRoomVertex,
  type RoomCommandResult,
  type RoomPatch,
  removeRoom as removeRoomCommand,
  replaceRoomShape,
  resizeRoom as resizeRoomCommand,
  resizeRoomFromHandle,
} from '../commands/roomCommands'
import type { RoomShape } from '../editorTypes'
import type { SceneUpdateMode } from '../session/SceneSession'
import type { EditorActionContext } from './context'

export function createRoomActions({ store, idGenerator }: EditorActionContext) {
  const activeRoomId = () => store.state.activeRoomId

  const apply = (result: RoomCommandResult, mode: SceneUpdateMode = 'commit'): boolean => {
    const applied = store.replaceScene(result.scene, mode)
    if (result.notice) store.notify(result.notice)
    return applied
  }

  return {
    addRoom(shape: RoomShape): void {
      const roomId = idGenerator.next()
      if (!apply(addRoomCommand(store.state.scene, shape, roomId))) return
      store.patch({ activeRoomId: roomId, selection: { type: 'room', id: roomId } })
    },

    removeRoom(id: string): void {
      if (!apply(removeRoomCommand(store.state.scene, id))) return
      const firstRoom = store.state.scene.rooms[0]
      if (!firstRoom) return
      const nextRoomId = store.state.scene.rooms.some((room) => room.id === activeRoomId())
        ? activeRoomId()
        : firstRoom.id
      store.patch({ activeRoomId: nextRoomId, selection: { type: 'room', id: nextRoomId } })
    },

    updateRoom(patch: RoomPatch, mode: SceneUpdateMode = 'commit'): void {
      apply(patchRoom(store.state.scene, activeRoomId(), patch), mode)
    },

    resizeRoom(width: number, depth: number, mode: SceneUpdateMode = 'commit'): void {
      apply(resizeRoomCommand(store.state.scene, activeRoomId(), width, depth), mode)
    },

    resizeRoomHandle(handle: RoomResizeHandle, point: Vec2, mode: SceneUpdateMode = 'commit'): void {
      apply(resizeRoomFromHandle(store.state.scene, activeRoomId(), handle, point), mode)
    },

    moveRoom(center: Vec2, mode: SceneUpdateMode = 'commit'): void {
      apply(moveRoomCommand(store.state.scene, activeRoomId(), center), mode)
    },

    setRoomShape(shape: RoomShape): void {
      apply(replaceRoomShape(store.state.scene, activeRoomId(), shape))
    },

    updateVertex(index: number, vertex: Vec2, mode: SceneUpdateMode = 'commit'): void {
      apply(patchRoomVertex(store.state.scene, activeRoomId(), index, vertex), mode)
    },

    insertVertex(wallIndex: number): void {
      apply(insertRoomVertex(store.state.scene, activeRoomId(), wallIndex))
    },

    deleteVertex(index: number): void {
      apply(deleteRoomVertex(store.state.scene, activeRoomId(), index))
    },
  }
}
