import type { Vec2 } from '@entities/scene'
import { useEditorActions } from '@features/editor'
import { type ThreeEvent, useThree } from '@react-three/fiber'
import { clamp, snap } from '@shared/lib'
import { useRef } from 'react'
import * as THREE from 'three'
import { useNativePlaneDrag } from './useNativePlaneDrag'

interface VerticalDragBounds {
  min: number
  max: number
}

interface VerticalDragOptions {
  origin: Vec2
  value: number
  bounds: VerticalDragBounds
  interactionTool: 'select' | 'pan'
  onPreview(value: number): void
}

const COARSE_STEP = 0.05
const FINE_STEP = 0.01

function facingPlaneAt(camera: THREE.Camera, origin: Vec2): THREE.Plane {
  const normal = new THREE.Vector3(camera.position.x - origin.x, 0, camera.position.z - origin.z)
  if (normal.lengthSq() < 1e-6) normal.set(0, 0, 1)
  normal.normalize()
  return new THREE.Plane(normal, -normal.dot(new THREE.Vector3(origin.x, 0, origin.z)))
}

export function useVerticalDrag({ origin, value, bounds, interactionTool, onPreview }: VerticalDragOptions) {
  const { beginTransaction, endTransaction, cancelTransaction } = useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const camera = useThree((state) => state.camera)
  const latest = useRef({ origin, value, bounds, onPreview })
  latest.current = { origin, value, bounds, onPreview }

  return (event: ThreeEvent<PointerEvent>) => {
    if (interactionTool === 'pan') return
    event.stopPropagation()

    const start = latest.current
    const plane = facingPlaneAt(camera, start.origin)
    const projected = planeDrag.project(event.nativeEvent, plane)
    if (!projected) return

    const offsetY = start.value - projected.y

    planeDrag.start(event, plane, {
      onStart: beginTransaction,
      onMove: (point, frame) => {
        const { bounds: live, onPreview: preview } = latest.current
        const step = frame.shiftKey ? FINE_STEP : COARSE_STEP
        preview(clamp(snap(point.y + offsetY, step), live.min, live.max))
      },
      onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
    })
  }
}
