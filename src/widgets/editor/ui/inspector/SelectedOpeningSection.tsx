import {
  getOpeningLimits,
  getWallSegments,
  type RoomDefinition,
  type ValidationIssue,
  type WallOpening,
} from '@entities/scene'
import { useEditorActions } from '@features/editor'
import { formatMeters, GEOMETRY_EPSILON } from '@shared/lib'
import { Actions, Button, Field, FieldRow, Note } from '@shared/ui'
import type { ChangeEvent } from 'react'
import { NumberField } from '../controls/NumberField'

interface Props {
  opening: WallOpening
  room: RoomDefinition
  issues: readonly ValidationIssue[]
}

export function SelectedOpeningSection({ opening, room, issues }: Props) {
  const { updateOpening, removeOpening } = useEditorActions()
  const walls = getWallSegments(room)
  const wallLength = walls[opening.wallIndex]?.length ?? 0
  const limits = getOpeningLimits(opening, room)

  return (
    <section className="inspector-section object-section selected-opening-section" aria-label="Opening settings">
      <p className="section-help opening-intro">
        Drag it along the wall, or set exact numbers below. It always stays within the wall.
      </p>
      <Field label="Wall">
        {(controlId) => (
          <select
            id={controlId}
            value={opening.wallIndex}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              updateOpening(opening.id, { wallIndex: Number(event.target.value) })
            }
          >
            {walls.map((wall) => (
              <option key={wall.index} value={wall.index}>
                Wall {wall.index + 1} · {formatMeters(wall.length)}
              </option>
            ))}
          </select>
        )}
      </Field>
      <FieldRow>
        <NumberField
          label="Position"
          unit="m"
          value={wallLength * opening.offset}
          step={0.05}
          min={0}
          max={wallLength}
          onChange={(distance) =>
            updateOpening(opening.id, { offset: distance / Math.max(GEOMETRY_EPSILON, wallLength) }, 'preview')
          }
        />
        <NumberField
          label="Width"
          unit="m"
          value={opening.width}
          step={0.05}
          min={limits.width.min}
          max={limits.width.max}
          onChange={(width) => updateOpening(opening.id, { width }, 'preview')}
        />
      </FieldRow>
      <FieldRow>
        <NumberField
          label="Height"
          unit="m"
          value={opening.height}
          step={0.05}
          min={limits.height.min}
          max={limits.height.max}
          onChange={(height) => updateOpening(opening.id, { height }, 'preview')}
        />
        {opening.kind === 'window' && (
          <NumberField
            label="Sill"
            unit="m"
            value={opening.sillHeight}
            step={0.05}
            min={limits.sillHeight.min}
            max={limits.sillHeight.max}
            onChange={(sillHeight) => updateOpening(opening.id, { sillHeight }, 'preview')}
          />
        )}
      </FieldRow>
      {issues.length > 0 ? (
        <Note tone="danger" role="status" aria-live="polite">
          {issues.map((issue) => (
            <div key={issue.message}>{issue.message}</div>
          ))}
        </Note>
      ) : (
        <Note tone="success" role="status">
          Placement is valid
        </Note>
      )}
      <Actions className="inspector-actions">
        <Button variant="danger" onClick={() => removeOpening(opening.id)}>
          Delete opening
        </Button>
      </Actions>
    </section>
  )
}
