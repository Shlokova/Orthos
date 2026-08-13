import { type FurnitureItem, getCatalogItem, resolveFurnitureColor } from '@entities/scene'
import { useEditorSelector, type ViewMode } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { Edges, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { shallowEqual } from '@shared/lib'
import { memo } from 'react'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
import { useFurnitureDrag } from '../../lib/interactions/useFurnitureDrag'
import { useFurnitureRotate } from '../../lib/interactions/useFurnitureRotate'
import { ProceduralFurniture } from '../furniture/ProceduralFurniture'
import { PlanHitArea, VolumeHitArea } from './FurnitureHitArea'
import { FurnitureRotateHandle } from './FurnitureRotateHandle'
import { PlanFurnitureSymbol } from './PlanFurnitureSymbol'

interface Props {
  item: FurnitureItem
  viewMode: ViewMode
}

interface FurnitureVisualProps extends Props {
  selected: boolean
  invalid: boolean
  isDragging: boolean
  illustratedColor: string
  handlePointerDown: (event: ThreeEvent<PointerEvent>) => void
  handleRotatePointerDown: (event: ThreeEvent<PointerEvent>) => void
}

function PlanFurnitureVisual({
  item,
  selected,
  invalid,
  illustratedColor,
  handlePointerDown,
  handleRotatePointerDown,
}: FurnitureVisualProps) {
  const walkable = getCatalogItem(item.kind).walkable === true
  const layerY = walkable ? 0.032 : 0.062
  const renderOrder = walkable ? 16 : 20

  return (
    <group
      position={[item.position.x, layerY + (selected ? 0.014 : 0), item.position.z]}
      rotation-y={planAngleToSceneY(item.rotation)}
    >
      <PlanFurnitureSymbol
        item={item}
        color={illustratedColor}
        selected={selected}
        invalid={invalid}
        baseRenderOrder={renderOrder}
      />
      <PlanHitArea width={item.size.width} depth={item.size.depth} onPointerDown={handlePointerDown} />
      {selected && (
        <FurnitureRotateHandle
          width={item.size.width}
          depth={item.size.depth}
          height={0.1}
          onPointerDown={handleRotatePointerDown}
        />
      )}
      {(selected || invalid) && (
        <Html
          center
          transform={false}
          position={[0, 0.16, item.size.depth / 2 + 0.12]}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`plan-object-label ${selected ? 'is-selected' : ''} ${invalid ? 'is-invalid' : ''}`}>
            {item.name}
          </div>
        </Html>
      )}
    </group>
  )
}

function PerspectiveFurnitureVisual({
  item,
  selected,
  invalid,
  isDragging,
  illustratedColor,
  handlePointerDown,
  handleRotatePointerDown,
}: FurnitureVisualProps) {
  const definition = getCatalogItem(item.kind)
  const modelItem = { ...item, color: illustratedColor, height: definition.height }
  const heightScale = item.height / definition.height

  return (
    <group position={[item.position.x, 0, item.position.z]} rotation-y={planAngleToSceneY(item.rotation)}>
      <group scale-y={heightScale}>
        <ProceduralFurniture item={modelItem} />
      </group>
      <VolumeHitArea
        width={item.size.width}
        depth={item.size.depth}
        height={item.height}
        onPointerDown={handlePointerDown}
      />
      {selected && (
        <FurnitureRotateHandle
          width={item.size.width}
          depth={item.size.depth}
          height={item.height + 0.12}
          onPointerDown={handleRotatePointerDown}
        />
      )}
      {invalid && (
        <mesh position-y={item.height / 2} renderOrder={7}>
          <boxGeometry args={[item.size.width + 0.08, item.height + 0.08, item.size.depth + 0.08]} />
          <meshBasicMaterial
            color={SCENE_THEME.palette.invalid}
            wireframe
            transparent
            opacity={0.72}
            depthTest={false}
          />
        </mesh>
      )}
      {selected && (
        <mesh position-y={0.042} rotation-x={-Math.PI / 2} renderOrder={3}>
          <planeGeometry args={[item.size.width + 0.08, item.size.depth + 0.08]} />
          <meshBasicMaterial
            transparent
            opacity={0.11}
            color={invalid ? SCENE_THEME.palette.invalid : SCENE_THEME.palette.olivePlan}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
          />
          <Edges color={invalid ? SCENE_THEME.palette.invalid : SCENE_THEME.palette.olivePlan} />
        </mesh>
      )}
      {selected && !isDragging && (
        <Html center transform={false} position={[0, item.height + 0.25, 0]} style={{ pointerEvents: 'none' }}>
          <div className="object-label">
            {item.size.width.toFixed(2)} × {item.size.depth.toFixed(2)} m · Floor
          </div>
        </Html>
      )}
    </group>
  )
}

function FurnitureObjectComponent({ item, viewMode }: Props) {
  const { interactionTool } = useViewportInteraction()
  const { selected, invalid, selectedDragging } = useEditorSelector((state) => {
    const isSelected = state.selectedId === item.id
    return {
      selected: isSelected,
      invalid: state.invalidIds.has(item.id),
      selectedDragging: isSelected && state.isTransacting,
    }
  }, shallowEqual)
  const illustratedColor = resolveFurnitureColor(item)
  const handlePointerDown = useFurnitureDrag({ item, viewMode, interactionTool })
  const handleRotatePointerDown = useFurnitureRotate({ item, viewMode, interactionTool })
  const visualProps: FurnitureVisualProps = {
    item,
    viewMode,
    selected,
    invalid,
    isDragging: selectedDragging,
    illustratedColor,
    handlePointerDown,
    handleRotatePointerDown,
  }

  return viewMode === 'top' ? <PlanFurnitureVisual {...visualProps} /> : <PerspectiveFurnitureVisual {...visualProps} />
}

export const FurnitureObject = memo(FurnitureObjectComponent)
