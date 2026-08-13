import { roomArea } from '@entities/scene'
import { useEditorActions, useEditorSelector } from '@features/editor'
import { formatArea, shallowEqual } from '@shared/lib'

export function RoomListCard() {
  const { rooms, activeRoomId } = useEditorSelector(
    (state) => ({ rooms: state.rooms, activeRoomId: state.activeRoomId }),
    shallowEqual,
  )
  const { selectRoom } = useEditorActions()

  return (
    <section className="room-editor-card">
      <div className="section-title-row">
        <h3>Rooms</h3>
        <span>{rooms.length}</span>
      </div>
      <div className="room-chip-list" role="toolbar" aria-label="Rooms">
        {rooms.map((entry) => (
          <button
            type="button"
            key={entry.id}
            className={entry.id === activeRoomId ? 'is-active' : ''}
            aria-current={entry.id === activeRoomId ? 'true' : undefined}
            onClick={() => selectRoom(entry.id)}
          >
            <strong>{entry.name}</strong>
            <small>{formatArea(roomArea(entry))}</small>
          </button>
        ))}
      </div>
    </section>
  )
}
