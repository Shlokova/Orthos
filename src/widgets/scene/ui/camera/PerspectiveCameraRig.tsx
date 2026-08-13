import { useViewportCommands, useViewportInteraction } from '@features/viewport'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { type ComponentRef, useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { perspectiveZoomPercent, scaleClamped } from '../../lib/camera/cameraControls'
import {
  calculatePerspectiveCameraFit,
  getPlanCameraMetrics,
  type PlanCameraMetrics,
  perspectiveViewNeedsMoreSpace,
} from '../../lib/camera/cameraMath'
import { CAMERA_FIT_TWEEN_MS, tweenScalar } from '../../lib/camera/cameraTween'
import { useCameraPlanReconciler, type ViewportSize } from '../../lib/camera/useCameraPlanReconciler'
import type { CameraModeRigProps } from './cameraRig.types'

const CAMERA_FOV = 45
const CAMERA_DIRECTION = new THREE.Vector3(0.92, 0.78, 1).normalize()
const CAMERA_EPSILON = 1e-5
const ZOOM_STEP = 1.14

export function PerspectiveCameraRig({ rooms, isDragging, interactionLocked }: CameraModeRigProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const cancelDistanceTween = useRef<(() => void) | null>(null)
  const { registerController, reportZoom } = useViewportCommands()
  const { interactionTool } = useViewportInteraction()
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const metrics = useMemo(() => getPlanCameraMetrics(rooms), [rooms])
  const aspect = Math.max(0.2, size.width / Math.max(1, size.height))
  const fitConfig = useMemo(
    () => calculatePerspectiveCameraFit(metrics.bounds, metrics.maxHeight, CAMERA_FOV, aspect),
    [aspect, metrics],
  )
  const fitTarget = useMemo(
    () => new THREE.Vector3(metrics.bounds.center.x, fitConfig.targetY, metrics.bounds.center.z),
    [fitConfig.targetY, metrics.bounds.center.x, metrics.bounds.center.z],
  )
  const fitPosition = useMemo(
    () => fitTarget.clone().addScaledVector(CAMERA_DIRECTION, fitConfig.distance),
    [fitConfig.distance, fitTarget],
  )

  const updateZoomLabel = useCallback(() => {
    if (!camera.current || !controls.current) return
    const distance = camera.current.position.distanceTo(controls.current.target)
    reportZoom(perspectiveZoomPercent(fitConfig.distance, distance))
  }, [fitConfig.distance, reportZoom])

  const updateProjectionRange = useCallback(() => {
    if (!camera.current) return
    camera.current.near = fitConfig.near
    camera.current.far = fitConfig.far
    camera.current.updateProjectionMatrix()
  }, [fitConfig.far, fitConfig.near])

  const fit = useCallback(() => {
    if (!camera.current || !controls.current) return
    cancelDistanceTween.current?.()
    camera.current.position.copy(fitPosition)
    camera.current.up.set(0, 1, 0)
    controls.current.target.copy(fitTarget)
    updateProjectionRange()
    camera.current.lookAt(fitTarget)
    controls.current.update()
    reportZoom(100)
    invalidate()
  }, [fitPosition, fitTarget, invalidate, reportZoom, updateProjectionRange])

  const reconcileView = useCallback(
    (previous: PlanCameraMetrics, next: PlanCameraMetrics, ensureFit: boolean) => {
      if (!camera.current || !controls.current) return

      const dx = next.bounds.center.x - previous.bounds.center.x
      const dz = next.bounds.center.z - previous.bounds.center.z
      const previousTargetY = Math.min(previous.maxHeight * 0.22, 0.65)
      const dy = fitConfig.targetY - previousTargetY

      if (Math.abs(dx) > CAMERA_EPSILON || Math.abs(dy) > CAMERA_EPSILON || Math.abs(dz) > CAMERA_EPSILON) {
        camera.current.position.x += dx
        camera.current.position.y += dy
        camera.current.position.z += dz
        controls.current.target.x += dx
        controls.current.target.y += dy
        controls.current.target.z += dz
      }

      updateProjectionRange()
      controls.current.update()
      updateZoomLabel()
      invalidate()

      if (!ensureFit) return
      const offset = camera.current.position.clone().sub(controls.current.target)
      if (offset.lengthSq() < CAMERA_EPSILON) offset.copy(CAMERA_DIRECTION)
      const distance = offset.length()
      if (distance >= fitConfig.distance) return

      const cameraObject = camera.current
      const controlsObject = controls.current
      const direction = offset.clone().normalize()
      cancelDistanceTween.current?.()
      cancelDistanceTween.current = tweenScalar(distance, fitConfig.distance, CAMERA_FIT_TWEEN_MS, (next) => {
        cameraObject.position.copy(controlsObject.target).addScaledVector(direction, next)
        updateProjectionRange()
        controlsObject.update()
        updateZoomLabel()
        invalidate()
      })
    },
    [fitConfig.distance, fitConfig.targetY, invalidate, updateProjectionRange, updateZoomLabel],
  )

  const zoomBy = useCallback(
    (factor: number) => {
      if (!camera.current || !controls.current) return
      const offset = camera.current.position.clone().sub(controls.current.target)
      const distance = offset.length()
      const nextDistance = scaleClamped(distance, factor, fitConfig.minDistance, fitConfig.maxDistance)
      if (Math.abs(nextDistance - distance) < CAMERA_EPSILON) return
      offset.setLength(nextDistance)
      camera.current.position.copy(controls.current.target).add(offset)
      updateProjectionRange()
      controls.current.update()
      updateZoomLabel()
      invalidate()
    },
    [fitConfig.maxDistance, fitConfig.minDistance, invalidate, updateProjectionRange, updateZoomLabel],
  )

  const resizeView = useCallback(
    (previousViewport: ViewportSize, nextViewport: ViewportSize) => {
      if (!camera.current || !controls.current) return
      const previousAspect = Math.max(0.2, previousViewport.width / Math.max(1, previousViewport.height))
      const nextAspect = Math.max(0.2, nextViewport.width / Math.max(1, nextViewport.height))
      const previousFit = calculatePerspectiveCameraFit(metrics.bounds, metrics.maxHeight, CAMERA_FOV, previousAspect)
      const nextFit = calculatePerspectiveCameraFit(metrics.bounds, metrics.maxHeight, CAMERA_FOV, nextAspect)
      if (previousFit.distance <= 0 || Math.abs(nextFit.distance - previousFit.distance) < CAMERA_EPSILON) return

      cancelDistanceTween.current?.()
      const offset = camera.current.position.clone().sub(controls.current.target)
      if (offset.lengthSq() < CAMERA_EPSILON) offset.copy(CAMERA_DIRECTION)
      offset.setLength(offset.length() * (nextFit.distance / previousFit.distance))
      camera.current.position.copy(controls.current.target).add(offset)
      updateProjectionRange()
      controls.current.update()
      updateZoomLabel()
      invalidate()
    },
    [invalidate, metrics.bounds, metrics.maxHeight, updateProjectionRange, updateZoomLabel],
  )

  const needsMoreSpace = useCallback(
    (previous: PlanCameraMetrics, viewport: ViewportSize) => {
      const aspectAtViewport = Math.max(0.2, viewport.width / Math.max(1, viewport.height))
      const previousFit = calculatePerspectiveCameraFit(
        previous.bounds,
        previous.maxHeight,
        CAMERA_FOV,
        aspectAtViewport,
      )
      return perspectiveViewNeedsMoreSpace(previousFit.distance, fitConfig.distance)
    },
    [fitConfig.distance],
  )

  useCameraPlanReconciler({
    metrics,
    isDragging,
    size,
    fit,
    resize: resizeView,
    reconcile: reconcileView,
    needsMoreSpace,
  })

  useEffect(() => () => cancelDistanceTween.current?.(), [])

  useEffect(() => {
    registerController({
      zoomIn: () => zoomBy(1 / ZOOM_STEP),
      zoomOut: () => zoomBy(ZOOM_STEP),
      fit,
    })
    return () => registerController(null)
  }, [fit, registerController, zoomBy])

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={CAMERA_FOV} near={fitConfig.near} far={fitConfig.far} />
      <OrbitControls
        ref={controls}
        makeDefault
        enabled={!isDragging && !interactionLocked}
        enableDamping
        dampingFactor={0.08}
        minDistance={fitConfig.minDistance}
        maxDistance={fitConfig.maxDistance}
        maxPolarAngle={Math.PI / 2.04}
        mouseButtons={
          interactionTool === 'pan'
            ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
            : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
        }
        onChange={updateZoomLabel}
      />
    </>
  )
}
