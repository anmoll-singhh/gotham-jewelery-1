import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type Lenis from 'lenis'

/**
 * Scrolls to the top of the page on every route change.
 * Uses Lenis's immediate scrollTo when available so the smooth-scroll
 * engine doesn't animate an unwanted scroll from the previous position.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [pathname])

  return null
}
