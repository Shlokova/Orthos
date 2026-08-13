import { useEditorSelector } from '@features/editor'
import { WallVisibilityControl } from './WallVisibilityControl'

export function WallDisplayCard() {
  const viewMode = useEditorSelector((state) => state.viewMode)

  return (
    <section className="room-editor-card">
      <div className="section-title-row">
        <h3>Walls in 3D</h3>
        <span>{viewMode === 'top' ? '2D plan' : '3D view'}</span>
      </div>
      <WallVisibilityControl />
    </section>
  )
}
