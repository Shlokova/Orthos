import { getCatalogItem } from '@entities/scene'
import { useEditorSelector } from '@features/editor'
import { shallowEqual } from '@shared/lib'
import { FurnitureSection } from './FurnitureSection'
import { SelectedOpeningSection } from './SelectedOpeningSection'
import './Inspector.css'
import { FloatingPanel } from '../panel'

interface Props {
  itemId: string | null
  openingId: string | null
  isExiting: boolean
  onRequestClose(): void
}

export function ObjectInspectorPanel({ itemId, openingId, isExiting, onRequestClose }: Props) {
  const { rooms, room, items, openings, issues } = useEditorSelector(
    (state) => ({
      rooms: state.rooms,
      room: state.room,
      items: state.items,
      openings: state.openings,
      issues: state.issues,
    }),
    shallowEqual,
  )
  const item = items.find((candidate) => candidate.id === itemId)
  const opening = openings.find((candidate) => candidate.id === openingId)
  const definition = item ? getCatalogItem(item.kind) : null
  const openingRoom = opening ? (rooms.find((candidate) => candidate.id === opening.roomId) ?? room) : room

  if (!item && !opening) return null

  return (
    <FloatingPanel
      id="object-inspector-panel"
      titleId="object-inspector-title"
      variant="object-inspector"
      headerClassName="object-inspector-header"
      eyebrow={item && definition ? definition.category : 'Wall opening'}
      title={item?.name ?? (opening?.kind === 'door' ? 'Door' : 'Window')}
      closeLabel="Close the object panel"
      isExiting={isExiting}
      onRequestClose={onRequestClose}
    >
      <div className="inspector-scroll object-inspector-scroll">
        {item && <FurnitureSection item={item} />}
        {opening && (
          <SelectedOpeningSection
            opening={opening}
            room={openingRoom}
            issues={issues.filter((issue) => issue.itemIds.includes(opening.id))}
          />
        )}
      </div>
    </FloatingPanel>
  )
}
