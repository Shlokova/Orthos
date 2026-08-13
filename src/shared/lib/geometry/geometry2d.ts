interface Vector2Like {
  x: number
  z: number
}

export const GEOMETRY_EPSILON = 1e-8

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function snap(value: number, step = 0.25): number {
  return Math.round(value / step) * step
}

export function rotatePoint(point: Vector2Like, angle: number): Vector2Like {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return {
    x: point.x * cos - point.z * sin,
    z: point.x * sin + point.z * cos,
  }
}

export function vec2Equal(first: Vector2Like, second: Vector2Like): boolean {
  return first === second || (first.x === second.x && first.z === second.z)
}

export function distanceBetween(first: Vector2Like, second: Vector2Like): number {
  return Math.hypot(second.x - first.x, second.z - first.z)
}

export function formatMeters(value: number, fractionDigits = 2): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(fractionDigits)} m`
}

export function formatArea(value: number, fractionDigits = 1): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(fractionDigits)} m²`
}
