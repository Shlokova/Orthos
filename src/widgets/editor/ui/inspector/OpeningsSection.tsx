import { useEditorActions, useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { Actions, Button, Stack } from '@shared/ui'

export function OpeningsSection() {
  const { room, openings, selectedOpeningId } = useEditorSelector(
    (state) => ({
      room: state.room,
      openings: state.openings,
      selectedOpeningId: state.selectedOpeningId,
    }),
    shallowEqual,
  )
  const { selectOpening, addOpening } = useEditorActions()
  const roomOpenings = openings.filter((entry) => entry.roomId === room.id)

  return (
    <section className="inspector-section plan-openings-section" aria-labelledby="openings-title">
      <div className="section-title-row">
        <h3 id="openings-title">Doors and windows</h3>
        <span>{roomOpenings.length}</span>
      </div>
      <p className="section-help plan-opening-help">
        Openings belong to the active room. Pick one to set its wall, position and size.
      </p>
      <Actions>
        <Button onClick={() => addOpening('door')}>Add door</Button>
        <Button onClick={() => addOpening('window')}>Add window</Button>
      </Actions>
      <Stack>
        {roomOpenings.map((entry) => (
          <Button
            key={entry.id}
            variant="list"
            active={selectedOpeningId === entry.id}
            aria-label={`Edit ${entry.kind} on wall ${entry.wallIndex + 1}`}
            onClick={() => selectOpening(entry.id)}
          >
            <span>
              {entry.kind === 'door' ? 'Door' : 'Window'} · wall {entry.wallIndex + 1}
            </span>
            <small>
              {entry.width.toFixed(2)} × {entry.height.toFixed(2)} m
            </small>
          </Button>
        ))}
        {roomOpenings.length === 0 && <div className="empty-state compact">No openings yet.</div>}
      </Stack>
    </section>
  )
}
