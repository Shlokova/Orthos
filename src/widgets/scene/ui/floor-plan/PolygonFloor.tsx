import { findInteriorPointNear, polygonCentroid, type RoomDefinition } from '@entities/scene'
import { useEditorActions, useEditorSelector, type ViewMode } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { NativePolyline } from '../primitives/NativePolyline'

function makeShapeGeometry(room: RoomDefinition): THREE.ShapeGeometry {
  const shape = new THREE.Shape()
  room.vertices.forEach((vertex, index) => {
    if (index === 0) shape.moveTo(vertex.x, -vertex.z)
    else shape.lineTo(vertex.x, -vertex.z)
  })
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

interface PolygonFloorProps {
  room: RoomDefinition
  active: boolean
  viewMode: ViewMode
}

export function PolygonFloor({ room, active, viewMode }: PolygonFloorProps) {
  const { interactionTool } = useViewportInteraction()
  const isDragging = useEditorSelector((state) => state.isTransacting)
  const { selectRoom } = useEditorActions()
  const geometry = useMemo(() => makeShapeGeometry(room), [room])
  useEffect(() => () => geometry.dispose(), [geometry])
  const outline = useMemo(() => room.vertices.map((vertex) => [vertex.x, 0.032, vertex.z] as const), [room.vertices])
  const center = findInteriorPointNear(room, polygonCentroid(room.vertices))

  return (
    <group>
      <mesh
        receiveShadow={viewMode === 'perspective'}
        rotation-x={-Math.PI / 2}
        geometry={geometry}
        renderOrder={0}
        onPointerDown={(event: ThreeEvent<PointerEvent>) => {
          if (interactionTool === 'pan') return
          event.stopPropagation()
          selectRoom(room.id)
        }}
      >
        {viewMode === 'top' ? (
          <meshBasicMaterial
            color={active ? SCENE_THEME.palette.floorActive : SCENE_THEME.palette.floorInactive}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            color={active ? SCENE_THEME.palette.paper : SCENE_THEME.palette.floorSideInactive}
            roughness={0.92}
            metalness={0}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
      <NativePolyline
        points={outline}
        closed
        color={active ? SCENE_THEME.palette.olivePlan : SCENE_THEME.palette.outlineInactive}
        depthTest={viewMode !== 'top'}
        renderOrder={viewMode === 'top' ? 29 : 10}
      />
      {!isDragging && (
        <Html center transform={false} position={[center.x, 0.08, center.z]} style={{ pointerEvents: 'none' }}>
          <div className={`room-label ${viewMode === 'top' ? 'plan-room-label' : ''} ${active ? 'is-active' : ''}`}>
            {room.name}
          </div>
        </Html>
      )}
    </group>
  )
}
