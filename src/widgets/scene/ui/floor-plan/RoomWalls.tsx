import {
  buildWallBandQuads,
  buildWallPieces,
  getWallSegments,
  polygonCentroid,
  type RoomDefinition,
  type WallBandQuad,
  type WallOpening,
  type WallSegment,
} from '@entities/scene'
import { useEditorSelector, type ViewMode, type WallDisplayMode } from '@features/editor'
import { Edges } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { shallowEqual } from '@shared/lib'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WALL_THICKNESS } from '../../lib/geometry/constants'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
import { PlanStroke } from '../primitives/PlanStroke'
import { OpeningVisual } from './OpeningVisual'

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1)
const WALL_ACTIVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: SCENE_THEME.palette.cream,
  roughness: 0.9,
  metalness: 0,
})
const WALL_INACTIVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: SCENE_THEME.palette.wallInactive,
  roughness: 0.9,
  metalness: 0,
})
const WALL_CAP_ACTIVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: SCENE_THEME.palette.wallWoodActive,
  roughness: 0.82,
  metalness: 0,
})
const WALL_CAP_INACTIVE_MATERIAL = new THREE.MeshStandardMaterial({
  color: SCENE_THEME.palette.wallWoodInactive,
  roughness: 0.82,
  metalness: 0,
})
const TOP_WALL_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.wallPlan,
  side: THREE.DoubleSide,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
})

interface WallSegmentViewProps {
  room: RoomDefinition
  wall: WallSegment
  openings: WallOpening[]
  wallDisplayMode: WallDisplayMode
  active: boolean
}

function WallSegmentView({ room, wall, openings, wallDisplayMode, active }: WallSegmentViewProps) {
  const root = useRef<THREE.Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const roomCenter = useMemo(() => polygonCentroid(room.vertices), [room.vertices])
  const followsCamera = wallDisplayMode === 'far'

  useLayoutEffect(() => {
    if (!root.current || followsCamera) return
    root.current.visible = wallDisplayMode === 'all'
    invalidate()
  }, [followsCamera, wallDisplayMode, invalidate])

  useFrame(({ camera }) => {
    if (!root.current || !followsCamera) return
    const wallVectorX = wall.center.x - roomCenter.x
    const wallVectorZ = wall.center.z - roomCenter.z
    const cameraVectorX = camera.position.x - roomCenter.x
    const cameraVectorZ = camera.position.z - roomCenter.z
    root.current.visible = wallVectorX * cameraVectorX + wallVectorZ * cameraVectorZ <= 0.02
  })

  return (
    <group ref={root}>
      <group position={[wall.center.x, 0, wall.center.z]} rotation-y={planAngleToSceneY(wall.angle)}>
        {buildWallPieces(room, wall.index, openings).map((piece, index) => {
          const width = piece.end - piece.start
          const height = piece.maxY - piece.minY
          return (
            <mesh
              key={`${piece.start}-${piece.end}-${index}`}
              castShadow
              receiveShadow
              geometry={UNIT_BOX}
              material={active ? WALL_ACTIVE_MATERIAL : WALL_INACTIVE_MATERIAL}
              position={[piece.start + width / 2 - wall.length / 2, piece.minY + height / 2, 0]}
              scale={[width, height, WALL_THICKNESS]}
              dispose={null}
            >
              <Edges threshold={25} color={SCENE_THEME.palette.ink} />
            </mesh>
          )
        })}
        <mesh
          castShadow
          receiveShadow
          geometry={UNIT_BOX}
          material={active ? WALL_CAP_ACTIVE_MATERIAL : WALL_CAP_INACTIVE_MATERIAL}
          position={[0, room.height - 0.035, 0]}
          scale={[wall.length + 0.04, 0.09, WALL_THICKNESS * 1.22]}
          dispose={null}
        >
          <Edges threshold={28} color={SCENE_THEME.palette.ink} />
        </mesh>
      </group>
    </group>
  )
}

function buildBandGeometry(quads: readonly WallBandQuad[]): THREE.BufferGeometry {
  const positions: number[] = []
  for (const quad of quads) {
    const { outerStart, outerEnd, innerEnd, innerStart } = quad
    positions.push(outerStart.x, 0, outerStart.z, outerEnd.x, 0, outerEnd.z, innerEnd.x, 0, innerEnd.z)
    positions.push(outerStart.x, 0, outerStart.z, innerEnd.x, 0, innerEnd.z, innerStart.x, 0, innerStart.z)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

function WallBandView({ room, openings }: { room: RoomDefinition; openings: readonly WallOpening[] }) {
  const quads = useMemo(() => buildWallBandQuads(room, openings, WALL_THICKNESS), [room, openings])
  const geometry = useMemo(() => buildBandGeometry(quads), [quads])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <mesh
        geometry={geometry}
        material={TOP_WALL_MATERIAL}
        position={[0, 0.055, 0]}
        renderOrder={PLAN_ORDER.wallBand}
        dispose={null}
      />
      {quads.map((quad, index) => (
        <PlanStroke
          key={`${quad.wallIndex}:${index}`}
          points={[
            [quad.outerStart.x, 0.056, quad.outerStart.z],
            [quad.outerEnd.x, 0.056, quad.outerEnd.z],
            [quad.innerEnd.x, 0.056, quad.innerEnd.z],
            [quad.innerStart.x, 0.056, quad.innerStart.z],
          ]}
          closed
          color={SCENE_THEME.palette.wallPlanEdge}
          width={SCENE_THEME.plan.stroke.wall}
          renderOrder={PLAN_ORDER.wallBand + 1}
        />
      ))}
    </group>
  )
}

interface VolumeWallsProps {
  room: RoomDefinition
  wallOpenings: readonly WallOpening[]
  wallDisplayMode: WallDisplayMode
  active: boolean
}

function VolumeWalls({ room, wallOpenings, wallDisplayMode, active }: VolumeWallsProps) {
  const walls = useMemo(() => getWallSegments(room), [room])
  const openingsByWall = useMemo(() => {
    const map = new Map<number, WallOpening[]>()
    for (const opening of wallOpenings) {
      const current = map.get(opening.wallIndex)
      if (current) current.push(opening)
      else map.set(opening.wallIndex, [opening])
    }
    return map
  }, [wallOpenings])

  return (
    <>
      {walls.map((wall) => (
        <WallSegmentView
          key={wall.index}
          room={room}
          wall={wall}
          openings={openingsByWall.get(wall.index) ?? []}
          wallDisplayMode={wallDisplayMode}
          active={active}
        />
      ))}
    </>
  )
}

interface RoomWallsProps {
  room: RoomDefinition
  ownOpenings: readonly WallOpening[]
  wallOpenings: readonly WallOpening[]
  viewMode: ViewMode
  wallDisplayMode: WallDisplayMode
  active: boolean
}

export function RoomWalls({ room, ownOpenings, wallOpenings, viewMode, wallDisplayMode, active }: RoomWallsProps) {
  const { selectedOpeningId, invalidIds } = useEditorSelector(
    (state) => ({ selectedOpeningId: state.selectedOpeningId, invalidIds: state.invalidIds }),
    shallowEqual,
  )

  return (
    <>
      {viewMode === 'top' ? (
        <WallBandView room={room} openings={wallOpenings} />
      ) : (
        <VolumeWalls room={room} wallOpenings={wallOpenings} wallDisplayMode={wallDisplayMode} active={active} />
      )}
      {ownOpenings.map((opening) => (
        <OpeningVisual
          key={opening.id}
          opening={opening}
          room={room}
          selected={selectedOpeningId === opening.id}
          invalid={invalidIds.has(opening.id)}
          viewMode={viewMode}
        />
      ))}
    </>
  )
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    UNIT_BOX.dispose()
    WALL_ACTIVE_MATERIAL.dispose()
    WALL_INACTIVE_MATERIAL.dispose()
    WALL_CAP_ACTIVE_MATERIAL.dispose()
    WALL_CAP_INACTIVE_MATERIAL.dispose()
    TOP_WALL_MATERIAL.dispose()
  })
}
