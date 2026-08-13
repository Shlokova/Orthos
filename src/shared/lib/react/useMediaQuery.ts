import { useCallback, useSyncExternalStore } from 'react'

const mediaQueryLists = new Map<string, MediaQueryList>()

function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null
  const cached = mediaQueryLists.get(query)
  if (cached) return cached
  const list = window.matchMedia(query)
  mediaQueryLists.set(query, list)
  return list
}

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = getMediaQueryList(query)
      if (!list) return () => {}
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => getMediaQueryList(query)?.matches ?? false,
    () => false,
  )
}
