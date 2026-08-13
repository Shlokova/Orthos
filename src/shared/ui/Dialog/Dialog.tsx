import { type PropsWithChildren, type ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getFocusableElements, trapTabKey } from '../lib/focus'
import './Dialog.css'

interface DialogProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: string
  onClose(): void
  actions?: ReactNode
}

export function Dialog({ open, title, description, onClose, actions, children }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const requestClose = useRef(onClose)
  requestClose.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const frame = window.requestAnimationFrame(() => {
      const autofocus = dialog.querySelector<HTMLElement>('[data-autofocus]')
      ;(autofocus ?? getFocusableElements(dialog)[0] ?? dialog).focus()
    })
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose.current()
        return
      }
      trapTabKey(event, dialog)
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown, true)
      previousFocus?.focus()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="ui-dialog-layer" role="presentation">
      <button type="button" className="ui-dialog-backdrop" aria-label="Close dialog" onClick={onClose} />
      <div
        ref={dialogRef}
        className="ui-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <div className="ui-dialog-copy">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
          {children}
        </div>
        {actions && <div className="ui-dialog-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  )
}
