import type { SceneState } from '@entities/scene'
import type { SceneRepository } from '../../model/ports/SceneRepository'

export class MemorySceneRepository implements SceneRepository {
  constructor(private scene: SceneState | null = null) {}

  load(): SceneState | null {
    return this.scene
  }

  save(scene: SceneState): void {
    this.scene = scene
  }

  flush(): void {}

  onFailure(): void {}

  dispose(): void {}
}
