import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { EDITOR_CONFIG } from '../config/editorConfig'
import type { EditorActions } from '../model/actions'
import type { EditorController } from '../model/EditorController'
import type { EditorSnapshot } from '../model/EditorState'
import { useEditorKeyboardShortcuts } from './keyboard/useEditorKeyboardShortcuts'

interface EditorRuntime {
  controller: EditorController
  actions: EditorActions
}

interface EditorProviderProps extends PropsWithChildren {
  controller: EditorController
}

const EditorRuntimeContext = createContext<EditorRuntime | null>(null)

function useEditorRuntime(): EditorRuntime {
  const runtime = useContext(EditorRuntimeContext)
  if (!runtime) throw new Error('Editor hooks must be used inside EditorProvider')
  return runtime
}

function EditorLifecycle({ runtime }: { runtime: EditorRuntime }) {
  const snapshot = useSyncExternalStore(
    runtime.controller.subscribe,
    runtime.controller.getSnapshot,
    runtime.controller.getSnapshot,
  )
  useEditorKeyboardShortcuts(snapshot, runtime.actions)

  useEffect(() => {
    const flush = () => runtime.controller.flushPersistence()
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [runtime.controller])

  const noticeId = snapshot.editorNotice?.id ?? null
  useEffect(() => {
    if (noticeId === null) return undefined
    const timeout = window.setTimeout(runtime.actions.clearEditorNotice, EDITOR_CONFIG.noticeDurationMs)
    return () => window.clearTimeout(timeout)
  }, [runtime.actions, noticeId])

  return null
}

export function EditorProvider({ children, controller }: EditorProviderProps) {
  const runtime = useMemo<EditorRuntime>(() => ({ controller, actions: controller.actions }), [controller])

  return (
    <EditorRuntimeContext value={runtime}>
      <EditorLifecycle runtime={runtime} />
      {children}
    </EditorRuntimeContext>
  )
}

export function useEditorSelector<T>(
  selector: (snapshot: EditorSnapshot) => T,
  isEqual: (left: T, right: T) => boolean = Object.is,
): T {
  const runtime = useEditorRuntime()
  const selectorRef = useRef(selector)
  const equalityRef = useRef(isEqual)
  const cacheRef = useRef<{ source: EditorSnapshot; selected: T } | null>(null)
  selectorRef.current = selector
  equalityRef.current = isEqual

  const getSelectedSnapshot = useCallback(() => {
    const source = runtime.controller.getSnapshot()
    const cached = cacheRef.current
    if (cached && cached.source === source) return cached.selected

    const selected = selectorRef.current(source)
    if (cached && equalityRef.current(cached.selected, selected)) {
      cacheRef.current = { source, selected: cached.selected }
      return cached.selected
    }

    cacheRef.current = { source, selected }
    return selected
  }, [runtime.controller])

  return useSyncExternalStore(runtime.controller.subscribe, getSelectedSnapshot, getSelectedSnapshot)
}

export function useEditorActions(): EditorActions {
  return useEditorRuntime().actions
}
