import { Circle, DETAIL, Line, type PlanSymbolProps, Rect } from './primitives'

export function DecorSymbol({ item, color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  const diameter = Math.min(width, depth) * 0.62

  if (item.kind === 'vase' || item.kind === 'plant') {
    return (
      <>
        <Circle diameter={Math.min(width, depth)} color={color} y={0.04} renderOrder={detailOrder} />
        <Circle diameter={diameter} color={DETAIL} y={0.045} renderOrder={outlineOrder} />
      </>
    )
  }

  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={color} y={0.04} renderOrder={detailOrder} />
      <Line
        points={[
          [-width * 0.34, 0, 0],
          [width * 0.34, 0, 0],
        ]}
        renderOrder={outlineOrder}
      />
    </>
  )
}
