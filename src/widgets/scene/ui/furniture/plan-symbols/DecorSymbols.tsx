import { Circle, DETAIL, Line, type PlanSymbolProps, Polygon, Rect } from './primitives'

const LEAF_COUNT = 9

function leafRosette(radius: number): [number, number][] {
  const points: [number, number][] = []
  for (let index = 0; index < LEAF_COUNT * 2; index += 1) {
    const angle = (index * Math.PI) / LEAF_COUNT
    const reach = index % 2 === 0 ? radius : radius * 0.5
    points.push([Math.cos(angle) * reach, Math.sin(angle) * reach])
  }
  return points
}

export function DecorSymbol({
  item,
  colors,
  width,
  depth,
  insetW,
  insetD,
  fillOrder,
  detailOrder,
  outlineOrder,
}: PlanSymbolProps) {
  const diameter = Math.min(width, depth)

  if (item.kind === 'plant') {
    return (
      <>
        <Polygon points={leafRosette(diameter / 2)} color={colors.primary} y={0.04} renderOrder={fillOrder} />
        <Circle diameter={diameter * 0.34} color={DETAIL} y={0.05} renderOrder={detailOrder} />
      </>
    )
  }

  if (item.kind === 'vase') {
    return (
      <>
        <Circle diameter={diameter} color={colors.primary} y={0.04} renderOrder={fillOrder} />
        <Circle diameter={diameter * 0.62} color={DETAIL} y={0.045} renderOrder={detailOrder} />
      </>
    )
  }

  return (
    <>
      <Rect width={width - insetW} depth={depth - insetD} color={colors.primary} y={0.04} renderOrder={fillOrder} />
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
