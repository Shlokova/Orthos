import type { SceneState } from '@entities/scene'
import { cloneSceneState } from './sceneClone'
import { SCENE_VERSION, type SceneDocument } from './sceneDocument'
import { assertUniqueIds, isRecord, isSceneState } from './sceneGuards'

export { SCENE_VERSION } from './sceneDocument'
export { isSceneState } from './sceneGuards'

export function serializeScene(scene: SceneState): string {
  if (!isSceneState(scene)) throw new Error('Invalid scene: cannot serialize an invalid document')
  assertUniqueIds(scene)
  const document: SceneDocument = { version: SCENE_VERSION, ...scene }
  return JSON.stringify(document, null, 2)
}

export function deserializeScene(json: string): SceneState {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid scene: malformed JSON')
  }
  if (!isRecord(parsed)) throw new Error('Invalid scene: root must be an object')

  if (parsed.version !== SCENE_VERSION) throw new Error(`Unsupported scene version: ${String(parsed.version)}`)
  const candidate = { rooms: parsed.rooms, items: parsed.items, openings: parsed.openings }
  if (!isSceneState(candidate)) throw new Error('Invalid scene: floor-plan entities are missing or invalid')
  assertUniqueIds(candidate)
  return cloneSceneState(candidate)
}
