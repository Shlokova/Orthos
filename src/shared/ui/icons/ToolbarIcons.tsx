import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function PerspectiveIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </IconBase>
  )
}

export function TopViewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h8v8H8z" />
    </IconBase>
  )
}

export function ClearanceIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 18h16M4 6h16M7 9v6M12 9v6M17 9v6" />
      <path d="m5 12 2-2 2 2-2 2zM10 12l2-2 2 2-2 2zM15 12l2-2 2 2-2 2z" />
    </IconBase>
  )
}

export function DimensionsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 8v8M21 8v8M3 12h18" />
      <path d="m6 9-3 3 3 3M18 9l3 3-3 3" />
    </IconBase>
  )
}

export function WallNoneIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 18V7h14v11" opacity=".35" />
      <path d="m4 4 16 16" />
    </IconBase>
  )
}

export function WallCutawayIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 18V7h14v11M5 7h7" />
      <path d="M12 7v5h7" opacity=".45" />
    </IconBase>
  )
}

export function WallAllIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 18V7h14v11z" />
      <path d="M9 7v11M15 7v11" opacity=".45" />
    </IconBase>
  )
}

export function UndoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h8a6 6 0 0 1 6 6" />
    </IconBase>
  )
}

export function RedoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 7 4 4-4 4" />
      <path d="M19 11h-8a6 6 0 0 0-6 6" />
    </IconBase>
  )
}

export function MoreIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v12M8 11l4 4 4-4M5 20h14" />
    </IconBase>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4M8 8l4-4 4 4M5 20h14" />
    </IconBase>
  )
}

export function ResetIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4v6h6" />
      <path d="M5.5 15a7 7 0 1 0 .8-8.2L4 10" />
    </IconBase>
  )
}

export function BuildIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 19V8l7-4 7 4v11" />
      <path d="M4 19h16M9 19v-6h6v6" />
    </IconBase>
  )
}

export function ObjectsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12 8 4.5 8-4.5M4 16.5 12 21l8-4.5" />
    </IconBase>
  )
}

export function DrawRoomIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 18V6h10" />
      <path d="M15 6v8h4" />
      <circle cx="5" cy="18" r="1.5" />
      <circle cx="5" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="15" cy="14" r="1.5" />
      <circle cx="19" cy="14" r="1.5" />
    </IconBase>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconBase>
  )
}

export function CursorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 4 11 8-5 1.2 2 5.8-2.5 1-2.1-5.7L6 18z" />
    </IconBase>
  )
}

export function OrbitIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="12" rx="8" ry="4.5" />
      <path d="M7 5.5c1.6-1.1 3.3-1.7 5-1.7 4.4 0 8 3.7 8 8.2M17 18.5c-1.6 1.1-3.3 1.7-5 1.7-4.4 0-8-3.7-8-8.2" />
      <path d="m18 9.5 2 2.5 2-2.5M6 14.5 4 12l-2 2.5" />
    </IconBase>
  )
}

export function HandIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 12V6a1 1 0 0 1 2 0v5" />
      <path d="M10 11V5.5a1 1 0 0 1 2 0V11" />
      <path d="M12 11V6.2a1 1 0 1 1 2 0V12" />
      <path d="M14 11.5V8.4a1 1 0 1 1 2 0v5.1c0 3.3-2.5 5.5-5.5 5.5-2 0-3.6-.8-4.7-2.4L4.6 15A1 1 0 0 1 6 13.6L8 15" />
    </IconBase>
  )
}

export function MoveIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18M3 12h18" />
      <path d="m12 3 2.5 2.5M12 3 9.5 5.5M12 21l2.5-2.5M12 21l-2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5" />
    </IconBase>
  )
}

export function CornerEditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" />
      <path d="M10 7.5h4M7.5 10v4M16.5 10v4M10 16.5h4" />
    </IconBase>
  )
}

export function RotateLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4v6h6" />
      <path d="M5.5 15a7 7 0 1 0 .8-8.2L4 10" />
    </IconBase>
  )
}

export function RotateRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 4v6h-6" />
      <path d="M18.5 15a7 7 0 1 1-.8-8.2L20 10" />
    </IconBase>
  )
}

export function FitIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 4H4v4M16 4h4v4M8 20H4v-4M20 16v4h-4" />
      <path d="M9 9 4 4M15 9l5-5M9 15l-5 5M15 15l5 5" />
    </IconBase>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
    </IconBase>
  )
}
