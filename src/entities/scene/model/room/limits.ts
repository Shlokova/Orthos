export const MAX_ROOM_VERTICES = 16
export const MAX_ROOMS = 12
export const MIN_ROOM_EDGE = 0.5
export const MIN_ROOM_AREA = 1

export const DEGENERATE_EXTENT = 1e-4

export const ROOM_LIMITS = {
  width: { min: 1, max: 20 },
  depth: { min: 1, max: 20 },
  height: { min: 2.2, max: 5 },
} as const

export const ROOM_NAME_MAX_LENGTH = 80

export const MIN_DRAWN_EDGE = 0.05

export const DEFAULT_ROOM_HEIGHT = 2.7
