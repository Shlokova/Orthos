import { Line, type PlanSymbolProps, Rect } from './primitives'

export function StorageSymbol({
  item,
  colors,
  width,
  depth,
  insetW,
  insetD,
  fillOrder,
  outlineOrder,
}: PlanSymbolProps) {
  const front = depth / 2

  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={colors.primary} y={0.04} renderOrder={fillOrder} />
      {item.kind === 'bookshelf' ? (
        [-0.22, 0.05, 0.28].map((z) => (
          <Line
            key={z}
            points={[
              [-width * 0.42, 0, z * depth],
              [width * 0.42, 0, z * depth],
            ]}
            renderOrder={outlineOrder}
          />
        ))
      ) : (
        <Line
          points={[
            [0, 0, -depth / 2 + insetD],
            [0, 0, front],
          ]}
          renderOrder={outlineOrder}
        />
      )}
    </>
  )
}
