import { Box, Cylinder, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

export function ShelfModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const bracketDepth = depth * 0.7

  return (
    <group>
      <RoundedBox
        size={[width, item.height, depth]}
        position={[0, item.height / 2, 0]}
        material={materials.primary}
        outlineScale={1.01}
      />
      {[-1, 1].map((sign) => (
        <Box
          key={sign}
          size={[depth * 0.14, item.height * 1.6, bracketDepth]}
          position={[sign * (width / 2 - depth * 0.35), -item.height * 0.65, -depth * 0.1]}
          material={materials.dark}
        />
      ))}
    </group>
  )
}

export function PaintingModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size

  return (
    <group>
      <Box size={[width, item.height, depth]} position={[0, item.height / 2, 0]} material={materials.dark} />
      <Box
        size={[width * 0.86, item.height * 0.84, depth * 0.4]}
        position={[0, item.height / 2, depth * 0.32]}
        material={materials.cream}
      />
      <RoundedBox
        size={[width * 0.5, item.height * 0.34, depth * 0.16]}
        position={[-width * 0.12, item.height * 0.42, depth * 0.44]}
        rotation={[0, 0, 0.18]}
        material={materials.green}
        outlineScale={1.006}
      />
      <RoundedBox
        size={[width * 0.3, item.height * 0.24, depth * 0.16]}
        position={[width * 0.2, item.height * 0.62, depth * 0.44]}
        material={materials.accent}
        outlineScale={1.006}
      />
    </group>
  )
}

export function MirrorModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size

  return (
    <group>
      <RoundedBox size={[width, item.height, depth]} position={[0, item.height / 2, 0]} material={materials.primary} />
      <Box
        size={[width * 0.84, item.height * 0.88, depth * 0.4]}
        position={[0, item.height / 2, depth * 0.34]}
        material={materials.glass}
      />
    </group>
  )
}

export function WallClockModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const faceY = item.height / 2

  return (
    <group>
      <Cylinder
        size={[width, depth, item.height]}
        position={[0, faceY, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.primary}
      />
      <Cylinder
        size={[width * 0.82, depth * 0.5, item.height * 0.82]}
        position={[0, faceY, depth * 0.3]}
        rotation={[Math.PI / 2, 0, 0]}
        material={materials.white}
      />
      <Box
        size={[width * 0.06, item.height * 0.32, depth * 0.16]}
        position={[0, faceY + item.height * 0.14, depth * 0.44]}
        material={materials.dark}
      />
      <Box
        size={[width * 0.28, item.height * 0.05, depth * 0.16]}
        position={[width * 0.12, faceY, depth * 0.44]}
        material={materials.dark}
      />
    </group>
  )
}

export function WallTvModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size

  return (
    <group>
      <Box
        size={[depth * 0.9, item.height * 0.36, depth * 0.6]}
        position={[0, item.height / 2, -depth * 0.2]}
        material={materials.dark}
      />
      <RoundedBox
        size={[width, item.height, depth * 0.7]}
        position={[0, item.height / 2, depth * 0.16]}
        material={materials.dark}
        outlineScale={1.008}
      />
      <Box
        size={[width * 0.94, item.height * 0.9, depth * 0.2]}
        position={[0, item.height / 2, depth * 0.4]}
        material={materials.glass}
      />
    </group>
  )
}
