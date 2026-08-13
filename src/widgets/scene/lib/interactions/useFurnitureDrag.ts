import type { FurnitureItem } from '@entities/scene'
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

function grabPlaneFor(viewMode: ViewMode, grabHeight: number): THREE.Plane {
  if (viewMode === 'top') return FLOOR_PLANE
  return new THREE.Plane(UP.clone(), -Math.max(grabHeight, 0))
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
    const plane = grabPlaneFor(viewMode, event.point.y)
    const projected = planeDrag.project(event.nativeEvent, plane)
    if (!projected) return

    const offsetX = initial.position.x - projected.x
    const offsetZ = initial.position.z - projected.z

    planeDrag.start(event, plane, {
      onStart: beginTransaction,
      onMove: (point) => {
        updateItem(
          initial.id,
          {
            position: {
              x: snap(point.x + offsetX),
              z: snap(point.z + offsetZ),
            },
          },
          'preview',
        )
      },
      onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
    })
  }
}
