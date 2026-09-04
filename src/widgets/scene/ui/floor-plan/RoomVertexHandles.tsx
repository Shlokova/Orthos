import type { RoomDefinition, Vec2 } from '@entities/scene'
import { useEditorActions } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { snap } from '@shared/lib'
import { FLOOR_PLANE } from '../../lib/geometry/constants'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'
import { useNativePlaneDrag } from '../../lib/interactions/useNativePlaneDrag'

function VertexHandle({ room, vertex, index }: { room: RoomDefinition; vertex: Vec2; index: number }) {
  const { interactionTool } = useViewportInteraction()
  const { beginTransaction, endTransaction, cancelTransaction, updateVertex, selectRoom } = useEditorActions()
  const planeDrag = useNativePlaneDrag()

  return (
    <group position={[vertex.x, 0.11, vertex.z]}>
      <mesh
        renderOrder={PLAN_ORDER.handles + 2}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          if (interactionTool === 'pan') return
          planeDrag.start(event, FLOOR_PLANE, {
            onStart: () => {
              selectRoom(room.id)
              beginTransaction()
            },
            onMove: (point) => updateVertex(index, { x: snap(point.x), z: snap(point.z) }, 'preview'),
            onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
          })
        }}
      >
        <sphereGeometry args={[0.115, 18, 12]} />
        <meshBasicMaterial color={SCENE_THEME.palette.terracottaHandle} transparent depthTest={false} />
      </mesh>
    </group>
  )
}

export function RoomVertexHandles({ room, visible }: { room: RoomDefinition; visible: boolean }) {
  if (!visible) return null
  return (
    <>
      {room.vertices.map((vertex, index) => (
        <VertexHandle key={`${vertex.x},${vertex.z}`} room={room} vertex={vertex} index={index} />
      ))}
    </>
  )
}
