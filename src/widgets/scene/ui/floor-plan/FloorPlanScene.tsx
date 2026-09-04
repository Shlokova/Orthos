import { collectRoomWallOpenings, getPlanBounds, type WallOpening } from '@entities/scene'
import { useEditorSelector } from '@features/editor'
import { SCENE_THEME } from '@shared/config/theme'
import { shallowEqual } from '@shared/lib'
import { useMemo } from 'react'
import { buildPlanItemLayers, PLAN_ITEM_FALLBACK } from '../../lib/geometry/planLayers'
import { CameraRig } from '../camera/CameraRig'
import { ClearanceOverlay } from '../environment/ClearanceOverlay'
import { FurnitureLights } from '../environment/FurnitureLights'
import { PlanGrid } from '../environment/PlanGrid'
import { PlanLighting } from '../environment/PlanLighting'
import {
  PolygonFloor,
  RoomDimensions,
  RoomDrawingLayer,
  RoomTransformHandles,
  RoomVertexHandles,
  RoomWalls,
} from '../floor-plan'
import { FurnitureObject } from '../furniture/FurnitureObject'

export function FloorPlanScene() {
  const {
    rooms,
    room,
    activeRoomId,
    items,
    openings,
    heatmapVisible,
    dimensionsVisible,
    viewMode,
    wallDisplayMode,
    roomEditTool,
    activeRoomSelected,
    isDragging,
    roomDrawing,
  } = useEditorSelector(
    (state) => ({
      rooms: state.rooms,
      room: state.room,
      activeRoomId: state.activeRoomId,
      items: state.items,
      openings: state.openings,
      heatmapVisible: state.heatmapVisible,
      dimensionsVisible: state.dimensionsVisible,
      viewMode: state.viewMode,
      wallDisplayMode: state.wallDisplayMode,
      roomEditTool: state.roomEditTool,
      activeRoomSelected: state.selection?.type === 'room' && state.selection.id === state.room.id,
      isDragging: state.isTransacting,
      roomDrawing: state.roomDrawing,
    }),
    shallowEqual,
  )
  const planBounds = useMemo(() => getPlanBounds(rooms), [rooms])
  const gridBounds = useMemo(
    () => ({
      ...planBounds,
      minX: planBounds.minX - 3,
      maxX: planBounds.maxX + 3,
      minZ: planBounds.minZ - 3,
      maxZ: planBounds.maxZ + 3,
      width: planBounds.width + 6,
      depth: planBounds.depth + 6,
    }),
    [planBounds],
  )
  const maxHeight = useMemo(() => Math.max(...rooms.map((entry) => entry.height)), [rooms])
  const openingsByRoom = useMemo(() => {
    const grouped = new Map<string, WallOpening[]>()
    for (const opening of openings) {
      const current = grouped.get(opening.roomId)
      if (current) current.push(opening)
      else grouped.set(opening.roomId, [opening])
    }
    return grouped
  }, [openings])
  const wallOpeningsByRoom = useMemo(
    () => new Map(rooms.map((entry) => [entry.id, collectRoomWallOpenings(entry, rooms, openings)])),
    [rooms, openings],
  )
  const maxExtent = Math.max(planBounds.width, planBounds.depth)
  const planLayers = useMemo(() => buildPlanItemLayers(items), [items])

  return (
    <>
      <CameraRig
        rooms={rooms}
        viewMode={viewMode}
        isDragging={isDragging}
        interactionLocked={Boolean(roomDrawing)}
        dimensionsVisible={dimensionsVisible}
      />
      {viewMode === 'perspective' && (
        <fog
          attach="fog"
          args={[SCENE_THEME.palette.fog, Math.max(22, maxExtent * 1.15), Math.max(52, maxExtent * 3.8)]}
        />
      )}
      {viewMode === 'perspective' && <PlanLighting bounds={planBounds} maxHeight={maxHeight} />}
      {viewMode === 'perspective' && <FurnitureLights items={items} />}

      {rooms.map((entry) => (
        <group key={entry.id}>
          <PolygonFloor room={entry} active={entry.id === activeRoomId} viewMode={viewMode} />
          <RoomWalls
            room={entry}
            ownOpenings={openingsByRoom.get(entry.id) ?? []}
            wallOpenings={wallOpeningsByRoom.get(entry.id) ?? []}
            viewMode={viewMode}
            wallDisplayMode={wallDisplayMode}
            active={entry.id === activeRoomId}
          />
        </group>
      ))}

      {viewMode === 'top' && <PlanGrid bounds={gridBounds} />}
      {viewMode === 'top' && dimensionsVisible && !roomDrawing && <RoomDimensions room={room} />}
      <ClearanceOverlay rooms={rooms} items={items} visible={heatmapVisible} occluded={viewMode === 'perspective'} />
      {items.map((item) => (
        <FurnitureObject
          key={item.id}
          item={item}
          room={rooms.find((entry) => entry.id === item.roomId) ?? null}
          viewMode={viewMode}
          layer={planLayers.get(item.id) ?? PLAN_ITEM_FALLBACK}
        />
      ))}
      <RoomTransformHandles
        room={room}
        visible={viewMode === 'top' && activeRoomSelected && roomEditTool === 'transform'}
      />
      <RoomVertexHandles room={room} visible={viewMode === 'top' && activeRoomSelected && roomEditTool === 'corners'} />
      {viewMode === 'top' && roomDrawing && <RoomDrawingLayer draft={roomDrawing} />}
    </>
  )
}
