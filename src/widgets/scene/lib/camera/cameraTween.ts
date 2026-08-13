export const CAMERA_FIT_TWEEN_MS = 260

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function tweenScalar(from: number, to: number, durationMs: number, onStep: (value: number) => void): () => void {
  if (durationMs <= 0 || prefersReducedMotion() || Math.abs(to - from) < 1e-6) {
    onStep(to)
    return () => {}
  }

  const start = performance.now()
  let frame = window.requestAnimationFrame(function step(now: number) {
    const progress = Math.min(1, (now - start) / durationMs)
    const eased = 1 - (1 - progress) ** 3
    onStep(from + (to - from) * eased)
    if (progress < 1) frame = window.requestAnimationFrame(step)
  })

  return () => window.cancelAnimationFrame(frame)
}
