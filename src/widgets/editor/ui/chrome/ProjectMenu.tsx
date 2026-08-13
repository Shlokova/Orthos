import { useEditorActions } from '@features/editor'
import { Button, Dialog, getFocusableElements } from '@shared/ui'
import { DownloadIcon, MoreIcon, ResetIcon, UploadIcon } from '@shared/ui/icons'
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import './ProjectMenu.css'

function importErrorMessage(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error)
  console.warn(`Scene import failed: ${detail}`)
  if (detail.startsWith('Unsupported scene version')) {
    return 'This file comes from an older version of Orthos and can no longer be opened.'
  }
  return 'That file is not an Orthos project, or it is damaged.'
}

function downloadJson(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ProjectMenu() {
  const { resetScene, exportScene, importScene, showEditorNotice } = useEditorActions()
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const closeMenu = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const menu = menuRef.current
    const frame = window.requestAnimationFrame(() => {
      const first = menu ? getFocusableElements(menu)[0] : null
      first?.focus()
    })
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !menuRootRef.current?.contains(event.target)) closeMenu()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const currentMenu = menuRef.current
      if (!currentMenu) return
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
        return
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
      const items = getFocusableElements(currentMenu)
      if (items.length === 0) return
      event.preventDefault()
      const active = document.activeElement
      const currentIndex = active instanceof HTMLElement ? items.indexOf(active) : -1
      if (event.key === 'Home') items[0].focus()
      else if (event.key === 'End') items.at(-1)?.focus()
      else if (event.key === 'ArrowDown') items[(currentIndex + 1 + items.length) % items.length].focus()
      else items[(currentIndex - 1 + items.length) % items.length].focus()
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [closeMenu, open])

  return (
    <>
      <div className="project-menu" ref={menuRootRef}>
        <button
          ref={triggerRef}
          type="button"
          className={`menu-trigger ${open ? 'is-active' : ''}`}
          aria-label="Project menu"
          aria-haspopup="menu"
          aria-controls="project-menu-popover"
          aria-expanded={open}
          title="Project menu"
          onClick={() => setOpen((value) => !value)}
        >
          <MoreIcon />
        </button>
        {open && (
          <div
            ref={menuRef}
            id="project-menu-popover"
            className="project-menu-popover"
            role="menu"
            aria-label="Project actions"
          >
            <div className="project-menu-heading" aria-hidden="true">
              <strong>Project</strong>
              <span>Everything stays on this device</span>
            </div>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                inputRef.current?.click()
                closeMenu(true)
              }}
            >
              <UploadIcon />
              <span>Open a file</span>
            </button>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                downloadJson('orthos-scene.json', exportScene())
                showEditorNotice('Saved to orthos-scene.json.')
                closeMenu(true)
              }}
            >
              <DownloadIcon />
              <span>Save to a file</span>
            </button>
            <hr className="project-menu-separator" />
            <button
              role="menuitem"
              type="button"
              className="danger-menu-item"
              onClick={() => {
                closeMenu()
                setResetOpen(true)
              }}
            >
              <ResetIcon />
              <span>Start over</span>
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="application/json,.json"
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) return
            try {
              importScene(await file.text())
              showEditorNotice('Project opened.')
            } catch (error) {
              showEditorNotice(importErrorMessage(error))
            } finally {
              event.target.value = ''
            }
          }}
        />
      </div>

      <Dialog
        open={resetOpen}
        title="Start over?"
        description="The plan goes back to the sample room. Undo still works afterwards."
        onClose={() => setResetOpen(false)}
        actions={
          <>
            <Button data-autofocus onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetScene()
                setResetOpen(false)
                showEditorNotice('Back to the sample room.')
              }}
            >
              Start over
            </Button>
          </>
        }
      />
    </>
  )
}
