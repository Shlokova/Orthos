import type { FurnitureItem, RoomDefinition, SceneState, ValidationIssue, Vec2, WallOpening } from '@entities/scene'
import type { RoomEditTool, Selection, ViewMode, WallDisplayMode } from './editorTypes'

export interface RoomDrawingDraft {
  readonly vertices: readonly Vec2[]
  readonly pointer: Vec2 | null
}

interface EditorNotice {
  readonly id: number
  readonly message: string
}

export interface EditorModelState {
  scene: SceneState
  activeRoomId: string
  selection: Selection
  viewMode: ViewMode
  wallDisplayMode: WallDisplayMode
  roomEditTool: RoomEditTool
  heatmapVisible: boolean
  editorNotice: EditorNotice | null
  isTransacting: boolean
  roomDrawing: RoomDrawingDraft | null
}

export interface EditorProjection {
  rooms: readonly RoomDefinition[]
  room: RoomDefinition
  items: readonly FurnitureItem[]
  openings: readonly WallOpening[]
  selectedId: string | null
  selectedOpeningId: string | null
  issues: readonly ValidationIssue[]
  invalidIds: ReadonlySet<string>
}

export interface EditorSnapshot extends EditorModelState, EditorProjection {
  canUndo: boolean
  canRedo: boolean
}
