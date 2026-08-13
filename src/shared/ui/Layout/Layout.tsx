import type { PropsWithChildren } from 'react'
import './Layout.css'

interface LayoutProps extends PropsWithChildren {
  className?: string
}

export function Actions({ className, children }: LayoutProps) {
  return <div className={className ? `ui-actions ${className}` : 'ui-actions'}>{children}</div>
}

export function Stack({ className, children }: LayoutProps) {
  return <div className={className ? `ui-stack ${className}` : 'ui-stack'}>{children}</div>
}
