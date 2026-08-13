import type { RoomDefinition } from '@entities/scene'
import type { ViewMode } from '@features/editor'

export interface CameraRigProps {
  rooms: readonly RoomDefinition[]
  viewMode: ViewMode
  isDragging: boolean
  interactionLocked: boolean
}

export type CameraModeRigProps = Omit<CameraRigProps, 'viewMode'>
