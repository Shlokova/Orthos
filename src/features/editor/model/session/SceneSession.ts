import type { SceneState } from '@entities/scene'
import { scenesEqual } from '@entities/scene'
import { SnapshotHistory } from '@shared/lib'
import type { SceneCodec } from '../ports/SceneCodec'
import type { SceneRepository } from '../ports/SceneRepository'

export type SceneUpdateMode = 'commit' | 'preview'

export class SceneSession {
  private readonly history: SnapshotHistory<SceneState>
  private transactionBase: SceneState | null = null

  constructor(
    private readonly repository: SceneRepository,
    private readonly codec: SceneCodec,
  ) {
    this.history = new SnapshotHistory<SceneState>()
  }

  get canUndo(): boolean {
    return this.history.canUndo
  }
  get canRedo(): boolean {
    return this.history.canRedo
  }
  get isInTransaction(): boolean {
    return this.transactionBase !== null
  }

  flush(): void {
    this.repository.flush?.()
  }

  dispose(): void {
    this.repository.dispose()
  }

  load(fallback: SceneState): SceneState {
    return this.repository.load() ?? fallback
  }

  apply(current: SceneState, next: SceneState, mode: SceneUpdateMode): SceneState | null {
    if (scenesEqual(current, next) || !this.codec.isValid(next)) return null
    if (mode === 'preview') {
      if (!this.transactionBase) {
        console.warn('Orthos: a preview update outside a transaction is never persisted')
      }
      return next
    }

    if (this.transactionBase) return next
    this.history.record(current)
    this.repository.save(next)
    return next
  }

  beginTransaction(scene: SceneState): boolean {
    if (this.transactionBase) return false
    this.transactionBase = scene
    return true
  }

  endTransaction(scene: SceneState): SceneState | null {
    const base = this.transactionBase
    if (!base) return null
    this.transactionBase = null

    if (!this.codec.isValid(scene)) {
      this.repository.save(base)
      return base
    }
    if (scenesEqual(base, scene)) return null

    this.history.record(base)
    this.repository.save(scene)
    return null
  }

  cancelTransaction(): SceneState | null {
    const base = this.transactionBase
    if (!base) return null
    this.transactionBase = null
    this.repository.save(base)
    return base
  }

  undo(current: SceneState): SceneState | null {
    return this.transactionBase ? null : this.restore(this.history.undo(current))
  }

  redo(current: SceneState): SceneState | null {
    return this.transactionBase ? null : this.restore(this.history.redo(current))
  }

  private restore(scene: SceneState | null): SceneState | null {
    if (!scene || !this.codec.isValid(scene)) return null
    this.repository.save(scene)
    return scene
  }
}
