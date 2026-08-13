import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

interface GeometrySet {
  roundedBox: THREE.BufferGeometry
  box: THREE.BufferGeometry
  cylinder: THREE.BufferGeometry
  frustum: THREE.BufferGeometry
  invertedFrustum: THREE.BufferGeometry
  sphere: THREE.BufferGeometry
  cone: THREE.BufferGeometry
  torus: THREE.BufferGeometry
}

export type FurnitureGeometryKind = keyof GeometrySet

function createGeometrySet(): GeometrySet {
  return {
    roundedBox: new RoundedBoxGeometry(1, 1, 1, 2, 0.065),
    box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
    frustum: new THREE.CylinderGeometry(0.38, 0.5, 1, 12),
    invertedFrustum: new THREE.CylinderGeometry(0.5, 0.36, 1, 12),
    sphere: new THREE.SphereGeometry(0.5, 12, 8),
    cone: new THREE.ConeGeometry(0.5, 1, 12),
    torus: new THREE.TorusGeometry(0.38, 0.1, 8, 16),
  }
}

const GEOMETRIES = createGeometrySet()

export function getFurnitureGeometry(kind: FurnitureGeometryKind): THREE.BufferGeometry {
  return GEOMETRIES[kind]
}

export const FURNITURE_OUTLINE_MATERIAL = new THREE.MeshBasicMaterial({
  color: SCENE_THEME.palette.ink,
  side: THREE.BackSide,
  toneMapped: false,
})

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const geometry of Object.values(GEOMETRIES)) geometry.dispose()
    FURNITURE_OUTLINE_MATERIAL.dispose()
  })
}
