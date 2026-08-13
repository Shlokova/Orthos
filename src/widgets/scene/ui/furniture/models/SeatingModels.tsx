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
        size={[cushionWidth, 0.22, depth * 0.68]}
        position={[-cushionWidth / 2 - 0.035, 0.43, 0.07]}
        material={materials.primary}
      />
      <RoundedBox
        size={[cushionWidth, 0.22, depth * 0.68]}
        position={[cushionWidth / 2 + 0.035, 0.43, 0.07]}
        material={materials.secondary}
      />
      <RoundedBox
        size={[width * 0.82, 0.47, 0.18]}
        position={[0, 0.66, -depth / 2 + 0.09]}
        rotation={[-0.09, 0, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.19, 0.45, depth * 0.76]}
        position={[-width / 2 + 0.095, 0.49, 0.03]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.19, 0.45, depth * 0.76]}
        position={[width / 2 - 0.095, 0.49, 0.03]}
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
      <RoundedBox size={[width * 0.78, 0.24, depth * 0.7]} position={[0, 0.29, 0.07]} material={materials.dark} />
      <RoundedBox size={[width * 0.68, 0.2, depth * 0.62]} position={[0, 0.46, 0.08]} material={materials.secondary} />
      <RoundedBox
        size={[width * 0.74, 0.49, 0.17]}
        position={[0, 0.68, -depth / 2 + 0.1]}
        rotation={[-0.12, 0, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.17, 0.43, depth * 0.68]}
        position={[-width / 2 + 0.1, 0.48, 0.04]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.17, 0.43, depth * 0.68]}
        position={[width / 2 - 0.1, 0.48, 0.04]}
        material={materials.primary}
      />
    </group>
  )
}

export function ChairModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const seatWidth = width * 0.82
  const seatDepth = depth * 0.78
  const backZ = -depth / 2 + 0.065
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
        position={[-seatWidth / 2 + 0.045, 0.7, backZ]}
        material={materials.dark}
      />
      <RoundedBox
        size={[0.065, 0.42, 0.065]}
        position={[seatWidth / 2 - 0.045, 0.7, backZ]}
        material={materials.dark}
      />
      <RoundedBox size={[seatWidth, 0.095, 0.07]} position={[0, 0.89, backZ]} material={materials.primary} />
      {[-0.27, 0, 0.27].map((ratio) => (
        <Box
          key={ratio}
          size={[0.035, 0.28, 0.035]}
          position={[seatWidth * ratio, 0.72, backZ]}
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
