import type { SceneState } from '@entities/scene'
import type { IdGenerator } from '../ports/IdGenerator'
import type { SceneCodec } from '../ports/SceneCodec'
import type { SceneSession } from '../session/SceneSession'
import type { EditorStore } from '../store/EditorStore'

export interface EditorActionContext {
  store: EditorStore
  session: SceneSession
  codec: SceneCodec
  idGenerator: IdGenerator
  defaultScene: SceneState
}
