import { MAX_ROOM_VERTICES, MIN_ROOM_EDGE, segmentsIntersect, type Vec2 } from '@entities/scene'
import { distanceBetween, formatMeters, GEOMETRY_EPSILON, snap } from '@shared/lib'
import type { RoomDrawingDraft } from '../EditorState'

const DRAWING_GRID_STEP = 0.05
const AXIS_LOCK_DISTANCE = DRAWING_GRID_STEP
const CLOSE_DISTANCE = 0.4

interface RoomDrawingUpdate {
  draft: RoomDrawingDraft
  shouldFinish: boolean
  notice: string
}

export function createRoomDrawingDraft(): RoomDrawingDraft {
  return { vertices: [], pointer: null }
}

function alignToAnchor(value: number, anchors: readonly number[]): number | undefined {
  return anchors.find((anchor) => Math.abs(value - anchor) <= AXIS_LOCK_DISTANCE)
}

function drawingAnchors(vertices: readonly Vec2[]): Vec2[] {
  const previous = vertices.at(-1)
  const first = vertices[0]
  if (!previous || !first) return []
  return previous === first ? [previous] : [previous, first]
}

function snapRoomDrawingPoint(point: Vec2, vertices: readonly Vec2[] = []): Vec2 {
  const toGrid = { x: snap(point.x, DRAWING_GRID_STEP), z: snap(point.z, DRAWING_GRID_STEP) }
  const anchors = drawingAnchors(vertices)
  if (anchors.length === 0) return toGrid

  const nearAnchor = anchors.some(
    (anchor) =>
      Math.abs(point.x - anchor.x) <= AXIS_LOCK_DISTANCE && Math.abs(point.z - anchor.z) <= AXIS_LOCK_DISTANCE,
  )
  if (nearAnchor) return toGrid

  return {
    x:
      alignToAnchor(
        point.x,
        anchors.map((anchor) => anchor.x),
      ) ?? toGrid.x,
    z:
      alignToAnchor(
        point.z,
        anchors.map((anchor) => anchor.z),
      ) ?? toGrid.z,
  }
}

function pointsEqual(first: Vec2 | null, second: Vec2 | null): boolean {
  if (first === second) return true
  return Boolean(
    first &&
      second &&
      Math.abs(first.x - second.x) <= GEOMETRY_EPSILON &&
      Math.abs(first.z - second.z) <= GEOMETRY_EPSILON,
  )
}

export function previewRoomDrawing(draft: RoomDrawingDraft, point: Vec2): RoomDrawingDraft {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.z)) return draft
  const pointer = snapRoomDrawingPoint(point, draft.vertices)
  return pointsEqual(pointer, draft.pointer) ? draft : { ...draft, pointer }
}

export function undoRoomDrawingPoint(draft: RoomDrawingDraft): RoomDrawingDraft {
  const vertices = draft.vertices.slice(0, -1)
  return { vertices, pointer: vertices.at(-1) ?? null }
}

export function isRoomDrawingClosable(draft: RoomDrawingDraft, point = draft.pointer): boolean {
  const first = draft.vertices[0]
  return Boolean(first && point && draft.vertices.length >= 3 && distanceBetween(point, first) <= CLOSE_DISTANCE)
}

function newWallCrossesExisting(vertices: readonly Vec2[], end: Vec2, closing: boolean): boolean {
  const start = vertices.at(-1)
  if (!start || vertices.length < 2) return false

  for (let index = 0; index < vertices.length - 1; index += 1) {
    if (index === vertices.length - 2) continue
    if (closing && index === 0) continue
    const segmentStart = vertices[index]
    const segmentEnd = vertices[index + 1]
    if (segmentStart && segmentEnd && segmentsIntersect(start, end, segmentStart, segmentEnd)) return true
  }
  return false
}

function isDuplicateCorner(vertices: readonly Vec2[], point: Vec2): boolean {
  return vertices.some((vertex) => distanceBetween(vertex, point) < DRAWING_GRID_STEP)
}

export function addRoomDrawingPoint(draft: RoomDrawingDraft, point: Vec2): RoomDrawingUpdate {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.z)) {
    return { draft, shouldFinish: false, notice: 'Could not place that corner. Try again inside the plan.' }
  }

  const snapped = snapRoomDrawingPoint(point, draft.vertices)
  const closing = isRoomDrawingClosable(draft, snapped)
  const first = draft.vertices[0]
  const target = closing && first ? first : snapped
  const previous = draft.vertices.at(-1)

  if (previous && distanceBetween(previous, target) < MIN_ROOM_EDGE) {
    return {
      draft,
      shouldFinish: false,
      notice: `Walls must be at least ${formatMeters(MIN_ROOM_EDGE)} long.`,
    }
  }

  if (!closing && isDuplicateCorner(draft.vertices, target)) {
    return {
      draft,
      shouldFinish: false,
      notice: 'That corner already exists. Close on the first point or choose another position.',
    }
  }

  if (newWallCrossesExisting(draft.vertices, target, closing)) {
    return {
      draft: pointsEqual(draft.pointer, target) ? draft : { ...draft, pointer: target },
      shouldFinish: false,
      notice: 'Walls cannot cross. Undo the last corner or choose another point.',
    }
  }

  if (closing) {
    return {
      draft: first && pointsEqual(draft.pointer, first) ? draft : { ...draft, pointer: first ?? snapped },
      shouldFinish: true,
      notice: 'Room outline closed.',
    }
  }

  if (draft.vertices.length >= MAX_ROOM_VERTICES) {
    return {
      draft,
      shouldFinish: false,
      notice: `A room can have at most ${MAX_ROOM_VERTICES} corners. Finish or undo a corner.`,
    }
  }

  const vertices = [...draft.vertices, snapped]
  return {
    draft: { vertices, pointer: snapped },
    shouldFinish: false,
    notice:
      vertices.length < 3
        ? 'Continue drawing the room perimeter.'
        : 'Click the first corner or press Finish to create the room.',
  }
}
