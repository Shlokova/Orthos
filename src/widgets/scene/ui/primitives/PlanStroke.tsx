import { Line } from '@react-three/drei'
import { useMemo } from 'react'
import type * as THREE from 'three'

interface PlanStrokeProps {
  points: readonly (readonly [number, number, number])[]
  color: THREE.ColorRepresentation
  width: number
  closed?: boolean
  depthTest?: boolean
  opacity?: number
  renderOrder?: number
}

function noRaycast(): void {}

export function PlanStroke({
  points,
  color,
  width,
  closed = false,
  depthTest = false,
  opacity = 1,
  renderOrder = 0,
}: PlanStrokeProps) {
  const signature = points.map(([x, y, z]) => `${x},${y},${z}`).join(';')
  // biome-ignore lint/correctness/useExhaustiveDependencies: the signature is the key for `points`
  const vertices = useMemo(() => {
    const list = points.map(([x, y, z]) => [x, y, z] as [number, number, number])
    const first = list[0]
    if (closed && first && list.length > 1) list.push([...first])
    return list
  }, [signature, closed])

  return (
    <Line
      points={vertices}
      color={color}
      lineWidth={width}
      depthTest={depthTest}
      depthWrite={false}
      transparent
      opacity={opacity}
      toneMapped={false}
      renderOrder={renderOrder}
      raycast={noRaycast}
    />
  )
}
