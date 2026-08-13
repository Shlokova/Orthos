import { useThree } from '@react-three/fiber'
import { useCallback, useRef } from 'react'
import * as THREE from 'three'

type ScreenToPlane = (clientX: number, clientY: number, plane: THREE.Plane) => THREE.Vector3 | null

interface ProjectionScratch {
  raycaster: THREE.Raycaster
  pointer: THREE.Vector2
  intersection: THREE.Vector3
}

export function useScreenToPlane(): ScreenToPlane {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const scratch = useRef<ProjectionScratch | null>(null)
  scratch.current ??= {
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
    intersection: new THREE.Vector3(),
  }

  return useCallback(
    (clientX: number, clientY: number, plane: THREE.Plane) => {
      const { raycaster, pointer, intersection } = scratch.current as ProjectionScratch
      const bounds = gl.domElement.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return null

      pointer.set(((clientX - bounds.left) / bounds.width) * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      return raycaster.ray.intersectPlane(plane, intersection) ? intersection.clone() : null
    },
    [camera, gl],
  )
}
