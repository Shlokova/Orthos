import { type FurnitureItem, getRoomBounds } from '@entities/scene'
import { useEditorActions, useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { Actions, Button, Field, FieldRow, Note } from '@shared/ui'
import type { ChangeEvent } from 'react'
import { NumberField } from '../controls/NumberField'
import { FurniturePropertiesControls } from './furniture/FurniturePropertiesControls'

interface Props {
  item: FurnitureItem
}

export function FurnitureSection({ item }: Props) {
  const { rooms, issues } = useEditorSelector((state) => ({ rooms: state.rooms, issues: state.issues }), shallowEqual)
  const actions = useEditorActions()
  const itemIssues = issues.filter((issue) => issue.itemIds.includes(item.id))

  return (
    <section className="inspector-section object-section" aria-label="Selected object settings">
      <Field label="Room">
        {(controlId) => (
          <select
            id={controlId}
            value={item.roomId}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => {
              const targetRoom = rooms.find((room) => room.id === event.target.value)
              if (!targetRoom) return
              actions.updateItem(item.id, {
                roomId: targetRoom.id,
                position: getRoomBounds(targetRoom).center,
              })
            }}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        )}
      </Field>

      <FieldRow>
        <NumberField
          label="X"
          unit="m"
          value={item.position.x}
          step={0.25}
          onChange={(x) => actions.updateItem(item.id, { position: { ...item.position, x } }, 'preview')}
        />
        <NumberField
          label="Z"
          unit="m"
          value={item.position.z}
          step={0.25}
          onChange={(z) => actions.updateItem(item.id, { position: { ...item.position, z } }, 'preview')}
        />
      </FieldRow>

      <NumberField
        label="Rotation"
        unit="°"
        value={Math.round((item.rotation * 180) / Math.PI)}
        step={15}
        onChange={(degrees) => actions.updateItem(item.id, { rotation: (degrees * Math.PI) / 180 }, 'preview')}
      />

      <FurniturePropertiesControls item={item} actions={actions} />

      {itemIssues.length > 0 ? (
        <Note tone="danger" role="status" aria-live="polite">
          {itemIssues.map((issue) => (
            <div key={`${issue.type}-${issue.itemIds.join('-')}`}>{issue.message}</div>
          ))}
        </Note>
      ) : (
        <Note tone="success" role="status">
          Placement is valid
        </Note>
      )}

      <p className="section-help">
        Drag the object on the plan, hold Space to pan. Press R to turn it 45°, or , and . for 15° steps.
      </p>

      <Actions className="inspector-actions">
        <Button onClick={() => actions.duplicateItem(item.id)}>Duplicate</Button>
        <Button variant="danger" onClick={() => actions.removeItem(item.id)}>
          Delete
        </Button>
      </Actions>
    </section>
  )
}
