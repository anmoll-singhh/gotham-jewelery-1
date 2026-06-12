/**
 * WatchCanvas — Apple-style scroll-driven frame sequence player.
 *
 * HOW IT WORKS:
 *  1. Probe frame0001.jpg. If it loads → canvas mode. If it 404s → static mode.
 *  2. Canvas mode: preload all frames, RAF loop draws current frame.
 *  3. Static mode: show frame0061.jpg as a poster.
 *  4. Desktop: GSAP ScrollTrigger pins + scrubs.
 *     Mobile:   CSS position:sticky wrapper + native scroll listener drives same doUpdate.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface WatchCanvasProps {
  totalFrames?: number;
  framesPath?: string;
  scrubLength?: string;
  children?: React.ReactNode;
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
  const containerRef   = useRef<HTMLDivElement>(null);
  const mobileWrapRef  = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const frames         = useRef<HTMLImageElement[]>([]);
  const targetFrame    = useRef(0);
  const drawnFrame     = useRef(-1);
  const rafId          = useRef(0);

  const onProgressRef = useRef(onProgress);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  const [mode, setMode]       = useState<"detecting" | "canvas" | "static">("detecting");
  const [loadPct, setLoadPct] = useState(0);
  const [ready, setReady]     = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );

  const modeRef  = useRef(mode);
  const readyRef = useRef(ready);
  useEffect(() => { modeRef.current = mode; },  [mode]);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef  = useRef<HTMLDivElement>(null);

  // Track viewport breakpoint for sticky vs GSAP pin decision
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Parse "320%" → 320  (used for sticky wrapper height: scrubVh + 100)
  const scrubVh = parseInt(scrubLength.replace("%", ""), 10) || 500;

  // ─── doUpdate — shared by GSAP (desktop) and scroll listener (mobile) ──
  const doUpdate = useCallback((progress: number) => {
    if (modeRef.current === "canvas" && readyRef.current) {
      targetFrame.current = Math.round(progress * (frames.current.length - 1));
    }
    onProgressRef.current?.(progress);
    if (entryOverlayRef.current) {
      const fadeProgress = Math.min(1, progress / 0.06);
      entryOverlayRef.current.style.opacity = String(1 - fadeProgress);
    }
  }, []);

  // ─── Phase 1: Probe for frames (all devices — mobile also gets canvas) ─
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (modeRef.current === "detecting") setMode("static");
    }, 4000);

    const probe = new Image();
    probe.onload = () => { clearTimeout(timeout); setMode("canvas"); };
    probe.onerror = () => { clearTimeout(timeout); setMode("static"); };
    probe.src = `${framesPath}/frame0001.jpg`;

    return () => clearTimeout(timeout);
  }, [framesPath]);

  // ─── Phase 2a: Canvas mode — preload all frames ──────────────────────
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

  // ─── Phase 2b: Static mode ────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "static") return;
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // ─── Phase 3: Canvas RAF render loop ─────────────────────────────────
  useEffect(() => {
    if (mode !== "canvas" || !ready) return;
    const canvas = canvasRef.current!;

    const resize = () => {
      const rawDpr = window.devicePixelRatio || 1;
      const isPortrait = canvas.offsetHeight > canvas.offsetWidth;
      const dpr = isPortrait ? 1 : Math.min(rawDpr, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
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
      const rounded = Math.max(0, Math.min(Math.round(targetFrame.current), frames.current.length - 1));
      if (rounded !== drawnFrame.current) {
        const img = frames.current[rounded];
        if (img?.complete && img.naturalWidth > 0) {
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          const cw = canvas.offsetWidth;
          const ch = canvas.offsetHeight;
          const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
          const sw = img.naturalWidth  * scale;
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

  // ─── Phase 4: Desktop — GSAP ScrollTrigger pin ───────────────────────
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
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
      // Mobile is handled by the scroll listener effect below —
      // no matchMedia mobile handler needed here.
    }, containerRef);
    return () => ctx.revert();
  }, [scrubLength, doUpdate]);

  // ─── Phase 5: Mobile — native scroll listener drives doUpdate ────────
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const wrapper = mobileWrapRef.current;
      if (!wrapper) return;
      const rect       = wrapper.getBoundingClientRect();
      const totalScroll = wrapper.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / totalScroll));
      doUpdate(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Call once immediately in case section is already in view on mount
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, doUpdate]);

  // ─── JSX ──────────────────────────────────────────────────────────────
  // The outer div (mobileWrapRef) is always rendered:
  //   Desktop: height:auto → GSAP inserts its pin-spacer child, wrapper grows naturally.
  //   Mobile:  height:(scrubVh+100)vh → provides scroll space for sticky inner.
  return (
    <div
      ref={mobileWrapRef}
      style={{ position: "relative", height: isMobile ? `${scrubVh + 100}vh` : "auto" }}
    >
      <div
        ref={containerRef}
        className="watch-canvas-wrap"
        style={{
          position: isMobile ? "sticky" : "relative",
          top: isMobile ? 0 : undefined,
          zIndex: 20,
          height: "100vh",
          background: "#000",
          overflow: "hidden",
        }}
      >
        {/* ── Canvas ──────────────────────────────────────────── */}
        {mode === "canvas" && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              display: "block", zIndex: 2,
              background: "#000", imageRendering: "auto",
            }}
          />
        )}

        {/* ── Static poster ───────────────────────────────────── */}
        {(mode === "detecting" || mode === "static") && (
          <img
            src={mode === "detecting"
              ? `${framesPath}/frame0001.jpg`
              : `${framesPath}/frame0061.jpg`}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              zIndex: 2, background: "#000",
            }}
          />
        )}

        {/* ── Loading bar ─────────────────────────────────────── */}
        {mode === "canvas" && !ready && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#000",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "180px", height: "1px", background: "rgba(197,164,110,0.15)", margin: "0 auto 14px" }}>
                <div style={{ height: "100%", width: `${loadPct}%`, background: "var(--c-accent)", transition: "width 0.1s linear" }} />
              </div>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "9px", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)" }}>
                Loading · {loadPct}%
              </p>
            </div>
          </div>
        )}

        {/* ── Entry overlay (fades from black over first 6% of progress) ── */}
        <div
          ref={entryOverlayRef}
          style={{
            position: "absolute", inset: 0,
            background: "#000", zIndex: 5,
            pointerEvents: "none", opacity: 1,
          }}
        />

        {/* ── Exit overlay ────────────────────────────────────── */}
        <div
          ref={exitOverlayRef}
          style={{
            position: "absolute", inset: 0,
            background: "#000", zIndex: 6,
            pointerEvents: "none", opacity: 0,
          }}
        />

        {/* ── Overlay content (text, CTAs) ────────────────────── */}
        {/* Always rendered — GSAP drives each element's opacity via onProgress.
            The entry overlay (zIndex:5) covers the canvas while loading; text
            elements start at GSAP opacity:0 and animate in on scroll regardless
            of whether all frames have finished preloading. */}
        {children && (
          <div style={{
            position: "relative", zIndex: 10, height: "100%",
            pointerEvents: ready ? "auto" : "none",
          }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
