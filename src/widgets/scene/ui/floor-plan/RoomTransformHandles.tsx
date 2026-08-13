import {
  getRoomBounds,
  getRoomResizeHandlePositions,
  ROOM_RESIZE_HANDLES,
  type RoomDefinition,
  type RoomResizeHandle,
  type Vec2,
} from '@entities/scene'
import { useEditorActions } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { snap } from '@shared/lib'
import { FLOOR_PLANE } from '../../lib/geometry/constants'
import { useNativePlaneDrag } from '../../lib/interactions/useNativePlaneDrag'
import { NativePolyline } from '../primitives/NativePolyline'

interface RoomTransformHandleProps {
  room: RoomDefinition
  kind: 'move' | RoomResizeHandle
  position: Vec2
}

function RoomTransformHandle({ room, kind, position }: RoomTransformHandleProps) {
  const { interactionTool } = useViewportInteraction()
  const { beginTransaction, endTransaction, cancelTransaction, moveRoom, resizeRoomHandle, selectRoom } =
    useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const bounds = getRoomBounds(room)

  return (
    <group position={[position.x, 0.095, position.z]}>
      <group
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          if (interactionTool === 'pan') return
          event.stopPropagation()
          const initial = planeDrag.project(event.nativeEvent, FLOOR_PLANE)
          if (!initial) return
          const offset =
            kind === 'move' ? { x: bounds.center.x - initial.x, z: bounds.center.z - initial.z } : { x: 0, z: 0 }
          planeDrag.start(event, FLOOR_PLANE, {
            onStart: () => {
              selectRoom(room.id)
              beginTransaction()
            },
            onMove: (point) => {
              const target = {
                x: snap(point.x + offset.x),
                z: snap(point.z + offset.z),
              }
              if (kind === 'move') moveRoom(target, 'preview')
              else resizeRoomHandle(kind, target, 'preview')
            },
            onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
          })
        }}
      >
        <mesh renderOrder={39}>
          {kind === 'move' ? (
            <cylinderGeometry args={[0.48, 0.48, 0.06, 24]} />
          ) : (
            <boxGeometry args={[0.52, 0.06, 0.52]} />
          )}
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <mesh renderOrder={40}>
          {kind === 'move' ? (
            <cylinderGeometry args={[0.25, 0.25, 0.08, 28]} />
          ) : (
            <boxGeometry args={[0.2, 0.08, 0.2]} />
          )}
          <meshBasicMaterial
            color={kind === 'move' ? SCENE_THEME.palette.terracottaHandle : SCENE_THEME.palette.olivePlanDark}
            depthTest={false}
          />
        </mesh>
      </group>
      {kind === 'move' && (
        <>
          <NativePolyline
            points={[
              [-0.13, 0.08, 0],
              [0.13, 0.08, 0],
            ]}
            color={SCENE_THEME.palette.handleDetail}
            depthTest={false}
            renderOrder={41}
          />
          <NativePolyline
            points={[
              [0, 0.08, -0.13],
              [0, 0.08, 0.13],
            ]}
            color={SCENE_THEME.palette.handleDetail}
            depthTest={false}
            renderOrder={41}
          />
        </>
      )}
    </group>
  )
}

export function RoomTransformHandles({ room, visible }: { room: RoomDefinition; visible: boolean }) {
  if (!visible) return null
  const bounds = getRoomBounds(room)
  const handles = getRoomResizeHandlePositions(room)
  const frame: [number, number, number][] = [
    [bounds.minX, 0.055, bounds.minZ],
    [bounds.maxX, 0.055, bounds.minZ],
    [bounds.maxX, 0.055, bounds.maxZ],
    [bounds.minX, 0.055, bounds.maxZ],
    [bounds.minX, 0.055, bounds.minZ],
  ]

  return (
    <>
      <NativePolyline points={frame} color={SCENE_THEME.palette.olivePlanDark} depthTest={false} renderOrder={38} />
      <RoomTransformHandle room={room} kind="move" position={bounds.center} />
      {ROOM_RESIZE_HANDLES.map((kind) => (
        <RoomTransformHandle key={kind} room={room} kind={kind} position={handles[kind]} />
      ))}
    </>
  )
}
