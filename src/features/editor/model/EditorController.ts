import type { SceneState } from '@entities/scene'
import { createEditorActions, type EditorActions } from './actions'
import type { EditorProjector } from './EditorProjector'
import type { EditorModelState, EditorSnapshot } from './EditorState'
import type { IdGenerator } from './ports/IdGenerator'
import type { SceneCodec } from './ports/SceneCodec'
import type { SceneRepository } from './ports/SceneRepository'
import { SceneSession } from './session/SceneSession'
import { EditorStore } from './store/EditorStore'

interface EditorControllerDependencies {
  repository: SceneRepository
  codec: SceneCodec
  idGenerator: IdGenerator
  projector: EditorProjector
  defaultScene: SceneState
}

type Listener = () => void

export class EditorController {
  private readonly session: SceneSession
  private readonly store: EditorStore
  private disposed = false

  readonly actions: EditorActions

  constructor(dependencies: EditorControllerDependencies) {
    this.session = new SceneSession(dependencies.repository, dependencies.codec)
    const scene = this.session.load(dependencies.defaultScene)
    const activeRoom = scene.rooms[0]
    if (!activeRoom) throw new Error('Editor scene must contain at least one room')

    const initialState: EditorModelState = {
      scene,
      activeRoomId: activeRoom.id,
      selection: { type: 'room', id: activeRoom.id },
      viewMode: 'top',
      wallDisplayMode: 'far',
      roomEditTool: 'transform',
      heatmapVisible: false,
      dimensionsVisible: true,
      editorNotice: null,
      isTransacting: false,
      roomDrawing: null,
    }
    this.store = new EditorStore(initialState, this.session, dependencies.projector)
    this.actions = createEditorActions({
      store: this.store,
      session: this.session,
      codec: dependencies.codec,
      idGenerator: dependencies.idGenerator,
      defaultScene: dependencies.defaultScene,
    })

    dependencies.repository.onFailure(() => {
      if (this.disposed) return
      this.store.notify('Autosave is unavailable. Export your project to keep it.')
    })
  }

  readonly subscribe = (listener: Listener): (() => void) => this.store.subscribe(listener)

  readonly getSnapshot = (): EditorSnapshot => this.store.getSnapshot()

  flushPersistence(): void {
    if (!this.disposed) this.session.flush()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.session.dispose()
    this.store.dispose()
  }
}
