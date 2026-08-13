import { useLayoutEffect, useRef } from 'react'
import { type PlanCameraMetrics, resolveCameraPlanChange } from './cameraMath'

export interface ViewportSize {
  width: number
  height: number
}

interface CameraPlanReconcilerOptions {
  metrics: PlanCameraMetrics
  isDragging: boolean
  size: ViewportSize
  fit: () => void
  resize: (previousViewport: ViewportSize, nextViewport: ViewportSize) => void
  reconcile: (previous: PlanCameraMetrics, next: PlanCameraMetrics, ensureFit: boolean) => void
  needsMoreSpace: (previous: PlanCameraMetrics, viewport: ViewportSize) => boolean
}

export function useCameraPlanReconciler({
  metrics,
  isDragging,
  size,
  fit,
  resize,
  reconcile,
  needsMoreSpace,
}: CameraPlanReconcilerOptions): void {
  const lastMetrics = useRef<PlanCameraMetrics | null>(null)
  const pendingMetrics = useRef<PlanCameraMetrics | null>(null)
  const lastViewport = useRef<ViewportSize>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (isDragging) {
      pendingMetrics.current = metrics
      return
    }

    const previousViewport = lastViewport.current
    const viewportChanged =
      previousViewport.width > 0 &&
      previousViewport.height > 0 &&
      (previousViewport.width !== size.width || previousViewport.height !== size.height)

    const nextMetrics = pendingMetrics.current ?? metrics
    const previousMetrics = lastMetrics.current
    const change = resolveCameraPlanChange(previousMetrics, nextMetrics)

    if (!previousMetrics) fit()
    else {
      if (viewportChanged) resize(previousViewport, size)
      if (change.type !== 'none') reconcile(previousMetrics, nextMetrics, needsMoreSpace(previousMetrics, size))
    }

    lastMetrics.current = nextMetrics
    pendingMetrics.current = null
    lastViewport.current = { width: size.width, height: size.height }
  }, [fit, isDragging, metrics, needsMoreSpace, reconcile, resize, size])
}
