import type { EditorActionContext } from './context'
import { createInteractionActions } from './createInteractionActions'
import { createItemActions } from './createItemActions'
import { createOpeningActions } from './createOpeningActions'
import { createProjectActions } from './createProjectActions'
import { createRoomActions } from './createRoomActions'
import { createRoomDrawingActions } from './createRoomDrawingActions'
import { createSelectionActions } from './createSelectionActions'
import { createViewActions } from './createViewActions'

export type { EditorActionContext } from './context'

export function createEditorActions(context: EditorActionContext) {
  return {
    ...createItemActions(context),
    ...createRoomActions(context),
    ...createRoomDrawingActions(context),
    ...createOpeningActions(context),
    ...createSelectionActions(context),
    ...createInteractionActions(context),
    ...createViewActions(context),
    ...createProjectActions(context),
  }
}

export type EditorActions = ReturnType<typeof createEditorActions>
