import { type PlanSymbolProps, RoundedRect } from './primitives'

const TWO_PILLOW_WIDTH = 1.3

export function BedSymbol({
  width,
  depth,
  insetW,
  insetD,
  fillOrder,
  detailOrder,
  outlineOrder,
  colors,
}: PlanSymbolProps) {
  const headboardDepth = Math.max(0.06, depth * 0.09)
  const mattressDepth = depth - insetD - headboardDepth
  const mattressZ = -depth / 2 + headboardDepth + mattressDepth / 2
  const pillowDepth = Math.max(0.1, depth * 0.2)
  const pillowZ = mattressZ - mattressDepth / 2 + pillowDepth / 2 + insetD * 0.3
  const pillows = width >= TWO_PILLOW_WIDTH ? [-1, 1] : [0]
  const pillowWidth = pillows.length === 2 ? width * 0.4 : width * 0.52
  const blanketDepth = mattressDepth - pillowDepth
  const blanketZ = pillowZ + pillowDepth / 2 + blanketDepth / 2

  return (
    <>
      <RoundedRect
        width={width - insetW}
        depth={mattressDepth}
        z={mattressZ}
        radius={Math.min(width, depth) * 0.06}
        color={colors.dark}
        y={0.042}
        renderOrder={fillOrder}
      />
      <RoundedRect
        width={width - insetW}
        depth={headboardDepth}
        z={-depth / 2 + headboardDepth / 2 + insetD * 0.2}
        radius={headboardDepth * 0.4}
        color={colors.primary}
        y={0.05}
        renderOrder={outlineOrder}
      />
      <RoundedRect
        width={width - insetW}
        depth={blanketDepth}
        z={blanketZ}
        radius={headboardDepth * 0.4}
        color={colors.secondary}
        y={0.05}
        renderOrder={outlineOrder}
      />
      {pillows.map((side) => (
        <RoundedRect
          key={side}
          width={pillowWidth}
          depth={pillowDepth}
          x={(side * width) / 4.6}
          z={pillowZ}
          radius={pillowDepth * 0.45}
          color={colors.white}
          y={0.06}
          renderOrder={detailOrder}
        />
      ))}
    </>
  )
}
