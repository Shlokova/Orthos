import type { SceneState } from '@entities/scene'

export interface SceneRepository {
  load(): SceneState | null
  save(scene: SceneState): void

  flush(): void

  onFailure(listener: (error: unknown) => void): void

  dispose(): void
}
