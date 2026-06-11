/**
 * extract-frames.mjs
 * ──────────────────────────────────────────────────────────────────────────────
 * Extracts JPEG frames from the watch-reveal.mp4 video for the Apple-style
 * canvas scroll animation (WatchCanvas component).
 *
 * WHY: video.currentTime scrubbing is slow because the browser must decode
 *      compressed video in real time. Canvas drawing pre-decoded images is
 *      instant — this is exactly how Apple.com does the iPhone animations.
 *
 * INSTALL FFmpeg first (one-time):
 *   Windows:  winget install Gyan.FFmpeg
 *             -- OR -- choco install ffmpeg
 *   macOS:    brew install ffmpeg
 *   Linux:    sudo apt install ffmpeg
 *
 * RUN:
 *   node scripts/extract-frames.mjs
 *
 * OUTPUT:
 *   public/assets/watch-frames/frame0001.jpg  (120 frames total)
 *   ...
 *   public/assets/watch-frames/frame0120.jpg
 *
 * After running this script, reload the site. WatchCanvas will automatically
 * detect the frames and switch from video fallback to butter-smooth canvas mode.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { execSync } from 'child_process'
import { mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')

// ── Config ────────────────────────────────────────────────────────────────
const VIDEO_SRC  = join(ROOT, 'public', 'assets', 'watch-reveal-ap.mp4')
const FRAMES_DIR = join(ROOT, 'public', 'assets', 'watch-frames')
const FPS        = 24         // frames per second (5s video → 120 frames)
const WIDTH      = 1920       // output width — 1920 ensures no upscaling on DPR-2 desktops
const QUALITY    = 3          // JPEG quality 1–31: lower = better (2–4 is ideal)
// ─────────────────────────────────────────────────────────────────────────

console.log('\n🎬  GCJ Watch Frame Extractor')
console.log('─────────────────────────────')

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

// Check source video exists
if (!existsSync(VIDEO_SRC)) {
  console.error(`\n❌  Source video not found: ${VIDEO_SRC}`)
  console.error('    Make sure watch-reveal.mp4 is in public/assets/\n')
  process.exit(1)
}

// Create output directory
if (!existsSync(FRAMES_DIR)) {
  mkdirSync(FRAMES_DIR, { recursive: true })
  console.log(`📁  Created: public/assets/watch-frames/`)
} else {
  const existing = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg'))
  if (existing.length > 0) {
    console.log(`⚠️   Found ${existing.length} existing frames — overwriting`)
  }
}

// Run extraction
console.log(`\n⚙️   Extracting ${FPS}fps @ ${WIDTH}px width, JPEG quality ${QUALITY}...`)
console.log('    (This takes ~5–15 seconds)\n')

const cmd = [
  'ffmpeg',
  '-y',                                           // overwrite without asking
  `-i "${VIDEO_SRC}"`,                            // input
  `-vf "fps=${FPS},scale=${WIDTH}:-2"`,           // filter: fps + scale
  `-q:v ${QUALITY}`,                              // JPEG quality
  `"${join(FRAMES_DIR, 'frame%04d.jpg')}"`,      // output pattern
].join(' ')

try {
  execSync(cmd, { stdio: 'inherit' })
} catch (e) {
  console.error('\n❌  FFmpeg extraction failed.')
  process.exit(1)
}

// Count output files
const count = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length
console.log(`\n✅  Done! Extracted ${count} frames → public/assets/watch-frames/`)
console.log(`\n   Total COMPONENT_FRAME_COUNT = ${count}`)
console.log(`   → Update WatchCanvas totalFrames prop if different from 120\n`)
console.log('🚀  Run  npm run dev  and scroll through the watch scene!\n')
