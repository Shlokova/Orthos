import { ViewportControlsProvider } from '@features/viewport'
import { TopBar, useWorkspacePanels, Workspace } from '@widgets/editor'
import { RoomScene, SceneBottomBar } from '@widgets/scene'

export function EditorPage() {
  const { openPanel, inspectorTarget, closePanel, togglePanel } = useWorkspacePanels()

  return (
    <main
      className="app-shell"
      data-panel-open={openPanel ?? undefined}
      data-overlay-open={openPanel ? 'true' : undefined}
    >
      <TopBar />
      <ViewportControlsProvider>
        <Workspace openPanel={openPanel} inspectorTarget={inspectorTarget} onClose={closePanel} onToggle={togglePanel}>
          <RoomScene />
          <SceneBottomBar />
        </Workspace>
      </ViewportControlsProvider>
    </main>
  )
}
