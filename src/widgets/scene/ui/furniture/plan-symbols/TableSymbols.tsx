import { Circle, Ellipse, OUTLINE, type PlanSymbolProps, RoundedRect } from './primitives'

const ROUND_TOP_RATIO = 0.86

export function TableSymbol({ colors, width, depth, insetW, insetD, fillOrder, detailOrder }: PlanSymbolProps) {
  const topWidth = width - insetW
  const topDepth = depth - insetD
  const round = Math.min(topWidth, topDepth) / Math.max(topWidth, topDepth) >= ROUND_TOP_RATIO

  return (
    <>
      {round ? (
        <Ellipse width={topWidth} depth={topDepth} color={colors.primary} y={0.04} renderOrder={fillOrder} />
      ) : (
        <RoundedRect
          width={topWidth}
          depth={topDepth}
          radius={Math.min(topWidth, topDepth) * 0.08}
          color={colors.primary}
          y={0.04}
          renderOrder={fillOrder}
        />
      )}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((z) => (
          <Circle
            key={`${x}-${z}`}
            x={x * width * (round ? 0.29 : 0.37)}
            z={z * depth * (round ? 0.29 : 0.35)}
            diameter={Math.min(width, depth) * 0.08}
            color={OUTLINE}
            renderOrder={detailOrder}
          />
        )),
      )}
    </>
  )
}
