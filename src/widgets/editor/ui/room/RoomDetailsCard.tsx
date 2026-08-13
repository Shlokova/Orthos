import { getRoomBounds, ROOM_LIMITS, ROOM_NAME_MAX_LENGTH } from '@entities/scene'
import { useEditorActions, useEditorSelector } from '@features/editor'
import { Chip, Field } from '@shared/ui'
import type { ChangeEvent } from 'react'
import { NumberField } from '../controls/NumberField'
import { useFieldTransaction } from '../controls/useFieldTransaction'

export function RoomDetailsCard() {
  const room = useEditorSelector((state) => state.room)
  const { updateRoom, resizeRoom, setRoomShape } = useEditorActions()
  const nameTransaction = useFieldTransaction()
  const bounds = getRoomBounds(room)

  return (
    <section className="room-editor-card">
      <div className="section-title-row">
        <h3>Room</h3>
        <span>metres</span>
      </div>
      <Field label="Name" className="room-name-field">
        {(controlId) => (
          <input
            id={controlId}
            value={room.name}
            maxLength={ROOM_NAME_MAX_LENGTH}
            onFocus={nameTransaction.begin}
            onBlur={nameTransaction.end}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateRoom({ name: event.target.value }, 'preview')}
          />
        )}
      </Field>
      <div className="room-dimension-grid">
        <NumberField
          label="Width"
          unit="m"
          value={bounds.width}
          step={0.25}
          min={ROOM_LIMITS.width.min}
          max={ROOM_LIMITS.width.max}
          onChange={(width) => resizeRoom(width, getRoomBounds(room).depth, 'preview')}
        />
        <NumberField
          label="Depth"
          unit="m"
          value={bounds.depth}
          step={0.25}
          min={ROOM_LIMITS.depth.min}
          max={ROOM_LIMITS.depth.max}
          onChange={(depth) => resizeRoom(getRoomBounds(room).width, depth, 'preview')}
        />
        <NumberField
          label="Ceiling"
          unit="m"
          value={room.height}
          step={0.1}
          min={ROOM_LIMITS.height.min}
          max={ROOM_LIMITS.height.max}
          onChange={(height) => updateRoom({ height }, 'preview')}
        />
      </div>
      <div className="room-preset-row" role="toolbar" aria-label="Reset this room's shape">
        <span className="room-preset-label">Reset shape</span>
        <Chip onClick={() => setRoomShape('rectangle')}>Rectangle</Chip>
        <Chip onClick={() => setRoomShape('l-shape')}>L-shape</Chip>
      </div>
    </section>
  )
}
