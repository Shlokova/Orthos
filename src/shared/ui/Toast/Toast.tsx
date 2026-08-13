import './Toast.css'

interface ToastProps {
  message: string
  onDismiss(): void
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="ui-toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  )
}
