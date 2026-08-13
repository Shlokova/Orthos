import { useEditorActions } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { DrawRoomIcon } from '@shared/ui/icons'

interface Props {
  onRequestClose(): void
}

export function CreateRoomCard({ onRequestClose }: Props) {
  const { setInteractionTool } = useViewportInteraction()
  const { addRoom, beginRoomDrawing } = useEditorActions()

  const startDrawing = () => {
    setInteractionTool('select')
    beginRoomDrawing()
    onRequestClose()
  }

  const createRoom = (shape: 'rectangle' | 'l-shape') => {
    setInteractionTool('select')
    addRoom(shape)
  }

  return (
    <section className="room-editor-card plan-create-card">
      <div className="section-title-row">
        <h3>New room</h3>
        <span>2D plan</span>
      </div>
      <button type="button" className="feature-tool" onClick={startDrawing}>
        <span className="feature-tool-icon">
          <DrawRoomIcon />
        </span>
        <span>
          <strong>Draw a shape</strong>
          <small>Click each corner on the plan, then close the loop</small>
        </span>
      </button>
      <div className="tool-card-grid compact">
        <button type="button" onClick={() => createRoom('rectangle')}>
          <span className="room-shape rectangle" />
          <strong>Add a rectangle</strong>
        </button>
        <button type="button" onClick={() => createRoom('l-shape')}>
          <span className="room-shape l-shape" />
          <strong>Add an L-shape</strong>
        </button>
      </div>
    </section>
  )
}
