import { type FurnitureItem, resolveFurnitureColor } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export interface FurnitureMaterials {
  primary: THREE.MeshStandardMaterial
  secondary: THREE.MeshStandardMaterial
  cream: THREE.MeshStandardMaterial
  dark: THREE.MeshStandardMaterial
  green: THREE.MeshStandardMaterial
  greenLight: THREE.MeshStandardMaterial
  metal: THREE.MeshStandardMaterial
  glass: THREE.MeshStandardMaterial
  fabric: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  white: THREE.MeshStandardMaterial
}

function deriveColor(base: string, target: string, amount: number): string {
  return `#${new THREE.Color(base).lerp(new THREE.Color(target), amount).getHexString()}`
}

function createMaterial(
  color: string,
  options: {
    roughness?: number
    metalness?: number
    transparent?: boolean
    opacity?: number
    depthWrite?: boolean
  } = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.78,
    metalness: options.metalness ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true,
  })
}

const COMMON_MATERIALS = {
  cream: createMaterial(SCENE_THEME.palette.cream, { roughness: 0.9 }),
  green: createMaterial(SCENE_THEME.palette.olive, { roughness: 0.82 }),
  greenLight: createMaterial(SCENE_THEME.palette.oliveLight, { roughness: 0.84 }),
  metal: createMaterial(SCENE_THEME.palette.metal, { roughness: 0.34, metalness: 0.66 }),
  glass: createMaterial(SCENE_THEME.palette.glass, {
    roughness: 0.18,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  }),
  fabric: createMaterial(SCENE_THEME.palette.fabric, { roughness: 0.96 }),
  accent: createMaterial(SCENE_THEME.palette.terracotta, { roughness: 0.8 }),
  white: createMaterial(SCENE_THEME.palette.paper, { roughness: 0.94 }),
} satisfies Pick<
  FurnitureMaterials,
  'cream' | 'green' | 'greenLight' | 'metal' | 'glass' | 'fabric' | 'accent' | 'white'
>

export function useFurnitureMaterials(item: FurnitureItem): FurnitureMaterials {
  const { color, kind } = item
  const dynamicMaterials = useMemo(() => {
    const base = resolveFurnitureColor({ color, kind })
    return {
      primary: createMaterial(base, { roughness: 0.82 }),
      secondary: createMaterial(deriveColor(base, SCENE_THEME.palette.creamLight, 0.34), { roughness: 0.88 }),
      dark: createMaterial(deriveColor(base, SCENE_THEME.palette.ink, 0.58), { roughness: 0.72 }),
    }
  }, [color, kind])

  useEffect(
    () => () => {
      for (const material of Object.values(dynamicMaterials)) material.dispose()
    },
    [dynamicMaterials],
  )

  return { ...COMMON_MATERIALS, ...dynamicMaterials }
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const material of Object.values(COMMON_MATERIALS)) material.dispose()
  })
}
