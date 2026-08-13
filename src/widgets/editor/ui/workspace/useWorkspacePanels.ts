import { useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { useCallback, useMemo, useState } from 'react'

export type WorkspacePanel = 'plan' | 'catalog' | 'object' | null

export interface InspectorTarget {
  readonly kind: 'item' | 'opening'
  readonly id: string
}

function inspectorTargetKey(target: InspectorTarget | null): string | null {
  return target ? `${target.kind}:${target.id}` : null
}

export function useWorkspacePanels() {
  const [openPanel, setOpenPanel] = useState<WorkspacePanel>(null)
  const selection = useEditorSelector<InspectorTarget | null>(
    (state) =>
      state.selectedId
        ? { kind: 'item', id: state.selectedId }
        : state.selectedOpeningId
          ? { kind: 'opening', id: state.selectedOpeningId }
          : null,
    shallowEqual,
  )
  const selectionKey = inspectorTargetKey(selection)

  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey)
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    if (!selectionKey && openPanel === 'object') setOpenPanel(null)
  }

  const closePanel = useCallback(() => setOpenPanel(null), [])

  const togglePanel = useCallback(
    (panel: Exclude<WorkspacePanel, null>) => {
      if (panel === 'object' && !selectionKey) return
      setOpenPanel((current) => (current === panel ? null : panel))
    },
    [selectionKey],
  )

  const inspectorTarget = useMemo(() => (openPanel === 'object' ? selection : null), [openPanel, selection])

  return { openPanel, inspectorTarget, closePanel, togglePanel }
}
