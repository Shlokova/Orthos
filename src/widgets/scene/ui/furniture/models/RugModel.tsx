import { Cylinder, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

const RUG_ROWS = 4
const RUG_COLUMNS = 6
const RUG_FRINGE_COUNT = 7

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
      {Array.from({ length: RUG_FRINGE_COUNT }, (_, index) => index).map((index) => {
        const divisor = RUG_FRINGE_COUNT - 1
        const x = -width / 2 + (width / divisor) * index
        return (
          <Cylinder
            key={index}
            size={[0.012, 0.11, 0.012]}
            position={[x, item.height / 2, -depth / 2 - 0.055]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.dark}
          />
        )
      })}
    </group>
  )
}
