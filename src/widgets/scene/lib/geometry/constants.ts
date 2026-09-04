import { SCENE_THEME } from '@shared/config/theme'
import * as THREE from 'three'

export const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
export const WALL_THICKNESS = SCENE_THEME.plan.wallThickness
