import { openingWorldPosition, projectPointToClosestWall, type RoomDefinition, type WallOpening } from '@entities/scene'
import { useEditorActions, type ViewMode } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { snap } from '@shared/lib'
import { useRef } from 'react'
import { FLOOR_PLANE } from '../../lib/geometry/constants'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
import { useNativePlaneDrag } from '../../lib/interactions/useNativePlaneDrag'
import { NativePolyline } from '../primitives/NativePolyline'

interface OpeningVisualProps {
  opening: WallOpening
  room: RoomDefinition
  selected: boolean
  invalid: boolean
  viewMode: ViewMode
}

export function OpeningVisual({ opening, room, selected, invalid, viewMode }: OpeningVisualProps) {
  const { interactionTool } = useViewportInteraction()
  const { selectOpening, updateOpening, beginTransaction, endTransaction, cancelTransaction } = useEditorActions()
  const planeDrag = useNativePlaneDrag()
  const openingRef = useRef(opening)
  const roomRef = useRef(room)
  openingRef.current = opening
  roomRef.current = room
  const frame = openingWorldPosition(opening, room)
  const color = invalid
    ? SCENE_THEME.palette.invalidUi
    : selected
      ? SCENE_THEME.palette.olivePlan
      : opening.kind === 'door'
        ? SCENE_THEME.palette.doorWood
        : SCENE_THEME.palette.olivePlan

  return (
    <group
      position={[frame.position.x, 0, frame.position.z]}
      rotation-y={planAngleToSceneY(frame.angle)}
      onPointerDown={(event: ThreeEvent<PointerEvent>) => {
        if (interactionTool === 'pan') return
        event.stopPropagation()
        selectOpening(opening.id)
        if (viewMode !== 'top') return
        let activeWallIndex = opening.wallIndex
        planeDrag.start(event, FLOOR_PLANE, {
          onStart: beginTransaction,
          onMove: (point) => {
            const liveRoom = roomRef.current
            const liveOpening = openingRef.current
            const projection = projectPointToClosestWall(liveRoom, { x: point.x, z: point.z }, activeWallIndex, 0.035)
            activeWallIndex = projection.wallIndex
            const wallLength = Math.max(projection.wallLength, 1e-6)
            const snappedDistance = snap(projection.offset * wallLength, 0.05)
            updateOpening(
              liveOpening.id,
              {
                wallIndex: activeWallIndex,
                offset: snappedDistance / wallLength,
              },
              'preview',
            )
          },
          onEnd: (cancelled) => (cancelled ? cancelTransaction() : endTransaction()),
        })
      }}
    >
      {viewMode === 'top' ? (
        <TopOpening opening={opening} color={color} selected={selected} />
      ) : opening.kind === 'window' ? (
        <WindowOpening opening={opening} color={color} />
      ) : (
        <DoorOpening opening={opening} color={color} />
      )}
      {viewMode !== 'top' && selected && (
        <mesh position={[0, opening.sillHeight + opening.height / 2, 0]} renderOrder={6}>
          <boxGeometry args={[opening.width + 0.12, opening.height + 0.12, 0.12]} />
          <meshBasicMaterial color={color} wireframe depthTest={false} />
        </mesh>
      )}
    </group>
  )
}

function TopOpening({
  opening,
  color,
  selected,
}: Pick<OpeningVisualProps, 'opening' | 'selected'> & { color: string }) {
  const hitDepth = Math.max(0.46, opening.width * 0.42)
  if (opening.kind === 'window') {
    return (
      <>
        <NativePolyline
          points={[
            [-opening.width / 2, 0.09, -0.045],
            [opening.width / 2, 0.09, -0.045],
          ]}
          color={color}
          depthTest={false}
          renderOrder={33}
        />
        <NativePolyline
          points={[
            [-opening.width / 2, 0.09, 0.045],
            [opening.width / 2, 0.09, 0.045],
          ]}
          color={color}
          depthTest={false}
          renderOrder={33}
        />
        <mesh position={[0, 0.07, 0]} renderOrder={34}>
          <boxGeometry args={[opening.width + 0.35, 0.05, hitDepth]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        {selected && (
          <NativePolyline
            points={[
              [-opening.width / 2 - 0.06, 0.1, -0.11],
              [opening.width / 2 + 0.06, 0.1, -0.11],
              [opening.width / 2 + 0.06, 0.1, 0.11],
              [-opening.width / 2 - 0.06, 0.1, 0.11],
            ]}
            closed
            color={color}
            depthTest={false}
            renderOrder={35}
          />
        )}
      </>
    )
  }

  const hingeX = -opening.width / 2
  const angle = Math.PI / 2.8
  const leafEnd: [number, number, number] = [
    hingeX + Math.cos(angle) * opening.width,
    0.1,
    Math.sin(angle) * opening.width,
  ]
  const arc: [number, number, number][] = Array.from({ length: 14 }, (_, index) => {
    const current = angle * (index / 13)
    return [hingeX + Math.cos(current) * opening.width, 0.095, Math.sin(current) * opening.width]
  })
  return (
    <>
      <mesh position={[0, 0.055, 0]} renderOrder={32}>
        <boxGeometry args={[opening.width, 0.04, 0.18]} />
        <meshBasicMaterial color={SCENE_THEME.palette.floorActive} depthTest={false} depthWrite={false} />
      </mesh>
      <NativePolyline points={[[hingeX, 0.1, 0], leafEnd]} color={color} depthTest={false} renderOrder={34} />
      <NativePolyline points={arc} color={color} depthTest={false} renderOrder={34} />
      <mesh position={[0, 0.07, opening.width * 0.22]} renderOrder={35}>
        <boxGeometry args={[opening.width + 0.4, 0.05, Math.max(hitDepth, opening.width * 0.8)]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {selected && (
        <NativePolyline
          points={[
            [-opening.width / 2 - 0.06, 0.105, -0.12],
            [opening.width / 2 + 0.06, 0.105, -0.12],
          ]}
          color={color}
          depthTest={false}
          renderOrder={36}
        />
      )}
    </>
  )
}

function WindowOpening({ opening, color }: { opening: WallOpening; color: string }) {
  return (
    <>
      <mesh position={[0, opening.sillHeight + opening.height / 2, 0]} renderOrder={4} castShadow receiveShadow>
        <boxGeometry args={[opening.width - 0.08, opening.height - 0.08, 0.035]} />
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.3}
          transmission={0.55}
          roughness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, opening.sillHeight + opening.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[opening.width, 0.055, 0.075]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh
          key={sign}
          position={[(sign * opening.width) / 2, opening.sillHeight + opening.height / 2, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.055, opening.height, 0.075]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  )
}

function DoorOpening({ opening, color }: { opening: WallOpening; color: string }) {
  return (
    <group position={[-opening.width / 2, 0, 0]} rotation-y={-Math.PI / 5}>
      <mesh position={[opening.width / 2, opening.height / 2, 0.02]} castShadow>
        <boxGeometry args={[opening.width - 0.06, opening.height - 0.05, 0.055]} />
        <meshStandardMaterial color={color} transparent opacity={0.72} roughness={0.75} />
      </mesh>
      <mesh position={[opening.width - 0.13, opening.height * 0.52, 0.07]} castShadow receiveShadow>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshStandardMaterial color={SCENE_THEME.palette.olivePlanDark} metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  )
}
