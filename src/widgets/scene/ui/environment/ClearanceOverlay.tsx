import {
  analyzeClearance,
  FURNITURE_CLEARANCE_PADDING,
  type FurnitureItem,
  itemBlocksClearance,
  type RoomDefinition,
  type Vec2,
} from '@entities/scene'
import { useThree } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'

interface Props {
  rooms: readonly RoomDefinition[]
  items: readonly FurnitureItem[]
  visible: boolean
  occluded: boolean
}

function createRoomMaskGeometry(vertices: readonly Vec2[]): THREE.ShapeGeometry {
  const shape = new THREE.Shape()
  vertices.forEach((vertex, index) => {
    if (index === 0) shape.moveTo(vertex.x, -vertex.z)
    else shape.lineTo(vertex.x, -vertex.z)
  })
  shape.closePath()
  return new THREE.ShapeGeometry(shape)
}

function ignoreRaycast(): void {}

interface FootprintLayerProps {
  items: readonly FurnitureItem[]
  padding: number
  y: number
  color: string
  opacity: number
  renderOrder: number
  stencilRef: number
  occluded: boolean
}

function FootprintLayer({ items, padding, y, color, opacity, renderOrder, stencilRef, occluded }: FootprintLayerProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const invalidate = useThree((state) => state.invalidate)
  const [transform] = useState(() => new THREE.Object3D())

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]
      transform.position.set(item.position.x, y, item.position.z)
      transform.rotation.set(0, planAngleToSceneY(item.rotation), 0)
      transform.scale.set(item.size.width + padding * 2, 0.006, item.size.depth + padding * 2)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
    }

    mesh.count = items.length
    mesh.instanceMatrix.needsUpdate = true
    invalidate()
  }, [items, padding, transform, y, invalidate])

  if (items.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, items.length]}
      renderOrder={renderOrder}
      frustumCulled={false}
      raycast={ignoreRaycast}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthTest={occluded}
        depthWrite={false}
        toneMapped={false}
        stencilWrite
        stencilRef={stencilRef}
        stencilFunc={THREE.EqualStencilFunc}
        stencilFail={THREE.KeepStencilOp}
        stencilZFail={THREE.KeepStencilOp}
        stencilZPass={THREE.KeepStencilOp}
      />
    </instancedMesh>
  )
}

function RoomClearanceOverlay({
  room,
  items,
  stencilRef,
  occluded,
}: {
  room: RoomDefinition
  items: readonly FurnitureItem[]
  stencilRef: number
  occluded: boolean
}) {
  const blockers = useMemo(
    () => items.filter((item) => item.roomId === room.id && itemBlocksClearance(item)),
    [items, room.id],
  )
  const analysis = useMemo(() => analyzeClearance(room, blockers), [blockers, room])
  const issueBlockers = useMemo(
    () => blockers.filter((item) => analysis.issueItemIds.has(item.id)),
    [analysis.issueItemIds, blockers],
  )
  const maskGeometry = useMemo(() => createRoomMaskGeometry(room.vertices), [room.vertices])

  useEffect(() => () => maskGeometry.dispose(), [maskGeometry])
  if (blockers.length === 0) return null

  return (
    <group>
      <mesh
        geometry={maskGeometry}
        rotation-x={-Math.PI / 2}
        position-y={0.012}
        renderOrder={5}
        raycast={ignoreRaycast}
      >
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          depthTest={false}
          stencilWrite
          stencilRef={stencilRef}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilFail={THREE.ReplaceStencilOp}
          stencilZFail={THREE.ReplaceStencilOp}
          stencilZPass={THREE.ReplaceStencilOp}
        />
      </mesh>
      <FootprintLayer
        items={blockers}
        padding={FURNITURE_CLEARANCE_PADDING}
        y={0.026}
        color={SCENE_THEME.palette.clearanceMargin}
        opacity={0.24}
        renderOrder={6}
        stencilRef={stencilRef}
        occluded={occluded}
      />
      <FootprintLayer
        items={issueBlockers}
        padding={FURNITURE_CLEARANCE_PADDING}
        y={0.028}
        color={SCENE_THEME.palette.invalidUi}
        opacity={0.32}
        renderOrder={7}
        stencilRef={stencilRef}
        occluded={occluded}
      />
    </group>
  )
}

export function ClearanceOverlay({ rooms, items, visible, occluded }: Props) {
  if (!visible) return null

  return (
    <group>
      {rooms.map((room, index) => (
        <RoomClearanceOverlay
          key={room.id}
          room={room}
          items={items}
          stencilRef={(index % 254) + 1}
          occluded={occluded}
        />
      ))}
    </group>
  )
}
