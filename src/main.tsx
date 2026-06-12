import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
// NOTE: lenis v1.x has no CSS file to import — no 'lenis/dist/lenis.css' needed

gsap.registerPlugin(ScrollTrigger)

// Safari / iOS Safari scroll-restoration fix:
// without this, Safari reloads to a saved scroll offset → wrong pin positions.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

// Prevent extraneous refresh events that can break iOS pins.
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,orientationchange',
})

// Lenis smooth scroll — desktop only.
// pointer:coarse = touch screen is the primary input (phone/tablet).
// On those devices Lenis intercepts touchmove events but can't drive native
// scroll, completely blocking scrolling. Skip Lenis; use native + passive listener.
const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches

type LenisInstance = InstanceType<typeof Lenis>
let lenis: LenisInstance | null = null

if (!isTouchPrimary) {
  lenis = new Lenis()
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => { lenis!.raf(time * 1000) })
  gsap.ticker.lagSmoothing(0)
} else {
  // Touch devices: native scroll drives ScrollTrigger via passive listener.
  window.addEventListener('scroll', ScrollTrigger.update, { passive: true })
}

// Expose to window so ScrollToTop can call lenis.scrollTo(0) without prop-drilling.
;(window as unknown as { __lenis: LenisInstance | null }).__lenis = lenis

// Refresh all ScrollTrigger pin spacers after web fonts load.
document.fonts.ready.then(() => {
  ScrollTrigger.refresh()
  if (lenis) (lenis as unknown as { resize?: () => void }).resize?.()
})

// Debounced resize refresh: GSAP pin spacers are calculated for a specific viewport.
let _resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer)
  _resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh()
    if (lenis) (lenis as unknown as { resize?: () => void }).resize?.()
  }, 250)
})

// StrictMode OFF — breaks GSAP ScrollTrigger (double-fires effects)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
