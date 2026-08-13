import { useEditorActions, useEditorSelector, type WallDisplayMode } from '@features/editor'
import { WallAllIcon, WallCutawayIcon, WallNoneIcon } from '@shared/ui/icons'
import './WallVisibilityControl.css'

const WALL_MODES: readonly {
  value: WallDisplayMode
  label: string
  icon: typeof WallNoneIcon
}[] = [
  { value: 'none', label: 'Hide walls', icon: WallNoneIcon },
  { value: 'far', label: 'Cut away near walls', icon: WallCutawayIcon },
  { value: 'all', label: 'Show every wall', icon: WallAllIcon },
]

export function WallVisibilityControl() {
  const wallDisplayMode = useEditorSelector((state) => state.wallDisplayMode)
  const { setWallDisplayMode } = useEditorActions()

  return (
    <div className="toolbar-group wall-mode-control" role="toolbar" aria-label="Wall visibility">
      {WALL_MODES.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={wallDisplayMode === value ? 'is-active' : ''}
          aria-label={label}
          aria-pressed={wallDisplayMode === value}
          title={label}
          onClick={() => setWallDisplayMode(value)}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
