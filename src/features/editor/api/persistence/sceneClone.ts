import { cloneRoom, type FurnitureItem, type SceneState, type WallOpening } from '@entities/scene'

function cloneFurnitureItems(items: readonly FurnitureItem[]): FurnitureItem[] {
  return items.map((item) => ({
    ...item,
    position: { ...item.position },
    size: { ...item.size },
  }))
}

function cloneOpenings(openings: readonly WallOpening[]): WallOpening[] {
  return openings.map((opening) => ({ ...opening }))
}

export function cloneSceneState(scene: SceneState): SceneState {
  return {
    rooms: scene.rooms.map(cloneRoom),
    items: cloneFurnitureItems(scene.items),
    openings: cloneOpenings(scene.openings),
  }
}
