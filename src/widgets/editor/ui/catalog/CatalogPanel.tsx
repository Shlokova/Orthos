import { type CatalogItem, FURNITURE_CATALOG } from '@entities/scene'
import { useEditorActions } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { Chip } from '@shared/ui'
import { type ChangeEvent, type CSSProperties, useMemo, useState } from 'react'
import './CatalogPanel.css'
import { FloatingPanel } from '../panel'

interface Props {
  isExiting: boolean
  onRequestClose(): void
}

type CatalogGroup = 'All' | 'Living' | 'Work' | 'Bedroom' | 'Storage' | 'Dining'

const groups: readonly CatalogGroup[] = ['All', 'Living', 'Work', 'Bedroom', 'Storage', 'Dining']

type CatalogPreviewStyle = CSSProperties & { '--catalog-color': string }

function catalogPreviewStyle(color: string): CatalogPreviewStyle {
  return { '--catalog-color': color }
}

function belongsToGroup(item: CatalogItem, group: CatalogGroup): boolean {
  if (group === 'All') return true
  if (group === 'Living') return item.category === 'Living'
  return item.category === group
}

export function CatalogPanel({ isExiting, onRequestClose }: Props) {
  const { setInteractionTool } = useViewportInteraction()
  const { addItem } = useEditorActions()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<CatalogGroup>('All')

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return FURNITURE_CATALOG.filter(
      (item) =>
        belongsToGroup(item, group) &&
        (!normalized || `${item.name} ${item.category}`.toLowerCase().includes(normalized)),
    )
  }, [group, query])

  return (
    <FloatingPanel
      id="object-library-panel"
      titleId="object-library-title"
      variant="catalog"
      eyebrow="Furniture library"
      title="Objects"
      closeLabel="Close the object library"
      isExiting={isExiting}
      onRequestClose={onRequestClose}
    >
      <label className="catalog-search">
        <span className="search-glyph" aria-hidden="true">
          ⌕
        </span>
        <span className="sr-only">Search objects</span>
        <input
          type="search"
          value={query}
          placeholder="Search by name or category"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        />
      </label>

      <div className="category-tabs" role="toolbar" aria-label="Object categories">
        {groups.map((entry) => (
          <Chip key={entry} active={group === entry} aria-pressed={group === entry} onClick={() => setGroup(entry)}>
            {entry}
          </Chip>
        ))}
      </div>

      <div className="catalog-grid">
        {items.map((item) => (
          <button
            type="button"
            key={item.kind}
            className="catalog-card"
            aria-label={`Add ${item.name}`}
            onClick={() => {
              setInteractionTool('select')
              addItem(item.kind)
            }}
          >
            <span className="catalog-preview" aria-hidden="true">
              <span className="catalog-sketch" style={catalogPreviewStyle(item.color)}>
                {item.icon}
              </span>
            </span>
            <span className="catalog-card-copy">
              <strong>{item.name}</strong>
              <small>
                {item.size.width} × {item.size.depth} m
              </small>
            </span>
          </button>
        ))}
      </div>
      {items.length === 0 && (
        <div className="empty-state">Nothing matches that search. Try another word or pick a different category.</div>
      )}
    </FloatingPanel>
  )
}
