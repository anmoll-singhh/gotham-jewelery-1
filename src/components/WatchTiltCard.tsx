/**
 * WatchTiltCard — Framer Motion 3D tilt card for luxury watch showcase.
 *
 * Features:
 *  - Mouse-tracking 3D perspective tilt (spring physics)
 *  - Moving spotlight that follows the cursor (like an actual studio light)
 *  - Scale on hover
 *  - "Price on Request" text reveals on hover
 */

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface WatchTiltCardProps {
  img:    string
  name:   string
  ref_:   string
  brand:  string
  delay?: number
}

export function WatchTiltCard({ img, name, ref_, brand, delay = 0 }: WatchTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const spring = { stiffness: 220, damping: 20 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]),  spring)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  spring)
  const glowX   = useTransform(mouseX, [-0.5, 0.5], [20, 80])
  const glowY   = useTransform(mouseY, [-0.5, 0.5], [20, 80])

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5)
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5)
  }
  const handleLeave = () => { mouseX.set(0); mouseY.set(0) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: '100%', height: '100%' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        whileHover={{ scale: 1.02 }}
        className="watch-tilt-card-wrap"
        style={{
          rotateX,
          rotateY,
          transformStyle:  'preserve-3d',
          perspective:      1000,
          position:        'relative',
          overflow:        'hidden',
          width:           '100%',
          height:          '100%',
          cursor:          'pointer',
        }}
        transition={{ scale: { type: 'spring', stiffness: 300, damping: 25 } }}
      >
        {/* Watch image */}
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="watch-tilt-card-img"
          style={{
            width:      '100%',
            height:     '100%',
            objectFit: 'cover',
            filter:     'brightness(0.52) saturate(0.82)',
            display:   'block',
            transition: 'filter 0.4s ease',
          }}
        />

        {/* Base gradient */}
        <div style={{
          position:   'absolute',
          inset:       0,
          background:  'linear-gradient(to top, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.06) 50%)',
        }} />

        {/* Mouse-tracking spotlight */}
        <motion.div
          style={{
            position:     'absolute',
            inset:         0,
            background:    `radial-gradient(circle 180px at ${glowX}% ${glowY}%, rgba(197,164,110,0.13) 0%, transparent 60%)`,
            opacity:        0,
            transition:    'opacity 0.25s',
          }}
          whileHover={{ opacity: 1 }}
        />

        {/* Gold border on hover */}
        <motion.div
          style={{
            position:    'absolute',
            inset:        0,
            border:      '1px solid transparent',
            transition:  'border-color 0.3s',
          }}
          whileHover={{ borderColor: 'rgba(197,164,110,0.4)' }}
        />

        {/* "Price on Request" pill — slides up on hover */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position:       'absolute',
            top:            '16px',
            right:          '16px',
            background:     'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border:         '1px solid rgba(197,164,110,0.3)',
            padding:        '6px 14px',
          }}
        >
          <span style={{
            fontFamily:    'var(--f-body)',
            fontSize:      '9px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color:         'var(--c-accent)',
          }}>
            Price on Request
          </span>
        </motion.div>

        {/* Info */}
        <div style={{
          position:      'absolute',
          bottom:        '22px',
          left:          '22px',
          right:         '22px',
          transformStyle: 'preserve-3d',
        }}>
          <span style={{
            fontFamily:    'var(--f-body)',
            fontSize:      '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color:         'var(--c-accent)',
            display:       'block',
            marginBottom:  '6px',
          }}>
            {brand}
          </span>
          <p style={{
            fontFamily:  'var(--f-display)',
            fontSize:    'clamp(15px, 1.4vw, 18px)',
            color:       'var(--c-white)',
            fontStyle:   'italic',
            fontWeight:   400,
            marginBottom: '4px',
            lineHeight:   1.2,
          }}>
            {name}
          </p>
          <p style={{
            fontFamily:    'var(--f-body)',
            fontSize:      '10px',
            letterSpacing: '0.12em',
            color:         'var(--c-muted)',
          }}>
            Ref. {ref_}
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
