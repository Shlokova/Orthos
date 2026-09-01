import { projectPointToClosestWall, type RoomDefinition, type WallOpening } from '@entities/scene'
import { useEditorActions, type ViewMode } from '@features/editor'
import type { ThreeEvent } from '@react-three/fiber'
import { snap } from '@shared/lib'
import { useRef } from 'react'
import { FLOOR_PLANE } from '../geometry/constants'
import { horizontalPlaneAt } from './useFurnitureDrag'
import { useNativePlaneDrag } from './useNativePlaneDrag'

interface OpeningDragOptions {
  opening: WallOpening
  room: RoomDefinition
  viewMode: ViewMode
  interactionTool: 'select' | 'pan'
}

const WALL_SNAP = 0.05
const STICKY_BIAS = 0.035

export function useOpeningDrag({ opening, room, viewMode, interactionTool }: OpeningDragOptions) {
  const { selectOpening, updateOpening, beginTransaction, endTransaction, cancelTransaction } = useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const openingRef = useRef(opening)
  const roomRef = useRef(room)
  openingRef.current = opening
  roomRef.current = room

  return (event: ThreeEvent<PointerEvent>) => {
    if (interactionTool === 'pan') return
    event.stopPropagation()
    selectOpening(opening.id)

    const initial = openingRef.current
    const plane = viewMode === 'top' ? FLOOR_PLANE : horizontalPlaneAt(event.point.y)
    let activeWallIndex = initial.wallIndex

    planeDrag.start(event, plane, {
      onStart: beginTransaction,
      onMove: (point) => {
        const liveRoom = roomRef.current
        const liveOpening = openingRef.current
        const projection = projectPointToClosestWall(liveRoom, { x: point.x, z: point.z }, activeWallIndex, STICKY_BIAS)
        activeWallIndex = projection.wallIndex
        const wallLength = Math.max(projection.wallLength, 1e-6)
        const snappedDistance = snap(projection.offset * wallLength, WALL_SNAP)

        updateOpening(liveOpening.id, { wallIndex: activeWallIndex, offset: snappedDistance / wallLength }, 'preview')
      },
      onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
    })
  }
}
