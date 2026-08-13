import { useEditorActions } from '@features/editor'
import { useCallback, useRef } from 'react'

export function useFieldTransaction(): { begin: () => void; end: () => void } {
  const { beginTransaction, endTransaction } = useEditorActions()
  const ownsTransaction = useRef(false)

  const begin = useCallback(() => {
    ownsTransaction.current = beginTransaction()
  }, [beginTransaction])

  const end = useCallback(() => {
    if (!ownsTransaction.current) return
    ownsTransaction.current = false
    endTransaction()
  }, [endTransaction])

  return { begin, end }
}
