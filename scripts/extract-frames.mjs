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
const FPS     = 24     // must match the source video fps so frame count == nb_frames
const WIDTH   = 2560   // Lanczos-upscaled from 720p → sharp on DPR-2 desktop + portrait mobile
const QUALITY = 3      // JPEG quality 1–31 (lower = better). q3 @ 2560px ≈ 160KB/frame
const FLAGS   = 'lanczos'

// Each scene: source video → output frame dir. `framesPath`/`totalFrames` on the
// matching <WatchCanvas> must equal these (dir name + extracted frame count).
const SCENES = [
  { name: 'Night Reveal (Home)',  src: 'gotham-nyc-reveal.mp4',          out: 'nyc-reveal-frames' },
  { name: 'Vault (Timepieces)',   src: 'gotham-watch-rotation-new.mp4',  out: 'watch-frames-new' },
]
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🎬  GCJ Scroll-Frame Extractor  (2560px · Lanczos · q3)')
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
  const videoSrc  = join(ASSETS, scene.src)
  const framesDir = join(ASSETS, scene.out)

  console.log(`\n▶  ${scene.name}`)
  console.log(`   src: assets/${scene.src}  →  assets/${scene.out}/`)

  if (!existsSync(videoSrc)) {
    console.error(`   ❌  Source video not found: ${videoSrc} — skipping`)
    hadError = true
    continue
  }

  // Clean the output dir so a shorter re-extract can't leave stale trailing frames
  if (existsSync(framesDir)) {
    rmSync(framesDir, { recursive: true, force: true })
  }
  mkdirSync(framesDir, { recursive: true })

  const cmd = [
    'ffmpeg',
    '-y',
    `-i "${videoSrc}"`,
    `-vf "fps=${FPS},scale=${WIDTH}:-2:flags=${FLAGS}"`,
    `-q:v ${QUALITY}`,
    `"${join(framesDir, 'frame%04d.jpg')}"`,
  ].join(' ')

  try {
    execSync(cmd, { stdio: 'pipe' })
  } catch (e) {
    console.error(`   ❌  FFmpeg extraction failed for ${scene.name}`)
    hadError = true
    continue
  }

  const count = readdirSync(framesDir).filter(f => f.endsWith('.jpg')).length
  console.log(`   ✅  ${count} frames extracted → set <WatchCanvas totalFrames={${count}} framesPath="/assets/${scene.out}" />`)
}

console.log('')
if (hadError) {
  console.error('⚠️   Completed with errors — see above.\n')
  process.exit(1)
}
console.log('🚀  All scenes extracted. Run  npm run dev  and scroll through the reveal scenes!\n')
