import { Circle, DETAIL, Line, type PlanSymbolProps } from './primitives'

const RAY_COUNT = 8

export function LightingSymbol({ colors, width, depth, fillOrder, detailOrder, outlineOrder }: PlanSymbolProps) {
  const diameter = Math.min(width, depth)
  const radius = diameter / 2

  return (
    <>
      <Circle diameter={diameter} color={colors.primary} y={0.04} renderOrder={fillOrder} />
      <Circle diameter={diameter * 0.44} color={DETAIL} y={0.045} renderOrder={detailOrder} />
      {Array.from({ length: RAY_COUNT }, (_, index) => (index * Math.PI * 2) / RAY_COUNT).map((angle) => (
        <Line
          key={angle}
          points={[
            [Math.cos(angle) * radius * 0.68, 0, Math.sin(angle) * radius * 0.68],
            [Math.cos(angle) * radius * 1.15, 0, Math.sin(angle) * radius * 1.15],
          ]}
          renderOrder={outlineOrder}
        />
      ))}
    </>
  )
}
