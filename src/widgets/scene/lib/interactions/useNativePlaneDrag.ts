import { type ThreeEvent, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import { useScreenToPlane } from './useScreenToPlane'

interface ControlsLike {
  enabled: boolean
}

interface NativeDragFrame {
  clientX: number
  clientY: number
  shiftKey: boolean

  project(plane: THREE.Plane): THREE.Vector3 | null

  setPlane(plane: THREE.Plane): THREE.Vector3 | null
}

interface DragCallbacks {
  onStart?(): void
  onMove(point: THREE.Vector3, frame: NativeDragFrame): void
  onEnd?(cancelled: boolean): void
}

interface ActiveDrag {
  onMove(point: THREE.Vector3, frame: NativeDragFrame): void
  onEnd: ((cancelled: boolean) => void) | undefined
  pointerId: number
  plane: THREE.Plane
}

let activeDragOwner: symbol | null = null

function trySetPointerCapture(element: HTMLElement, pointerId: number): boolean {
  try {
    element.setPointerCapture(pointerId)
    return true
  } catch {
    return false
  }
}

function tryReleasePointerCapture(element: HTMLElement, pointerId: number): void {
  try {
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
  } catch {
    return
  }
}

export function useNativePlaneDrag() {
  const owner = useRef<symbol | null>(null)
  owner.current ??= Symbol('orthos-drag-owner')
  const controls = useThree((state) => state.controls) as ControlsLike | null
  const gl = useThree((state) => state.gl)
  const projectClient = useScreenToPlane()
  const active = useRef<ActiveDrag | null>(null)
  const pending = useRef<{ x: number; y: number; shiftKey: boolean } | null>(null)
  const frame = useRef<number | null>(null)
  const controlsWereEnabled = useRef(true)
  const capturedPointerId = useRef<number | null>(null)
  const removeListeners = useRef<(() => void) | null>(null)
  const controlsRef = useRef(controls)
  controlsRef.current = controls

  const dispatch = (clientX: number, clientY: number, shiftKey: boolean) => {
    const drag = active.current
    if (!drag) return
    const point = projectClient(clientX, clientY, drag.plane)
    if (!point) return
    const dragFrame: NativeDragFrame = {
      clientX,
      clientY,
      shiftKey,
      project: (plane) => projectClient(clientX, clientY, plane),
      setPlane: (plane) => {
        drag.plane = plane.clone()
        return projectClient(clientX, clientY, drag.plane)
      },
    }
    drag.onMove(point, dragFrame)
  }

  const flush = () => {
    frame.current = null
    const next = pending.current
    pending.current = null
    if (next) dispatch(next.x, next.y, next.shiftKey)
  }

  const schedule = (clientX: number, clientY: number, shiftKey: boolean) => {
    pending.current = { x: clientX, y: clientY, shiftKey }
    if (frame.current === null) frame.current = requestAnimationFrame(flush)
  }

  const cleanup = () => {
    removeListeners.current?.()
    removeListeners.current = null
    pending.current = null
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    if (capturedPointerId.current !== null) {
      tryReleasePointerCapture(gl.domElement, capturedPointerId.current)
      capturedPointerId.current = null
    }
    if (activeDragOwner !== owner.current) return
    const activeControls = controlsRef.current
    if (activeControls) activeControls.enabled = controlsWereEnabled.current
    activeDragOwner = null
    document.documentElement.classList.remove('is-editor-dragging')
  }

  const finish = (cancelled: boolean, point?: { x: number; y: number; shiftKey: boolean }) => {
    const drag = active.current
    if (!drag) return
    if (point) dispatch(point.x, point.y, point.shiftKey)
    active.current = null
    cleanup()
    drag.onEnd?.(cancelled)
  }

  const start = (event: ThreeEvent<PointerEvent>, plane: THREE.Plane, callbacks: DragCallbacks) => {
    event.stopPropagation()
    if (activeDragOwner !== null || active.current) return false

    callbacks.onStart?.()
    controlsWereEnabled.current = controls?.enabled ?? true
    if (controls) controls.enabled = false
    document.documentElement.classList.add('is-editor-dragging')
    active.current = {
      pointerId: event.pointerId,
      plane: plane.clone(),
      onMove: callbacks.onMove,
      onEnd: callbacks.onEnd,
    }
    activeDragOwner = owner.current

    if (trySetPointerCapture(gl.domElement, event.pointerId)) capturedPointerId.current = event.pointerId

    const onMove = (nativeEvent: PointerEvent) => {
      if (active.current?.pointerId !== nativeEvent.pointerId) return
      schedule(nativeEvent.clientX, nativeEvent.clientY, nativeEvent.shiftKey)
    }
    const onEnd = (nativeEvent: PointerEvent) => {
      if (active.current?.pointerId !== nativeEvent.pointerId) return
      finish(false, { x: nativeEvent.clientX, y: nativeEvent.clientY, shiftKey: nativeEvent.shiftKey })
    }
    const onCancel = (nativeEvent: PointerEvent) => {
      if (active.current?.pointerId !== nativeEvent.pointerId) return
      finish(true)
    }
    const onKeyDown = (nativeEvent: KeyboardEvent) => {
      if (nativeEvent.code !== 'Escape') return
      nativeEvent.preventDefault()
      nativeEvent.stopPropagation()
      finish(true)
    }
    const onBlur = () => finish(true)

    window.addEventListener('pointermove', onMove, true)
    window.addEventListener('pointerup', onEnd, true)
    window.addEventListener('pointercancel', onCancel, true)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('blur', onBlur)
    removeListeners.current = () => {
      window.removeEventListener('pointermove', onMove, true)
      window.removeEventListener('pointerup', onEnd, true)
      window.removeEventListener('pointercancel', onCancel, true)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('blur', onBlur)
    }
    return true
  }

  const cleanupRef = useRef(cleanup)
  cleanupRef.current = cleanup

  useEffect(
    () => () => {
      const drag = active.current
      active.current = null
      cleanupRef.current()
      drag?.onEnd?.(true)
    },
    [],
  )

  return {
    project(event: PointerEvent, plane: THREE.Plane) {
      return projectClient(event.clientX, event.clientY, plane)
    },
    start,
  }
}
