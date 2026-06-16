import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticBtnProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  /** Target element (spring physics). Default: 'a' if href provided, 'button' otherwise */
}

/**
 * Framer Motion magnetic button. Used on ALL primary CTAs per the design constitution.
 * Spring: stiffness 150, damping 15 — do not change these values.
 */
export function MagneticBtn({ children, href, onClick, className }: MagneticBtnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      <motion.div
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97, y: 2 }}
      >
        {href ? (
          <a href={href} className={className}>
            {children}
          </a>
        ) : (
          <button onClick={onClick} className={className}>
            {children}
          </button>
        )}
      </motion.div>
    </div>
  )
}
