import type { RoomEditTool, ViewMode, WallDisplayMode } from '../editorTypes'
import type { EditorActionContext } from './context'

export function createViewActions({ store }: EditorActionContext) {
  return {
    setViewMode(viewMode: ViewMode): void {
      store.patch({
        viewMode,
        roomDrawing: viewMode === 'perspective' ? null : store.state.roomDrawing,
      })
    },

    setWallDisplayMode(wallDisplayMode: WallDisplayMode): void {
      store.patch({ wallDisplayMode })
    },

    setRoomEditTool(roomEditTool: RoomEditTool): void {
      store.patch({ roomEditTool })
    },

    setHeatmapVisible(heatmapVisible: boolean): void {
      store.patch({ heatmapVisible })
    },

    setDimensionsVisible(dimensionsVisible: boolean): void {
      store.patch({ dimensionsVisible })
    },
  }
}
