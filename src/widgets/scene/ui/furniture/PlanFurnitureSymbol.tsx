import { type FurnitureItem, getCatalogItem } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { useMemo } from 'react'
import * as THREE from 'three'
import { NativePolyline } from '../primitives/NativePolyline'
import { BedSymbol } from './plan-symbols/BedroomSymbols'
import { footprintOutline, type PlanSymbolProps, Rect } from './plan-symbols/primitives'
import { RugSymbol } from './plan-symbols/RugSymbol'
import { BenchSymbol, ChairSymbol, SofaSymbol } from './plan-symbols/SeatingSymbols'
import { StorageSymbol } from './plan-symbols/StorageSymbols'
import { TableSymbol } from './plan-symbols/TableSymbols'

const UI_GREEN = SCENE_THEME.palette.olivePlan
const UI_RED = SCENE_THEME.palette.invalidUi

interface Props {
  item: FurnitureItem
  color: string
  selected: boolean
  invalid: boolean
  baseRenderOrder?: number
}

function KindSymbol(props: PlanSymbolProps) {
  switch (props.item.kind) {
    case 'sofa':
    case 'armchair':
      return <SofaSymbol {...props} />
    case 'chair':
      return <ChairSymbol {...props} />
    case 'bench':
      return <BenchSymbol {...props} />
    case 'table':
    case 'coffee-table':
    case 'desk':
      return <TableSymbol {...props} />
    case 'bed':
      return <BedSymbol {...props} />
    case 'rug':
      return <RugSymbol {...props} />
    case 'cabinet':
    case 'bookshelf':
    case 'wardrobe':
      return <StorageSymbol {...props} />
  }
}

export function PlanFurnitureSymbol({ item, color, selected, invalid, baseRenderOrder = 20 }: Props) {
  const definition = getCatalogItem(item.kind)
  const width = item.size.width
  const depth = item.size.depth
  const accent = invalid ? UI_RED : selected ? UI_GREEN : SCENE_THEME.palette.outline
  const softColor = useMemo(
    () => `#${new THREE.Color(color).lerp(new THREE.Color(SCENE_THEME.palette.softCream), 0.2).getHexString()}`,
    [color],
  )

  const footprint = footprintOutline(width, depth)
  const symbolProps: PlanSymbolProps = {
    item,
    color,
    width,
    depth,
    insetW: Math.max(0.04, width * 0.08),
    insetD: Math.max(0.04, depth * 0.09),
    detailOrder: baseRenderOrder + 1,
    outlineOrder: baseRenderOrder + 2,
  }

  return (
    <>
      <Rect
        width={width}
        depth={depth}
        color={softColor}
        opacity={definition.walkable ? 0.68 : 0.94}
        renderOrder={baseRenderOrder}
      />
      <NativePolyline
        points={footprint}
        closed
        color={accent}
        depthTest={false}
        renderOrder={symbolProps.outlineOrder}
      />
      <KindSymbol {...symbolProps} />
      {selected && (
        <NativePolyline
          points={footprint.map(([x, y, z]) => [x * 1.05, y, z * 1.05])}
          closed
          color={accent}
          depthTest={false}
          renderOrder={baseRenderOrder + 3}
        />
      )}
    </>
  )
}
