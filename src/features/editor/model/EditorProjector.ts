import type { EditorModelState, EditorProjection } from './EditorState'
import type { PlacementValidator } from './validation/PlacementValidator'

type SceneProjection = Omit<EditorProjection, 'selectedId' | 'selectedOpeningId'>

export class EditorProjector {
  private previousScene: EditorModelState['scene'] | null = null
  private previousActiveRoomId: string | null = null
  private previousProjection: SceneProjection | null = null

  constructor(private readonly validator: PlacementValidator) {}

  project(state: EditorModelState): EditorProjection {
    const sceneProjection = this.projectScene(state)
    return {
      ...sceneProjection,
      selectedId: state.selection?.type === 'item' ? state.selection.id : null,
      selectedOpeningId: state.selection?.type === 'opening' ? state.selection.id : null,
    }
  }

  private projectScene(state: EditorModelState): SceneProjection {
    if (
      this.previousProjection &&
      this.previousScene === state.scene &&
      this.previousActiveRoomId === state.activeRoomId
    )
      return this.previousProjection

    const { rooms, items, openings } = state.scene
    const room = rooms.find((candidate) => candidate.id === state.activeRoomId) ?? rooms[0]
    if (!room) throw new Error('Editor scene must contain at least one room')
    const issues = this.validator.validate(items, rooms, openings)
    const invalidIds: ReadonlySet<string> = new Set(issues.flatMap((issue) => issue.itemIds))

    const projection: SceneProjection = {
      rooms,
      room,
      items,
      openings,
      issues,
      invalidIds,
    }

    this.previousScene = state.scene
    this.previousActiveRoomId = state.activeRoomId
    this.previousProjection = projection
    return projection
  }
}
