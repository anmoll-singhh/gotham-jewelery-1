import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis | null }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
    // Recalculate pin spacers from position 0 after the page change.
    ScrollTrigger.refresh()
  }, [pathname])

  return null
}
