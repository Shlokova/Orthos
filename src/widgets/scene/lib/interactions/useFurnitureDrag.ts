import { type FurnitureItem, getFurnitureAnchor } from '@entities/scene'
import { useEditorActions, type ViewMode } from '@features/editor'
import type { ThreeEvent } from '@react-three/fiber'
import { snap } from '@shared/lib'
import { useRef } from 'react'
import * as THREE from 'three'
import { FLOOR_PLANE } from '../geometry/constants'
import { useNativePlaneDrag } from './useNativePlaneDrag'

interface FurnitureDragOptions {
  item: FurnitureItem
  viewMode: ViewMode
  interactionTool: 'select' | 'pan'
}

const UP = new THREE.Vector3(0, 1, 0)

export function horizontalPlaneAt(height: number): THREE.Plane {
  return new THREE.Plane(UP.clone(), -Math.max(height, 0))
}

function grabPlaneFor(viewMode: ViewMode, grabHeight: number): THREE.Plane {
  return viewMode === 'top' ? FLOOR_PLANE : horizontalPlaneAt(grabHeight)
}

export function useFurnitureDrag({ item, viewMode, interactionTool }: FurnitureDragOptions) {
  const { select, updateItem, beginTransaction, endTransaction, cancelTransaction } = useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const itemRef = useRef(item)
  itemRef.current = item

  return (event: ThreeEvent<PointerEvent>) => {
    if (interactionTool === 'pan') return
    event.stopPropagation()
    select(item.id)

    const initial = itemRef.current
    const followsWall = getFurnitureAnchor(initial.kind) === 'wall'
    const plane = grabPlaneFor(viewMode, event.point.y)
    const projected = planeDrag.project(event.nativeEvent, plane)
    if (!projected) return

    const offsetX = initial.position.x - projected.x
    const offsetZ = initial.position.z - projected.z

    planeDrag.start(event, plane, {
      onStart: beginTransaction,
      onMove: (point) => {
        const desiredX = point.x + offsetX
        const desiredZ = point.z + offsetZ
        const position = followsWall ? { x: desiredX, z: desiredZ } : { x: snap(desiredX), z: snap(desiredZ) }
        updateItem(initial.id, { position }, 'preview')
      },
      onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
    })
  }
}
