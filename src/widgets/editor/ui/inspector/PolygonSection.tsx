import { useEditorActions, useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { Button } from '@shared/ui'
import { CornerEditIcon, MinusIcon, PlusIcon } from '@shared/ui/icons'
import { NumberField } from '../controls/NumberField'

export function PolygonSection() {
  const { room, viewMode, roomEditTool } = useEditorSelector(
    (state) => ({ room: state.room, viewMode: state.viewMode, roomEditTool: state.roomEditTool }),
    shallowEqual,
  )
  const { updateVertex, insertVertex, deleteVertex, setRoomEditTool } = useEditorActions()
  const isPlanView = viewMode === 'top'
  const dragging = roomEditTool === 'corners'

  return (
    <section className="inspector-section corner-section" aria-labelledby="vertices-title">
      <div className="section-title-row">
        <h3 id="vertices-title">Corners</h3>
        <span>{room.vertices.length}</span>
      </div>

      <Button
        className="corner-drag-toggle"
        variant={dragging && isPlanView ? 'primary' : 'default'}
        disabled={!isPlanView}
        title={isPlanView ? undefined : 'Available in the 2D plan'}
        onClick={() => setRoomEditTool(dragging ? 'transform' : 'corners')}
      >
        <CornerEditIcon />
        {dragging && isPlanView ? 'Dragging corners on the plan' : 'Drag corners on the plan'}
      </Button>

      <div className="corner-list">
        <div className="corner-head" aria-hidden="true">
          <span />
          <span>X, m</span>
          <span>Z, m</span>
          <span />
        </div>
        {room.vertices.map((vertex, index) => (
          <div className="corner-row" key={index}>
            <span className="corner-index">{index + 1}</span>
            <NumberField
              label={`Corner ${index + 1} X`}
              hideLabel
              value={vertex.x}
              step={0.25}
              onChange={(x) => updateVertex(index, { ...vertex, x }, 'preview')}
            />
            <NumberField
              label={`Corner ${index + 1} Z`}
              hideLabel
              value={vertex.z}
              step={0.25}
              onChange={(z) => updateVertex(index, { ...vertex, z }, 'preview')}
            />
            <div className="corner-row-actions">
              <button
                type="button"
                aria-label={`Add a corner after corner ${index + 1}`}
                title="Add a corner after this one"
                onClick={() => insertVertex(index)}
              >
                <PlusIcon />
              </button>
              <button
                type="button"
                aria-label={`Remove corner ${index + 1}`}
                title={room.vertices.length <= 3 ? 'A room needs at least three corners' : 'Remove this corner'}
                disabled={room.vertices.length <= 3}
                onClick={() => deleteVertex(index)}
              >
                <MinusIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="section-help">Adding or removing a corner renumbers the walls, so this room loses its openings.</p>
    </section>
  )
}
