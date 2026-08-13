import { createRectangularRoom, DEFAULT_ROOM_HEIGHT, type FurnitureItem, type SceneState } from '@entities/scene'
import { FURNITURE_SWATCHES } from '@shared/config/theme'

const DEFAULT_ROOM = createRectangularRoom(8, 6, DEFAULT_ROOM_HEIGHT, { x: 0, z: 0 }, 'Living room', 'room-living')

const items: FurnitureItem[] = [
  {
    id: 'sofa-demo',
    roomId: DEFAULT_ROOM.id,
    kind: 'sofa',
    name: 'Sofa',
    position: { x: -1.8, z: -1.65 },
    rotation: 0,
    size: { width: 2.2, depth: 0.9 },
    height: 0.85,
    color: FURNITURE_SWATCHES.leaf,
  },
  {
    id: 'coffee-table-demo',
    roomId: DEFAULT_ROOM.id,
    kind: 'coffee-table',
    name: 'Coffee table',
    position: { x: -1.75, z: -0.15 },
    rotation: 0,
    size: { width: 1.1, depth: 0.62 },
    height: 0.43,
    color: FURNITURE_SWATCHES.darkWood,
  },
  {
    id: 'desk-demo',
    roomId: DEFAULT_ROOM.id,
    kind: 'desk',
    name: 'Desk',
    position: { x: 2.35, z: -1.85 },
    rotation: Math.PI / 2,
    size: { width: 1.5, depth: 0.7 },
    height: 0.78,
    color: FURNITURE_SWATCHES.warmWood,
  },
  {
    id: 'table-demo',
    roomId: DEFAULT_ROOM.id,
    kind: 'table',
    name: 'Dining table',
    position: { x: 1.35, z: 1.25 },
    rotation: Math.PI / 8,
    size: { width: 1.4, depth: 1 },
    height: 0.75,
    color: FURNITURE_SWATCHES.warmWood,
  },
  {
    id: 'rug-demo',
    roomId: DEFAULT_ROOM.id,
    kind: 'rug',
    name: 'Rug',
    position: { x: -1.75, z: -0.2 },
    rotation: 0,
    size: { width: 2.45, depth: 1.8 },
    height: 0.025,
    color: FURNITURE_SWATCHES.sand,
  },
]

export const DEFAULT_SCENE: SceneState = {
  rooms: [DEFAULT_ROOM],
  items,
  openings: [
    {
      id: 'window-demo',
      roomId: DEFAULT_ROOM.id,
      kind: 'window',
      wallIndex: 0,
      offset: 0.62,
      width: 1.6,
      height: 1.1,
      sillHeight: 0.9,
    },
    {
      id: 'door-demo',
      roomId: DEFAULT_ROOM.id,
      kind: 'door',
      wallIndex: 1,
      offset: 0.5,
      width: 0.9,
      height: 2.1,
      sillHeight: 0,
    },
  ],
}
