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

// Lenis smooth scroll + GSAP ticker integration
// This runs once globally. All ScrollTrigger instances in the app
// will automatically sync with Lenis through this ticker.
const lenis = new Lenis()
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => { lenis.raf(time * 1000) })
gsap.ticker.lagSmoothing(0)

// Expose to window so ScrollToTop can call lenis.scrollTo(0, { immediate: true })
// without needing to pass lenis through React context/props.
;(window as unknown as { __lenis: typeof lenis }).__lenis = lenis

// Refresh all ScrollTrigger pin spacers after web fonts load.
document.fonts.ready.then(() => {
  ScrollTrigger.refresh()
  ;(lenis as unknown as { resize?: () => void }).resize?.()
})

// Debounced resize refresh: GSAP pin spacers are calculated for a specific viewport.
let _resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer)
  _resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh()
    ;(lenis as unknown as { resize?: () => void }).resize?.()
  }, 250)
})

// StrictMode OFF — breaks GSAP ScrollTrigger (double-fires effects)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
