/**
 * WatchCanvas — Apple-style scroll-driven frame sequence player.
 *
 * HOW IT WORKS (same technique Apple uses for iPhone/MacBook animations):
 *  1. Probe frame0001.jpg. If it loads → canvas mode. If it 404s → static mode.
 *  2. Canvas mode: preload every frame as an Image, RAF loop draws current frame.
 *  3. Static mode: show frame0061.jpg as a poster (no scroll animation).
 *  4. ScrollTrigger pins the section and sets targetFrame via onUpdate.
 *
 * NO VIDEO FALLBACK — avoids auto-playing background video on all devices.
 * Run  node scripts/extract-frames.mjs  once to generate the JPEG frames.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface WatchCanvasProps {
  /** Total number of extracted frames (default: 193 = ~8s @ 24fps) */
  totalFrames?: number;
  /** Path to frames directory, no trailing slash */
  framesPath?: string;
  /** Scroll distance for the pinned scene */
  scrubLength?: string;
  children?: React.ReactNode;
  /**
   * Called on every ScrollTrigger tick with the current progress (0→1).
   * Use this to drive overlay text/animations from a SINGLE ScrollTrigger.
   */
  onProgress?: (progress: number) => void;
}

const DEFAULT_FRAMES = 193;
const DEFAULT_PATH = "/assets/watch-frames";

export function WatchCanvas({
  totalFrames = DEFAULT_FRAMES,
  framesPath = DEFAULT_PATH,
  scrubLength = "500%",
  children,
  onProgress,
}: WatchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const targetFrame = useRef(0);
  const drawnFrame = useRef(-1);
  const rafId = useRef(0);

  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  const [mode, setMode] = useState<"detecting" | "canvas" | "static">("detecting");
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady] = useState(false);

  const modeRef = useRef(mode);
  const readyRef = useRef(ready);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef = useRef<HTMLDivElement>(null);

  // ─── Phase 1: Probe for frames ───────────────────────────────────
  useEffect(() => {
    // Safety: if probe hangs (CDN cold start, slow network), fall to static after 4s.
    const timeout = setTimeout(() => {
      if (modeRef.current === "detecting") setMode("static");
    }, 4000);

    const probe = new Image();
    probe.onload = () => { clearTimeout(timeout); setMode("canvas"); };
    probe.onerror = () => { clearTimeout(timeout); setMode("static"); };
    probe.src = `${framesPath}/frame0001.jpg`;

    return () => clearTimeout(timeout);
  }, [framesPath]);

  // ─── Phase 2a: Canvas mode — preload all frames ──────────────────
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
      img.onerror = onDone;
      img.src = `${framesPath}/frame${String(idx + 1).padStart(4, "0")}.jpg`;
      imgs[idx] = img;
    }

    return () => { frames.current = []; };
  }, [mode, totalFrames, framesPath]);

  // ─── Phase 2b: Static mode — mark ready immediately ─────────────
  useEffect(() => {
    if (mode !== "static") return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // ─── Phase 3: Canvas RAF render loop ────────────────────────────
  useEffect(() => {
    if (mode !== "canvas" || !ready) return;
    const canvas = canvasRef.current!;

    const resize = () => {
      const rawDpr = window.devicePixelRatio || 1;
      // Portrait phones: landscape frames (1920×1080) would be stretched 3.5× at DPR=3.
      // Cap DPR=1 in portrait so frames scale DOWN into the canvas rather than up.
      const isPortrait = canvas.offsetHeight > canvas.offsetWidth;
      const dpr = isPortrait ? 1 : Math.min(rawDpr, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawnFrame.current = -1;
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
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

  // ─── Phase 4: ScrollTrigger — desktop pin only ───────────────────
  // CRITICAL: pin spacer must exist before downstream triggers are created.
  // modeRef/readyRef keep closures fresh without recreating the trigger.
  // On mobile (pointer:coarse) we skip the pin entirely so native touch
  // scroll is never blocked.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const doUpdate = (progress: number) => {
        if (modeRef.current === "canvas" && readyRef.current) {
          targetFrame.current = Math.round(progress * (frames.current.length - 1));
        }
        onProgressRef.current?.(progress);

        if (entryOverlayRef.current) {
          const fadeProgress = Math.min(1, progress / 0.06);
          entryOverlayRef.current.style.opacity = String(1 - fadeProgress);
        }
      };

      const mm = gsap.matchMedia();

      // Desktop: pinned scroll-driven animation
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrubLength}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.5,
          onUpdate: (self) => doUpdate(self.progress),
        });
      });

      // Mobile: no pin — native touch scroll is unobstructed.
      // Static poster shows; pin spacer is never injected.
    }, containerRef);
    return () => ctx.revert();
  }, [scrubLength]);

  return (
    <div
      ref={containerRef}
      className="watch-canvas-wrap"
      style={{
        position: "relative",
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

      {/* ── Static poster (frames unavailable) ───────────────── */}
      {(mode === "detecting" || mode === "static") && (
        <img
          src={mode === "detecting"
            ? `${framesPath}/frame0001.jpg`
            : `${framesPath}/frame0061.jpg`}
          alt=""
          aria-hidden="true"
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
            <div style={{
              width: "180px", height: "1px",
              background: "rgba(197,164,110,0.15)",
              margin: "0 auto 14px",
            }}>
              <div style={{
                height: "100%",
                width: `${loadPct}%`,
                background: "var(--c-accent)",
                transition: "width 0.1s linear",
              }} />
            </div>
            <p style={{
              fontFamily: "var(--f-body)",
              fontSize: "9px",
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.22)",
            }}>
              Loading · {loadPct}%
            </p>
          </div>
        </div>
      )}

      {/* ── Entry overlay — fades from #000 over first 6% of progress ── */}
      <div
        ref={entryOverlayRef}
        style={{
          position: "absolute", inset: 0,
          background: "#000",
          zIndex: 5, pointerEvents: "none", opacity: 1,
        }}
      />

      {/* ── Exit overlay ─────────────────────────────────────── */}
      <div
        ref={exitOverlayRef}
        style={{
          position: "absolute", inset: 0,
          background: "#000",
          zIndex: 6, pointerEvents: "none", opacity: 0,
        }}
      />

      {/* ── Overlay content (text, CTAs) ─────────────────────── */}
      {children && (
        <div style={{
          position: "relative", zIndex: 10, height: "100%",
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
