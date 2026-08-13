import type { HTMLAttributes, PropsWithChildren } from 'react'
import './Note.css'

type NoteTone = 'neutral' | 'danger' | 'success'

interface NoteProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  tone?: NoteTone
}

export function Note({ tone = 'neutral', className, children, ...rest }: NoteProps) {
  const classes = ['ui-note']
  if (tone !== 'neutral') classes.push(`ui-note--${tone}`)
  if (className) classes.push(className)

  return (
    <div className={classes.join(' ')} {...rest}>
      {children}
    </div>
  )
}
