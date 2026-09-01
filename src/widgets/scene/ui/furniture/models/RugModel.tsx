import { RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

const RUG_ROWS = 4
const RUG_COLUMNS = 6

export function RugModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const cellWidth = width / RUG_COLUMNS
  const cellDepth = depth / RUG_ROWS

  return (
    <group>
      <RoundedBox
        size={[width, item.height, depth]}
        position={[0, item.height / 2, 0]}
        material={materials.fabric}
        outlineScale={1.012}
      />
      {Array.from({ length: RUG_ROWS }, (_, row) => row).flatMap((row) =>
        Array.from({ length: RUG_COLUMNS }, (_, column) => column).map((column) => {
          if ((row + column) % 2 === 0) return null
          return (
            <RoundedBox
              key={`${row}-${column}`}
              size={[cellWidth * 0.96, 0.009, cellDepth * 0.96]}
              position={[
                -width / 2 + cellWidth * (column + 0.5),
                item.height + 0.006,
                -depth / 2 + cellDepth * (row + 0.5),
              ]}
              material={materials.secondary}
              outlineScale={1.002}
            />
          )
        }),
      )}
    </group>
  )
}
