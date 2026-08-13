import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

interface NativePolylineProps {
  points: readonly (readonly [number, number, number])[]
  color: THREE.ColorRepresentation
  closed?: boolean
  depthTest?: boolean
  renderOrder?: number
}

const MATERIAL_CACHE = new Map<string, THREE.LineBasicMaterial>()

function materialKey(color: THREE.ColorRepresentation, depthTest: boolean): string {
  return `${new THREE.Color(color).getHexString()}:${depthTest ? 'depth' : 'overlay'}`
}

function getLineMaterial(color: THREE.ColorRepresentation, depthTest: boolean): THREE.LineBasicMaterial {
  const key = materialKey(color, depthTest)
  const cached = MATERIAL_CACHE.get(key)
  if (cached) return cached
  const material = new THREE.LineBasicMaterial({
    color,
    depthTest,
    depthWrite: depthTest,
    transparent: false,
    toneMapped: false,
  })
  MATERIAL_CACHE.set(key, material)
  return material
}

function pointsSignature(points: readonly (readonly [number, number, number])[]): string {
  return points.map(([x, y, z]) => `${x},${y},${z}`).join(';')
}

export function NativePolyline({
  points,
  color,
  closed = false,
  depthTest = true,
  renderOrder = 0,
}: NativePolylineProps) {
  const signature = pointsSignature(points)
  // biome-ignore lint/correctness/useExhaustiveDependencies: the signature is the key for `points`
  const geometry = useMemo(() => {
    const next = new THREE.BufferGeometry()
    next.setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
    return next
  }, [signature])
  const material = useMemo(() => getLineMaterial(color, depthTest), [color, depthTest])
  const object = useMemo(
    () => (closed ? new THREE.LineLoop(geometry, material) : new THREE.Line(geometry, material)),
    [closed, geometry, material],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  return <primitive object={object} renderOrder={renderOrder} />
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const material of MATERIAL_CACHE.values()) material.dispose()
    MATERIAL_CACHE.clear()
  })
}
