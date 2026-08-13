import { type FurnitureItem, normalizeAngle } from '@entities/scene'
import { useEditorActions, type ViewMode } from '@features/editor'
import type { ThreeEvent } from '@react-three/fiber'
import { snap } from '@shared/lib'
import { useRef } from 'react'
import * as THREE from 'three'
import { FLOOR_PLANE } from '../geometry/constants'
import { useNativePlaneDrag } from './useNativePlaneDrag'

interface FurnitureRotateOptions {
  item: FurnitureItem
  viewMode: ViewMode
  interactionTool: 'select' | 'pan'
}

const UP = new THREE.Vector3(0, 1, 0)
const COARSE_STEP = Math.PI / 12
const FINE_STEP = Math.PI / 180

function snapAngle(angle: number, fine: boolean): number {
  return snap(angle, fine ? FINE_STEP : COARSE_STEP)
}

export function useFurnitureRotate({ item, viewMode, interactionTool }: FurnitureRotateOptions) {
  const { updateItem, beginTransaction, endTransaction, cancelTransaction } = useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const itemRef = useRef(item)
  itemRef.current = item

  return (event: ThreeEvent<PointerEvent>) => {
    if (interactionTool === 'pan') return
    event.stopPropagation()

    const initial = itemRef.current
    const plane = viewMode === 'top' ? FLOOR_PLANE : new THREE.Plane(UP.clone(), -Math.max(event.point.y, 0))
    const grabbed = planeDrag.project(event.nativeEvent, plane)
    if (!grabbed) return

    const center = initial.position
    const startAngle = Math.atan2(grabbed.z - center.z, grabbed.x - center.x)

    planeDrag.start(event, plane, {
      onStart: beginTransaction,
      onMove: (point, frame) => {
        const angle = Math.atan2(point.z - center.z, point.x - center.x)
        const rotation = normalizeAngle(snapAngle(initial.rotation + angle - startAngle, frame.shiftKey))
        updateItem(initial.id, { rotation }, 'preview')
      },
      onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
    })
  }
}
