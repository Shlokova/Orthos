import { type PropsWithChildren, type ReactNode, useId } from 'react'
import './Field.css'

interface FieldProps {
  label: string
  hideLabel?: boolean
  className?: string
  children: (controlId: string) => ReactNode
}

export function Field({ label, hideLabel = false, className, children }: FieldProps) {
  const controlId = useId()

  return (
    <div className={className ? `ui-field ${className}` : 'ui-field'}>
      <label htmlFor={controlId} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </label>
      {children(controlId)}
    </div>
  )
}

export function FieldRow({ children }: PropsWithChildren) {
  return <div className="ui-field-row">{children}</div>
}
