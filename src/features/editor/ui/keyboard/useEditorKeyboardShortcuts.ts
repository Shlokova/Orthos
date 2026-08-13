import { useEffect, useRef } from 'react'
import { EDITOR_CONFIG } from '../../config/editorConfig'
import type { EditorActions } from '../../model/actions'
import type { EditorSnapshot } from '../../model/EditorState'
import type { NudgeDirection } from '../../model/editorTypes'
import { type EditorCommand, resolveEditorCommand } from './resolveEditorCommand'

const nudgeDirectionByCommand: Record<Extract<EditorCommand, `move-selection-${string}`>, NudgeDirection> = {
  'move-selection-north': 'north',
  'move-selection-south': 'south',
  'move-selection-west': 'west',
  'move-selection-east': 'east',
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function isOverlayTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('.floating-panel, .project-menu-popover, .ui-dialog'))
}

export function useEditorKeyboardShortcuts(snapshot: EditorSnapshot, actions: EditorActions): void {
  const transactionTimeout = useRef<number | null>(null)
  const snapshotRef = useRef(snapshot)
  const actionsRef = useRef(actions)
  snapshotRef.current = snapshot
  actionsRef.current = actions

  useEffect(() => {
    const cancelPendingTransactionEnd = (): boolean => {
      if (transactionTimeout.current === null) return false
      window.clearTimeout(transactionTimeout.current)
      transactionTimeout.current = null
      return true
    }

    const scheduleTransactionEnd = () => {
      cancelPendingTransactionEnd()
      transactionTimeout.current = window.setTimeout(() => {
        transactionTimeout.current = null
        actionsRef.current.endTransaction()
      }, EDITOR_CONFIG.keyboardTransactionIdleMs)
    }

    const settleTransaction = () => {
      if (cancelPendingTransactionEnd()) actionsRef.current.endTransaction()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || isOverlayTarget(event.target)) return
      const currentSnapshot = snapshotRef.current
      const currentActions = actionsRef.current
      if (currentSnapshot.roomDrawing) {
        if (event.code === 'Escape') {
          event.preventDefault()
          currentActions.cancelRoomDrawing()
          return
        }
        if (event.code === 'Enter') {
          event.preventDefault()
          currentActions.finishRoomDrawing()
          return
        }
        if (event.code === 'Backspace' || event.code === 'Delete') {
          event.preventDefault()
          currentActions.undoRoomDrawingPoint()
          return
        }
        return
      }
      const command = resolveEditorCommand(event)
      if (!command) return

      const repeatable =
        command.startsWith('move-selection') ||
        command === 'rotate-selection-left' ||
        command === 'rotate-selection-right'
      if (event.repeat && !repeatable) return

      switch (command) {
        case 'undo':
          event.preventDefault()
          settleTransaction()
          currentActions.undo()
          break
        case 'redo':
          event.preventDefault()
          settleTransaction()
          currentActions.redo()
          break
        case 'clear-selection':
          currentActions.select(null)
          break
        case 'remove-selection':
          if (currentSnapshot.selection?.type === 'item') {
            event.preventDefault()
            currentActions.removeItem(currentSnapshot.selection.id)
          }
          if (currentSnapshot.selection?.type === 'opening') {
            event.preventDefault()
            currentActions.removeOpening(currentSnapshot.selection.id)
          }
          break
        case 'duplicate-selection':
          if (currentSnapshot.selection?.type === 'item') {
            event.preventDefault()
            currentActions.duplicateItem(currentSnapshot.selection.id)
          }
          break
        case 'rotate-selection':
        case 'rotate-selection-left':
        case 'rotate-selection-right': {
          if (currentSnapshot.selection?.type !== 'item') break
          event.preventDefault()
          const delta =
            command === 'rotate-selection'
              ? Math.PI / 4
              : command === 'rotate-selection-left'
                ? -Math.PI / 12
                : Math.PI / 12
          currentActions.beginTransaction()
          currentActions.rotateSelection(delta, 'preview')
          scheduleTransactionEnd()
          break
        }
        case 'move-selection-north':
        case 'move-selection-south':
        case 'move-selection-west':
        case 'move-selection-east': {
          if (!currentSnapshot.selection) break
          event.preventDefault()
          const direction = nudgeDirectionByCommand[command]
          currentActions.beginTransaction()
          currentActions.nudgeSelection(direction, event.shiftKey ? 'fine' : 'coarse', 'preview')
          scheduleTransactionEnd()
          break
        }
        case 'top-camera':
          currentActions.setViewMode('top')
          break
        case 'perspective-camera':
          currentActions.setViewMode('perspective')
          break
        case 'toggle-clearance':
          currentActions.setHeatmapVisible(!currentSnapshot.heatmapVisible)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      settleTransaction()
    }
  }, [])
}
