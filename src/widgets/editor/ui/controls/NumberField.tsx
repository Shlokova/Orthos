import { Field } from '@shared/ui'
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useFieldTransaction } from './useFieldTransaction'
import './NumberField.css'

interface NumberFieldProps {
  label: string
  hideLabel?: boolean
  unit?: string
  value: number
  step: number
  min?: number
  max?: number
  onChange(value: number): void
}

function formatValue(value: number): string {
  return Number.isFinite(value) ? String(Number(value.toFixed(3))) : '0'
}

export function NumberField({ label, hideLabel = false, unit, value, step, min, max, onChange }: NumberFieldProps) {
  const transaction = useFieldTransaction()
  const focusedRef = useRef(false)
  const [draft, setDraft] = useState(() => formatValue(value))

  useEffect(() => {
    if (!focusedRef.current) setDraft(formatValue(value))
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDraft = event.target.value
    setDraft(nextDraft)
    if (nextDraft.trim() === '') return
    const numericValue = Number(nextDraft)
    if (Number.isFinite(numericValue)) onChange(numericValue)
  }

  const handleFocus = () => {
    focusedRef.current = true
    setDraft(formatValue(value))
    transaction.begin()
  }

  const handleBlur = () => {
    focusedRef.current = false
    const numericValue = Number(draft)
    if (draft.trim() !== '' && Number.isFinite(numericValue)) onChange(numericValue)
    setDraft(formatValue(value))
    transaction.end()
  }

  return (
    <Field label={label} hideLabel={hideLabel}>
      {(controlId) => (
        <div className={unit ? 'number-field has-unit' : 'number-field'}>
          <input
            id={controlId}
            type="number"
            value={draft}
            step={step}
            min={min}
            max={max}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
            onChange={handleChange}
            {...(unit ? { 'aria-label': `${label}, ${unit}` } : {})}
          />
          {unit && (
            <span className="number-field-unit" aria-hidden="true">
              {unit}
            </span>
          )}
        </div>
      )}
    </Field>
  )
}
