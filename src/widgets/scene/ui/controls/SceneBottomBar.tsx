import { analyzeClearance } from '@entities/scene'
import { useEditorActions, useEditorSelector } from '@features/editor'
import { useViewportControls } from '@features/viewport'
import { shallowEqual } from '@shared/lib'
import {
  ClearanceIcon,
  CornerEditIcon,
  CursorIcon,
  FitIcon,
  HandIcon,
  MinusIcon,
  MoveIcon,
  OrbitIcon,
  PlusIcon,
  RotateLeftIcon,
  RotateRightIcon,
} from '@shared/ui/icons'
import { useMemo } from 'react'
import './SceneBottomBar.css'

export function SceneBottomBar() {
  const { selection, roomEditTool, viewMode, roomDrawing, heatmapVisible, room, items } = useEditorSelector(
    (state) => ({
      selection: state.selection,
      roomEditTool: state.roomEditTool,
      viewMode: state.viewMode,
      roomDrawing: state.roomDrawing,
      heatmapVisible: state.heatmapVisible,
      room: state.room,
      items: state.items,
    }),
    shallowEqual,
  )
  const { setRoomEditTool, rotateSelection, setHeatmapVisible } = useEditorActions()
  const clearanceIssues = useMemo(() => analyzeClearance(room, items).issues.length, [items, room])
  const { interactionTool, setInteractionTool, zoomPercent, zoomIn, zoomOut, fit } = useViewportControls()

  const topView = viewMode === 'top'
  const itemSelected = selection?.type === 'item' && topView
  const roomSelected = selection?.type === 'room' && topView

  if (roomDrawing) return null

  return (
    <div className="scene-bottom-toolbar" role="toolbar" aria-label="Plan controls">
      <div className="scene-bottom-panel">
        <button
          type="button"
          className={interactionTool === 'select' ? 'is-active' : ''}
          aria-pressed={interactionTool === 'select'}
          onClick={() => setInteractionTool('select')}
          aria-label={topView ? 'Select tool' : 'Orbit and select tool'}
          title={topView ? 'Select and move objects' : 'Orbit camera and select objects'}
        >
          {topView ? <CursorIcon /> : <OrbitIcon />}
        </button>
        <button
          type="button"
          className={interactionTool === 'pan' ? 'is-active' : ''}
          aria-pressed={interactionTool === 'pan'}
          onClick={() => setInteractionTool('pan')}
          aria-label="Pan tool"
          title="Pan · hold Space for temporary pan"
        >
          <HandIcon />
        </button>

        {roomSelected && (
          <>
            <span className="scene-toolbar-separator" aria-hidden="true" />
            <button
              type="button"
              className={roomEditTool === 'transform' ? 'is-active' : ''}
              aria-pressed={roomEditTool === 'transform'}
              onClick={() => setRoomEditTool('transform')}
              aria-label="Move and resize room"
              title="Move and resize room"
            >
              <MoveIcon />
            </button>
            <button
              type="button"
              className={roomEditTool === 'corners' ? 'is-active' : ''}
              aria-pressed={roomEditTool === 'corners'}
              onClick={() => setRoomEditTool('corners')}
              aria-label="Edit room corners"
              title="Edit room corners"
            >
              <CornerEditIcon />
            </button>
          </>
        )}

        {itemSelected && (
          <>
            <span className="scene-toolbar-separator" aria-hidden="true" />
            <button
              type="button"
              onClick={() => rotateSelection(-Math.PI / 12)}
              aria-label="Rotate selected object left"
              title="Rotate left 15° · ,"
            >
              <RotateLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => rotateSelection(Math.PI / 12)}
              aria-label="Rotate selected object right"
              title="Rotate right 15° · ."
            >
              <RotateRightIcon />
            </button>
          </>
        )}

        <span className="scene-toolbar-separator" aria-hidden="true" />
        <button
          type="button"
          className={heatmapVisible ? 'is-active' : ''}
          aria-pressed={heatmapVisible}
          onClick={() => setHeatmapVisible(!heatmapVisible)}
          aria-label="Clearance overlay"
          title={
            clearanceIssues === 0
              ? 'Clearance overlay · everything has room'
              : `Clearance overlay · ${clearanceIssues} tight ${clearanceIssues === 1 ? 'spot' : 'spots'}`
          }
        >
          <ClearanceIcon />
          {clearanceIssues > 0 && <span className="scene-toolbar-badge">{clearanceIssues}</span>}
        </button>
      </div>

      <div className="scene-bottom-panel">
        <div className="scene-zoom-control">
          <button type="button" onClick={zoomOut} aria-label="Zoom out" title="Zoom out">
            <MinusIcon />
          </button>
          <output aria-label="Current zoom">{zoomPercent}%</output>
          <button type="button" onClick={zoomIn} aria-label="Zoom in" title="Zoom in">
            <PlusIcon />
          </button>
        </div>
        <span className="scene-toolbar-separator" aria-hidden="true" />
        <button type="button" onClick={fit} title="Fit plan to viewport" aria-label="Fit plan to viewport">
          <FitIcon />
        </button>
      </div>
    </div>
  )
}
