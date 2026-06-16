import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface SpotlightProps {
  /** Radial spotlight radius in px. Default: 560 */
  radius?: number
  /** Gold tint opacity at the center. Default: 0.08 */
  intensity?: number
  style?: React.CSSProperties
  className?: string
}

/**
 * Mouse-tracked gold spotlight that follows cursor with spring physics.
 * Position it absolutely inside the section you want to illuminate.
 * Automatically hides on touch devices via CSS media query.
 */
export function Spotlight({ radius = 560, intensity = 0.08, style, className }: SpotlightProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 80, damping: 20 })
  const springY = useSpring(rawY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const parent = overlay.parentElement
    if (!parent) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      rawX.set(e.clientX - rect.left)
      rawY.set(e.clientY - rect.top)
    }

    const onMouseLeave = () => {
      // Gently drift back to center
      rawX.set(parent.offsetWidth / 2)
      rawY.set(parent.offsetHeight / 2)
    }

    parent.addEventListener('mousemove', onMouseMove)
    parent.addEventListener('mouseleave', onMouseLeave)

    // Init to center
    rawX.set(parent.offsetWidth / 2)
    rawY.set(parent.offsetHeight / 2)

    return () => {
      parent.removeEventListener('mousemove', onMouseMove)
      parent.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [rawX, rawY])

  useEffect(() => {
    const update = () => {
      if (!overlayRef.current) return
      const x = springX.get()
      const y = springY.get()
      overlayRef.current.style.background =
        `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(201,168,76,${intensity}) 0%, transparent 70%)`
    }

    const unsubX = springX.on('change', update)
    const unsubY = springY.on('change', update)
    return () => { unsubX(); unsubY() }
  }, [springX, springY, radius, intensity])

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 3,
        background: 'transparent',
        /* hidden on touch devices */
        ...style,
      }}
    />
  )
}
