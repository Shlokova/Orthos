import type * as THREE from 'three'
import { Box, Handle, RoundedBox } from '../FurniturePrimitives'
import type { FurnitureModelProps } from './types'

function DoorPanel({
  width,
  height,
  depth,
  x,
  y,
  material,
  handleMaterial,
  handleX,
}: {
  width: number
  height: number
  depth: number
  x: number
  y: number
  material: THREE.Material
  handleMaterial: THREE.Material
  handleX: number
}) {
  return (
    <group>
      <RoundedBox size={[width, height, depth]} position={[x, y, 0]} material={material} outlineScale={1.012} />
      <Handle
        position={[handleX, y, depth / 2 + 0.022]}
        rotation={[0, 0, 0]}
        length={Math.min(0.2, height * 0.28)}
        material={handleMaterial}
      />
    </group>
  )
}

export function CabinetModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const bodyHeight = item.height - 0.08
  const doorWidth = width * 0.43
  return (
    <group>
      <RoundedBox size={[width, bodyHeight, depth]} position={[0, bodyHeight / 2, 0]} material={materials.dark} />
      <RoundedBox
        size={[width * 1.03, 0.1, depth * 1.04]}
        position={[0, item.height - 0.05, 0]}
        material={materials.cream}
      />
      <DoorPanel
        width={doorWidth}
        height={bodyHeight * 0.78}
        depth={0.045}
        x={-width * 0.235}
        y={bodyHeight * 0.49}
        material={materials.primary}
        handleMaterial={materials.metal}
        handleX={-0.055}
      />
      <DoorPanel
        width={doorWidth}
        height={bodyHeight * 0.78}
        depth={0.045}
        x={width * 0.235}
        y={bodyHeight * 0.49}
        material={materials.secondary}
        handleMaterial={materials.metal}
        handleX={0.055}
      />
      <RoundedBox size={[width * 0.92, 0.08, depth * 0.85]} position={[0, 0.07, 0]} material={materials.dark} />
    </group>
  )
}

export function WardrobeModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const doorWidth = width * 0.44
  return (
    <group>
      <RoundedBox size={[width, item.height, depth]} position={[0, item.height / 2, 0]} material={materials.cream} />
      <RoundedBox
        size={[width * 1.025, 0.09, depth * 1.03]}
        position={[0, item.height - 0.045, 0]}
        material={materials.primary}
      />
      <DoorPanel
        width={doorWidth}
        height={item.height * 0.88}
        depth={0.05}
        x={-width * 0.24}
        y={item.height * 0.5}
        material={materials.secondary}
        handleMaterial={materials.dark}
        handleX={-0.06}
      />
      <DoorPanel
        width={doorWidth}
        height={item.height * 0.88}
        depth={0.05}
        x={width * 0.24}
        y={item.height * 0.5}
        material={materials.secondary}
        handleMaterial={materials.dark}
        handleX={0.06}
      />
      <RoundedBox size={[width * 0.9, 0.1, depth * 0.86]} position={[0, 0.08, 0]} material={materials.dark} />
    </group>
  )
}

export function BookshelfModel({ item, materials }: FurnitureModelProps) {
  const { width, depth } = item.size
  const innerWidth = width - 0.16
  const shelfCount = 4
  const shelfGap = (item.height - 0.16) / shelfCount
  const bookColors = [materials.accent, materials.green, materials.cream, materials.secondary]
  return (
    <group>
      <RoundedBox
        size={[width, item.height, 0.055]}
        position={[0, item.height / 2, -depth / 2 + 0.028]}
        material={materials.dark}
      />
      <RoundedBox
        size={[0.09, item.height, depth]}
        position={[-width / 2 + 0.045, item.height / 2, 0]}
        material={materials.primary}
      />
      <RoundedBox
        size={[0.09, item.height, depth]}
        position={[width / 2 - 0.045, item.height / 2, 0]}
        material={materials.primary}
      />
      {Array.from({ length: shelfCount + 1 }, (_, index) => index).map((index) => (
        <RoundedBox
          key={`shelf-${index}`}
          size={[innerWidth, 0.075, depth]}
          position={[0, 0.055 + index * shelfGap, 0]}
          material={materials.secondary}
        />
      ))}
      {Array.from({ length: shelfCount }, (_, shelfIndex) => shelfIndex).flatMap((shelfIndex) =>
        [-0.3, -0.1, 0.1, 0.3].map((ratio, bookIndex) => (
          <Box
            key={`${shelfIndex}-${bookIndex}`}
            size={[0.05 + bookIndex * 0.02, shelfGap * (0.48 + (bookIndex % 2) * 0.12), depth * 0.6]}
            position={[innerWidth * ratio, 0.1 + shelfIndex * shelfGap + shelfGap * 0.3, depth * 0.2]}
            rotation={[0, 0, bookIndex === 3 ? -0.02 : 0]}
            material={bookColors[(shelfIndex + bookIndex) % bookColors.length]}
            outlineScale={1.01}
          />
        )),
      )}
    </group>
  )
}
