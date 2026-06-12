/**
 * Pic — WebP image with automatic browser fallback.
 *
 * Priority chain (browser picks first supported option):
 *  1. .webp  — Chrome 32+, Firefox 65+, Safari 14+, Edge 18+
 *  2. .jpg   — auto-derived by replacing .webp extension
 *  3. .png   — if .jpg also 404s, onError cascades to .png
 *  4. fb     — explicit fallback src overrides the .jpg/.png cascade
 *
 * Usage:
 *   <Pic src="/assets/photo.webp" alt="…" style={…} />
 *   <Pic src="/assets/logo.webp" fb="/assets/logo.png" alt="…" />  ← explicit override
 *
 * display:contents on <picture> makes it invisible to the layout engine —
 * the inner <img> is positioned/sized exactly as if there were no wrapper.
 */

import { forwardRef } from 'react'
import type { ImgHTMLAttributes, SyntheticEvent } from 'react'

export interface PicProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  /** Explicit fallback src. If omitted: tries .jpg, then .png automatically. */
  fb?: string
}

export const Pic = forwardRef<HTMLImageElement, PicProps>(
  function Pic({ src, fb, onError: externalOnError, ...imgProps }, ref) {
    if (!src.endsWith('.webp')) {
      return <img ref={ref} src={src} onError={externalOnError} {...imgProps} />
    }

    const jpgFallback = fb ?? src.replace(/\.webp$/, '.jpg')

    const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget
      // Step 1: if we just failed on .jpg, try .png
      if (!fb && el.src.endsWith('.jpg')) {
        el.src = el.src.replace(/\.jpg$/, '.png')
        return
      }
      // Step 2: propagate to any caller-supplied onError
      externalOnError?.(e)
    }

    return (
      <picture style={{ display: 'contents' }}>
        <source srcSet={src} type="image/webp" />
        <img ref={ref} src={jpgFallback} onError={handleError} {...imgProps} />
      </picture>
    )
  }
)
