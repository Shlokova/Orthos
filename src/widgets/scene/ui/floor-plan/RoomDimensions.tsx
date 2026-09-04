import { getWallSegments, type RoomDefinition, type Vec2, wallInwardNormal } from '@entities/scene'
import { Html } from '@react-three/drei'
import { SCENE_THEME } from '@shared/config/theme'
import { formatMeters } from '@shared/lib'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'
import { PlanStroke } from '../primitives/PlanStroke'

const DIMENSION_Y = 0.13
const ARROW_WIDTH_RATIO = 0.3

const ARROW_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.dimensionLine,
  side: THREE.DoubleSide,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
})

if (import.meta.hot) {
  import.meta.hot.dispose(() => ARROW_MATERIAL.dispose())
}

type Point = [number, number, number]

interface WallDimension {
  index: number
  length: number
  line: [Point, Point]
  extensions: [[Point, Point], [Point, Point]]
  label: Point
}

function buildDimensions(room: RoomDefinition): WallDimension[] {
  const { offset, extension } = SCENE_THEME.plan.dimension
  return getWallSegments(room).map((wall) => {
    const inward = wallInwardNormal(room, wall.index)
    const away = (point: Vec2, distance: number): Point => [
      point.x - inward.x * distance,
      DIMENSION_Y,
      point.z - inward.z * distance,
    ]
    return {
      index: wall.index,
      length: wall.length,
      line: [away(wall.start, offset), away(wall.end, offset)],
      extensions: [
        [away(wall.start, extension), away(wall.start, offset + extension)],
        [away(wall.end, extension), away(wall.end, offset + extension)],
      ],
      label: away(wall.center, offset),
    }
  })
}

function buildArrowGeometry(dimensions: readonly WallDimension[]): THREE.BufferGeometry {
  const { arrow } = SCENE_THEME.plan.dimension
  const positions: number[] = []

  for (const dimension of dimensions) {
    const [from, to] = dimension.line
    const dx = to[0] - from[0]
    const dz = to[2] - from[2]
    const length = Math.hypot(dx, dz)
    if (length < arrow * 2) continue
    const directionX = dx / length
    const directionZ = dz / length
    const halfWidth = arrow * ARROW_WIDTH_RATIO

    for (const [tip, sign] of [
      [from, 1],
      [to, -1],
    ] as const) {
      const baseX = tip[0] + directionX * arrow * sign
      const baseZ = tip[2] + directionZ * arrow * sign
      positions.push(
        tip[0],
        DIMENSION_Y,
        tip[2],
        baseX - directionZ * halfWidth,
        DIMENSION_Y,
        baseZ + directionX * halfWidth,
        baseX + directionZ * halfWidth,
        DIMENSION_Y,
        baseZ - directionX * halfWidth,
      )
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

export function RoomDimensions({ room }: { room: RoomDefinition }) {
  const dimensions = useMemo(() => buildDimensions(room), [room])
  const arrows = useMemo(() => buildArrowGeometry(dimensions), [dimensions])
  useEffect(() => () => arrows.dispose(), [arrows])
  const color = SCENE_THEME.palette.dimensionLine
  const strokes = SCENE_THEME.plan.stroke

  return (
    <group>
      <mesh geometry={arrows} material={ARROW_MATERIAL} renderOrder={PLAN_ORDER.dimensions} dispose={null} />
      {dimensions.map((dimension) => (
        <group key={dimension.index}>
          <PlanStroke
            points={dimension.line}
            color={color}
            width={strokes.detail}
            renderOrder={PLAN_ORDER.dimensions}
          />
          {dimension.extensions.map((extension, index) => (
            <PlanStroke
              key={index}
              points={extension}
              color={color}
              width={strokes.hairline}
              opacity={0.6}
              renderOrder={PLAN_ORDER.dimensions}
            />
          ))}
          <Html center transform={false} position={dimension.label} style={{ pointerEvents: 'none' }}>
            <span className="plan-dimension">{formatMeters(dimension.length)}</span>
          </Html>
        </group>
      ))}
    </group>
  )
}
