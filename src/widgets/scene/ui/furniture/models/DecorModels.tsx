import { Box, Cylinder, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

export function VaseModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const neck = width * 0.52

  return (
    <group>
      <Cylinder
        size={[width * 0.72, item.height * 0.18, depth * 0.72]}
        position={[0, item.height * 0.09, 0]}
        material={materials.primary}
      />
      <Cylinder
        size={[width, item.height * 0.5, depth]}
        position={[0, item.height * 0.42, 0]}
        material={materials.primary}
      />
      <Cylinder
        size={[neck, item.height * 0.34, neck]}
        position={[0, item.height * 0.83, 0]}
        material={materials.secondary}
      />
    </group>
  )
}

export function PhotoFrameModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size

  return (
    <group>
      <Box size={[width, item.height, depth * 0.34]} position={[0, item.height / 2, 0]} material={materials.dark} />
      <Box
        size={[width * 0.76, item.height * 0.76, depth * 0.12]}
        position={[0, item.height / 2, depth * 0.18]}
        material={materials.white}
      />
      <Box
        size={[depth * 0.22, item.height * 0.72, depth * 0.5]}
        position={[0, item.height * 0.32, -depth * 0.24]}
        rotation={[0.32, 0, 0]}
        material={materials.dark}
      />
    </group>
  )
}

export function PlantModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const potHeight = item.height * 0.36
  const leaves = [
    { angle: 0, tilt: 0.42 },
    { angle: Math.PI * 0.5, tilt: -0.38 },
    { angle: Math.PI, tilt: 0.34 },
    { angle: Math.PI * 1.5, tilt: -0.44 },
  ]

  return (
    <group>
      <Cylinder
        size={[width * 0.82, potHeight, depth * 0.82]}
        position={[0, potHeight / 2, 0]}
        material={materials.accent}
      />
      <Cylinder
        size={[width * 0.92, potHeight * 0.16, depth * 0.92]}
        position={[0, potHeight * 0.94, 0]}
        material={materials.dark}
      />
      <Cylinder
        size={[width * 0.12, item.height * 0.4, depth * 0.12]}
        position={[0, potHeight + item.height * 0.2, 0]}
        material={materials.green}
      />
      {leaves.map((leaf) => (
        <RoundedBox
          key={leaf.angle}
          size={[width * 0.62, item.height * 0.06, depth * 0.22]}
          position={[
            Math.cos(leaf.angle) * width * 0.26,
            potHeight + item.height * (0.42 + Math.abs(leaf.tilt) * 0.2),
            Math.sin(leaf.angle) * depth * 0.26,
          ]}
          rotation={[Math.sin(leaf.angle) * leaf.tilt, -leaf.angle, Math.cos(leaf.angle) * leaf.tilt]}
          material={materials.greenLight}
        />
      ))}
    </group>
  )
}

export function BooksModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const covers = [materials.primary, materials.green, materials.accent, materials.secondary]
  const bookHeight = item.height / covers.length

  return (
    <group>
      {covers.map((material, index) => (
        <RoundedBox
          key={`${index}-book`}
          size={[width * (1 - index * 0.06), bookHeight * 0.88, depth * (1 - index * 0.05)]}
          position={[index % 2 === 0 ? 0 : width * 0.03, bookHeight * (index + 0.5), 0]}
          rotation={[0, index * 0.06, 0]}
          material={material}
          outlineScale={1.01}
        />
      ))}
    </group>
  )
}
