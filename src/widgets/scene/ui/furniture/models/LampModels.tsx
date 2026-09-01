import { Box, Cylinder, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

export function TableLampModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const baseHeight = item.height * 0.1
  const shadeHeight = item.height * 0.36

  return (
    <group>
      <Cylinder
        size={[width * 0.66, baseHeight, depth * 0.66]}
        position={[0, baseHeight / 2, 0]}
        material={materials.dark}
      />
      <Cylinder
        size={[width * 0.14, item.height * 0.58, depth * 0.14]}
        position={[0, item.height * 0.35, 0]}
        material={materials.metal}
      />
      <Cylinder
        size={[width, shadeHeight, depth]}
        position={[0, item.height - shadeHeight / 2, 0]}
        material={materials.lampShade}
      />
    </group>
  )
}

export function WallLampModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const shadeHeight = item.height * 0.62

  return (
    <group>
      <RoundedBox
        size={[width * 0.42, item.height * 0.26, depth * 0.3]}
        position={[0, item.height * 0.13, -depth * 0.3]}
        material={materials.dark}
      />
      <Cylinder
        size={[depth * 0.12, depth * 0.6, depth * 0.12]}
        position={[0, item.height * 0.2, -depth * 0.05]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.metal}
      />
      <Cylinder
        size={[width, shadeHeight, width]}
        position={[0, item.height - shadeHeight / 2, depth * 0.16]}
        material={materials.lampShade}
      />
    </group>
  )
}

export function CeilingLampModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const shadeHeight = item.height * 0.42
  const dropHeight = item.height - shadeHeight

  return (
    <group>
      <Box
        size={[width * 0.3, item.height * 0.06, depth * 0.3]}
        position={[0, item.height - item.height * 0.03, 0]}
        material={materials.dark}
      />
      <Cylinder
        size={[width * 0.05, dropHeight, depth * 0.05]}
        position={[0, shadeHeight + dropHeight / 2, 0]}
        material={materials.metal}
      />
      <Cylinder size={[width, shadeHeight, depth]} position={[0, shadeHeight / 2, 0]} material={materials.lampShade} />
    </group>
  )
}
