import { Circle, DETAIL, Line, type PlanSymbolProps, Rect } from './primitives'

export function WallSymbol({ item, color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  if (item.kind === 'wall-clock') {
    return (
      <>
        <Circle diameter={Math.min(width, depth * 2)} color={color} y={0.04} renderOrder={detailOrder} />
        <Circle diameter={Math.min(width, depth * 2) * 0.5} color={DETAIL} y={0.045} renderOrder={outlineOrder} />
      </>
    )
  }

  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={color} y={0.04} renderOrder={detailOrder} />
      <Line
        points={[
          [-width / 2, 0, -depth / 2],
          [width / 2, 0, -depth / 2],
        ]}
        color={DETAIL}
        renderOrder={outlineOrder}
      />
      {item.kind === 'shelf' &&
        [-0.28, 0.28].map((offset) => (
          <Line
            key={offset}
            points={[
              [width * offset, 0, -depth / 2],
              [width * offset, 0, depth / 2],
            ]}
            renderOrder={outlineOrder}
          />
        ))}
    </>
  )
}
