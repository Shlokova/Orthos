export function shallowEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!isRecord(left) || !isRecord(right)) return false

  const leftKeys = Object.keys(left)
  if (leftKeys.length !== Object.keys(right).length) return false
  return leftKeys.every((key) => Object.is(left[key], right[key]))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
