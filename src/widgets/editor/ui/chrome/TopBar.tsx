import { EditorToolbar } from './EditorToolbar'
import { ProjectMenu } from './ProjectMenu'
import './TopBar.css'

export function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-mark" src="/favicon.png" alt="" width={38} height={38} />
        <div className="brand-copy">
          <strong>Orthos</strong>
          <span>2D and 3D room planner</span>
        </div>
      </div>

      <EditorToolbar />

      <div className="topbar-actions">
        <ProjectMenu />
      </div>
    </header>
  )
}
