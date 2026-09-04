import type { Bounds2D, RoomDefinition } from '@entities/scene'
import { getPlanBounds } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { clamp } from '@shared/lib'

const TOP_CAMERA_PADDING = 1.12
const MIN_TOP_CAMERA_ZOOM = 2

export const PLAN_DIMENSION_MARGIN =
  SCENE_THEME.plan.dimension.offset + SCENE_THEME.plan.dimension.extension + SCENE_THEME.plan.dimension.gutter

const METRIC_EPSILON = 1e-4
const SIGNATURE_PRECISION = 1_000

export interface PlanCameraMetrics {
  bounds: Bounds2D
  maxHeight: number
  layoutSignature: string
}

type CameraPlanChange = { type: 'none' } | { type: 'translate'; dx: number; dz: number } | { type: 'fit' }

interface PerspectiveCameraFit {
  targetY: number
  distance: number
  radius: number
  near: number
  far: number
  minDistance: number
  maxDistance: number
}

function quantize(value: number): number {
  return Math.round(value * SIGNATURE_PRECISION) / SIGNATURE_PRECISION
}

function createLayoutSignature(rooms: readonly RoomDefinition[], bounds: Bounds2D): string {
  return [...rooms]
    .sort((first, second) => first.id.localeCompare(second.id))
    .map((room) => {
      const vertices = room.vertices
        .map((vertex) => `${quantize(vertex.x - bounds.center.x)},${quantize(vertex.z - bounds.center.z)}`)
        .join(';')
      return `${room.id}:${quantize(room.height)}:${vertices}`
    })
    .join('|')
}

export function getPlanCameraMetrics(rooms: readonly RoomDefinition[]): PlanCameraMetrics {
  const bounds = getPlanBounds(rooms)
  return {
    bounds,
    maxHeight: Math.max(...rooms.map((room) => room.height)),
    layoutSignature: createLayoutSignature(rooms, bounds),
  }
}

export function resolveCameraPlanChange(previous: PlanCameraMetrics | null, next: PlanCameraMetrics): CameraPlanChange {
  if (!previous) return { type: 'fit' }

  const dimensionsChanged =
    Math.abs(previous.bounds.width - next.bounds.width) > METRIC_EPSILON ||
    Math.abs(previous.bounds.depth - next.bounds.depth) > METRIC_EPSILON ||
    Math.abs(previous.maxHeight - next.maxHeight) > METRIC_EPSILON
  if (dimensionsChanged || previous.layoutSignature !== next.layoutSignature) return { type: 'fit' }

  const dx = next.bounds.center.x - previous.bounds.center.x
  const dz = next.bounds.center.z - previous.bounds.center.z
  if (Math.abs(dx) > METRIC_EPSILON || Math.abs(dz) > METRIC_EPSILON) {
    return { type: 'translate', dx, dz }
  }
  return { type: 'none' }
}

export function perspectiveViewNeedsMoreSpace(previousDistance: number, nextDistance: number): boolean {
  return nextDistance > previousDistance + METRIC_EPSILON
}

export function topViewNeedsMoreSpace(previousZoom: number, nextZoom: number): boolean {
  return nextZoom < previousZoom - METRIC_EPSILON
}

export function calculateTopCameraZoom(
  viewportWidth: number,
  viewportHeight: number,
  extent: { width: number; depth: number },
  margin = 0,
  padding = TOP_CAMERA_PADDING,
): number {
  const safeWidth = Math.max(1, viewportWidth)
  const safeHeight = Math.max(1, viewportHeight)
  const paddedWidth = Math.max(0.25, extent.width * padding + margin * 2)
  const paddedDepth = Math.max(0.25, extent.depth * padding + margin * 2)
  return Math.max(MIN_TOP_CAMERA_ZOOM, Math.min(safeWidth / paddedWidth, safeHeight / paddedDepth))
}

export function calculatePerspectiveCameraFit(
  extent: { width: number; depth: number },
  maxHeight: number,
  verticalFovDegrees: number,
  aspect: number,
  padding = 1.18,
): PerspectiveCameraFit {
  const safeAspect = Math.max(0.2, aspect)
  const halfVerticalFov = Math.max(0.05, (verticalFovDegrees * Math.PI) / 360)
  const halfHorizontalFov = Math.atan(Math.tan(halfVerticalFov) * safeAspect)
  const limitingHalfFov = Math.max(0.05, Math.min(halfVerticalFov, halfHorizontalFov))
  const targetY = Math.min(maxHeight * 0.22, 0.65)
  const verticalRadius = Math.max(targetY, maxHeight - targetY)
  const radius = Math.max(0.75, Math.hypot(extent.width / 2, extent.depth / 2, verticalRadius))
  const distance = (radius / Math.sin(limitingHalfFov)) * padding
  const minDistance = Math.max(1.25, radius * 0.42)
  const maxDistance = Math.max(20, distance * 3.5)

  return {
    targetY,
    distance,
    radius,
    near: clamp(radius * 0.02, 0.02, 0.2),
    far: Math.max(80, maxDistance + radius * 2.5),
    minDistance,
    maxDistance,
  }
}
