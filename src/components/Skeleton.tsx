/**
 * Skeleton — layout-matched shimmer loaders.
 * Hardware-accelerated: uses transform/opacity only, never top/left.
 */
import React from 'react'

const shimmer: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(255,255,255,0.04)',
}

const shimmerAfter = `
@keyframes sk-sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.sk-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(197,164,110,0.07) 50%,
    transparent 100%
  );
  animation: sk-sweep 1.6s ease-in-out infinite;
}
`

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('sk-style')) {
  const s = document.createElement('style')
  s.id = 'sk-style'
  s.textContent = shimmerAfter
  document.head.appendChild(s)
}

export function HeroSkeleton() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: '#080808',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      padding: 'clamp(64px,8vw,108px) clamp(24px,5vw,80px)',
    }}>
      {/* label bar */}
      <div className="sk-shimmer" style={{ ...shimmer, width: '180px', height: '10px', borderRadius: '2px', marginBottom: '28px' }} />
      {/* headline line 1 */}
      <div className="sk-shimmer" style={{ ...shimmer, width: '70%', height: 'clamp(40px,6vw,84px)', borderRadius: '2px', marginBottom: '14px' }} />
      {/* headline line 2 */}
      <div className="sk-shimmer" style={{ ...shimmer, width: '52%', height: 'clamp(40px,6vw,84px)', borderRadius: '2px', marginBottom: '52px' }} />
      {/* buttons row */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="sk-shimmer" style={{ ...shimmer, width: '160px', height: '46px', borderRadius: '2px' }} />
        <div className="sk-shimmer" style={{ ...shimmer, width: '140px', height: '46px', borderRadius: '2px', opacity: 0.5 }} />
      </div>
    </div>
  )
}
