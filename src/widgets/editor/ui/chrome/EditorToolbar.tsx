import { useEditorActions, useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { PerspectiveIcon, RedoIcon, TopViewIcon, UndoIcon } from '@shared/ui/icons'
import './EditorToolbar.css'

export function EditorToolbar() {
  const { viewMode, canUndo, canRedo, roomDrawing } = useEditorSelector(
    (state) => ({
      viewMode: state.viewMode,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      roomDrawing: state.roomDrawing,
    }),
    shallowEqual,
  )
  const { setViewMode, undo, redo } = useEditorActions()

  return (
    <div className="editor-toolbar">
      <div className="history-cluster" role="toolbar" aria-label="History">
        <button
          type="button"
          disabled={!canUndo || Boolean(roomDrawing)}
          onClick={undo}
          aria-label="Undo"
          title={roomDrawing ? 'Finish or cancel the room first' : 'Undo'}
        >
          <UndoIcon />
        </button>
        <button
          type="button"
          disabled={!canRedo || Boolean(roomDrawing)}
          onClick={redo}
          aria-label="Redo"
          title={roomDrawing ? 'Finish or cancel the room first' : 'Redo'}
        >
          <RedoIcon />
        </button>
      </div>
      <div className="view-switch" role="toolbar" aria-label="View mode">
        <button
          type="button"
          className={viewMode === 'top' ? 'is-active' : ''}
          onClick={() => setViewMode('top')}
          aria-label="Switch to 2D plan"
          title="2D plan"
          aria-pressed={viewMode === 'top'}
        >
          <TopViewIcon />
          <span>2D plan</span>
        </button>
        <button
          type="button"
          className={viewMode === 'perspective' ? 'is-active' : ''}
          onClick={() => setViewMode('perspective')}
          aria-label="Switch to 3D view"
          title="3D view"
          aria-pressed={viewMode === 'perspective'}
        >
          <PerspectiveIcon />
          <span>3D view</span>
        </button>
      </div>
    </div>
  )
}
