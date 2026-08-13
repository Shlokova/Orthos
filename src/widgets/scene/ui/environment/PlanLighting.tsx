import type { Bounds2D } from '@entities/scene'
import { useThree } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

interface Props {
  bounds: Bounds2D
  maxHeight: number
}

const SHADOW_PADDING = 1.2

function fitShadowCamera(
  camera: THREE.OrthographicCamera,
  lightPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  bounds: Bounds2D,
  maxHeight: number,
): void {
  camera.position.copy(lightPosition)
  camera.up.set(0, 1, 0)
  camera.lookAt(targetPosition)
  camera.updateMatrixWorld(true)

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let minDepth = Number.POSITIVE_INFINITY
  let maxDepth = Number.NEGATIVE_INFINITY
  const point = new THREE.Vector3()

  for (const x of [bounds.minX, bounds.maxX]) {
    for (const y of [0, maxHeight]) {
      for (const z of [bounds.minZ, bounds.maxZ]) {
        point.set(x, y, z).applyMatrix4(camera.matrixWorldInverse)
        minX = Math.min(minX, point.x)
        maxX = Math.max(maxX, point.x)
        minY = Math.min(minY, point.y)
        maxY = Math.max(maxY, point.y)
        const depth = -point.z
        minDepth = Math.min(minDepth, depth)
        maxDepth = Math.max(maxDepth, depth)
      }
    }
  }

  camera.left = minX - SHADOW_PADDING
  camera.right = maxX + SHADOW_PADDING
  camera.bottom = minY - SHADOW_PADDING
  camera.top = maxY + SHADOW_PADDING
  camera.near = Math.max(0.1, minDepth - SHADOW_PADDING * 2)
  camera.far = Math.max(camera.near + 4, maxDepth + SHADOW_PADDING * 3)
  camera.updateProjectionMatrix()
}

export function PlanLighting({ bounds, maxHeight }: Props) {
  const invalidate = useThree((state) => state.invalidate)
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const [target] = useState(() => new THREE.Object3D())
  const planRadius = Math.hypot(bounds.width, bounds.depth) / 2
  const targetPosition = useMemo(
    () => new THREE.Vector3(bounds.center.x, Math.min(maxHeight * 0.18, 0.5), bounds.center.z),
    [bounds.center.x, bounds.center.z, maxHeight],
  )
  const lightPosition = useMemo(
    () =>
      new THREE.Vector3(
        bounds.center.x + Math.max(4, planRadius * 0.72),
        Math.max(maxHeight + 8, planRadius * 0.8 + 8),
        bounds.center.z + Math.max(5, planRadius * 0.92),
      ),
    [bounds.center.x, bounds.center.z, maxHeight, planRadius],
  )

  useLayoutEffect(() => {
    const light = lightRef.current
    if (!light) return

    target.position.copy(targetPosition)
    target.updateMatrixWorld(true)
    light.position.copy(lightPosition)
    light.target = target
    light.updateMatrixWorld(true)

    const shadow = light.shadow
    fitShadowCamera(shadow.camera, lightPosition, targetPosition, bounds, maxHeight)
    shadow.mapSize.set(SCENE_THEME.render.shadowMapSize, SCENE_THEME.render.shadowMapSize)
    shadow.bias = -0.0001
    shadow.normalBias = 0.009
    shadow.radius = 2
    shadow.needsUpdate = true
    invalidate()
  }, [bounds, invalidate, lightPosition, maxHeight, target, targetPosition])

  return (
    <>
      <primitive object={target} />
      <ambientLight color={SCENE_THEME.palette.lightWarm} intensity={0.16} />
      <hemisphereLight args={[SCENE_THEME.palette.lightSky, SCENE_THEME.palette.lightGround, 0.22]} />
      <directionalLight ref={lightRef} castShadow target={target} position={lightPosition} intensity={2.05} />
    </>
  )
}
