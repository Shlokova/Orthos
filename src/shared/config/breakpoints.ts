const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

export const MEDIA_QUERIES = {
  mobileDown: `(max-width: ${BREAKPOINTS.mobile}px)`,
  tabletDown: `(max-width: ${BREAKPOINTS.tablet}px)`,
  desktopDown: `(max-width: ${BREAKPOINTS.desktop}px)`,
  wideDown: `(max-width: ${BREAKPOINTS.wide - 1}px)`,
} as const
