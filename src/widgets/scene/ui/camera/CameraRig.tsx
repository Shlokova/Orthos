import type { CameraRigProps } from './cameraRig.types'
import { PerspectiveCameraRig } from './PerspectiveCameraRig'
import { TopCameraRig } from './TopCameraRig'

export function CameraRig({ rooms, viewMode, isDragging, interactionLocked, dimensionsVisible }: CameraRigProps) {
  const props = { rooms, isDragging, interactionLocked, dimensionsVisible }
  return viewMode === 'top' ? <TopCameraRig {...props} /> : <PerspectiveCameraRig {...props} />
}
