import type { SceneState } from '@entities/scene'
import type { SceneCodec } from '../../model/ports/SceneCodec'
import { deserializeScene, isSceneState, serializeScene } from './SceneSerializer'
import { assertUniqueIds } from './sceneGuards'

export class JsonSceneCodec implements SceneCodec {
  isValid(scene: SceneState): boolean {
    if (!isSceneState(scene)) return false
    try {
      assertUniqueIds(scene)
      return true
    } catch {
      return false
    }
  }

  serialize(scene: SceneState): string {
    return serializeScene(scene)
  }

  deserialize(json: string): SceneState {
    return deserializeScene(json)
  }
}
