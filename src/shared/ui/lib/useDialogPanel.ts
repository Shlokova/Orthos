import { type RefObject, useEffect, useRef } from 'react'
import { trapTabKey } from './focus'

interface DialogPanelOptions {
  modal?: boolean
}

export function useDialogPanel<T extends HTMLElement>(
  onRequestClose: () => void,
  { modal = true }: DialogPanelOptions = {},
): RefObject<T | null> {
  const panelRef = useRef<T>(null)

  const requestClose = useRef(onRequestClose)
  requestClose.current = onRequestClose
  const isModal = useRef(modal)
  isModal.current = modal

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return undefined

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = isModal.current ? window.requestAnimationFrame(() => panel.focus()) : null

    const handleKeyDown = (event: KeyboardEvent) => {
      const insidePanel = event.target instanceof Node && panel.contains(event.target)
      if (event.key === 'Escape' && (isModal.current || insidePanel)) {
        event.preventDefault()
        requestClose.current()
        return
      }
      if (isModal.current) trapTabKey(event, panel)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('keydown', handleKeyDown)
      if (isModal.current) previousFocus?.focus()
    }
  }, [])

  return panelRef
}
