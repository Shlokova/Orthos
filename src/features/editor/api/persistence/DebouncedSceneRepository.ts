import type { SceneState } from '@entities/scene'
import type { SceneRepository } from '../../model/ports/SceneRepository'

export class DebouncedSceneRepository implements SceneRepository {
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private pendingScene: SceneState | null = null
  private readonly failureListeners = new Set<(error: unknown) => void>()

  constructor(
    private readonly repository: SceneRepository,
    private readonly delayMs = 250,
  ) {
    this.repository.onFailure((error) => this.reportFailure(error))
  }

  load(): SceneState | null {
    return this.repository.load()
  }

  save(scene: SceneState): void {
    this.pendingScene = scene
    this.clearTimer()
    this.timeoutId = setTimeout(() => this.flush(), this.delayMs)
  }

  onFailure(listener: (error: unknown) => void): void {
    this.failureListeners.add(listener)
  }

  dispose(): void {
    this.clearTimer()
    this.flush()
    this.failureListeners.clear()
    this.repository.dispose()
  }

  flush(): void {
    this.clearTimer()
    const scene = this.pendingScene
    if (!scene) return
    this.pendingScene = null
    try {
      this.repository.save(scene)
    } catch (error) {
      this.pendingScene = scene
      this.reportFailure(error)
    }
  }

  private clearTimer(): void {
    if (this.timeoutId !== null) clearTimeout(this.timeoutId)
    this.timeoutId = null
  }

  private reportFailure(error: unknown): void {
    console.warn('Orthos autosave is unavailable', error)
    for (const listener of this.failureListeners) listener(error)
  }
}
