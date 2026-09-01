import { DEFAULT_SCENE } from '../model/defaultScene'
import { EditorController } from '../model/EditorController'
import { EditorProjector } from '../model/EditorProjector'
import type { SceneRepository } from '../model/ports/SceneRepository'
import {
  BoundsRule,
  CollisionRule,
  OpeningObstructionRule,
  OpeningRule,
  PlacementValidator,
} from '../model/validation/PlacementValidator'
import { BrowserIdGenerator } from './BrowserIdGenerator'
import { BrowserSceneRepository, DebouncedSceneRepository, JsonSceneCodec, MemorySceneRepository } from './persistence'

function createRepository(): SceneRepository {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return new MemorySceneRepository()
    return new DebouncedSceneRepository(new BrowserSceneRepository(window.localStorage))
  } catch {
    return new MemorySceneRepository()
  }
}

export function createEditorRuntime(): EditorController {
  const projector = new EditorProjector(
    new PlacementValidator([new BoundsRule(), new CollisionRule(), new OpeningRule(), new OpeningObstructionRule()]),
  )

  return new EditorController({
    repository: createRepository(),
    codec: new JsonSceneCodec(),
    idGenerator: new BrowserIdGenerator(),
    projector,
    defaultScene: DEFAULT_SCENE,
  })
}
