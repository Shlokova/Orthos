import { Box, FourLegs, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

export function SofaModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const cushionWidth = (width - 0.34) / 2
  return (
    <group>
      <FourLegs
        width={width * 0.88}
        depth={depth * 0.7}
        height={0.14}
        material={materials.dark}
        inset={0.08}
        legWidth={0.075}
      />
      <RoundedBox size={[width, 0.25, depth * 0.8]} position={[0, 0.25, 0.04]} material={materials.dark} />
      <RoundedBox
        size={[cushionWidth - 0.04, 0.22, depth * 0.6]}
        position={[-cushionWidth / 2 + 0.01, 0.43, 0.12]}
        material={materials.secondary}
      />
      <RoundedBox
        size={[cushionWidth - 0.04, 0.22, depth * 0.6]}
        position={[cushionWidth / 2 - 0.01, 0.43, 0.12]}
        material={materials.secondary}
      />
      <RoundedBox
        size={[width * 0.82, 0.52, 0.18]}
        position={[0, 0.6, -depth / 2 + 0.16]}
        rotation={[-0.2, 0, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.19, 0.34, depth * 0.76]}
        position={[-width / 2 + 0.095, 0.51, 0.03]}
        rotation={[0, 0, 0.1]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.19, 0.34, depth * 0.76]}
        position={[width / 2 - 0.095, 0.51, 0.03]}
        rotation={[0, 0, -0.1]}
        material={materials.primary}
      />
    </group>
  )
}

export function ArmchairModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  return (
    <group>
      <FourLegs
        width={width * 0.74}
        depth={depth * 0.66}
        height={0.16}
        material={materials.dark}
        inset={0.06}
        legWidth={0.07}
        splay={0.05}
      />
      <RoundedBox size={[width * 0.95, 0.24, depth * 0.7]} position={[0, 0.19, 0.0]} material={materials.dark} />
      <RoundedBox size={[width * 0.58, 0.2, depth * 0.52]} position={[0, 0.4, 0.07]} material={materials.secondary} />
      <RoundedBox
        size={[width * 0.65, 0.5, 0.17]}
        position={[0, 0.56, -depth / 2 + 0.16]}
        rotation={[-0.2, 0, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.16, 0.4, depth * 0.65]}
        position={[-width / 2 + 0.11, 0.46, 0]}
        rotation={[0, 0, 0.08]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.16, 0.4, depth * 0.65]}
        position={[width / 2 - 0.11, 0.46, 0]}
        rotation={[0, 0, -0.08]}
        material={materials.primary}
      />
    </group>
  )
}

export function ChairModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const seatWidth = width * 0.82
  const seatDepth = depth * 0.78
  const backZ = -depth / 2 + 0.11
  return (
    <group>
      <FourLegs
        width={seatWidth}
        depth={seatDepth}
        height={0.46}
        material={materials.dark}
        inset={0.055}
        legWidth={0.055}
        splay={0.025}
      />
      <RoundedBox size={[seatWidth, 0.11, seatDepth]} position={[0, 0.49, 0.015]} material={materials.secondary} />
      <RoundedBox
        size={[0.065, 0.42, 0.065]}
        position={[-seatWidth / 2 + 0.045, 0.76, backZ]}
        material={materials.dark}
      />
      <RoundedBox
        size={[0.065, 0.42, 0.065]}
        position={[seatWidth / 2 - 0.045, 0.76, backZ]}
        material={materials.dark}
      />
      <RoundedBox size={[seatWidth, 0.095, 0.07]} position={[0, 1, backZ]} material={materials.primary} />
      {[-0.21, 0, 0.21].map((ratio) => (
        <Box
          key={ratio}
          size={[0.035, 0.47, 0.04]}
          position={[seatWidth * ratio, 0.78, backZ]}
          material={materials.primary}
        />
      ))}
    </group>
  )
}

export function BenchModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const legHeight = item.height - 0.14
  return (
    <group>
      <RoundedBox size={[width, 0.14, depth]} position={[0, item.height - 0.07, 0]} material={materials.secondary} />
      <RoundedBox
        size={[width * 0.94, 0.07, depth * 0.9]}
        position={[0, item.height + 0.015, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.11, legHeight, depth * 0.72]}
        position={[-width * 0.36, legHeight / 2, 0]}
        material={materials.dark}
      />
      <RoundedBox
        size={[0.11, legHeight, depth * 0.72]}
        position={[width * 0.36, legHeight / 2, 0]}
        material={materials.dark}
      />
    </group>
  )
}
