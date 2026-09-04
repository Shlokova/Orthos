import type { FurnitureItem } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { useFurnitureColors } from '@widgets/scene/lib/furniture/FurnitureMaterials'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'
import { PlanStroke } from '../primitives/PlanStroke'
import { BedSymbol } from './plan-symbols/BedroomSymbols'
import { DecorSymbol } from './plan-symbols/DecorSymbols'
import { LightingSymbol } from './plan-symbols/LightingSymbols'
import { footprintOutline, type PlanSymbolProps } from './plan-symbols/primitives'
import { RugSymbol } from './plan-symbols/RugSymbol'
import { BenchSymbol, ChairSymbol, SofaSymbol } from './plan-symbols/SeatingSymbols'
import { StorageSymbol } from './plan-symbols/StorageSymbols'
import { TableSymbol } from './plan-symbols/TableSymbols'
import { WallSymbol } from './plan-symbols/WallSymbols'

const UI_GREEN = SCENE_THEME.palette.olivePlan
const UI_RED = SCENE_THEME.palette.invalidUi

interface Props {
  item: FurnitureItem
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
    case 'vase':
    case 'photo-frame':
    case 'plant':
    case 'books':
      return <DecorSymbol {...props} />
    case 'table-lamp':
    case 'wall-lamp':
    case 'ceiling-lamp':
      return <LightingSymbol {...props} />
    case 'shelf':
    case 'painting':
    case 'mirror':
    case 'wall-clock':
    case 'wall-tv':
      return <WallSymbol {...props} />
  }
}

export function PlanFurnitureSymbol({ item, selected, invalid, baseRenderOrder = 20 }: Props) {
  const colors = useFurnitureColors(item)
  const width = item.size.width
  const depth = item.size.depth

  const accent = invalid ? UI_RED : selected ? UI_GREEN : SCENE_THEME.palette.outline

  const footprint = footprintOutline(width, depth)
  const symbolProps: PlanSymbolProps = {
    item,
    colors,
    width,
    depth,
    insetW: Math.max(0.04, width * 0.08),
    insetD: Math.max(0.04, depth * 0.09),
    fillOrder: baseRenderOrder + 1,
    detailOrder: baseRenderOrder + 2,
    outlineOrder: baseRenderOrder + 3,
  }

  return (
    <>
      <KindSymbol {...symbolProps} />
      {(selected || invalid) && (
        <PlanStroke
          points={footprint.map(([x, y, z]) => [x * 1.05, y, z * 1.05])}
          closed
          color={accent}
          width={SCENE_THEME.plan.stroke.outline}
          renderOrder={PLAN_ORDER.selection}
        />
      )}
    </>
  )
}
