import type { RoomDefinition, WallOpening } from '../types'
import { getWallSegment } from './walls'

export const WALL_SPAN_EPSILON = 0.01
export const WALL_STRIP_EPSILON = 0.02

export interface WallSpan {
  start: number
  end: number
}

export interface WallPiece extends WallSpan {
  minY: number
  maxY: number
}

interface OpeningSpan extends WallSpan {
  opening: WallOpening
}

export function openingSpan(opening: WallOpening, wallLength: number): WallSpan {
  const center = opening.offset * wallLength
  return { start: center - opening.width / 2, end: center + opening.width / 2 }
}

function getOpeningSpans(wallLength: number, openings: readonly WallOpening[]): OpeningSpan[] {
  return openings
    .map((opening) => {
      const span = openingSpan(opening, wallLength)
      return { opening, start: Math.max(0, span.start), end: Math.min(wallLength, span.end) }
    })
    .filter(({ start, end }) => end - start > WALL_SPAN_EPSILON)
    .sort((first, second) => first.start - second.start)
}

export function getSolidWallSpans(wallLength: number, openings: readonly WallOpening[]): WallSpan[] {
  const cuts = getOpeningSpans(wallLength, openings)
  if (cuts.length === 0) return [{ start: 0, end: wallLength }]

  const merged: WallSpan[] = []
  for (const cut of cuts) {
    const previous = merged.at(-1)
    if (previous && cut.start <= previous.end) previous.end = Math.max(previous.end, cut.end)
    else merged.push({ start: cut.start, end: cut.end })
  }

  const spans: WallSpan[] = []
  let cursor = 0
  for (const cut of merged) {
    if (cut.start - cursor > WALL_SPAN_EPSILON) spans.push({ start: cursor, end: cut.start })
    cursor = Math.max(cursor, cut.end)
  }
  if (wallLength - cursor > WALL_SPAN_EPSILON) spans.push({ start: cursor, end: wallLength })
  return spans
}

export function buildWallPieces(
  room: RoomDefinition,
  wallIndex: number,
  openings: readonly WallOpening[],
): WallPiece[] {
  const wall = getWallSegment(room, wallIndex)
  const attached = getOpeningSpans(
    wall.length,
    openings.filter((opening) => opening.wallIndex === wallIndex),
  )
  const boundaries = [...new Set([0, wall.length, ...attached.flatMap(({ start, end }) => [start, end])])].sort(
    (first, second) => first - second,
  )
  const pieces: WallPiece[] = []

  for (let index = 0; index < boundaries.length - 1; index += 1) {
    const start = boundaries[index]
    const end = boundaries[index + 1]
    if (start === undefined || end === undefined || end - start < WALL_SPAN_EPSILON) continue
    const midpoint = (start + end) / 2
    const entry = attached.find(
      ({ start: openingStart, end: openingEnd }) => midpoint > openingStart && midpoint < openingEnd,
    )
    if (!entry) {
      pieces.push({ start, end, minY: 0, maxY: room.height })
      continue
    }
    const { opening } = entry
    if (opening.kind === 'window' && opening.sillHeight > WALL_STRIP_EPSILON) {
      pieces.push({ start, end, minY: 0, maxY: opening.sillHeight })
    }
    const top = opening.sillHeight + opening.height
    if (top < room.height - WALL_STRIP_EPSILON) pieces.push({ start, end, minY: top, maxY: room.height })
  }
  return pieces
}
