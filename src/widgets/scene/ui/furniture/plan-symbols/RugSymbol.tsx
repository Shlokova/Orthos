import { NativePolyline } from '../../primitives/NativePolyline'
import { DETAIL, footprintOutline, type PlanSymbolProps, Rect } from './primitives'

export function RugSymbol({ color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect
        width={width - insetW}
        depth={depth - insetD}
        color={color}
        y={0.035}
        opacity={0.72}
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
