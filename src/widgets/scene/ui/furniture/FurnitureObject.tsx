import type { RoomDefinition } from '@entities/scene'
import {
  type FurnitureItem,
  findItemSupport,
  getCatalogItem,
  getItemAnchorStrategy,
  resolveFurnitureColor,
} from '@entities/scene'
import { useEditorActions, useEditorSelector, type ViewMode } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { Edges, Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { shallowEqual } from '@shared/lib'
import { memo } from 'react'
import type { PlanItemLayer } from '../../lib/geometry/planLayers'
import { planAngleToSceneY } from '../../lib/geometry/sceneCoordinates'
import { useFurnitureDrag } from '../../lib/interactions/useFurnitureDrag'
import { useFurnitureRotate } from '../../lib/interactions/useFurnitureRotate'
import { useVerticalDrag } from '../../lib/interactions/useVerticalDrag'
import { ProceduralFurniture } from '../furniture/ProceduralFurniture'
import { HeightHandle } from '../primitives/HeightHandle'
import { PlanHitArea, VolumeHitArea } from './FurnitureHitArea'
import { FurnitureRotateHandle } from './FurnitureRotateHandle'
import { PlanFurnitureSymbol } from './PlanFurnitureSymbol'

interface Props {
  item: FurnitureItem
  room: RoomDefinition | null
  viewMode: ViewMode
  layer: PlanItemLayer
}

function describePlacement(item: FurnitureItem, items: readonly FurnitureItem[]): string {
  switch (getCatalogItem(item.kind).anchor) {
    case 'wall':
      return `Wall · ${item.elevation.toFixed(2)} m`
    case 'ceiling':
      return `Ceiling · ${item.elevation.toFixed(2)} m`
    case 'surface': {
      const support = findItemSupport(item, items)
      return support ? `On ${support.name}` : 'Floor'
    }
    case 'floor':
      return 'Floor'
  }
}

interface FurnitureVisualProps extends Props {
  selected: boolean
  invalid: boolean
  isDragging: boolean
  placementLabel: string
  handleHeightPointerDown: (event: ThreeEvent<PointerEvent>) => void
  handlePointerDown: (event: ThreeEvent<PointerEvent>) => void
  handleRotatePointerDown: (event: ThreeEvent<PointerEvent>) => void
}

function PlanFurnitureVisual({
  item,
  selected,
  invalid,
  layer,
  handlePointerDown,
  handleRotatePointerDown,
}: FurnitureVisualProps) {
  const strategy = getItemAnchorStrategy(item.kind)

  return (
    <group position={[item.position.x, layer.y, item.position.z]} rotation-y={planAngleToSceneY(item.rotation)}>
      <PlanFurnitureSymbol item={item} selected={selected} invalid={invalid} baseRenderOrder={layer.order} />
      <PlanHitArea width={item.size.width} depth={item.size.depth} onPointerDown={handlePointerDown} />
      {selected && strategy.rotatable && (
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
  placementLabel,
  handlePointerDown,
  handleRotatePointerDown,
  handleHeightPointerDown,
}: FurnitureVisualProps) {
  const definition = getCatalogItem(item.kind)
  const strategy = getItemAnchorStrategy(item.kind)
  const modelItem = { ...item, color: resolveFurnitureColor(item), height: definition.height }
  const heightScale = item.height / definition.height

  return (
    <group position={[item.position.x, item.elevation, item.position.z]} rotation-y={planAngleToSceneY(item.rotation)}>
      <group scale-y={heightScale}>
        <ProceduralFurniture item={modelItem} />
      </group>
      <VolumeHitArea
        width={item.size.width}
        depth={item.size.depth}
        height={item.height}
        onPointerDown={handlePointerDown}
      />
      {selected && strategy.rotatable && (
        <FurnitureRotateHandle
          width={item.size.width}
          depth={item.size.depth}
          height={item.height + 0.12}
          onPointerDown={handleRotatePointerDown}
        />
      )}
      {selected && strategy.editableElevation && (
        <HeightHandle width={item.size.width} centerY={item.height / 2} onPointerDown={handleHeightPointerDown} />
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
            {item.size.width.toFixed(2)} × {item.size.depth.toFixed(2)} m · {placementLabel}
          </div>
        </Html>
      )}
    </group>
  )
}

function FurnitureObjectComponent({ item, room, viewMode, layer }: Props) {
  const { interactionTool } = useViewportInteraction()
  const { selected, invalid, selectedDragging, placementLabel } = useEditorSelector((state) => {
    const isSelected = state.selectedId === item.id
    return {
      selected: isSelected,
      invalid: state.invalidIds.has(item.id),
      selectedDragging: isSelected && state.isTransacting,
      placementLabel: isSelected ? describePlacement(item, state.scene.items) : '',
    }
  }, shallowEqual)
  const { updateItem } = useEditorActions()
  const handlePointerDown = useFurnitureDrag({ item, viewMode, interactionTool })
  const handleRotatePointerDown = useFurnitureRotate({ item, viewMode, interactionTool })
  const handleHeightPointerDown = useVerticalDrag({
    origin: item.position,
    value: item.elevation,
    bounds: { min: 0, max: Math.max(0, (room?.height ?? item.height) - item.height) },
    interactionTool,
    onPreview: (elevation) => updateItem(item.id, { elevation }, 'preview'),
  })
  const visualProps: FurnitureVisualProps = {
    item,
    room,
    viewMode,
    layer,
    selected,
    invalid,
    isDragging: selectedDragging,
    placementLabel,
    handlePointerDown,
    handleRotatePointerDown,
    handleHeightPointerDown,
  }

  return viewMode === 'top' ? <PlanFurnitureVisual {...visualProps} /> : <PerspectiveFurnitureVisual {...visualProps} />
}

export const FurnitureObject = memo(FurnitureObjectComponent)
