export const FURNITURE_LIMITS = {
  width: { min: 0.1, max: 5 },
  depth: { min: 0.03, max: 5 },
  height: { min: 0.02, max: 4 },
  nameLength: 80,
} as const

export function normalizeAngle(radians: number): number {
  if (!Number.isFinite(radians)) return 0
  const fullTurn = Math.PI * 2
  const normalized = (radians + Math.PI) % fullTurn
  return (normalized < 0 ? normalized + fullTurn : normalized) - Math.PI
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value)
}
