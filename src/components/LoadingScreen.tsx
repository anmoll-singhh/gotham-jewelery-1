/**
 * LoadingScreen — Cinematic bat SVG drawing → split reveal for Gotham City Jewelers.
 *
 * Sequence:
 *  1. Black screen — gold hairlines draw across top and bottom
 *  2. Bat outline traces itself (pathLength 0→1) over 2.8s with glow
 *  3. "GOTHAM CITY JEWELERS" logo fades in at 70% draw completion
 *  4. 500ms hold at complete state — bat fill materialises
 *  5. Left panel flies x→-100%, right panel flies x→+100%, 0.92s expo ease
 *  6. onDone() fires — home page takes over
 *
 * Two-panel split geometry:
 *  Each panel is 50vw wide, overflow:hidden.
 *  Each panel contains a full 100vw inner div anchored to its edge.
 *  The bat SVG is centered in the 100vw inner — its geometric center (x=250 of 500)
 *  lands at exactly 50vw (the screen seam between panels).
 *  Left panel clips x=0–50vw; right clips x=50vw–100vw.
 *  When panels fly apart the bat "wings" split open, revealing the site.
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface LoadingScreenProps { onDone: () => void }

// ─── Bat SVG — viewBox 0 0 500 185, center x=250 ─────────────────────────────
//
// Shape breakdown:
//  - Bottom center: (250, 172)
//  - Wings sweep left to (12, 78) and right to (488, 78)
//  - Left shoulder at (120, 52), right at (380, 52)
//  - Left ear tip at (183, 4), right at (317, 4)   ← highest points
//  - Center notch between ears at (250, 34)         ← V-dip between ears
//  - Fully symmetric around x=250
//
const BAT_D =
  'M 250 172 ' +
  'C 228 157, 188 132, 150 105 ' +     // left inner wing
  'C 114 80, 62 58, 12 78 ' +          // left outer wing → tip
  'C 46 65, 92 56, 120 52 ' +          // tip → left shoulder
  'C 138 52, 168 8, 183 4 ' +          // shoulder → left ear tip
  'C 196 22, 216 42, 232 50 ' +        // ear down toward center
  'C 242 48, 246 38, 250 34 ' +        // → center notch
  'C 254 38, 258 48, 268 50 ' +        // center notch →
  'C 284 42, 304 22, 317 4 ' +         // → right ear tip
  'C 332 8, 362 52, 380 52 ' +         // right ear → shoulder
  'C 408 56, 454 65, 488 78 ' +        // shoulder → right wing tip
  'C 438 58, 386 80, 350 105 ' +       // tip → right inner wing
  'C 312 132, 272 157, 250 172 Z'      // back to bottom center

const EASE_DRAW: [number, number, number, number] = [0.42, 0, 0.58, 1]
const EASE_SPLIT: [number, number, number, number] = [0.76, 0, 0.24, 1]

const DRAW_MS = 2800   // bat trace duration
const PAUSE_MS = 500    // hold at complete
const SPLIT_MS = 920    // split animation duration

type Phase = 'drawing' | 'complete' | 'splitting' | 'gone'

// ─── BatSVG ───────────────────────────────────────────────────────────────────
function BatSVG({ phase }: { phase: Phase }) {
  const done = phase !== 'drawing'
  return (
    <svg
      viewBox="0 0 500 185"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: 'clamp(260px, 36vw, 500px)',
        height: 'auto',
        overflow: 'visible',
        display: 'block',
        filter: done
          ? 'drop-shadow(0 0 32px rgba(197,164,110,0.75)) drop-shadow(0 0 70px rgba(197,164,110,0.30))'
          : 'drop-shadow(0 0 12px rgba(197,164,110,0.45))',
        transition: 'filter 0.7s ease',
      }}
    >
      {/* Wide amber halo — drawn slightly behind core stroke */}
      <motion.path
        d={BAT_D} fill="none"
        stroke="rgba(197,164,110,0.18)" strokeWidth={11}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DRAW_MS / 1000, ease: EASE_DRAW, delay: 0.08 }}
      />
      {/* Core stroke — crisp gold line */}
      <motion.path
        d={BAT_D} fill="none"
        stroke="#C5A46E" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DRAW_MS / 1000, ease: EASE_DRAW }}
      />
      {/* Gold fill — materialises when drawing completes */}
      <motion.path
        d={BAT_D}
        fill="rgba(197,164,110,0.09)"
        stroke="none"
        initial={{ opacity: 0 }}
        animate={{ opacity: done ? 1 : 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ phase }: { phase: Phase }) {
  const [pct, setPct] = useState(0)
  const rafRef = useRef<number>(0)
  const t0Ref = useRef<number>(0)

  useEffect(() => {
    if (phase === 'splitting' || phase === 'gone') {
      const raf = requestAnimationFrame(() => setPct(100));
      return () => cancelAnimationFrame(raf);
    }
    t0Ref.current = performance.now()
    const total = DRAW_MS + PAUSE_MS
    const tick = (now: number) => {
      const raw = Math.min((now - t0Ref.current) / total, 1)
      const eased = 1 - Math.pow(1 - raw, 3)
      setPct(Math.round(eased * 100))
      if (raw < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: phase === 'splitting' || phase === 'gone' ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute',
        bottom: 'clamp(26px, 5.5vh, 50px)',
        left: 'var(--gutter)', right: 'var(--gutter)',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'rgba(197,164,110,0.07)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          background: 'linear-gradient(90deg, rgba(197,164,110,.18), var(--c-accent))',
          transition: 'width 0.06s linear',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--f-label)', fontSize: '9px', letterSpacing: '0.06em',
        color: 'rgba(197,164,110,0.26)', minWidth: '26px', textAlign: 'right',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {pct}
      </span>
    </motion.div>
  )
}

// ─── PanelInner ───────────────────────────────────────────────────────────────
// Full 100vw inner rendered identically in both panels; panel's overflow:hidden
// clips it to its respective half of the screen.
function PanelInner({ phase, side }: { phase: Phase; side: 'left' | 'right' }) {
  const showBranding = phase === 'complete' || phase === 'splitting'

  return (
    <div style={{
      position: 'absolute', top: 0, height: '100vh', width: '100vw',
      [side === 'left' ? 'left' : 'right']: 0,
      background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '28px', overflow: 'hidden',
    }}>
      {/* Grain */}
      <div className="ls-grain" />

      {/* Top gold hairline — draws L→R */}
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        style={{
          position: 'absolute', top: '11%', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(197,164,110,.12) 15%, rgba(197,164,110,.52) 50%, rgba(197,164,110,.12) 85%, transparent)',
          transformOrigin: 'left',
        }}
      />
      {/* Bottom gold hairline — draws R→L */}
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
        style={{
          position: 'absolute', bottom: '11%', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(197,164,110,.12) 15%, rgba(197,164,110,.52) 50%, rgba(197,164,110,.12) 85%, transparent)',
          transformOrigin: 'right',
        }}
      />

      {/* Bat drawing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <BatSVG phase={phase} />
      </motion.div>

      {/* Gotham branding — fades in as bat completes */}
      <motion.div
        animate={{ opacity: showBranding ? 1 : 0, y: showBranding ? 0 : 14 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '11px', position: 'relative', zIndex: 2,
        }}
      >
        <img
          src="/assets/gotham-logo.webp" alt="Gotham City Jewelers"
          style={{ height: 'clamp(22px, 2.6vw, 38px)', width: 'auto', filter: 'invert(1) brightness(0.86)', opacity: 0.8 }}
          onError={e => {
            const el = e.currentTarget as HTMLImageElement;
            if (el.src.includes('.webp')) { el.src = el.src.replace('.webp', '.png'); return; }
            el.style.display = 'none';
          }}
        />
        <p style={{
          fontFamily: 'var(--f-label)', fontSize: '8px', letterSpacing: '0.44em',
          textTransform: 'uppercase', color: 'rgba(197,164,110,0.34)',
        }}>
          Manhattan · Fine Jewelry &amp; Horology
        </p>
      </motion.div>

      <ProgressBar phase={phase} />
    </div>
  )
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [phase, setPhase] = useState<Phase>('drawing')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('complete'), DRAW_MS)
    const t2 = setTimeout(() => setPhase('splitting'), DRAW_MS + PAUSE_MS)
    const t3 = setTimeout(() => {
      setPhase('gone')
      onDone()
    }, DRAW_MS + PAUSE_MS + SPLIT_MS + 60)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  if (phase === 'gone') return null

  const splitting = phase === 'splitting'

  return (
    <>
      {/* LEFT WING */}
      <motion.div
        animate={{ x: splitting ? '-100%' : '0%' }}
        transition={{ duration: SPLIT_MS / 1000, ease: EASE_SPLIT }}
        style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: '50%', overflow: 'hidden', zIndex: 9999 }}
      >
        <PanelInner phase={phase} side="left" />
      </motion.div>

      {/* RIGHT WING */}
      <motion.div
        animate={{ x: splitting ? '100%' : '0%' }}
        transition={{ duration: SPLIT_MS / 1000, ease: EASE_SPLIT }}
        style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: '50%', overflow: 'hidden', zIndex: 9999 }}
      >
        <PanelInner phase={phase} side="right" />
      </motion.div>

      {/* Vertical gold seam at split center */}
      <motion.div
        animate={{ opacity: splitting ? 0 : 1, scaleY: splitting ? 0.25 : 1 }}
        transition={{ duration: 0.18, ease: 'easeIn' }}
        style={{
          position: 'fixed', top: '9%', bottom: '9%', left: '50%',
          width: '1px', transform: 'translateX(-0.5px)',
          background: 'linear-gradient(to bottom, transparent, rgba(197,164,110,0.58) 20%, rgba(197,164,110,0.58) 80%, transparent)',
          zIndex: 10000, pointerEvents: 'none', transformOrigin: 'center',
        }}
      />
    </>
  )
}
