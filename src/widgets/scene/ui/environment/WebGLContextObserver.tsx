import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function WebGLContextObserver({ onLost }: { onLost(lost: boolean): void }) {
  const canvas = useThree((state) => state.gl.domElement)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const handleLost = (event: Event) => {
      event.preventDefault()
      onLost(true)
    }
    const handleRestored = () => {
      onLost(false)
      invalidate()
    }
    canvas.addEventListener('webglcontextlost', handleLost)
    canvas.addEventListener('webglcontextrestored', handleRestored)
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [canvas, invalidate, onLost])

  return null
}
