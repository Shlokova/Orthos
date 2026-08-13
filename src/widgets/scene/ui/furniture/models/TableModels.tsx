import { FourLegs, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

function WoodenTable({ item, materials, compact = false }: FurnitureModelProps & { compact?: boolean }) {
  const { width, depth } = item.size
  const topThickness = compact ? 0.105 : 0.125
  const legHeight = item.height - topThickness
  return (
    <group>
      <FourLegs
        width={width}
        depth={depth}
        height={legHeight}
        material={materials.dark}
        inset={compact ? 0.085 : 0.11}
        legWidth={compact ? 0.07 : 0.085}
        splay={compact ? 0.04 : 0.018}
      />
      <RoundedBox
        size={[width * 0.92, 0.1, depth * 0.78]}
        position={[0, legHeight - 0.01, 0]}
        material={materials.dark}
      />
      <RoundedBox
        size={[width, topThickness, depth]}
        position={[0, item.height - topThickness / 2, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[width * 0.94, 0.035, depth * 0.94]}
        position={[0, item.height + 0.012, 0]}
        material={materials.secondary}
        outlineScale={1.012}
      />
    </group>
  )
}

export function DeskModel(props: FurnitureModelProps) {
  return <WoodenTable {...props} />
}

export function DiningTableModel(props: FurnitureModelProps) {
  return <WoodenTable {...props} />
}

export function CoffeeTableModel(props: FurnitureModelProps) {
  return <WoodenTable {...props} compact />
}
