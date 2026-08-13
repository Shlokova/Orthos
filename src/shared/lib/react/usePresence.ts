import { useLayoutEffect, useRef, useState } from 'react'

export function usePresence<T>(value: T | null, exitDurationMs: number): { present: T | null; isExiting: boolean } {
  const [exiting, setExiting] = useState<T | null>(null)
  const lastPresent = useRef<T | null>(value)

  useLayoutEffect(() => {
    if (value !== null) {
      lastPresent.current = value
      setExiting(null)
      return undefined
    }

    const leaving = lastPresent.current
    lastPresent.current = null
    if (leaving === null) return undefined

    setExiting(leaving)
    const timer = window.setTimeout(() => setExiting(null), exitDurationMs)
    return () => window.clearTimeout(timer)
  }, [value, exitDurationMs])

  const present = value ?? exiting
  return { present, isExiting: value === null && present !== null }
}
