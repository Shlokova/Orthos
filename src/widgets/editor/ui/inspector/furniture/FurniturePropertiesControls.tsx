import {
  FURNITURE_COLOR_CHOICES,
  FURNITURE_LIMITS,
  type FurnitureItem,
  getItemAnchorStrategy,
  resolveFurnitureColor,
} from '@entities/scene'
import type { EditorActions } from '@features/editor'
import { FieldRow } from '@shared/ui'
import type { CSSProperties } from 'react'
import { NumberField } from '../../controls/NumberField'

type SwatchStyle = CSSProperties & { '--swatch-color': string }

function swatchStyle(color: string): SwatchStyle {
  return { '--swatch-color': color }
}

interface Props {
  item: FurnitureItem
  actions: EditorActions
}

export function FurniturePropertiesControls({ item, actions }: Props) {
  const resolvedColor = resolveFurnitureColor(item)
  const { editableElevation } = getItemAnchorStrategy(item.kind)
  return (
    <>
      <div className="object-color-field">
        <span>Finish</span>
        <div className="object-color-swatches" role="toolbar" aria-label="Object finish">
          {FURNITURE_COLOR_CHOICES.map(({ name, color }) => (
            <button
              key={color}
              type="button"
              className={resolvedColor === color ? 'is-active' : ''}
              style={swatchStyle(color)}
              aria-label={name}
              title={name}
              aria-pressed={resolvedColor === color}
              onClick={() => actions.updateItem(item.id, { color })}
            />
          ))}
        </div>
      </div>

      <FieldRow>
        <NumberField
          label="Width"
          unit="m"
          value={item.size.width}
          step={0.05}
          min={FURNITURE_LIMITS.width.min}
          max={FURNITURE_LIMITS.width.max}
          onChange={(width) => actions.updateItem(item.id, { size: { ...item.size, width } }, 'preview')}
        />
        <NumberField
          label="Depth"
          unit="m"
          value={item.size.depth}
          step={0.05}
          min={FURNITURE_LIMITS.depth.min}
          max={FURNITURE_LIMITS.depth.max}
          onChange={(depth) => actions.updateItem(item.id, { size: { ...item.size, depth } }, 'preview')}
        />
      </FieldRow>
      {editableElevation ? (
        <FieldRow>
          <NumberField
            label="Height"
            unit="m"
            value={item.height}
            step={0.05}
            min={FURNITURE_LIMITS.height.min}
            max={FURNITURE_LIMITS.height.max}
            onChange={(height) => actions.updateItem(item.id, { height }, 'preview')}
          />
          <NumberField
            label="Above floor"
            unit="m"
            value={item.elevation}
            step={0.05}
            min={FURNITURE_LIMITS.elevation.min}
            max={FURNITURE_LIMITS.elevation.max}
            onChange={(elevation) => actions.updateItem(item.id, { elevation }, 'preview')}
          />
        </FieldRow>
      ) : (
        <NumberField
          label="Height"
          unit="m"
          value={item.height}
          step={0.05}
          min={FURNITURE_LIMITS.height.min}
          max={FURNITURE_LIMITS.height.max}
          onChange={(height) => actions.updateItem(item.id, { height }, 'preview')}
        />
      )}
    </>
  )
}
