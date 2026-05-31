import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
// NOTE: lenis v1.x has no CSS file to import — no 'lenis/dist/lenis.css' needed

gsap.registerPlugin(ScrollTrigger)

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
// Cormorant Garamond + Jost both load async from Google Fonts CDN.
// If fonts load AFTER ScrollTrigger.refresh() (triggered by the loader exit),
// the computed text heights are wrong → pin spacers are wrong → sections overlap.
document.fonts.ready.then(() => {
  ScrollTrigger.refresh()
})

// Debounced resize refresh: GSAP pin spacers are calculated for a specific viewport.
// Resizing (DevTools, orientation change, window snap) leaves stale spacers →
// sections overlap or content appears at wrong scroll positions.
let _resizeTimer: ReturnType<typeof setTimeout>
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer)
  _resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh()
    ;(lenis as unknown as { resize?: () => void }).resize?.()
  }, 200)
})

// StrictMode OFF — breaks GSAP ScrollTrigger (double-fires effects)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
