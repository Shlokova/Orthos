import { clamp } from '@shared/lib'
export function scaleClamped(value: number, factor: number, min: number, max: number): number {
  return clamp(value * factor, min, max)
}

export function perspectiveZoomPercent(fitDistance: number, currentDistance: number): number {
  return (fitDistance / Math.max(currentDistance, 0.001)) * 100
}

export function orthographicZoomPercent(fitZoom: number, currentZoom: number): number {
  return (currentZoom / Math.max(fitZoom, 0.001)) * 100
}
