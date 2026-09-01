import { type FurnitureItem, getCatalogItem, getFurnitureFamily } from '@entities/scene'
import { SCENE_THEME } from '@shared/config/theme'
import { useMemo } from 'react'

interface Props {
  items: readonly FurnitureItem[]
}

interface LampSource {
  id: string
  position: [number, number, number]
  intensity: number
  distance: number
}

const MAX_ACTIVE_LAMPS = 24

function collectLampSources(items: readonly FurnitureItem[]): LampSource[] {
  const sources: LampSource[] = []
  for (const item of items) {
    if (getFurnitureFamily(item.kind) !== 'lighting') continue
    const light = getCatalogItem(item.kind).light
    if (!light) continue
    sources.push({
      id: item.id,
      position: [item.position.x, item.elevation + item.height * light.heightRatio, item.position.z],
      intensity: light.intensity,
      distance: light.distance,
    })
    if (sources.length === MAX_ACTIVE_LAMPS) break
  }
  return sources
}

export function FurnitureLights({ items }: Props) {
  const sources = useMemo(() => collectLampSources(items), [items])

  return (
    <>
      {sources.map((source) => (
        <pointLight
          key={source.id}
          position={source.position}
          intensity={source.intensity}
          distance={source.distance}
          decay={2}
          color={SCENE_THEME.palette.lightWarm}
          castShadow={false}
        />
      ))}
    </>
  )
}
