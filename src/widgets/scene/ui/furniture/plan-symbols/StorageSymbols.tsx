import { Line, type PlanSymbolProps, Rect } from './primitives'

export function StorageSymbol({
  item,
  color,
  width,
  depth,
  insetW,
  insetD,
  detailOrder,
  outlineOrder,
}: PlanSymbolProps) {
  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={color} y={0.04} renderOrder={detailOrder} />
      <Line
        points={[
          [0, 0, -depth / 2 + insetD],
          [0, 0, depth / 2 - insetD],
        ]}
        renderOrder={outlineOrder}
      />
      {item.kind === 'bookshelf' &&
        [-0.22, 0.05, 0.28].map((z) => (
          <Line
            key={z}
            points={[
              [-width * 0.42, 0, z * depth],
              [width * 0.42, 0, z * depth],
            ]}
            renderOrder={outlineOrder}
          />
        ))}
    </>
  )
}
