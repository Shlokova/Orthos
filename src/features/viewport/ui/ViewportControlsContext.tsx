import { clamp } from '@shared/lib'

const MIN_ZOOM_PERCENT = 10
const MAX_ZOOM_PERCENT = 500

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type InteractionTool = 'select' | 'pan'

interface ViewportController {
  zoomIn(): void
  zoomOut(): void
  fit(): void
}

interface InteractionValue {
  interactionTool: InteractionTool
  setInteractionTool(tool: InteractionTool): void
}

interface CommandsValue {
  registerController(controller: ViewportController | null): void
  reportZoom(percent: number): void
  zoomIn(): void
  zoomOut(): void
  fit(): void
}

const EMPTY_CONTROLLER: ViewportController = { zoomIn() {}, zoomOut() {}, fit() {} }
const InteractionContext = createContext<InteractionValue | null>(null)
const CommandsContext = createContext<CommandsValue | null>(null)
const ZoomContext = createContext(100)

function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function ViewportControlsProvider({ children }: PropsWithChildren) {
  const controllerRef = useRef<ViewportController>(EMPTY_CONTROLLER)
  const zoomFrameRef = useRef<number | null>(null)
  const pendingZoomRef = useRef(100)
  const previousToolRef = useRef<InteractionTool | null>(null)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [interactionTool, setInteractionTool] = useState<InteractionTool>('select')

  const registerController = useCallback((controller: ViewportController | null) => {
    controllerRef.current = controller ?? EMPTY_CONTROLLER
  }, [])

  const reportZoom = useCallback((percent: number) => {
    if (!Number.isFinite(percent)) return
    pendingZoomRef.current = Math.round(clamp(percent, MIN_ZOOM_PERCENT, MAX_ZOOM_PERCENT))
    if (zoomFrameRef.current !== null) return
    zoomFrameRef.current = window.requestAnimationFrame(() => {
      zoomFrameRef.current = null
      setZoomPercent((current) => (current === pendingZoomRef.current ? current : pendingZoomRef.current))
    })
  }, [])

  useEffect(() => {
    const beginTemporaryPan = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || isTextInput(event.target)) return
      event.preventDefault()
      setInteractionTool((current) => {
        if (previousToolRef.current === null) previousToolRef.current = current
        return 'pan'
      })
    }
    const endTemporaryPan = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || previousToolRef.current === null) return
      event.preventDefault()
      const previous = previousToolRef.current
      previousToolRef.current = null
      setInteractionTool(previous)
    }
    const restoreTool = () => {
      if (previousToolRef.current === null) return
      const previous = previousToolRef.current
      previousToolRef.current = null
      setInteractionTool(previous)
    }

    window.addEventListener('keydown', beginTemporaryPan)
    window.addEventListener('keyup', endTemporaryPan)
    window.addEventListener('blur', restoreTool)
    return () => {
      window.removeEventListener('keydown', beginTemporaryPan)
      window.removeEventListener('keyup', endTemporaryPan)
      window.removeEventListener('blur', restoreTool)
    }
  }, [])

  useEffect(
    () => () => {
      if (zoomFrameRef.current !== null) window.cancelAnimationFrame(zoomFrameRef.current)
    },
    [],
  )

  const interactionValue = useMemo<InteractionValue>(() => ({ interactionTool, setInteractionTool }), [interactionTool])
  const commandsValue = useMemo<CommandsValue>(
    () => ({
      registerController,
      reportZoom,
      zoomIn: () => controllerRef.current.zoomIn(),
      zoomOut: () => controllerRef.current.zoomOut(),
      fit: () => controllerRef.current.fit(),
    }),
    [registerController, reportZoom],
  )

  return (
    <InteractionContext value={interactionValue}>
      <CommandsContext value={commandsValue}>
        <ZoomContext value={zoomPercent}>{children}</ZoomContext>
      </CommandsContext>
    </InteractionContext>
  )
}

export function useViewportInteraction() {
  const value = useContext(InteractionContext)
  if (!value) throw new Error('useViewportInteraction must be used within ViewportControlsProvider')
  return value
}

export function useViewportCommands() {
  const value = useContext(CommandsContext)
  if (!value) throw new Error('useViewportCommands must be used within ViewportControlsProvider')
  return value
}

function useViewportZoom() {
  return useContext(ZoomContext)
}

export function useViewportControls() {
  return { ...useViewportInteraction(), ...useViewportCommands(), zoomPercent: useViewportZoom() }
}
