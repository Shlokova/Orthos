import { FourLegs, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

export function BedModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const frameHeight = 0.24
  const mattressHeight = 0.24
  return (
    <group>
      <FourLegs
        width={width * 0.94}
        depth={depth * 0.9}
        height={0.13}
        material={materials.dark}
        inset={0.08}
        legWidth={0.07}
      />
      <RoundedBox size={[width, frameHeight, depth]} position={[0, 0.2, 0]} material={materials.dark} />
      <RoundedBox
        size={[width * 0.94, mattressHeight, depth * 0.94]}
        position={[0, 0.42, 0.02]}
        material={materials.cream}
      />
      <RoundedBox
        size={[width * 0.95, 0.12, depth * 0.58]}
        position={[0, 0.57, depth * 0.18]}
        material={materials.secondary}
      />
      <RoundedBox size={[width, 0.68, 0.13]} position={[0, 0.48, -depth / 2 + 0.065]} material={materials.primary} />
      <RoundedBox
        size={[width * 0.39, 0.14, depth * 0.22]}
        position={[-width * 0.22, 0.66, -depth * 0.26]}
        rotation={[0.03, 0.04, 0]}
        material={materials.white}
      />
      <RoundedBox
        size={[width * 0.39, 0.14, depth * 0.22]}
        position={[width * 0.22, 0.66, -depth * 0.26]}
        rotation={[0.03, -0.04, 0]}
        material={materials.white}
      />
    </group>
  )
}
