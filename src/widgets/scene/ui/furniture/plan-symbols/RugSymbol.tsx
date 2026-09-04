import { SCENE_THEME } from '@shared/config/theme'
import { NativePolyline } from '../../primitives/NativePolyline'
import { DETAIL, footprintOutline, Hatch, type PlanSymbolProps, Rect } from './primitives'

export function RugSymbol({
  colors,
  width,
  depth,
  insetW,
  insetD,
  fillOrder,
  detailOrder,
  outlineOrder,
}: PlanSymbolProps) {
  return (
    <>
      <Rect
        width={width - insetW}
        depth={depth - insetD}
        color={colors.primary}
        y={0.035}
        opacity={0.72}
        renderOrder={fillOrder}
      />
      <Hatch
        width={width * 0.86}
        depth={depth * 0.82}
        spacing={Math.max(0.16, Math.min(width, depth) * 0.22)}
        color={SCENE_THEME.palette.hatch}
        y={0.038}
        renderOrder={detailOrder}
      />
      <NativePolyline
        points={footprintOutline(width, depth).map(([x, y, z]) => [x * 0.88, y, z * 0.84])}
        closed
        color={DETAIL}
        depthTest={false}
        renderOrder={outlineOrder}
      />
    </>
  )
}
