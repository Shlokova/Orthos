import { type KeyboardEvent, useRef } from 'react'
import './Tabs.css'

export interface TabDefinition<T extends string> {
  id: T
  label: string
}

interface TabsProps<T extends string> {
  items: readonly TabDefinition<T>[]
  value: T
  onChange(value: T): void
  label: string
  idPrefix: string
  className?: string
}

export function tabId(idPrefix: string, tab: string): string {
  return `${idPrefix}-tab-${tab}`
}

export function tabPanelId(idPrefix: string, tab: string): string {
  return `${idPrefix}-tabpanel-${tab}`
}

export function Tabs<T extends string>({ items, value, onChange, label, idPrefix, className }: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  const activate = (next: T, moveFocus: boolean): void => {
    onChange(next)
    if (!moveFocus) return
    window.requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`#${tabId(idPrefix, next)}`)?.focus()
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const currentIndex = items.findIndex((item) => item.id === value)
    let nextIndex = currentIndex
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + items.length) % items.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    else return

    event.preventDefault()
    const next = items[nextIndex]
    if (next) activate(next.id, true)
  }

  return (
    <div ref={listRef} className={className} role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
      {items.map((item) => (
        <button
          key={item.id}
          id={tabId(idPrefix, item.id)}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          aria-controls={tabPanelId(idPrefix, item.id)}
          tabIndex={value === item.id ? 0 : -1}
          className={value === item.id ? 'ui-tab is-active' : 'ui-tab'}
          onClick={() => activate(item.id, false)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
