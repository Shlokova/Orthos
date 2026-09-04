import { isRoomDrawingClosable, type RoomDrawingDraft, useEditorActions } from '@features/editor'
import { Html } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { SCENE_THEME } from '@shared/config/theme'
import { useMemo } from 'react'
import * as THREE from 'three'
import { FLOOR_PLANE } from '../../lib/geometry/constants'
import { useScreenToPlane } from '../../lib/interactions/useScreenToPlane'
import { NativePolyline } from '../primitives/NativePolyline'
import './RoomDrawingLayer.css'
import { distanceBetween, formatMeters } from '@shared/lib'
import { PLAN_ORDER } from '../../lib/geometry/planLayers'

interface Props {
  draft: RoomDrawingDraft
}

const DRAWING_CAPTURE_HEIGHT = 7
const DRAWING_CAPTURE_SIZE = 2_000
const MAX_CLICK_DRIFT_PX = 5
const CLOSE_BUTTON_OFFSET = 0.55

function DrawingCapturePlane() {
  const { addRoomDrawingPoint, previewRoomDrawing } = useEditorActions()
  const projectToFloor = useScreenToPlane()

  const floorPointOf = (event: { clientX: number; clientY: number }) => {
    const point = projectToFloor(event.clientX, event.clientY, FLOOR_PLANE)
    return point ? { x: point.x, z: point.z } : null
  }

  return (
    <mesh
      position={[0, DRAWING_CAPTURE_HEIGHT, 0]}
      rotation-x={-Math.PI / 2}
      renderOrder={PLAN_ORDER.drawing + 5}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        const point = floorPointOf(event.nativeEvent)
        if (point) previewRoomDrawing(point)
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        if (event.button !== 0 || event.delta > MAX_CLICK_DRIFT_PX) return
        event.stopPropagation()
        const point = floorPointOf(event.nativeEvent)
        if (point) addRoomDrawingPoint(point)
      }}
    >
      <planeGeometry args={[DRAWING_CAPTURE_SIZE, DRAWING_CAPTURE_SIZE]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

export function RoomDrawingLayer({ draft }: Props) {
  const { finishRoomDrawing } = useEditorActions()
  const closeTargetActive = isRoomDrawingClosable(draft)
  const first = draft.vertices[0]
  const canClose = draft.vertices.length >= 3
  const blocked = draft.blockedBy !== null
  const magnetised = draft.magnet === 'vertex' || draft.magnet === 'wall'
  const previewColor = blocked ? SCENE_THEME.palette.invalidUi : SCENE_THEME.palette.terracottaUi
  const pointerColor = blocked
    ? SCENE_THEME.palette.invalidUi
    : magnetised
      ? SCENE_THEME.palette.oliveUi
      : SCENE_THEME.palette.terracottaUi

  const previewPoints = useMemo(() => {
    const points = draft.vertices.map((vertex) => [vertex.x, 0.19, vertex.z] as const)
    if (draft.pointer) {
      const pointer = closeTargetActive && first ? first : draft.pointer
      points.push([pointer.x, 0.19, pointer.z] as const)
    }
    return points
  }, [closeTargetActive, draft.pointer, draft.vertices, first])

  const segmentLabels = useMemo(() => {
    const points = [...draft.vertices]
    if (draft.pointer) points.push(closeTargetActive && first ? first : draft.pointer)
    return points
      .slice(1)
      .map((point, index) => {
        const start = points[index]
        return {
          key: index,
          position: { x: (start.x + point.x) / 2, z: (start.z + point.z) / 2 },
          length: distanceBetween(start, point),
        }
      })
      .filter((label) => label.length >= 0.05)
  }, [closeTargetActive, draft.pointer, draft.vertices, first])

  const alignmentGuide = useMemo(() => {
    const pointer = draft.pointer
    if (!pointer || closeTargetActive || !first || draft.vertices.length < 2) return null
    if (first.x === pointer.x && first.z !== pointer.z) return { from: first, to: pointer }
    if (first.z === pointer.z && first.x !== pointer.x) return { from: first, to: pointer }
    return null
  }, [closeTargetActive, draft.pointer, draft.vertices.length, first])

  return (
    <group>
      <DrawingCapturePlane />

      {alignmentGuide && (
        <NativePolyline
          points={[
            [alignmentGuide.from.x, 0.18, alignmentGuide.from.z],
            [alignmentGuide.to.x, 0.18, alignmentGuide.to.z],
          ]}
          color={SCENE_THEME.palette.oliveUi}
          depthTest={false}
          renderOrder={PLAN_ORDER.drawing}
        />
      )}

      {previewPoints.length >= 2 && (
        <NativePolyline points={previewPoints} color={previewColor} renderOrder={PLAN_ORDER.drawing + 1} />
      )}

      {segmentLabels.map((label) => (
        <Html
          key={label.key}
          center
          transform={false}
          position={[label.position.x, 0.27, label.position.z]}
          style={{ pointerEvents: 'none' }}
        >
          <span className="drawing-measure">{formatMeters(label.length)}</span>
        </Html>
      ))}

      {draft.pointer && !closeTargetActive && (
        <group position={[draft.pointer.x, 0.2, draft.pointer.z]}>
          <mesh rotation-x={-Math.PI / 2} renderOrder={PLAN_ORDER.drawing + 4}>
            <circleGeometry args={[0.075, 20]} />
            <meshBasicMaterial color={pointerColor} transparent depthTest={false} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} renderOrder={PLAN_ORDER.drawing + 3}>
            <ringGeometry args={[0.1, 0.14, 24]} />
            <meshBasicMaterial color={pointerColor} transparent opacity={0.5} depthTest={false} />
          </mesh>
          {magnetised && (
            <mesh rotation-x={-Math.PI / 2} renderOrder={PLAN_ORDER.drawing + 3}>
              <ringGeometry args={[0.19, 0.23, 28]} />
              <meshBasicMaterial color={pointerColor} transparent opacity={0.8} depthTest={false} />
            </mesh>
          )}
        </group>
      )}

      {draft.vertices.map((vertex, index) => (
        <group key={index} position={[vertex.x, 0.21, vertex.z]}>
          <mesh rotation-x={-Math.PI / 2} renderOrder={PLAN_ORDER.drawing + 3}>
            <circleGeometry args={[index === 0 ? 0.14 : 0.1, 24]} />
            <meshBasicMaterial
              color={index === 0 ? SCENE_THEME.palette.terracottaUi : SCENE_THEME.palette.oliveUi}
              transparent
              depthTest={false}
            />
          </mesh>
          {index === 0 && canClose && (
            <mesh position-y={-0.01} rotation-x={-Math.PI / 2} renderOrder={PLAN_ORDER.drawing + 2}>
              <ringGeometry args={[0.18, closeTargetActive ? 0.3 : 0.24, 32]} />
              <meshBasicMaterial
                color={SCENE_THEME.palette.terracottaUi}
                transparent
                opacity={closeTargetActive ? 0.9 : 0.44}
                depthTest={false}
              />
            </mesh>
          )}
        </group>
      ))}

      {first && canClose && (
        <Html
          center
          transform={false}
          position={[first.x, 0.62, first.z - CLOSE_BUTTON_OFFSET]}
          style={{ pointerEvents: 'none' }}
        >
          <button
            className="drawing-close-button"
            type="button"
            style={{ pointerEvents: 'auto' }}
            onPointerDown={(event) => {
              event.stopPropagation()
              event.preventDefault()
            }}
            onClick={(event) => {
              event.stopPropagation()
              finishRoomDrawing()
            }}
          >
            Close room
          </button>
        </Html>
      )}
    </group>
  )
}
