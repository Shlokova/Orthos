export { analyzeClearance, FURNITURE_CLEARANCE_PADDING } from './model/clearance/clearanceAnalysis'
export { scenesEqual } from './model/equality'
export type { CatalogItem } from './model/furniture/catalog'
export {
  FURNITURE_CATALOG,
  getCatalogItem,
} from './model/furniture/catalog'
export {
  furnitureItemsIntersect3D,
  isItemInsideRoom,
  isItemVerticallyInsideRoom,
  itemBlocksClearance,
} from './model/furniture/collision'
export { FURNITURE_COLOR_CHOICES, resolveFurnitureColor } from './model/furniture/colorPalette'
export { FurnitureFactory } from './model/furniture/FurnitureFactory'
export {
  FURNITURE_LIMITS,
  isHexColor,
  normalizeAngle,
} from './model/furniture/limits'
export {
  constrainItemToRooms,
  itemFitsRoomAt,
} from './model/furniture/roomPlacement'
export {
  DEFAULT_ROOM_HEIGHT,
  MAX_ROOM_VERTICES,
  MAX_ROOMS,
  MIN_ROOM_EDGE,
  ROOM_LIMITS,
  ROOM_NAME_MAX_LENGTH,
} from './model/room/limits'
export type { OpeningPlacementScope } from './model/room/openingPlacement'
export {
  openingsOverlap,
  placeOpeningWithoutOverlap,
  reflowRoomOpenings,
  reindexOpeningsAfterVertexInsert,
  reindexOpeningsAfterVertexRemoval,
} from './model/room/openingPlacement'
export {
  findInteriorPointNear,
  getPlanBounds,
  getRoomBounds,
  isSimplePolygon,
  polygonCentroid,
  roomArea,
  segmentsIntersect,
} from './model/room/polygon'
export type { RoomResizeHandle } from './model/room/roomEditing'
export {
  addRoomVertex,
  getRoomResizeHandlePositions,
  ROOM_RESIZE_HANDLES,
  removeRoomVertex,
  resizeRoomBounds,
  resizeRoomFromHandle,
  translateRoom,
  updateRoomVertex,
} from './model/room/roomEditing'
export {
  cloneRoom,
  createLShapedRoom,
  createRectangularRoom,
  createRoomFromVertices,
  normalizeRoom,
} from './model/room/roomFactory'
export { findOverlappingRoom } from './model/room/roomOverlap'
export type { WallPiece, WallSpan } from './model/room/wallPieces'
export {
  buildWallPieces,
  getSolidWallSpans,
  openingSpan,
  WALL_SPAN_EPSILON,
  WALL_STRIP_EPSILON,
} from './model/room/wallPieces'
export type { OpeningLimits, WallSegment } from './model/room/walls'
export {
  clampOpeningToWall,
  getOpeningLimits,
  getWallSegment,
  getWallSegments,
  OPENING_LIMITS,
  openingWorldPosition,
  projectPointToClosestWall,
} from './model/room/walls'
export {
  MAX_SCENE_ITEMS,
  MAX_SCENE_OPENINGS,
} from './model/sceneLimits'
export type {
  Bounds2D,
  FurnitureItem,
  FurnitureKind,
  OpeningKind,
  RoomDefinition,
  SceneState,
  ValidationIssue,
  Vec2,
  WallOpening,
} from './model/types'
