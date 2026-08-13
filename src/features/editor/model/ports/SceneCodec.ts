import type { SceneState } from '@entities/scene'

export interface SceneCodec {
  isValid(scene: SceneState): boolean
  serialize(scene: SceneState): string
  deserialize(json: string): SceneState
}
