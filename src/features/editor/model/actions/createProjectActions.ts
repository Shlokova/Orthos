import type { SceneState } from '@entities/scene'
import type { EditorActionContext } from './context'

export function createProjectActions({ store, codec, defaultScene }: EditorActionContext) {
  const loadScene = (scene: SceneState): void => {
    if (!store.replaceScene(scene, 'commit')) return
    const activeRoom = store.state.scene.rooms[0]
    if (!activeRoom) return
    store.patch({
      activeRoomId: activeRoom.id,
      selection: { type: 'room', id: activeRoom.id },
      roomDrawing: null,
      heatmapVisible: false,
    })
  }

  return {
    resetScene(): void {
      loadScene(defaultScene)
    },

    exportScene(): string {
      return codec.serialize(store.state.scene)
    },

    importScene(json: string): void {
      loadScene(codec.deserialize(json))
    },
  }
}
