import { Line, OUTLINE, type PlanSymbolProps, Rect } from './primitives'

export function SofaSymbol({ item, color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect width={width - insetW * 2} depth={depth - insetD * 2} color={color} y={0.04} renderOrder={detailOrder} />
      <Rect
        width={width - insetW * 2}
        depth={Math.max(0.09, depth * 0.2)}
        z={-depth * 0.32}
        color={OUTLINE}
        y={0.055}
        renderOrder={detailOrder}
      />
      {item.kind === 'sofa' && (
        <Line
          points={[
            [0, 0, -depth * 0.18],
            [0, 0, depth * 0.34],
          ]}
          renderOrder={outlineOrder}
        />
      )}
    </>
  )
}

export function BenchSymbol({ color, width, depth, insetW, insetD, detailOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect width={width - insetW * 2} depth={depth - insetD * 2} color={color} y={0.04} renderOrder={detailOrder} />
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

export function ChairSymbol({ color, width, depth, detailOrder }: PlanSymbolProps) {
  return (
    <>
      <Rect
        width={width * 0.72}
        depth={depth * 0.68}
        z={depth * 0.05}
        color={color}
        y={0.04}
        renderOrder={detailOrder}
      />
      <Rect
        width={width * 0.78}
        depth={Math.max(0.06, depth * 0.12)}
        z={-depth * 0.38}
        color={OUTLINE}
        y={0.055}
        renderOrder={detailOrder}
      />
    </>
  )
}
