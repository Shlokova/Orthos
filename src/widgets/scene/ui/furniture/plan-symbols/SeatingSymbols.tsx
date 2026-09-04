import { Line, OUTLINE, type PlanSymbolProps, RoundedRect } from './primitives'

function cushionCount(width: number): number {
  if (width < 1.2) return 1
  if (width < 2) return 2
  return 3
}

export function SofaSymbol({
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
  const bodyWidth = width - insetW * 2
  const bodyDepth = depth - insetD * 2
  const backDepth = 0.18
  const armWidth = 0.18
  const seatDepth = bodyDepth - backDepth
  const seatWidth = bodyWidth - armWidth * 2
  const seatZ = -depth / 2 + insetD + backDepth + seatDepth / 2
  const cushions = item.kind === 'sofa' ? cushionCount(width) : 1
  const cushionGap = 0.04
  const cushionWidth = seatWidth / cushions - cushionGap

  return (
    <>
      <RoundedRect
        width={bodyWidth}
        depth={bodyDepth}
        radius={Math.min(width, depth) * 0.14}
        color={colors.primary}
        y={0.04}
        renderOrder={fillOrder}
      />
      <RoundedRect
        width={bodyWidth}
        depth={backDepth}
        z={-depth / 2 + insetD + backDepth / 2}
        radius={backDepth * 0.35}
        color={colors.dark}
        y={0.05}
        renderOrder={detailOrder}
      />
      {[-1, 1].map((side) => (
        <RoundedRect
          key={side}
          width={armWidth}
          depth={seatDepth}
          x={(side * (bodyWidth - armWidth)) / 2}
          z={seatZ}
          radius={armWidth * 0.4}
          color={colors.dark}
          y={0.05}
          renderOrder={detailOrder}
        />
      ))}
      {Array.from({ length: cushions }, (_, index) => {
        const x = -seatWidth / 2 + (index + 0.5) * (cushionWidth + cushionGap)
        return (
          <RoundedRect
            key={index}
            width={cushionWidth}
            depth={seatDepth - 0.05}
            x={x}
            z={seatZ}
            radius={armWidth * 0.4}
            color={colors.secondary}
            y={0.05}
            renderOrder={outlineOrder}
          />
        )
      })}
    </>
  )
}

export function BenchSymbol({ colors, width, depth, insetW, insetD, fillOrder, outlineOrder }: PlanSymbolProps) {
  return (
    <>
      <RoundedRect
        width={width}
        depth={depth}
        radius={Math.min(width, depth) * 0.12}
        color={colors.secondary}
        y={0.04}
        renderOrder={fillOrder}
      />
      <RoundedRect
        width={width - insetW * 2}
        depth={depth - insetD * 2}
        radius={Math.min(width, depth) * 0.12}
        color={colors.primary}
        y={0.04}
        renderOrder={outlineOrder}
      />
    </>
  )
}

export function ChairSymbol({ colors, width, depth, fillOrder, outlineOrder }: PlanSymbolProps) {
  const seatWidth = width * 0.74
  const seatDepth = depth * 0.68
  const seatZ = depth * 0.07

  return (
    <>
      <RoundedRect
        width={seatWidth}
        depth={seatDepth}
        z={seatZ}
        radius={Math.min(seatWidth, seatDepth) * 0.24}
        color={colors.secondary}
        y={0}
        renderOrder={fillOrder}
      />
      <RoundedRect
        width={width}
        depth={0.1}
        z={-depth / 2 + 0.1 / 2}
        radius={Math.min(seatWidth, seatDepth) * 0.24}
        color={colors.dark}
        y={0}
        renderOrder={outlineOrder}
      />
      {[-1, 0, 1].map((number) => (
        <Line
          key={number}
          points={[
            [number, 0, 0],
            [number, 0, 0],
            [number, 0, 0],
          ]}
          color={OUTLINE}
          renderOrder={outlineOrder}
        />
      ))}
    </>
  )
}
