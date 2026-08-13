import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type ButtonVariant = 'default' | 'primary' | 'danger' | 'list'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean
}

export function Button({ variant = 'default', active = false, className, type = 'button', ...rest }: ButtonProps) {
  const classes = ['ui-button']
  if (variant !== 'default') classes.push(`ui-button--${variant}`)
  if (active) classes.push('is-active')
  if (className) classes.push(className)

  return <button type={type} className={classes.join(' ')} {...rest} />
}
