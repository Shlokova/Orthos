import {
  buildWallPieces,
  getSolidWallSpans,
  getWallSegments,
  polygonCentroid,
  type RoomDefinition,
  type WallOpening,
  type WallSegment,
} from '@entities/scene'
import { useEditorSelector, type ViewMode, type WallDisplayMode } from '@features/editor'
import { Edges } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { shallowEqual } from '@shared/lib'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WALL_THICKNESS } from '../../lib/geometry/constants'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
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
const TOP_WALL_ACTIVE_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.inkSoft,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
})
const TOP_WALL_INACTIVE_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.outlineInactive,
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
          position={[0, room.height - 0.045, 0]}
          scale={[wall.length + 0.04, 0.09, WALL_THICKNESS * 1.22]}
          dispose={null}
        >
          <Edges threshold={28} color={SCENE_THEME.palette.ink} />
        </mesh>
      </group>
    </group>
  )
}

function TopWall({ wall, openings, active }: { wall: WallSegment; openings: readonly WallOpening[]; active: boolean }) {
  const intervals = useMemo(() => getSolidWallSpans(wall.length, openings), [openings, wall.length])
  return (
    <group position={[wall.center.x, 0, wall.center.z]} rotation-y={planAngleToSceneY(wall.angle)}>
      {intervals.map((interval) => {
        const width = interval.end - interval.start
        return (
          <mesh
            key={`${interval.start}:${interval.end}`}
            geometry={UNIT_BOX}
            material={active ? TOP_WALL_ACTIVE_MATERIAL : TOP_WALL_INACTIVE_MATERIAL}
            position={[interval.start + width / 2 - wall.length / 2, 0.055, 0]}
            scale={[width, 0.055, WALL_THICKNESS * 1.12]}
            renderOrder={30}
            dispose={null}
          />
        )
      })}
    </group>
  )
}

interface RoomWallsProps {
  room: RoomDefinition
  openings: WallOpening[]
  viewMode: ViewMode
  wallDisplayMode: WallDisplayMode
  active: boolean
}

export function RoomWalls({ room, openings, viewMode, wallDisplayMode, active }: RoomWallsProps) {
  const { selectedOpeningId, invalidIds } = useEditorSelector(
    (state) => ({ selectedOpeningId: state.selectedOpeningId, invalidIds: state.invalidIds }),
    shallowEqual,
  )
  const walls = useMemo(() => getWallSegments(room), [room])
  const openingsByWall = useMemo(() => {
    const map = new Map<number, WallOpening[]>()
    for (const opening of openings) {
      const current = map.get(opening.wallIndex)
      if (current) current.push(opening)
      else map.set(opening.wallIndex, [opening])
    }
    return map
  }, [openings])

  if (viewMode === 'top') {
    return (
      <>
        {walls.map((wall) => (
          <TopWall key={wall.index} wall={wall} openings={openingsByWall.get(wall.index) ?? []} active={active} />
        ))}
        {openings.map((opening) => (
          <OpeningVisual
            key={opening.id}
            opening={opening}
            room={room}
            selected={selectedOpeningId === opening.id}
            invalid={invalidIds.has(opening.id)}
            viewMode="top"
          />
        ))}
      </>
    )
  }

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
      {openings.map((opening) => (
        <OpeningVisual
          key={opening.id}
          opening={opening}
          room={room}
          selected={selectedOpeningId === opening.id}
          invalid={invalidIds.has(opening.id)}
          viewMode="perspective"
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
    TOP_WALL_ACTIVE_MATERIAL.dispose()
    TOP_WALL_INACTIVE_MATERIAL.dispose()
  })
}
