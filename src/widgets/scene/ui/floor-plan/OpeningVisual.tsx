import {
  getOpeningLimits,
  openingWorldPosition,
  type RoomDefinition,
  type WallOpening,
  wallInwardNormal,
} from '@entities/scene'
import { useEditorActions, type ViewMode } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'
import { WALL_THICKNESS } from '../../lib/geometry/constants'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
import { useOpeningDrag } from '../../lib/interactions/useOpeningDrag'
import { useVerticalDrag } from '../../lib/interactions/useVerticalDrag'
import { HeightHandle } from '../primitives/HeightHandle'
import { NativePolyline } from '../primitives/NativePolyline'
import { PlanStroke } from '../primitives/PlanStroke'

const OPENING_HIT_MATERIAL = new THREE.MeshBasicMaterial({
  colorWrite: false,
  depthWrite: false,
  depthTest: false,
  side: THREE.DoubleSide,
})
const DOOR_LEAF_GEOMETRY = new THREE.PlaneGeometry(1, 1)
const DOOR_ARC_SEGMENTS = 18

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    OPENING_HIT_MATERIAL.dispose()
    DOOR_LEAF_GEOMETRY.dispose()
  })
}

interface OpeningVisualProps {
  opening: WallOpening
  room: RoomDefinition
  selected: boolean
  invalid: boolean
  viewMode: ViewMode
}

export function OpeningVisual({ opening, room, selected, invalid, viewMode }: OpeningVisualProps) {
  const { interactionTool } = useViewportInteraction()
  const { updateOpening } = useEditorActions()
  const handlePointerDown = useOpeningDrag({ opening, room, viewMode, interactionTool })
  const frame = openingWorldPosition(opening, room)
  const limits = getOpeningLimits(opening, room)
  const adjustableSill = limits.sillHeight.max > limits.sillHeight.min
  const handleSillPointerDown = useVerticalDrag({
    origin: frame.position,
    value: opening.sillHeight,
    bounds: limits.sillHeight,
    interactionTool,
    onPreview: (sillHeight) => updateOpening(opening.id, { sillHeight }, 'preview'),
  })
  const color = invalid
    ? SCENE_THEME.palette.invalidUi
    : selected
      ? SCENE_THEME.palette.olivePlan
      : opening.kind === 'door'
        ? SCENE_THEME.palette.doorWood
        : SCENE_THEME.palette.olivePlan

  return (
    <group position={[frame.position.x, 0, frame.position.z]} rotation-y={planAngleToSceneY(frame.angle)}>
      {viewMode === 'top' ? (
        <TopOpening
          opening={opening}
          color={color}
          selected={selected}
          swing={planSwingDirection(opening, room, frame.angle)}
          onPointerDown={handlePointerDown}
        />
      ) : (
        <>
          {opening.kind === 'window' ? (
            <WindowOpening opening={opening} color={color} />
          ) : (
            <DoorOpening opening={opening} color={color} />
          )}
          <VolumeOpeningHitArea opening={opening} onPointerDown={handlePointerDown} />
        </>
      )}
      {viewMode !== 'top' && selected && adjustableSill && (
        <HeightHandle
          width={opening.width}
          centerY={opening.sillHeight + opening.height / 2}
          onPointerDown={handleSillPointerDown}
        />
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

function VolumeOpeningHitArea({
  opening,
  onPointerDown,
}: {
  opening: WallOpening
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}) {
  return (
    <mesh
      position={[0, opening.sillHeight + opening.height / 2, 0]}
      material={OPENING_HIT_MATERIAL}
      renderOrder={-1}
      onPointerDown={onPointerDown}
    >
      <boxGeometry args={[opening.width, opening.height, WALL_THICKNESS * 3]} />
    </mesh>
  )
}

function planSwingDirection(opening: WallOpening, room: RoomDefinition, angle: number): number {
  const inward = wallInwardNormal(room, opening.wallIndex)
  return inward.x * -Math.sin(angle) + inward.z * Math.cos(angle) >= 0 ? 1 : -1
}

function TopOpening({
  opening,
  color,
  selected,
  swing,
  onPointerDown,
}: Pick<OpeningVisualProps, 'opening' | 'selected'> & {
  color: string
  swing: number
  onPointerDown(event: ThreeEvent<PointerEvent>): void
}) {
  const half = WALL_THICKNESS / 2
  const edge = opening.width / 2
  const hitDepth = Math.max(0.46, opening.width * 0.42)
  const strokes = SCENE_THEME.plan.stroke
  const jambs = [-edge, edge].map((x) => (
    <PlanStroke
      key={x}
      points={[
        [x, 0.09, -half],
        [x, 0.09, half],
      ]}
      color={color}
      width={strokes.detail}
      renderOrder={PLAN_ORDER.openings}
    />
  ))

  if (opening.kind === 'window') {
    return (
      <>
        {[-half, half].map((z) => (
          <PlanStroke
            key={z}
            points={[
              [-edge, 0.09, z],
              [edge, 0.09, z],
            ]}
            color={color}
            width={strokes.detail}
            renderOrder={PLAN_ORDER.openings}
          />
        ))}
        {jambs}
        <NativePolyline
          points={[
            [-edge, 0.092, 0],
            [edge, 0.092, 0],
          ]}
          color={color}
          depthTest={false}
          renderOrder={PLAN_ORDER.openings + 1}
        />
        <mesh
          position={[0, 0.07, 0]}
          renderOrder={PLAN_ORDER.openings + 1}
          material={OPENING_HIT_MATERIAL}
          onPointerDown={onPointerDown}
        >
          <boxGeometry args={[opening.width + 0.35, 0.05, hitDepth]} />
        </mesh>
        {selected && (
          <PlanStroke
            points={[
              [-edge - 0.07, 0.1, -half - 0.06],
              [edge + 0.07, 0.1, -half - 0.06],
              [edge + 0.07, 0.1, half + 0.06],
              [-edge - 0.07, 0.1, half + 0.06],
            ]}
            closed
            color={color}
            width={strokes.outline}
            renderOrder={PLAN_ORDER.openings + 2}
          />
        )}
      </>
    )
  }

  const sweep = (Math.PI / 2) * swing
  const arc: [number, number, number][] = Array.from({ length: DOOR_ARC_SEGMENTS + 1 }, (_, index) => {
    const current = (sweep * index) / DOOR_ARC_SEGMENTS
    return [-edge + Math.cos(current) * opening.width, 0.095, Math.sin(current) * opening.width]
  })

  return (
    <>
      {jambs}
      <mesh
        geometry={DOOR_LEAF_GEOMETRY}
        position={[-edge, 0.098, (swing * opening.width) / 2]}
        rotation-x={-Math.PI / 2}
        scale={[0.05, opening.width, 1]}
        renderOrder={PLAN_ORDER.openings + 1}
        dispose={null}
      >
        <meshBasicMaterial color={color} transparent depthTest={false} depthWrite={false} toneMapped={false} />
      </mesh>
      <PlanStroke points={arc} color={color} width={strokes.detail} renderOrder={PLAN_ORDER.openings + 1} />
      <mesh
        position={[0, 0.07, swing * opening.width * 0.22]}
        renderOrder={PLAN_ORDER.openings + 2}
        material={OPENING_HIT_MATERIAL}
        onPointerDown={onPointerDown}
      >
        <boxGeometry args={[opening.width + 0.4, 0.05, Math.max(hitDepth, opening.width * 0.8)]} />
      </mesh>
      {selected && (
        <PlanStroke
          points={[
            [-edge - 0.07, 0.105, -half - 0.06],
            [edge + 0.07, 0.105, -half - 0.06],
          ]}
          color={color}
          width={strokes.outline}
          renderOrder={PLAN_ORDER.openings + 3}
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
