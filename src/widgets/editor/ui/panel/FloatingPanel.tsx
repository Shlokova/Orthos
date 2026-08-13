import { MEDIA_QUERIES } from '@shared/config/breakpoints'
import { useMediaQuery } from '@shared/lib/react'
import { useDialogPanel } from '@shared/ui'
import { CloseIcon } from '@shared/ui/icons'
import type { PropsWithChildren, ReactNode } from 'react'
import './FloatingPanel.css'

type FloatingPanelVariant = 'room-editor' | 'catalog' | 'object-inspector'

interface FloatingPanelProps extends PropsWithChildren {
  id: string
  titleId: string
  variant: FloatingPanelVariant
  eyebrow: ReactNode
  title: ReactNode
  closeLabel: string
  headerClassName?: string
  isExiting?: boolean
  onRequestClose(): void
}

export function FloatingPanel({
  id,
  titleId,
  variant,
  eyebrow,
  title,
  closeLabel,
  headerClassName,
  isExiting = false,
  onRequestClose,
  children,
}: FloatingPanelProps) {
  const isSheet = useMediaQuery(MEDIA_QUERIES.tabletDown)
  const panelRef = useDialogPanel<HTMLElement>(onRequestClose, { modal: isSheet })

  return (
    <aside
      ref={panelRef}
      id={id}
      className={`floating-panel ${variant}-panel`}
      data-state={isExiting ? 'exiting' : 'open'}
      aria-labelledby={titleId}
      tabIndex={-1}
      {...(isSheet ? { role: 'dialog', 'aria-modal': true } : {})}
    >
      <header className={headerClassName ? `floating-panel-header ${headerClassName}` : 'floating-panel-header'}>
        <div>
          <span>{eyebrow}</span>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button type="button" className="panel-close" onClick={onRequestClose} aria-label={closeLabel}>
          <CloseIcon />
        </button>
      </header>
      {children}
    </aside>
  )
}
