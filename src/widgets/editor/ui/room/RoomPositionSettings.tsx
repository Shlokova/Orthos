import { getRoomBounds } from '@entities/scene'
import { useEditorActions, useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { Button } from '@shared/ui'
import { NumberField } from '../controls/NumberField'

export function RoomPositionSettings() {
  const { room, roomCount } = useEditorSelector(
    (state) => ({ room: state.room, roomCount: state.rooms.length }),
    shallowEqual,
  )
  const { moveRoom, removeRoom } = useEditorActions()
  const bounds = getRoomBounds(room)

  return (
    <details className="advanced-room-settings">
      <summary>Position and removal</summary>
      <div className="room-dimension-grid two-columns">
        <NumberField
          label="Center X"
          unit="m"
          value={bounds.center.x}
          step={0.25}
          onChange={(x) => moveRoom({ x, z: getRoomBounds(room).center.z }, 'preview')}
        />
        <NumberField
          label="Center Z"
          unit="m"
          value={bounds.center.z}
          step={0.25}
          onChange={(z) => moveRoom({ x: getRoomBounds(room).center.x, z }, 'preview')}
        />
      </div>
      <Button
        variant="danger"
        className="full-width"
        disabled={roomCount <= 1}
        title={roomCount <= 1 ? 'A plan needs at least one room' : undefined}
        onClick={() => removeRoom(room.id)}
      >
        Delete room
      </Button>
    </details>
  )
}
