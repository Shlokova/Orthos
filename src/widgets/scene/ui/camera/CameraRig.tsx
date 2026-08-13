import type { CameraRigProps } from './cameraRig.types'
import { PerspectiveCameraRig } from './PerspectiveCameraRig'
import { TopCameraRig } from './TopCameraRig'

export function CameraRig({ rooms, viewMode, isDragging, interactionLocked }: CameraRigProps) {
  const props = { rooms, isDragging, interactionLocked }
  return viewMode === 'top' ? <TopCameraRig {...props} /> : <PerspectiveCameraRig {...props} />
}
