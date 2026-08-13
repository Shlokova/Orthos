import {
  MAX_SCENE_OPENINGS,
  type OpeningKind,
  placeOpeningWithoutOverlap,
  type SceneState,
  type WallOpening,
} from '@entities/scene'

interface OpeningCommandResult {
  scene: SceneState
  selectedOpeningId?: string
  notice?: string
}

export function addOpening(scene: SceneState, roomId: string, kind: OpeningKind, id: string): OpeningCommandResult {
  if (scene.openings.length >= MAX_SCENE_OPENINGS) {
    return { scene, notice: 'The opening limit has been reached.' }
  }
  const room = scene.rooms.find((candidate) => candidate.id === roomId)
  if (!room) return { scene }
  const requested: WallOpening = {
    id,
    roomId: room.id,
    kind,
    wallIndex: 0,
    offset: 0.5,
    width: kind === 'door' ? 0.9 : 1.4,
    height: kind === 'door' ? Math.min(2.1, room.height - 0.1) : 1.1,
    sillHeight: kind === 'door' ? 0 : 0.9,
  }
  const opening = placeOpeningWithoutOverlap(requested, room, scene.openings, 'any-wall')
  if (!opening) {
    return { scene, notice: `There is no free wall interval for another ${kind}.` }
  }
  return {
    scene: { ...scene, openings: [...scene.openings, opening] },
    selectedOpeningId: opening.id,
  }
}

export function patchOpening(scene: SceneState, id: string, patch: Partial<WallOpening>): SceneState {
  return {
    ...scene,
    openings: scene.openings.map((opening) => {
      if (opening.id !== id) return opening
      const requested = { ...opening, ...patch }
      const room = scene.rooms.find((entry) => entry.id === requested.roomId)
      if (!room) return opening
      const siblings = scene.openings.filter((candidate) => candidate.id !== id)
      return placeOpeningWithoutOverlap(requested, room, siblings, 'same-wall') ?? opening
    }),
  }
}

export function removeOpening(scene: SceneState, id: string): SceneState {
  return { ...scene, openings: scene.openings.filter((opening) => opening.id !== id) }
}
