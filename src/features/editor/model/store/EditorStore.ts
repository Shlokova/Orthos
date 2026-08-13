import type { SceneState } from '@entities/scene'
import type { EditorProjector } from '../EditorProjector'
import type { EditorModelState, EditorSnapshot } from '../EditorState'
import { restoreActiveRoomId, restoreSelection } from '../selection'
import type { SceneSession, SceneUpdateMode } from '../session/SceneSession'

type Listener = () => void

function patchChangesModel(model: EditorModelState, patch: Partial<EditorModelState>): boolean {
  return (Object.keys(patch) as (keyof EditorModelState)[]).some((key) => !Object.is(model[key], patch[key]))
}

export class EditorStore {
  private readonly listeners = new Set<Listener>()
  private noticeSequence = 0
  private model: EditorModelState
  private snapshot: EditorSnapshot

  constructor(
    initialState: EditorModelState,
    private readonly session: SceneSession,
    private readonly projector: EditorProjector,
  ) {
    this.model = initialState
    this.snapshot = this.buildSnapshot()
  }

  get state(): EditorModelState {
    return this.model
  }

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  readonly getSnapshot = (): EditorSnapshot => this.snapshot

  patch(patch: Partial<EditorModelState>): boolean {
    const normalized =
      patch.activeRoomId === undefined
        ? patch
        : { ...patch, activeRoomId: restoreActiveRoomId(patch.activeRoomId, patch.scene ?? this.model.scene) }
    if (!patchChangesModel(this.model, normalized)) return false
    this.model = { ...this.model, ...normalized }
    this.refresh()
    return true
  }

  notify(message: string): void {
    this.noticeSequence += 1
    this.patch({ editorNotice: { id: this.noticeSequence, message } })
  }

  replaceScene(nextScene: SceneState, mode: SceneUpdateMode): boolean {
    const scene = this.session.apply(this.model.scene, nextScene, mode)
    if (!scene) return false

    const activeRoomId = restoreActiveRoomId(this.model.activeRoomId, scene)
    this.model = {
      ...this.model,
      scene,
      activeRoomId,
      selection: restoreSelection(this.model.selection, scene, activeRoomId),
    }
    this.refresh()
    return true
  }

  restoreScene(scene: SceneState, patch: Partial<EditorModelState> = {}): void {
    const activeRoomId = restoreActiveRoomId(this.model.activeRoomId, scene)
    this.model = {
      ...this.model,
      scene,
      activeRoomId,
      selection: restoreSelection(this.model.selection, scene, activeRoomId),
      ...patch,
    }
    this.refresh()
  }

  refresh(): void {
    this.snapshot = this.buildSnapshot()
    for (const listener of this.listeners) listener()
  }

  dispose(): void {
    this.listeners.clear()
  }

  private buildSnapshot(): EditorSnapshot {
    return {
      ...this.model,
      ...this.projector.project(this.model),
      canUndo: this.session.canUndo,
      canRedo: this.session.canRedo,
    }
  }
}
