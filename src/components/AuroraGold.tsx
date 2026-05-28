/**
 * AuroraGold — Framer Motion aurora background in the brand's gold/amber palette.
 * Use as a section wrapper — content sits above the aurora layer (z-index: 1).
 *
 * Colors are tuned to Gotham City Jewelers:
 *  gold  #C5A46E  →  warm copper bloom
 *  amber #B8924A  →  deep amber drift
 *  light #D4B87A  →  pale gold shimmer
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuroraGoldProps {
  children: ReactNode
  /** Override background color (default: var(--c-void)) */
  bg?: string
  /** Scale the aurora intensity (0–1). Lower = more subtle. Default: 1 */
  intensity?: number
  style?: React.CSSProperties
  className?: string
}

export function AuroraGold({ children, bg, intensity = 1, style, className }: AuroraGoldProps) {
  const op = intensity

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: bg ?? 'var(--c-void)',
        ...style,
      }}
    >
      {/* ── Aurora blobs ─────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      >
        {/* Blob 1 — top-left warm gold */}
        <motion.div
          style={{
            position:     'absolute',
            top:          '-30%',
            left:         '-15%',
            width:        '65%',
            height:       '65%',
            borderRadius: '50%',
            background:   `radial-gradient(circle, rgba(197,164,110,${0.14 * op}) 0%, transparent 68%)`,
            filter:       'blur(72px)',
            willChange:   'transform',
          }}
          animate={{ x: [-30, 60, -30], y: [-20, 50, -20] }}
          transition={{ duration: 28, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* Blob 2 — bottom-right deep amber */}
        <motion.div
          style={{
            position:     'absolute',
            bottom:       '-25%',
            right:        '-20%',
            width:        '55%',
            height:       '55%',
            borderRadius: '50%',
            background:   `radial-gradient(circle, rgba(184,146,74,${0.11 * op}) 0%, transparent 68%)`,
            filter:       'blur(90px)',
            willChange:   'transform',
          }}
          animate={{ x: [50, -60, 50], y: [30, -40, 30] }}
          transition={{ duration: 36, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* Blob 3 — center shimmer */}
        <motion.div
          style={{
            position:     'absolute',
            top:          '35%',
            left:         '38%',
            width:        '38%',
            height:       '38%',
            borderRadius: '50%',
            background:   `radial-gradient(circle, rgba(212,184,122,${0.07 * op}) 0%, transparent 68%)`,
            filter:       'blur(110px)',
            willChange:   'transform',
          }}
          animate={{ x: [20, -35, 20], y: [-35, 35, -35], scale: [1, 1.25, 1] }}
          transition={{ duration: 44, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />

        {/* Subtle horizontal streak */}
        <motion.div
          style={{
            position:   'absolute',
            top:        '50%',
            left:       '-10%',
            width:      '120%',
            height:     '1px',
            background: `linear-gradient(to right, transparent 0%, rgba(197,164,110,${0.06 * op}) 30%, rgba(197,164,110,${0.1 * op}) 50%, rgba(197,164,110,${0.06 * op}) 70%, transparent 100%)`,
            filter:     'blur(8px)',
          }}
          animate={{ y: [-80, 80, -80], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
