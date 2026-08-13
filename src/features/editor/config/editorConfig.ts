export const EDITOR_CONFIG = {
  noticeDurationMs: 3200,
  keyboardTransactionIdleMs: 180,
} as const

export const NEW_ROOM_DEFAULTS = {
  rectangle: { width: 5, depth: 4 },
  lShape: { width: 6, depth: 5 },
  name: (index: number) => `Room ${index + 1}`,
} as const
