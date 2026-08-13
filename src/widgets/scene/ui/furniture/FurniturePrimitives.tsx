import type * as THREE from 'three'
import {
  FURNITURE_OUTLINE_MATERIAL,
  type FurnitureGeometryKind,
  getFurnitureGeometry,
} from '../../lib/furniture/FurnitureGeometryCache'

type Vector3Tuple = [number, number, number]

interface PrimitiveProps {
  size: Vector3Tuple
  position: Vector3Tuple
  material: THREE.Material
  rotation?: Vector3Tuple
  outlineScale?: number
}

interface SketchPrimitiveProps extends PrimitiveProps {
  geometryKind: FurnitureGeometryKind
}

function SketchPrimitive({
  geometryKind,
  size,
  position,
  material,
  rotation = [0, 0, 0],
  outlineScale = 1.018,
}: SketchPrimitiveProps) {
  const geometry = getFurnitureGeometry(geometryKind)

  return (
    <group position={position} rotation={rotation} scale={size}>
      <mesh
        geometry={geometry}
        material={FURNITURE_OUTLINE_MATERIAL}
        scale={outlineScale}
        castShadow={false}
        receiveShadow={false}
        dispose={null}
      />
      <mesh castShadow receiveShadow geometry={geometry} material={material} dispose={null} />
    </group>
  )
}

export function RoundedBox(props: PrimitiveProps) {
  return <SketchPrimitive {...props} geometryKind="roundedBox" />
}

export function Box(props: PrimitiveProps) {
  return <SketchPrimitive {...props} geometryKind="box" />
}

export function Cylinder(props: PrimitiveProps) {
  return <SketchPrimitive {...props} geometryKind="cylinder" />
}

function Sphere(props: PrimitiveProps) {
  return <SketchPrimitive {...props} geometryKind="sphere" outlineScale={props.outlineScale ?? 1.025} />
}

interface FourLegsProps {
  width: number
  depth: number
  height: number
  material: THREE.Material
  inset?: number
  legWidth?: number
  splay?: number
}

export function FourLegs({
  width,
  depth,
  height,
  material,
  inset = 0.1,
  legWidth = 0.085,
  splay = 0.025,
}: FourLegsProps) {
  return [-1, 1].flatMap((xSign) =>
    [-1, 1].map((zSign) => (
      <RoundedBox
        key={`${xSign}-${zSign}`}
        size={[legWidth, height, legWidth]}
        position={[xSign * (width / 2 - inset), height / 2, zSign * (depth / 2 - inset)]}
        rotation={[zSign * splay, 0, -xSign * splay]}
        material={material}
        outlineScale={1.03}
      />
    )),
  )
}

interface HandleProps {
  position: Vector3Tuple
  rotation?: Vector3Tuple
  material: THREE.Material
  length?: number
}

export function Handle({ position, rotation = [0, 0, 0], material, length = 0.18 }: HandleProps) {
  return (
    <group position={position} rotation={rotation}>
      <Cylinder size={[0.025, length, 0.025]} position={[0, 0, 0]} material={material} />
      <Sphere size={[0.055, 0.055, 0.055]} position={[0, length / 2, 0]} material={material} />
      <Sphere size={[0.055, 0.055, 0.055]} position={[0, -length / 2, 0]} material={material} />
    </group>
  )
}
