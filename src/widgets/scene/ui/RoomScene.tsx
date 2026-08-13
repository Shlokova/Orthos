import { useEditorActions, useEditorSelector } from '@features/editor'
import { useViewportInteraction } from '@features/viewport'
import { Canvas } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { Toast } from '@shared/ui'
import { useRef, useState } from 'react'
import * as THREE from 'three'
import { WebGLContextObserver } from './environment/WebGLContextObserver'
import { FloorPlanScene } from './floor-plan/FloorPlanScene'
import './labels/SceneLabels.css'
import './RoomScene.css'

const CANVAS_DPR: [number, number] = [1, SCENE_THEME.render.maxDevicePixelRatio]

const CANVAS_RAYCASTER = {
  params: {
    Line: { threshold: SCENE_THEME.render.lineHitThreshold },
    Points: { threshold: SCENE_THEME.render.lineHitThreshold },
    Mesh: {},
    LOD: {},
    Sprite: {},
  },
}

const CANVAS_GL = {
  antialias: true,
  alpha: false,
  stencil: true,
  powerPreference: 'high-performance' as const,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1,
}

const CANVAS_STYLE = { touchAction: 'none' as const }

function configureRenderer({ gl }: { gl: THREE.WebGLRenderer }) {
  gl.outputColorSpace = THREE.SRGBColorSpace
  gl.shadowMap.enabled = true
  gl.shadowMap.type = THREE.PCFShadowMap
  gl.shadowMap.autoUpdate = true
}

export function RoomScene() {
  const { interactionTool } = useViewportInteraction()
  const editorNotice = useEditorSelector((state) => state.editorNotice)
  const roomDrawing = useEditorSelector((state) => state.roomDrawing)
  const selectionId = useEditorSelector((state) => state.selection?.id ?? null)
  const { select, clearEditorNotice, finishRoomDrawing, undoRoomDrawingPoint, cancelRoomDrawing } = useEditorActions()
  const [contextLost, setContextLost] = useState(false)
  const selectionRef = useRef<string | null>(selectionId)
  const selectionBeforePress = useRef<string | null>(selectionId)
  selectionRef.current = selectionId

  return (
    <section
      className={[
        'viewport',
        roomDrawing ? 'is-drawing' : '',
        interactionTool === 'pan' ? 'is-panning' : 'is-selecting',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Floor plan"
      onPointerDownCapture={() => {
        selectionBeforePress.current = selectionRef.current
      }}
    >
      <Canvas
        frameloop="demand"
        dpr={CANVAS_DPR}
        raycaster={CANVAS_RAYCASTER}
        gl={CANVAS_GL}
        style={CANVAS_STYLE}
        onCreated={configureRenderer}
        onPointerMissed={() => {
          if (roomDrawing || interactionTool !== 'select') return
          if (selectionBeforePress.current !== selectionRef.current) return
          select(null)
        }}
      >
        <color attach="background" args={[SCENE_THEME.palette.paper]} />
        <WebGLContextObserver onLost={setContextLost} />
        <FloorPlanScene />
      </Canvas>

      {roomDrawing && (
        <section className="drawing-hud" aria-label="Room drawing controls">
          <div className="drawing-hud-copy">
            <span>New room</span>
            <strong>
              {roomDrawing.vertices.length === 0
                ? 'Click to place the first corner'
                : `${roomDrawing.vertices.length} ${roomDrawing.vertices.length === 1 ? 'corner' : 'corners'} placed`}
            </strong>
            <small>Close the shape on the first corner. Snaps to 5 cm and keeps walls straight.</small>
          </div>
          <div className="drawing-hud-actions">
            <button type="button" disabled={roomDrawing.vertices.length === 0} onClick={undoRoomDrawingPoint}>
              Undo corner
            </button>
            <button
              type="button"
              className="drawing-hud-primary"
              disabled={roomDrawing.vertices.length < 3}
              onClick={finishRoomDrawing}
            >
              Finish
            </button>
            <button type="button" onClick={cancelRoomDrawing}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {editorNotice && <Toast key={editorNotice.id} message={editorNotice.message} onDismiss={clearEditorNotice} />}
      {contextLost && (
        <div className="context-lost" role="alert">
          The browser dropped the 3D context. Rendering resumes on its own once it is back.
        </div>
      )}
    </section>
  )
}
