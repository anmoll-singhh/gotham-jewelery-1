/**
 * WatchCanvas — Apple-style scroll-driven frame sequence player.
 *
 * HOW IT WORKS:
 *  1. Resolve which frame set to use: on phones/touch, probe `${framesPath}-mobile`
 *     and use it if present (smaller frames → far less decode/memory/draw cost);
 *     otherwise fall back to the desktop `framesPath`. The pages never see this —
 *     the mobile path is derived internally from the prop.
 *  2. Probe frame0001.jpg of the resolved path. If it loads → canvas mode, else static.
 *  3. Canvas mode: preload all frames — each is fully `img.decode()`d BEFORE it counts
 *     as loaded, so no JPEG is decoded synchronously on the main thread mid-scroll
 *     (the #1 source of scrub stutter). A RAF loop then draws the current frame.
 *  4. Static mode: show frame0001.jpg as a poster (also the always-on bg layer).
 *  5. Desktop: GSAP ScrollTrigger pins + scrubs. Canvas backing store capped at DPR 3.
 *     Mobile:  CSS position:sticky wrapper + native scroll listener drives same doUpdate.
 *              Canvas backing store capped at DPR 2 so it isn't gigantic on phones.
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

// Phones/small touch screens: load the lighter `-mobile` frame set (if it exists)
// and cap the canvas backing store at DPR 2. Desktop keeps the full set at DPR 3.
const MOBILE_MQ = "(max-width: 767px)";
const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches;

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
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  // Which frame directory to actually load. Defaults to the prop (desktop set);
  // upgraded to `${framesPath}-mobile` on phones once that set is confirmed present.
  // Resolved synchronously on desktop (no probe) so the poster never flickers.
  const [activePath, setActivePath] = useState(framesPath);
  const [pathResolved, setPathResolved] = useState(() => !isMobileViewport());

  const modeRef  = useRef(mode);
  const readyRef = useRef(ready);
  useEffect(() => { modeRef.current = mode; },  [mode]);
  useEffect(() => { readyRef.current = ready; }, [ready]);

  const entryOverlayRef = useRef<HTMLDivElement>(null);
  const exitOverlayRef  = useRef<HTMLDivElement>(null);

  // Track viewport breakpoint for sticky vs GSAP pin decision
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Phase 0: Resolve desktop vs mobile frame set (decided ONCE at mount) ──
  // On a phone, probe `${framesPath}-mobile/frame0001.jpg`; use that lighter set
  // if present, else fall back to the desktop set. Decided once (not on resize) so
  // crossing the breakpoint never triggers a full 193-frame re-download.
  useEffect(() => {
    if (!isMobileViewport()) {
      setActivePath(framesPath);   // no-ops on desktop (already the initial value)
      setPathResolved(true);
      return;
    }
    let cancelled = false;
    const mobilePath = `${framesPath}-mobile`;
    const finish = (path: string) => {
      if (cancelled) return;
      setActivePath(path);
      setPathResolved(true);
    };
    const probe = new Image();
    const timeout = setTimeout(() => finish(framesPath), 1500); // slow probe → desktop set
    probe.onload  = () => { clearTimeout(timeout); finish(mobilePath); };
    probe.onerror = () => { clearTimeout(timeout); finish(framesPath); };
    probe.src = `${mobilePath}/frame0001.jpg`;
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [framesPath]);

  // Parse "320%" → 320  (used for sticky wrapper height: scrubVh + 100)
  const scrubVh = parseInt(scrubLength.replace("%", ""), 10) || 500;

  // ─── doUpdate — shared by GSAP (desktop) and scroll listener (mobile) ──
  const doUpdate = useCallback((progress: number) => {
    if (modeRef.current === "canvas" && readyRef.current) {
      targetFrame.current = Math.round(progress * (frames.current.length - 1));
    }
    onProgressRef.current?.(progress);
  }, []);

  // ─── Phase 1: Probe for frames (all devices — mobile also gets canvas) ─
  // Waits for Phase 0 so it probes the resolved (possibly `-mobile`) path.
  useEffect(() => {
    if (!pathResolved) return;

    const timeout = setTimeout(() => {
      if (modeRef.current === "detecting") setMode("static");
    }, 1800);

    const probe = new Image();
    probe.onload = () => { clearTimeout(timeout); setMode("canvas"); };
    probe.onerror = () => { clearTimeout(timeout); setMode("static"); };
    probe.src = `${activePath}/frame0001.jpg`;

    return () => clearTimeout(timeout);
  }, [pathResolved, activePath]);

  // ─── Phase 2a: Canvas mode — preload + DECODE all frames ─────────────
  // Each frame is fully decoded (img.decode()) before it counts as "loaded", so the
  // heavy JPEG decode happens here — off the scroll-time main thread — instead of
  // lazily on the first drawImage() during a scrub (the biggest cause of stutter).
  // A small concurrency pool keeps a bounded number of decodes in flight so the
  // preload itself stays smooth and early (visible-first) frames land first.
  useEffect(() => {
    if (mode !== "canvas") return;

    let cancelled = false;
    let loaded = 0;
    let next = 0;
    const CONCURRENCY = 6;
    const imgs = new Array<HTMLImageElement>(totalFrames);

    const loadOne = (idx: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        imgs[idx] = img;
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          loaded++;
          if (!cancelled) setLoadPct(Math.round((loaded / totalFrames) * 100));
          resolve();
        };
        // Attach handlers BEFORE src so nothing is missed. On load, decode() moves
        // the pixel decode off the main thread; if decode() rejects (cache/CORS
        // quirks) we still count the frame so the preload can never stall.
        img.onload = () => {
          if (typeof img.decode === "function") {
            img.decode().then(done).catch(done);
          } else {
            done();
          }
        };
        img.onerror = done; // 404/broken frame → count it, don't hang the bar
        img.src = `${activePath}/frame${String(idx + 1).padStart(4, "0")}.jpg`;
      });

    const worker = async () => {
      while (!cancelled) {
        const idx = next++;
        if (idx >= totalFrames) return;
        await loadOne(idx);
      }
    };

    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(CONCURRENCY, totalFrames); i++) workers.push(worker());
    Promise.all(workers).then(() => {
      if (cancelled) return;
      frames.current = imgs;
      setReady(true);
    });

    return () => { cancelled = true; frames.current = []; };
  }, [mode, totalFrames, activePath]);

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
      // Cap DPR harder on phones/touch: a full-DPR-3 backing store on a small screen
      // is a huge per-frame GPU/memory cost for no visible gain (source detail tops
      // out at 720p). DPR 2 still exceeds the source's detail ceiling → crisp + fast.
      const touch = window.matchMedia("(pointer: coarse)").matches;
      const small = window.matchMedia(MOBILE_MQ).matches;
      const dpr = Math.min(rawDpr, touch || small ? 2 : 3);
      canvas.width  = Math.ceil(canvas.offsetWidth  * dpr);
      canvas.height = Math.ceil(canvas.offsetHeight * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      drawnFrame.current = -1;
    };
    resize();
    window.addEventListener("resize", resize);

    let isVisible = true;

    const draw = () => {
      if (!isVisible) return;
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

    // Pause RAF when section scrolls fully off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cancelAnimationFrame(rafId.current);
          rafId.current = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(rafId.current);
        }
      },
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
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
      style={{
        position: "relative",
        height: isMobile ? `${scrubVh + 100}vh` : "auto",
        background: "var(--c-void)",
        isolation: "isolate",
        overflowX: "clip",
      }}
    >
      <div
        ref={containerRef}
        className="watch-canvas-wrap"
        style={{
          position: isMobile ? "sticky" : "relative",
          top: isMobile ? 0 : undefined,
          zIndex: 20,
          height: "100vh",
          background: "var(--c-void)",
          overflow: "hidden",
        }}
      >
        {/* ── Poster — the FIRST FRAME is always the background layer ──
            Rendered in every mode (detecting, static AND canvas-while-loading)
            so the section shows frame 1 instead of the raw green void before
            the canvas has painted. This is the fallback picture for the whole
            scene. zIndex:1 keeps it behind the live canvas.
            Gated on pathResolved so a phone never fetches the heavy desktop
            frame0001 before the lighter `-mobile` set is confirmed. Desktop
            resolves synchronously, so there the poster still shows immediately. */}
        {pathResolved && (
          <img
            src={`${activePath}/frame0001.jpg`}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              zIndex: 1, background: "#000",
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* ── Canvas ──────────────────────────────────────────── */}
        {/* transparent bg (NOT var(--c-void)) so the poster shows through until
            the first frame is drawn — otherwise an opaque green canvas hides it */}
        {mode === "canvas" && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              display: "block", zIndex: 2,
              background: "transparent", imageRendering: "auto",
            }}
          />
        )}

        {/* ── Loading bar ─────────────────────────────────────── */}
        {mode === "canvas" && !ready && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(12,18,8,0.55)", zIndex: 4,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "180px", height: "1px", background: "rgba(197,164,110,0.15)", margin: "0 auto 14px" }}>
                <div style={{ height: "100%", width: `${loadPct}%`, background: "var(--c-accent)", transition: "width 0.1s linear" }} />
              </div>
              <p className="wc-loading-label" style={{ fontFamily: "var(--f-body)", fontSize: "9px", letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(201,168,76,0.62)" }}>
                Loading the reveal · {loadPct}%
              </p>
            </div>
          </div>
        )}

        {/* ── Loading shimmer — subtle gold sweep over the poster while frames
             preload, signalling the scene is loading more (not a static image) ── */}
        {mode === "canvas" && !ready && <div className="wc-shimmer" aria-hidden="true" />}

        {/* ── Entry overlay (fades from black over first 6% of progress) ── */}
        <div
          ref={entryOverlayRef}
          style={{
            position: "absolute", inset: 0,
            background: "var(--c-void)", zIndex: 5,
            pointerEvents: "none", opacity: 0,
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
