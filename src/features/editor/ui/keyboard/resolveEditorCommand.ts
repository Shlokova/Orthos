export type EditorCommand =
  | 'undo'
  | 'redo'
  | 'clear-selection'
  | 'remove-selection'
  | 'duplicate-selection'
  | 'rotate-selection'
  | 'rotate-selection-left'
  | 'rotate-selection-right'
  | 'move-selection-north'
  | 'move-selection-south'
  | 'move-selection-west'
  | 'move-selection-east'
  | 'top-camera'
  | 'perspective-camera'
  | 'toggle-clearance'

interface ShortcutEventLike {
  code: string
  key?: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

export function resolveEditorCommand(event: ShortcutEventLike): EditorCommand | null {
  const commandModifier = Boolean(event.ctrlKey || event.metaKey)

  if (commandModifier && event.code === 'KeyZ') return event.shiftKey ? 'redo' : 'undo'
  if (commandModifier && event.code === 'KeyY') return 'redo'

  if (commandModifier || event.altKey) return null

  switch (event.code) {
    case 'Escape':
      return 'clear-selection'
    case 'Delete':
    case 'Backspace':
      return 'remove-selection'
    case 'KeyD':
      return 'duplicate-selection'
    case 'KeyR':
      return 'rotate-selection'
    case 'Comma':
      return 'rotate-selection-left'
    case 'Period':
      return 'rotate-selection-right'
    case 'ArrowUp':
      return 'move-selection-north'
    case 'ArrowDown':
      return 'move-selection-south'
    case 'ArrowLeft':
      return 'move-selection-west'
    case 'ArrowRight':
      return 'move-selection-east'
    case 'Digit1':
      return 'top-camera'
    case 'Digit2':
      return 'perspective-camera'
    case 'KeyH':
      return 'toggle-clearance'
    default:
      return null
  }
}
