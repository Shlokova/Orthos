import type { SceneState } from '@entities/scene'
import type { SceneRepository } from '../../model/ports/SceneRepository'
import { deserializeScene, SCENE_VERSION, serializeScene } from './SceneSerializer'

const STORAGE_KEY = `orthos:scene:v${SCENE_VERSION}`

export class BrowserSceneRepository implements SceneRepository {
  private readonly failureListeners = new Set<(error: unknown) => void>()

  constructor(private readonly storage: Storage) {}

  load(): SceneState | null {
    const raw = this.read()
    if (!raw) return null
    try {
      return deserializeScene(raw)
    } catch {
      this.remove()
      return null
    }
  }

  save(scene: SceneState): void {
    this.storage.setItem(STORAGE_KEY, serializeScene(scene))
  }

  flush(): void {}

  onFailure(listener: (error: unknown) => void): void {
    this.failureListeners.add(listener)
  }

  dispose(): void {
    this.failureListeners.clear()
  }

  private read(): string | null {
    try {
      return this.storage.getItem(STORAGE_KEY)
    } catch (error) {
      this.reportFailure(error)
      return null
    }
  }

  private remove(): void {
    try {
      this.storage.removeItem(STORAGE_KEY)
    } catch (error) {
      this.reportFailure(error)
    }
  }

  private reportFailure(error: unknown): void {
    for (const listener of this.failureListeners) listener(error)
  }
}
