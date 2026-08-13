import type { SceneState } from '@entities/scene'

export const SCENE_VERSION = 6 as const

export interface SceneDocument extends SceneState {
  version: typeof SCENE_VERSION
}
