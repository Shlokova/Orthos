import { roomArea } from '@entities/scene'
import { useEditorSelector } from '@features/editor'
import { type TabDefinition, Tabs, tabId, tabPanelId } from '@shared/ui'
import { useState } from 'react'
import { OpeningsSection } from '../inspector/OpeningsSection'
import { PolygonSection } from '../inspector/PolygonSection'
import { CreateRoomCard } from './CreateRoomCard'
import { RoomDetailsCard } from './RoomDetailsCard'
import { RoomListCard } from './RoomListCard'
import { RoomPositionSettings } from './RoomPositionSettings'
import { WallDisplayCard } from './WallDisplayCard'
import './RoomEditor.css'
import { formatArea } from '@shared/lib'
import { FloatingPanel } from '../panel'

interface Props {
  isExiting: boolean
  onRequestClose(): void
}

type RoomTab = 'layout' | 'openings' | 'corners'

const ROOM_TABS: readonly TabDefinition<RoomTab>[] = [
  { id: 'layout', label: 'Layout' },
  { id: 'openings', label: 'Openings' },
  { id: 'corners', label: 'Corners' },
]

const ID_PREFIX = 'room'

export function RoomEditorPanel({ isExiting, onRequestClose }: Props) {
  const [tab, setTab] = useState<RoomTab>('layout')
  const room = useEditorSelector((state) => state.room)

  return (
    <FloatingPanel
      id="room-editor-panel"
      titleId="room-editor-title"
      variant="room-editor"
      eyebrow={`${formatArea(roomArea(room))} · ${room.vertices.length} corners`}
      title="Plan"
      closeLabel="Close the plan panel"
      isExiting={isExiting}
      onRequestClose={onRequestClose}
    >
      <Tabs<RoomTab>
        className="room-editor-tabs"
        items={ROOM_TABS}
        value={tab}
        onChange={setTab}
        label="Plan sections"
        idPrefix={ID_PREFIX}
      />

      <div className="panel-scroll room-editor-scroll">
        {tab === 'layout' && (
          <div id={tabPanelId(ID_PREFIX, 'layout')} role="tabpanel" aria-labelledby={tabId(ID_PREFIX, 'layout')}>
            <CreateRoomCard onRequestClose={onRequestClose} />
            <RoomListCard />
            <RoomDetailsCard />
            <WallDisplayCard />
            <RoomPositionSettings />
          </div>
        )}
        {tab === 'openings' && (
          <div id={tabPanelId(ID_PREFIX, 'openings')} role="tabpanel" aria-labelledby={tabId(ID_PREFIX, 'openings')}>
            <OpeningsSection />
          </div>
        )}
        {tab === 'corners' && (
          <div id={tabPanelId(ID_PREFIX, 'corners')} role="tabpanel" aria-labelledby={tabId(ID_PREFIX, 'corners')}>
            <PolygonSection />
          </div>
        )}
      </div>
    </FloatingPanel>
  )
}
