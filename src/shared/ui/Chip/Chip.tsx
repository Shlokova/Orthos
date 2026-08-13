import type { ButtonHTMLAttributes } from 'react'
import './Chip.css'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export function Chip({ active = false, className, type = 'button', ...rest }: ChipProps) {
  const classes = ['ui-chip']
  if (active) classes.push('is-active')
  if (className) classes.push(className)

  return <button type={type} className={classes.join(' ')} {...rest} />
}
