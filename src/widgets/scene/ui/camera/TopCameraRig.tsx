import { useViewportCommands, useViewportInteraction } from '@features/viewport'
import { MapControls, OrthographicCamera } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { type ComponentRef, useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { orthographicZoomPercent, scaleClamped } from '../../lib/camera/cameraControls'
import {
  calculateTopCameraZoom,
  getPlanCameraMetrics,
  type PlanCameraMetrics,
  topViewNeedsMoreSpace,
} from '../../lib/camera/cameraMath'
import { CAMERA_FIT_TWEEN_MS, tweenScalar } from '../../lib/camera/cameraTween'
import { useCameraPlanReconciler, type ViewportSize } from '../../lib/camera/useCameraPlanReconciler'
import type { CameraModeRigProps } from './cameraRig.types'

const CAMERA_EPSILON = 1e-5
const ZOOM_STEP = 1.15

export function TopCameraRig({ rooms, isDragging, interactionLocked }: CameraModeRigProps) {
  const camera = useRef<THREE.OrthographicCamera>(null)
  const controls = useRef<ComponentRef<typeof MapControls>>(null)
  const cancelZoomTween = useRef<(() => void) | null>(null)
  const { registerController, reportZoom } = useViewportCommands()
  const { interactionTool } = useViewportInteraction()
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const metrics = useMemo(() => getPlanCameraMetrics(rooms), [rooms])
  const fitZoom = calculateTopCameraZoom(size.width, size.height, metrics.bounds)
  const cameraHeight = Math.max(16, metrics.maxHeight + 10)
  const minZoom = Math.max(1, fitZoom * 0.35)
  const maxZoom = Math.max(minZoom * 2, fitZoom * 6)
  const far = Math.max(80, cameraHeight + metrics.maxHeight + 30)

  const updateZoomLabel = useCallback(() => {
    if (!camera.current) return
    reportZoom(orthographicZoomPercent(fitZoom, camera.current.zoom))
  }, [fitZoom, reportZoom])

  const fit = useCallback(() => {
    if (!camera.current || !controls.current) return
    cancelZoomTween.current?.()
    camera.current.position.set(metrics.bounds.center.x, cameraHeight, metrics.bounds.center.z)
    camera.current.up.set(0, 0, -1)
    camera.current.rotation.set(-Math.PI / 2, 0, 0)
    camera.current.zoom = fitZoom
    camera.current.near = 0.1
    camera.current.far = far
    controls.current.target.set(metrics.bounds.center.x, 0, metrics.bounds.center.z)
    camera.current.updateMatrixWorld(true)
    camera.current.updateProjectionMatrix()
    controls.current.update()
    reportZoom(100)
    invalidate()
  }, [cameraHeight, far, fitZoom, invalidate, metrics.bounds.center.x, metrics.bounds.center.z, reportZoom])

  const reconcileView = useCallback(
    (previous: PlanCameraMetrics, next: PlanCameraMetrics, ensureFit: boolean) => {
      if (!camera.current || !controls.current) return

      const dx = next.bounds.center.x - previous.bounds.center.x
      const dz = next.bounds.center.z - previous.bounds.center.z
      if (Math.abs(dx) > CAMERA_EPSILON || Math.abs(dz) > CAMERA_EPSILON) {
        camera.current.position.x += dx
        camera.current.position.z += dz
        controls.current.target.x += dx
        controls.current.target.z += dz
      }

      camera.current.position.y = cameraHeight
      camera.current.near = 0.1
      camera.current.far = far
      camera.current.updateMatrixWorld(true)
      camera.current.updateProjectionMatrix()
      controls.current.update()
      updateZoomLabel()
      invalidate()

      if (ensureFit && camera.current.zoom > fitZoom) {
        const cameraObject = camera.current
        const controlsObject = controls.current
        cancelZoomTween.current?.()
        cancelZoomTween.current = tweenScalar(cameraObject.zoom, fitZoom, CAMERA_FIT_TWEEN_MS, (zoom) => {
          cameraObject.zoom = zoom
          cameraObject.updateProjectionMatrix()
          controlsObject.update()
          updateZoomLabel()
          invalidate()
        })
      }
    },
    [cameraHeight, far, fitZoom, invalidate, updateZoomLabel],
  )

  const zoomBy = useCallback(
    (factor: number) => {
      if (!camera.current || !controls.current) return
      const nextZoom = scaleClamped(camera.current.zoom, factor, minZoom, maxZoom)
      if (Math.abs(nextZoom - camera.current.zoom) < CAMERA_EPSILON) return
      camera.current.zoom = nextZoom
      camera.current.updateProjectionMatrix()
      controls.current.update()
      updateZoomLabel()
      invalidate()
    },
    [invalidate, maxZoom, minZoom, updateZoomLabel],
  )

  const resizeView = useCallback(
    (previousViewport: ViewportSize, nextViewport: ViewportSize) => {
      if (!camera.current || !controls.current) return
      const previousFit = calculateTopCameraZoom(previousViewport.width, previousViewport.height, metrics.bounds)
      const nextFit = calculateTopCameraZoom(nextViewport.width, nextViewport.height, metrics.bounds)
      if (previousFit <= 0 || Math.abs(nextFit - previousFit) < CAMERA_EPSILON) return

      cancelZoomTween.current?.()
      camera.current.zoom *= nextFit / previousFit
      camera.current.updateProjectionMatrix()
      controls.current.update()
      updateZoomLabel()
      invalidate()
    },
    [invalidate, metrics.bounds, updateZoomLabel],
  )

  const needsMoreSpace = useCallback(
    (previous: PlanCameraMetrics, viewport: ViewportSize) =>
      topViewNeedsMoreSpace(calculateTopCameraZoom(viewport.width, viewport.height, previous.bounds), fitZoom),
    [fitZoom],
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

  useEffect(() => () => cancelZoomTween.current?.(), [])

  useEffect(() => {
    registerController({
      zoomIn: () => zoomBy(ZOOM_STEP),
      zoomOut: () => zoomBy(1 / ZOOM_STEP),
      fit,
    })
    return () => registerController(null)
  }, [fit, registerController, zoomBy])

  return (
    <>
      <OrthographicCamera ref={camera} makeDefault near={0.1} far={far} />
      <MapControls
        ref={controls}
        makeDefault
        enabled={!isDragging && !interactionLocked}
        enableRotate={false}
        enablePan
        enableDamping={false}
        mouseButtons={
          interactionTool === 'pan'
            ? { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
            : { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }
        }
        touches={
          interactionTool === 'pan'
            ? { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }
            : { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }
        }
        screenSpacePanning
        minZoom={minZoom}
        maxZoom={maxZoom}
        onChange={updateZoomLabel}
      />
    </>
  )
}
