import { MEDIA_QUERIES } from '@shared/config/breakpoints'
import { MOTION_BASE_MS } from '@shared/config/motion'
import { useMediaQuery, usePresence } from '@shared/lib/react'
import type { PropsWithChildren } from 'react'
import { CatalogPanel } from '../catalog/CatalogPanel'
import { ToolRail } from '../chrome/ToolRail'
import { ObjectInspectorPanel } from '../inspector/ObjectInspectorPanel'
import { RoomEditorPanel } from '../room/RoomEditorPanel'
import type { InspectorTarget, WorkspacePanel } from './useWorkspacePanels'
import './Workspace.css'

interface Props extends PropsWithChildren {
  openPanel: WorkspacePanel
  inspectorTarget: InspectorTarget | null
  onClose(): void
  onToggle(panel: Exclude<WorkspacePanel, null>): void
}

export function Workspace({ openPanel, inspectorTarget, onClose, onToggle, children }: Props) {
  const isSheetLayout = useMediaQuery(MEDIA_QUERIES.tabletDown)
  const tool = usePresence(openPanel === 'object' ? null : openPanel, MOTION_BASE_MS)
  const inspector = usePresence(inspectorTarget, MOTION_BASE_MS)
  const scrimVisible = isSheetLayout && Boolean(openPanel)

  return (
    <section className="workspace">
      <ToolRail openPanel={openPanel} onToggle={onToggle} />

      <div className="workspace-dock">
        {tool.present === 'plan' && <RoomEditorPanel isExiting={tool.isExiting} onRequestClose={onClose} />}
        {tool.present === 'catalog' && <CatalogPanel isExiting={tool.isExiting} onRequestClose={onClose} />}
        {inspector.present && (
          <ObjectInspectorPanel
            itemId={inspector.present.kind === 'item' ? inspector.present.id : null}
            openingId={inspector.present.kind === 'opening' ? inspector.present.id : null}
            isExiting={inspector.isExiting}
            onRequestClose={onClose}
          />
        )}
      </div>

      <div className="workspace-stage">{children}</div>

      {scrimVisible && (
        <button
          type="button"
          className="workspace-scrim"
          onClick={onClose}
          aria-label="Close open panel"
          tabIndex={-1}
        />
      )}
    </section>
  )
}
