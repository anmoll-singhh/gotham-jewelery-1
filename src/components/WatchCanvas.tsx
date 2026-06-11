/**
 * WatchCanvas — Apple-style scroll-driven frame sequence player.
 *
 * HOW IT WORKS (same technique Apple uses for iPhone/MacBook animations):
 *  1. Decode every video frame as a static JPEG upfront (one-time load cost)
 *  2. A requestAnimationFrame loop draws the current frame to <canvas>
 *  3. ScrollTrigger sets a target frame index via onUpdate — no decoding happens
 *  4. Result: butter-smooth 60fps scrubbing, zero video decoder lag
 *
 * VIDEO FALLBACK (when frames not extracted):
 *  - RAF-throttled seeking: only one fastSeek() per animation frame (60fps max)
 *  - 40ms minimum threshold between seeks: prevents decoder thrashing
 *  - scrub: 1 on ScrollTrigger adds smoothing, reducing distinct time values
 *
 * SETUP — run once to extract frames from video:
 *  node scripts/extract-frames.mjs
 *  (requires FFmpeg: winget install Gyan.FFmpeg  OR  brew install ffmpeg)
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface WatchCanvasProps {
  /** Total number of extracted frames (default: 120 = 5s @ 24fps) */
  totalFrames?: number;
  /** Path to frames directory, no trailing slash */
  framesPath?: string;
  /** Fallback video src if frames aren't available */
  videoSrc?: string;
  /** Scroll distance for the pinned scene */
  scrubLength?: string;
  children?: React.ReactNode;
  /**
   * Called on every ScrollTrigger tick with the current progress (0→1).
   * Use this to drive overlay text/animations from a SINGLE ScrollTrigger
   * instead of creating a competing pinned trigger on a parent element.
   */
  onProgress?: (progress: number) => void;
}

const DEFAULT_FRAMES = 120;
const DEFAULT_PATH = "/assets/watch-frames";

export function WatchCanvas({
  totalFrames = DEFAULT_FRAMES,
  framesPath = DEFAULT_PATH,
  videoSrc = "/assets/watch-reveal-ap.mp4",
  scrubLength = "500%",
  children,
  onProgress,
}: WatchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const targetFrame = useRef(0);
  const drawnFrame = useRef(-1);
  const rafId = useRef(0);
  // Video fallback: RAF loop reads from this ref, never from ScrollTrigger directly
  const videoTargetTime = useRef(0);
  // Stable ref so ScrollTrigger closure never captures a stale onProgress
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  const [mode, setMode] = useState<"detecting" | "canvas" | "video" | "static">(
    "detecting",
  );
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);

  // Stable refs for mode and ready — lets the pin's onUpdate always see fresh values
  // without needing to recreate the ScrollTrigger when they change.
  const modeRef = useRef(mode);
  const readyRef = useRef(ready);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { readyRef.current = ready; }, [ready]);
  // Entry overlay — masks the raw first frame during pre-pin transition.
  // Fades to transparent over the first 4% of scroll progress (directly via DOM).
  const entryOverlayRef = useRef<HTMLDivElement>(null);
  // Exit overlay — masks the raw last frame during post-pin scroll-out.
  // Fades to opaque over the last 4% of scroll progress (directly via DOM).
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  // ─── Phase 1: Detect whether frames exist ───────────────────────────────
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => setMode("canvas");
    probe.onerror = () => setMode("video");
    probe.src = `${framesPath}/frame0001.jpg`;
  }, [framesPath]);

  // ─── Phase 2a: Canvas mode — preload all frames ─────────────────────────
  useEffect(() => {
    if (mode !== "canvas") return;

    let loaded = 0;
    const imgs = new Array<HTMLImageElement>(totalFrames);

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const idx = i;
      const onDone = () => {
        loaded++;
        setLoadPct(Math.round((loaded / totalFrames) * 100));
        if (loaded === totalFrames) {
          frames.current = imgs;
          setReady(true);
        }
      };
      img.onload = onDone;
      img.onerror = onDone; // skip missing frames gracefully
      img.src = `${framesPath}/frame${String(idx + 1).padStart(4, "0")}.jpg`;
      imgs[idx] = img;
    }

    return () => {
      frames.current = [];
    };
  }, [mode, totalFrames, framesPath]);

  // ─── Phase 2b: Video fallback / static mode — just mark ready ───────────
  useEffect(() => {
    if (mode !== "video" && mode !== "static") return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // ─── Phase 3a: Canvas RAF render loop ───────────────────────────────────
  useEffect(() => {
    if (mode !== "canvas" || !ready) return;
    const canvas = canvasRef.current!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      drawnFrame.current = -1; // force redraw after resize
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const rounded = Math.max(
        0,
        Math.min(Math.round(targetFrame.current), frames.current.length - 1),
      );
      if (rounded !== drawnFrame.current) {
        const img = frames.current[rounded];
        if (img?.complete && img.naturalWidth > 0) {
          const ctx = canvas.getContext("2d")!;
          const cw = canvas.offsetWidth;
          const ch = canvas.offsetHeight;
          const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
          const sw = img.naturalWidth * scale;
          const sh = img.naturalHeight * scale;
          ctx.clearRect(0, 0, cw, ch);
          ctx.drawImage(img, (cw - sw) / 2, (ch - sh) / 2, sw, sh);
          drawnFrame.current = rounded;
        }
      }
      rafId.current = requestAnimationFrame(draw);
    };
    rafId.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
    };
  }, [mode, ready]);

  // ─── Phase 3b: Video fallback — RAF-throttled seeking ───────────────────
  // KEY FIX: ScrollTrigger fires on every scroll tick (100+ times/sec).
  // Calling fastSeek() that often thrashes the video decoder → lag.
  // This RAF loop caps seeks at 60fps AND only seeks if target moved >40ms.
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    // Kill any auto-play
    const stop = () => {
      v.pause();
      v.playbackRate = 0;
    };
    v.addEventListener("canplay", stop);
    v.addEventListener("play", stop);

    let lastSeeked = -1;
    let loop: number;

    const tick = () => {
      const target = videoTargetTime.current;
      // Only seek when video is ready AND target has moved enough to matter
      if (v.readyState >= 2 && Math.abs(target - lastSeeked) > 0.04) {
        if (typeof v.fastSeek === "function") v.fastSeek(target);
        else v.currentTime = target;
        lastSeeked = target;
      }
      loop = requestAnimationFrame(tick);
    };
    loop = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(loop);
      v.removeEventListener("canplay", stop);
      v.removeEventListener("play", stop);
    };
  }, [mode]);

  // ─── Phase 4: ScrollTrigger — created on mount (not gated on `ready`) ──────
  //
  // CRITICAL: This pin spacer must exist in the DOM before downstream
  // ScrollTriggers (e.g. ServicesScene) are initialised so they calculate
  // their trigger positions against the correct document height. Previously
  // the pin was deferred until frames finished loading, which caused
  // ServicesScene's trigger to be calculated ~2340px too early and produced
  // a large black void between the brand marquee and the services section.
  //
  // modeRef / readyRef keep the onUpdate closure fresh without recreating
  // the trigger when mode or ready change.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const doUpdate = (progress: number) => {
        const currentMode = modeRef.current;
        const currentReady = readyRef.current;

        if (currentMode === "canvas" && currentReady) {
          targetFrame.current = Math.round(progress * (frames.current.length - 1));
        } else if (currentMode === "video" && currentReady) {
          const v = videoRef.current;
          if (!v?.duration) return;
          videoTargetTime.current = progress * v.duration;
        }
        // "static" mode: falls through — no frame/video work needed.
        onProgressRef.current?.(progress);

        if (entryOverlayRef.current) {
          const fadeProgress = Math.min(1, progress / 0.06);
          entryOverlayRef.current.style.opacity = String(1 - fadeProgress);
        }
        // Exit overlay intentionally kept at 0 — last frame stays visible as section scrolls out
      };

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: `+=${scrubLength}`,
        pin: true,
        anticipatePin: 1,
        // scrub:1 works for both video and canvas; the RAF draw loop provides
        // the per-frame smoothness for canvas mode so no precision is lost.
        scrub: 1,
        onUpdate: (self) => doUpdate(self.progress),
      });
    }, containerRef);
    return () => ctx.revert();
  // Only recreate if scrubLength changes (rare). mode/ready use refs instead.
  }, [scrubLength]);

  return (
    <div
      ref={containerRef}
      className="watch-canvas-wrap"
      style={{
        position: "relative",
        // zIndex: 20 creates a root-level stacking context so that ServicesScene's
        // anticipatePin (which briefly sets position:fixed on later DOM elements)
        // can never render on top of the watch canvas while it is pinned.
        zIndex: 20,
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* ── Canvas (frame mode) ───────────────────────────────── */}
      {mode === "canvas" && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            zIndex: 2,
            background: "#000",
            imageRendering: "auto",
          }}
        />
      )}

      {/* ── Video (fallback mode) ─────────────────────────────── */}
      {mode === "video" && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 2,
            background: "#000",
          }}
        />
      )}

      {/* ── Static poster (mobile — avoids 121-frame / video load) ── */}
      {mode === "static" && (
        <img
          src={`${framesPath}/frame0061.jpg`}
          alt="Swiss timepiece"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            zIndex: 2,
            background: "#000",
          }}
        />
      )}

      {/* ── Loading overlay (canvas preload) ─────────────────── */}
      {mode === "canvas" && !ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "180px",
                height: "1px",
                background: "rgba(197,164,110,0.15)",
                marginBottom: "14px",
                margin: "0 auto 14px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${loadPct}%`,
                  background: "var(--c-accent)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "9px",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.22)",
              }}
            >
              Loading · {loadPct}%
            </p>
          </div>
        </div>
      )}

      {/* ── Detecting overlay ─────────────────────────────────── */}
      {mode === "detecting" && (
        <div style={{ position: "absolute", inset: 0, background: "#000" }} />
      )}

      {/* ── Entry overlay — masks raw first frame during pre-pin scroll-in ─── */}
      {/* Starts fully opaque (#000), fades out over first 6% of scroll progress  */}
      {/* NO CSS transition — JS (doUpdate) drives opacity directly every tick.   */}
      {/* A CSS transition would add 180ms lag and cause the ghost frame to flash. */}
      <div
        ref={entryOverlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          zIndex: 5,
          pointerEvents: "none",
          opacity: 1,
        }}
      />

      {/* ── Exit overlay — masks last frame during post-pin scroll-out ────── */}
      {/* Fades IN from 80% → 98% progress. NO CSS transition — must be instant. */}
      {/* With transition, the overlay lags and ServicesScene bleeds through.    */}
      <div
        ref={exitOverlayRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          zIndex: 6,
          pointerEvents: "none",
          opacity: 0,
        }}
      />

      {/* ── Overlay content (text, CTAs) — mount always so GSAP refs are available */}
      {children && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
