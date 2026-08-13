export type Selection =
  | { type: 'item'; id: string }
  | { type: 'opening'; id: string }
  | { type: 'room'; id: string }
  | null

export type ViewMode = 'perspective' | 'top'
export type WallDisplayMode = 'none' | 'far' | 'all'
export type RoomEditTool = 'transform' | 'corners'
export type RoomShape = 'rectangle' | 'l-shape'
export type NudgeDirection = 'north' | 'south' | 'west' | 'east'

export type NudgeStep = 'coarse' | 'fine'
