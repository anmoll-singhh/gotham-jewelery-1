/**
 * extract-frames.mjs
 * ──────────────────────────────────────────────────────────────────────────────
 * Extracts high-quality JPEG frames from the scroll-reveal videos that drive the
 * Apple-style canvas scroll animations (WatchCanvas component).
 *
 * WHY CANVAS FRAMES: video.currentTime scrubbing is slow because the browser must
 *      decode compressed video in real time. Canvas drawing pre-decoded images is
 *      instant — this is exactly how Apple.com does the iPhone animations.
 *
 * WHY THESE SETTINGS ("best quality on any device"):
 *      The source videos are only 1280×720. When the canvas paints a 720p frame
 *      full-screen it is upscaled ~2–3.5× at draw time by the browser's runtime
 *      sampler → soft. We instead upscale OFFLINE to 2560px wide with the Lanczos
 *      resampler (sharper than any browser upscale) at near-max JPEG quality, so
 *      the canvas receives a source at/above its backing-store size. 2560px covers
 *      DPR-2 desktops near 1:1 and gives portrait mobile 1440px of vertical detail
 *      (2× the native source). 720p is the true detail ceiling — this maximises
 *      perceived sharpness within it without bloating the blocking preload.
 *
 * WHY A SEPARATE MOBILE SET (the `-mobile` folders):
 *      A phone canvas is tiny (≈360–430 CSS px, capped at DPR-2 by WatchCanvas),
 *      yet the desktop set forces it to decode + draw a 2560×1440 JPEG (~3.7M px,
 *      ~14.7MB decoded) every scroll frame — 193 of those is huge memory pressure
 *      → eviction/re-decode → the reported "blurry & laggy on mobile". So we ALSO
 *      emit a 1440×810 set (~1.17M px, ~4.7MB decoded — ⅓ the cost). In a portrait
 *      cover-crop the vertical detail dominates, and 810px already sits at/above the
 *      720p source ceiling, so this loses no real detail on a phone while slashing
 *      decode/memory/draw cost. Same fps → same 193 frames, so frame indexing is
 *      identical to the desktop set and WatchCanvas can swap paths transparently.
 *
 * INSTALL FFmpeg first (one-time):
 *   Windows:  winget install Gyan.FFmpeg
 *   macOS:    brew install ffmpeg
 *   Linux:    sudo apt install ffmpeg
 *
 * RUN:
 *   node scripts/extract-frames.mjs
 *
 * SCENES (these are the ones actually rendered on the site — keep in sync with the
 * <WatchCanvas framesPath=... totalFrames=... /> props in the pages):
 *   • Home  "Night Reveal"  → public/assets/nyc-reveal-frames  (from gotham-nyc-reveal.mp4)
 *   • Vault "Timepieces"    → public/assets/watch-frames-new   (from gotham-watch-rotation-new.mp4)
 * Each also gets a phone-optimized twin at <dir>-mobile (1440px wide) that
 * WatchCanvas auto-loads on touch/small screens.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { execSync } from 'child_process'
import { mkdirSync, existsSync, readdirSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const ASSETS    = join(ROOT, 'public', 'assets')

// ── Config ────────────────────────────────────────────────────────────────
const FPS   = 24         // must match the source video fps so frame count == nb_frames
const FLAGS = 'lanczos'  // sharpest offline resampler (beats any browser runtime upscale)

// Two render targets per scene, SAME fps → SAME 193 frames → identical indexing.
// The `-mobile` twin is what WatchCanvas loads on phones/touch (see component).
const VARIANTS = [
  { suffix: '',        width: 2560, quality: 3 }, // desktop/tablet — q3 @ 2560px ≈ 160KB/frame
  { suffix: '-mobile', width: 1440, quality: 4 }, // phones        — q4 @ 1440px ≈  55KB/frame
]

// Each scene: source video → output frame dir base. `framesPath`/`totalFrames` on
// the matching <WatchCanvas> must equal these (dir name + extracted frame count).
const SCENES = [
  { name: 'Night Reveal (Home)',  src: 'gotham-nyc-reveal.mp4',          out: 'nyc-reveal-frames' },
  { name: 'Vault (Timepieces)',   src: 'gotham-watch-rotation-new.mp4',  out: 'watch-frames-new' },
]
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🎬  GCJ Scroll-Frame Extractor  (2560px desktop + 1440px mobile · Lanczos)')
console.log('──────────────────────────────────────────────────────')

// Check FFmpeg is available
try {
  execSync('ffmpeg -version', { stdio: 'pipe' })
  console.log('✅  FFmpeg found')
} catch {
  console.error('\n❌  FFmpeg not found. Install it first:')
  console.error('    Windows: winget install Gyan.FFmpeg')
  console.error('    macOS:   brew install ffmpeg')
  console.error('    Linux:   sudo apt install ffmpeg\n')
  process.exit(1)
}

let hadError = false

for (const scene of SCENES) {
  const videoSrc = join(ASSETS, scene.src)

  console.log(`\n▶  ${scene.name}`)
  console.log(`   src: assets/${scene.src}`)

  if (!existsSync(videoSrc)) {
    console.error(`   ❌  Source video not found: ${videoSrc} — skipping`)
    hadError = true
    continue
  }

  for (const variant of VARIANTS) {
    const outName   = `${scene.out}${variant.suffix}`
    const framesDir = join(ASSETS, outName)
    const tag       = variant.suffix ? 'mobile' : 'desktop'

    // Clean the output dir so a shorter re-extract can't leave stale trailing frames
    if (existsSync(framesDir)) {
      rmSync(framesDir, { recursive: true, force: true })
    }
    mkdirSync(framesDir, { recursive: true })

    const cmd = [
      'ffmpeg',
      '-y',
      `-i "${videoSrc}"`,
      `-vf "fps=${FPS},scale=${variant.width}:-2:flags=${FLAGS}"`,
      `-q:v ${variant.quality}`,
      `"${join(framesDir, 'frame%04d.jpg')}"`,
    ].join(' ')

    try {
      execSync(cmd, { stdio: 'pipe' })
    } catch (e) {
      console.error(`   ❌  FFmpeg extraction failed for ${scene.name} (${tag})`)
      hadError = true
      continue
    }

    const count = readdirSync(framesDir).filter(f => f.endsWith('.jpg')).length
    console.log(`   ✅  ${tag.padEnd(7)} ${variant.width}px → ${count} frames → assets/${outName}/`)
  }

  console.log(`   → <WatchCanvas totalFrames={193} framesPath="/assets/${scene.out}" />  (mobile twin auto-loaded)`)
}

console.log('')
if (hadError) {
  console.error('⚠️   Completed with errors — see above.\n')
  process.exit(1)
}
console.log('🚀  All scenes extracted. Run  npm run dev  and scroll through the reveal scenes!\n')
