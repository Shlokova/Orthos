import { Circle, OUTLINE, type PlanSymbolProps, Rect } from './primitives'

export function TableSymbol({ color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={color} y={0.04} renderOrder={detailOrder} />
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Circle
            key={`${x}-${z}`}
            x={x * width * 0.37}
            z={z * depth * 0.35}
            diameter={Math.min(width, depth) * 0.08}
            color={OUTLINE}
            renderOrder={outlineOrder}
          />
        )),
      )}
    </>
  )
}
