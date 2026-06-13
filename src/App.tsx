import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { ScrollToTop } from './components'

const Home          = lazy(() => import('./pages/Home'))
const Timepieces    = lazy(() => import('./pages/Timepieces'))
const RingBuilder   = lazy(() => import('./pages/RingBuilder'))
const CustomJewelry = lazy(() => import('./pages/CustomJewelry'))

// ── Dynamic page title per route ─────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  '/':               'Gotham City Jewelers — Manhattan Fine Jewelry & Horology',
  '/timepieces':     'Luxury Timepieces — Gotham City Jewelers',
  '/ring-builder':   'Ring Builder — Gotham City Jewelers',
  '/custom-jewelry': 'Custom Jewelry — Gotham City Jewelers',
}

function PageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.title = PAGE_TITLES[pathname] ?? 'Gotham City Jewelers'
  }, [pathname])
  return null
}

// ── Skip navigation link ─────────────────────────────────────────────────────
// Rendered first in DOM so it is the first Tab stop. Visible on :focus.
function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  )
}

// ── 404 ─────────────────────────────────────────────────────────────────────
function NotFound() {
  useEffect(() => { document.title = 'Page Not Found — Gotham City Jewelers' }, [])
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      gap: '28px',
    }}>
      <span aria-hidden="true" style={{
        fontFamily: 'var(--f-display)',
        fontSize: 'clamp(80px,14vw,180px)',
        color: 'rgba(197,164,110,0.08)',
        fontStyle: 'italic',
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: '-0.04em',
        userSelect: 'none',
      }}>
        404
      </span>
      <h1 style={{
        fontFamily: 'var(--f-display)',
        fontSize: 'clamp(22px,3vw,40px)',
        color: 'rgba(237,232,224,0.8)',
        fontStyle: 'italic',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        textAlign: 'center',
      }}>
        Page not found.
      </h1>
      <p style={{
        fontFamily: 'var(--f-body)',
        fontSize: '13px',
        color: 'rgba(237,232,224,0.32)',
        fontWeight: 300,
        letterSpacing: '0.06em',
        textAlign: 'center',
        maxWidth: '320px',
        lineHeight: 1.8,
      }}>
        The piece you're looking for may have moved.
      </p>
      <Link
        to="/"
        className="btn-primary"
        style={{ marginTop: '12px' }}
      >
        Return Home
      </Link>
    </div>
  )
}

function App() {
  return (
    <>
      {/* First focusable element — keyboard users skip nav instantly */}
      <SkipLink />

      {/* Update document.title on every route change */}
      <PageTitle />

      {/* Scroll to top on every route change (uses Lenis immediate scroll) */}
      <ScrollToTop />

      <Suspense fallback={<div style={{ background: '#080808', height: '100vh' }} aria-hidden="true" />}>
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/timepieces"     element={<Timepieces />} />
          <Route path="/ring-builder"   element={<RingBuilder />} />
          <Route path="/custom-jewelry" element={<CustomJewelry />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
