import { useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { BuildIcon, CursorIcon, ObjectsIcon } from '@shared/ui/icons'
import type { ComponentType } from 'react'
import type { WorkspacePanel } from '../workspace/useWorkspacePanels'
import './ToolRail.css'

interface Props {
  openPanel: WorkspacePanel
  onToggle(panel: Exclude<WorkspacePanel, null>): void
}

interface Tool {
  readonly id: Exclude<WorkspacePanel, null>
  readonly label: string
  readonly ariaLabel: string
  readonly controls: string
  readonly icon: ComponentType
}

const tools: readonly Tool[] = [
  {
    id: 'plan',
    label: 'Plan',
    ariaLabel: 'Plan: create and reshape rooms',
    controls: 'room-editor-panel',
    icon: BuildIcon,
  },
  {
    id: 'catalog',
    label: 'Objects',
    ariaLabel: 'Objects: the furniture library',
    controls: 'object-library-panel',
    icon: ObjectsIcon,
  },
]

const objectTool: Tool = {
  id: 'object',
  label: 'Edit',
  ariaLabel: 'Object editor: settings for the selected object',
  controls: 'object-inspector-panel',
  icon: CursorIcon,
}

export function ToolRail({ openPanel, onToggle }: Props) {
  const { drawing, hasSelection } = useEditorSelector(
    (state) => ({
      drawing: Boolean(state.roomDrawing),
      hasSelection: Boolean(state.selectedId ?? state.selectedOpeningId),
    }),
    shallowEqual,
  )
  const items = hasSelection ? [...tools, objectTool] : tools

  return (
    <nav className="tool-rail" aria-label="Workspace tools">
      {items.map(({ id, label, ariaLabel, controls, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={openPanel === id ? 'is-active' : id === 'object' ? 'is-available' : ''}
          aria-label={ariaLabel}
          aria-controls={controls}
          aria-expanded={openPanel === id}
          disabled={drawing}
          title={drawing ? 'Finish or cancel the room first' : label}
          onClick={() => onToggle(id)}
        >
          <Icon />
          {/*<span>{label}</span>*/}
        </button>
      ))}
    </nav>
  )
}
