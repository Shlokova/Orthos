import { SCENE_THEME } from '@shared/config/theme'
import { Line, type PlanSymbolProps, Rect } from './primitives'

export function BedSymbol({ width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect
        width={width - insetW}
        depth={depth - insetD}
        color={SCENE_THEME.palette.bedInset}
        y={0.04}
        renderOrder={detailOrder}
      />
      <Rect
        width={width * 0.36}
        depth={depth * 0.22}
        z={-depth * 0.31}
        color={SCENE_THEME.palette.bedPillow}
        y={0.06}
        renderOrder={outlineOrder}
      />
      <Line
        points={[
          [0, 0, -depth / 2 + insetD],
          [0, 0, depth / 2 - insetD],
        ]}
        renderOrder={outlineOrder}
      />
    </>
  )
}
