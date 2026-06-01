/**
 * HOME — Gotham City Jewelers
 *
 * S1  HERO         Ring in void — content reveals as you scroll (GSAP pinned scrub)
 * S2  THE VAULT    ★ Scroll-driven watch rotation — SINGLE ScrollTrigger via onProgress ★
 * S3  STATEMENT    Word-by-word opacity scrub — movement macro ghost bg
 * S4  SERVICES     GSAP horizontal pinned scroll — 3 editorial cards
 * S5  COLLECTION   Asymmetric 3D-tilt bento — 4 watches
 * S6  THE CITY     Parallax closing — Manhattan location
 *
 * LOADING:
 *  - <LoadingScreen> covers everything on first render (fixed, z:9999)
 *  - Site renders under it (no layout shift on reveal)
 *  - After loader exits → ScrollTrigger.refresh() recalculates all pin spacers
 *  - Hero headline entrance plays immediately after loader exits
 */

import {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useEffect,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import {
  Nav,
  Footer,
  MagneticBtn,
  WatchCanvas,
  WatchTiltCard,
  HeroSkeleton,
  LoadingScreen,
} from "@/components";

// ── util ─────────────────────────────────────────────────────────────────────
const c01 = (v: number) => Math.max(0, Math.min(1, v));

const lbl: React.CSSProperties = {
  fontFamily: "var(--f-label)",
  fontSize: "9px",
  fontWeight: 500,
  letterSpacing: "var(--ls-label)",
  textTransform: "uppercase",
  color: "var(--c-accent)",
  display: "block",
  marginBottom: "18px",
};

// ── Module-level flag: only show loader once per JS session ───────────────────
let _loaderShown = false;

// ═════════════════════════════════════════════════════════════════════════════
// S1 — HERO
// Full-screen video. GSAP pinned scrub builds in the content as you scroll.
// After loader exits, `live` prop switches to trigger headline entrance anim.
// ═════════════════════════════════════════════════════════════════════════════
function HeroScene({ live }: { live: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const [imgReady, setImgReady] = useState(false);

  // Scroll-driven: sub-text, CTAs, address slide in as user scrolls through pin
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        gsap.set([subRef.current, ctaRef.current, sideRef.current], {
          opacity: 0,
          y: 30,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: "+=120%",
            scrub: 1,
          },
        });
        tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3);
        tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.7);
        tl.to(sideRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.85);

        ScrollTrigger.create({
          trigger: wrapRef.current,
          start: "top top",
          end: "+=150%",
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          preventOverlaps: true,
          fastScrollEnd: true,
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set([subRef.current, ctaRef.current, sideRef.current], {
          opacity: 1,
          y: 0,
          immediateRender: true,
        });
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
        background: "#060606",
      }}
    >
      <AnimatePresence>
        {!imgReady && <HeroSkeleton key="sk" />}
      </AnimatePresence>

      {/* Background — dark marble / watch hero. Static Ken Burns drift. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: imgReady ? 1 : 0,
          transition: "opacity 1.1s var(--ease-silk)",
        }}
      >
        <img
          src="/assets/gotham-hero-watch-dark.jpg"
          alt=""
          aria-hidden="true"
          className="hero-scenic-img"
          onLoad={() => setImgReady(true)}
          onError={() => setImgReady(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            filter: "brightness(0.22) saturate(0.60) contrast(1.2)",
          }}
        />
        {/* Subtle warm-gold depth overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 55% at 55% 42%, rgba(197,164,110,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to top, #060606 0%, rgba(6,6,6,0.3) 35%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, rgba(6,6,6,0.78) 0%, transparent 58%)",
        }}
      />

      {/* Content — bottom-left anchor */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "var(--gutter)",
          paddingBottom: "clamp(24px, 5vh, 48px)",
          zIndex: 10,
          maxWidth: "880px",
          boxSizing: "border-box",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={live ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ marginBottom: "18px" }}
        >
          <span style={lbl}>
            New York City · Fine Jewelry &amp; Horology · Est. Manhattan
          </span>
        </motion.div>

        {live && (
          <h1
            className="hero-headline"
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-hero)",
              color: "var(--c-white)",
              lineHeight: "var(--lh-display)",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: "var(--ls-display)",
              maxWidth: "820px",
              marginBottom: "32px",
            }}
          >
            Where the stone
            <br />
            becomes the statement.
          </h1>
        )}

        <div ref={subRef} style={{ marginBottom: "44px" }}>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "rgba(240,235,227,0.38)",
              fontWeight: 300,
              lineHeight: 1.9,
              maxWidth: "380px",
              letterSpacing: "0.012em",
            }}
          >
            GIA-certified stones. Swiss-trained authentication.
            <br />
            Fourteen years in the Diamond District.
            <br />
            One address. No exceptions.
          </p>
        </div>

        <div
          cta-ref-marker=""
          ref={ctaRef}
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <MagneticBtn href="/ring-builder">
            <span className="btn-primary">Begin Your Ring</span>
          </MagneticBtn>
          <MagneticBtn href="/timepieces">
            <span className="btn-outline">Enter the Vault</span>
          </MagneticBtn>
        </div>
      </div>

      {/* Vertical address pill — far right (hidden on mobile) */}
      <div
        ref={sideRef}
        className="hide-mobile"
        style={{
          position: "absolute",
          top: "50%",
          right: "var(--gutter)",
          transform: "translateY(-50%) rotate(90deg)",
          transformOrigin: "right center",
          fontFamily: "var(--f-label)",
          fontSize: "8px",
          letterSpacing: "0.30em",
          textTransform: "uppercase",
          color: "rgba(197,164,110,0.20)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}
      >
        23 West 47th Street · Suite 402 · Manhattan
      </div>

      {/* Scroll pulse */}
      <div
        className="hide-mobile"
        style={{
          position: "absolute",
          bottom: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "7px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--f-label)",
            fontSize: "7px",
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: "rgba(197,164,110,0.28)",
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [1, 1.55, 1], opacity: [0.22, 0.65, 0.22] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "1px",
            height: "38px",
            background:
              "linear-gradient(to bottom, rgba(197,164,110,0.65), transparent)",
            transformOrigin: "top",
          }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// S2 — THE VAULT  ★ COMPULSORY: Scroll-driven watch rotation ★
//
// BUG FIX: Previously VaultScene had its own ScrollTrigger competing with
// WatchCanvas's pin. Fix: single ST lives inside WatchCanvas; text panels
// are driven via the onProgress callback — no competing pin, no jank.
// ═════════════════════════════════════════════════════════════════════════════
function VaultScene() {
  const p1 = useRef<HTMLDivElement>(null);
  const p2 = useRef<HTMLDivElement>(null);
  const p3 = useRef<HTMLDivElement>(null);
  const p1Wrap = useRef<HTMLDivElement>(null);
  const p2Wrap = useRef<HTMLDivElement>(null);

  // Initialize panels as hidden
  useLayoutEffect(() => {
    gsap.set([p1.current, p2.current, p3.current], {
      opacity: 0,
      y: 70,
      immediateRender: true,
    });
    gsap.set([p1Wrap.current, p2Wrap.current], {
      opacity: 0,
      pointerEvents: "none",
      immediateRender: true,
    });
  }, []);

  // Driven by WatchCanvas's single ScrollTrigger — no competing trigger
  const onProgress = useCallback((prog: number) => {
    // P1 "Mechanical." — enter 8→22%, hold, exit 35→46%
    const p1i = c01((prog - 0.08) / 0.14);
    const p1o = c01((prog - 0.35) / 0.11);
    const p1val = p1i - p1o;
    if (p1.current)
      gsap.set(p1.current, {
        opacity: p1val,
        y: (1 - p1i) * 70 - p1o * 50,
        immediateRender: false,
      });
    if (p1Wrap.current)
      gsap.set(p1Wrap.current, {
        opacity: p1val,
        pointerEvents: p1val > 0.01 ? "auto" : "none",
        immediateRender: false,
      });

    // P2 "Perfected." — enter 50→64%, hold, exit 68→79%
    const p2i = c01((prog - 0.5) / 0.14);
    const p2o = c01((prog - 0.68) / 0.11);
    const p2val = p2i - p2o;
    if (p2.current)
      gsap.set(p2.current, {
        opacity: p2val,
        y: (1 - p2i) * 70 - p2o * 50,
        immediateRender: false,
      });
    if (p2Wrap.current)
      gsap.set(p2Wrap.current, {
        opacity: p2val,
        pointerEvents: p2val > 0.01 ? "auto" : "none",
        immediateRender: false,
      });

    // P3 CTA — desktop: animate in at 82%
    const p3i = c01((prog - 0.82) / 0.1);
    if (p3.current)
      gsap.set(p3.current, {
        opacity: p3i,
        y: (1 - p3i) * 60,
        immediateRender: false,
      });
  }, []);

  return (
    <WatchCanvas
      totalFrames={121}
      framesPath="/assets/watch-frames"
      videoSrc="/assets/watch-patek-macro.mp4"
      scrubLength="260%"
      onProgress={onProgress}
    >
      {/* Radial vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 52% 62% at 50% 50%, transparent 0%, rgba(0,0,0,0.82) 100%)",
        }}
      />
      {/* Bottom fade for P3 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "44%",
          pointerEvents: "none",
          background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)",
        }}
      />

      {/* P1 — left · "Mechanical." */}
      <div className="vault-panel-1" ref={p1Wrap}>
        <div ref={p1}>
          <span style={lbl}>The Vault · Swiss Movement</span>
          <p
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(38px, 6.5vw, 106px)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: "var(--ls-display)",
            }}
          >
            Mechanical.
          </p>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-body)",
              color: "rgba(240,235,227,0.36)",
              fontWeight: 300,
              lineHeight: 1.8,
              marginTop: "20px",
              maxWidth: "250px",
              textAlign: "center",
              marginInline: "auto",
            }}
          >
            Every watch we carry has cleared
            <br />
            our 14-point authentication.
          </p>
        </div>
      </div>

      {/* P2 — right · "Perfected." */}
      <div className="vault-panel-2" ref={p2Wrap}>
        <div ref={p2}>
          <p
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(38px, 6.5vw, 106px)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 0.9,
              letterSpacing: "var(--ls-display)",
            }}
          >
            Perfected.
          </p>
          <span
            style={{
              ...lbl,
              textAlign: "inherit",
              marginTop: "14px",
              marginBottom: 0,
            }}
          >
            Swiss-Trained · GIA Certified
          </span>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-body)",
              color: "rgba(240,235,227,0.36)",
              fontWeight: 300,
              lineHeight: 1.8,
              marginTop: "12px",
            }}
          >
            We see forty clients a month.
            <br />
            Every piece is treated like the last.
          </p>
        </div>
      </div>

      {/* P3 — center bottom · CTA */}
      <div
        style={{
          position: "absolute",
          bottom: "var(--s-sm)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <div ref={p3} style={{ textAlign: "center" }}>
          <p
            className="vault-brand-list"
            style={{
              fontFamily: "var(--f-label)",
              fontSize: "9px",
              letterSpacing: "var(--ls-label)",
              textTransform: "uppercase",
              color: "rgba(197,164,110,0.5)",
              marginBottom: "24px",
              whiteSpace: "nowrap",
            }}
          >
            Rolex · Patek Philippe · Audemars Piguet · Cartier · Richard Mille
          </p>
          <MagneticBtn href="/timepieces">
            <span className="btn-outline">Enter the Vault</span>
          </MagneticBtn>
        </div>
      </div>
    </WatchCanvas>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// S3 — MERGED BRAND STATEMENT & RING MOMENT
// Shared gear movement macro background video `/assets/movement-macro.mp4`
// ═════════════════════════════════════════════════════════════════════════════
const LINES = ["Nothing leaves", "before we're certain."];

function MergedStatementRingScene() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const words = ref.current!.querySelectorAll<HTMLSpanElement>(".w");
      gsap.set(words, { opacity: 0.05 });
      gsap.to(words, {
        opacity: 1,
        stagger: { each: 0.065, from: "start" },
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 62%",
          end: "center 48%",
          scrub: 1,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "var(--s-xl) var(--gutter)",
        background: "#060606",
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.08,
          pointerEvents: "none",
          filter: "saturate(0.18) brightness(1.3)",
        }}
        src="/assets/movement-macro.mp4"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 80% at 50% 50%, transparent, rgba(6,6,6,0.9))",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "var(--max-w)",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(64px, 12vh, 120px)",
        }}
      >
        {/* Block 1: Statement Scroll Scrub */}
        <div>
          <span style={lbl}>
            Gotham City Jewelers · Manhattan Diamond District
          </span>
          <div style={{ marginTop: "22px" }}>
            {LINES.map((line, li) => (
              <p
                key={li}
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-h1)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: "var(--lh-display)",
                  letterSpacing: "var(--ls-display)",
                  marginBottom: "0.02em",
                }}
              >
                {line.split(" ").map((word, wi) => (
                  <span
                    key={wi}
                    className="w"
                    style={{
                      color: "var(--c-white)",
                      display: "inline-block",
                      marginRight: "0.28em",
                      willChange: "opacity",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>

        {/* Separator gold rule */}
        <div style={{
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(197,164,110,0.18) 10%, rgba(197,164,110,0.18) 90%, transparent)",
          margin: "0 auto",
          width: "100%"
        }} />

        {/* Block 2: Every stone has a question inside it */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%" }}
        >
          <span style={lbl}>The Ring Studio · Custom Engagement</span>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-h2)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "var(--lh-display)",
              letterSpacing: "var(--ls-display)",
              maxWidth: "680px",
              marginTop: "14px",
              marginBottom: "22px",
            }}
          >
            Every stone has
            <br />a question inside it.
          </h2>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "rgba(240,235,227,0.42)",
              fontWeight: 300,
              lineHeight: 1.82,
              maxWidth: "460px",
              marginBottom: "38px",
            }}
          >
            GIA-certified diamonds. Custom settings. Built in Manhattan from
            your first conversation — nothing is made until you say yes.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <MagneticBtn href="/ring-builder">
              <span className="btn-primary">Design Your Ring</span>
            </MagneticBtn>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-outline">Call to Begin</span>
            </MagneticBtn>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// S4 — SERVICES  (GSAP horizontal pinned scroll)
// ═════════════════════════════════════════════════════════════════════════════
const SERVICES = [
  {
    num: "01",
    sub: "Custom Engagement",
    title: "The Ring Studio",
    catchphrase: "No catalog. No compromises.",
    body: "GIA-certified stones. Built in Manhattan from a single conversation. Yours from the first sketch — nothing exists until you say yes.",
    href: "/ring-builder",
    cta: "Begin Here",
    img: "/assets/editorial-ring.png",
  },
  {
    num: "02",
    sub: "Fine Jewelry",
    title: "The Atelier",
    catchphrase: "One conversation. One commission.",
    body: "We don't sell collections. Every piece is made for someone specific. If you need to ask the price, we'll tell you. No pressure, ever.",
    href: "/custom-jewelry",
    cta: "Start Creating",
    img: "/assets/editorial-wrist.png",
  },
  {
    num: "03",
    sub: "Swiss Timepieces",
    title: "The Vault",
    catchphrase: "Fourteen authentication points. Every watch.",
    body: "Rolex, Patek Philippe, Audemars Piguet, Cartier, Richard Mille. We don't carry pieces we wouldn't wear ourselves. Price on request.",
    href: "/timepieces",
    cta: "Enter the Vault",
    img: "/assets/gotham-hf-flatlay.png",
  },
];

const SvcCard = memo(({ svc }: { svc: (typeof SERVICES)[0] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const gx = useSpring(useTransform(mx, [0, 1], [20, 80]), {
    stiffness: 240,
    damping: 22,
  });
  const gy = useSpring(useTransform(my, [0, 1], [20, 80]), {
    stiffness: 240,
    damping: 22,
  });

  return (
    <motion.div
      ref={ref}
      className="h-scroll-panel services-card"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      whileHover={{
        scale: 1.013,
        transition: { type: "spring", stiffness: 260, damping: 24 },
      }}
      style={{
        width: "clamp(290px, 29vw, 420px)",
        height: "100%",
        flexShrink: 0,
        marginRight: "clamp(12px, 1.6vw, 20px)",
        position: "relative",
        overflow: "hidden",
        background: "var(--c-surface-2)",
        borderTop: "2px solid var(--c-accent)",
        cursor: "pointer",
      }}
    >
      <div style={{ height: "52%", overflow: "hidden" }}>
        <motion.img
          src={svc.img}
          alt={svc.title}
          whileHover={{
            scale: 1.07,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.86) saturate(0.82)",
            display: "block",
          }}
        />
      </div>

      {/* Spotlight */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(circle 200px at ${gx}% ${gy}%, rgba(197,164,110,0.10) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          padding: "clamp(18px, 2.2vw, 32px)",
          height: "48%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(60px, 8vw, 80px)",
              fontStyle: "italic",
              color: "var(--c-accent-rich)",
              opacity: 0.3,
              lineHeight: 0.82,
              display: "block",
              userSelect: "none",
              marginBottom: "8px",
            }}
          >
            {svc.num}
          </span>
          <p
            style={{
              fontFamily: "var(--f-label)",
              fontSize: "9px",
              letterSpacing: "var(--ls-label)",
              textTransform: "uppercase",
              color: "var(--c-accent-rich)",
              marginBottom: "4px",
            }}
          >
            {svc.sub}
          </p>
          <h3
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-h3)",
              color: "var(--c-text-dark)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.1,
              marginBottom: "6px",
            }}
          >
            {svc.title}
          </h3>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "11px",
              color: "var(--c-accent-rich)",
              fontWeight: 500,
              letterSpacing: "0.04em",
              marginBottom: "8px",
            }}
          >
            {svc.catchphrase}
          </p>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-body)",
              color: "var(--c-muted-dark)",
              fontWeight: 300,
              lineHeight: 1.8,
              maxWidth: "270px",
            }}
          >
            {svc.body}
          </p>
        </div>
        <Link
          to={svc.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontFamily: "var(--f-label)",
            fontSize: "9px",
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
            color: "var(--c-accent-rich)",
            width: "fit-content",
            transition: "gap 0.3s var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.gap = "22px";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.gap = "10px";
          }}
        >
          {svc.cta} <span style={{ fontSize: "14px" }}>→</span>
        </Link>
      </div>
    </motion.div>
  );
});

function ServicesScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Desktop only: horizontal pinned scroll
      // On mobile the CSS h-scroll-track/h-scroll-panel classes turn this into
      // a vertical stack — no pin needed (and pin would break mobile layout).
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const getW = () => trackRef.current!.scrollWidth - window.innerWidth;
        gsap.to(trackRef.current, {
          x: () => -getW(),
          ease: "none",
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: () => `+=${getW() + window.innerWidth * 0.35}`,
            pin: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={wrapRef}
      className="h-scroll-container has-abs-header"
      style={{
        overflow: "hidden",
        background: "var(--c-surface)",
        position: "relative",
        // zIndex: 1 — explicitly below WatchCanvas (zIndex: 20).
        // GSAP anticipatePin briefly makes this section position:fixed; without
        // an explicit z-index it would stack above WatchCanvas (later in DOM order).
        zIndex: 1,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="h-scroll-header"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 5,
          padding: "var(--s-sm) var(--gutter)",
          pointerEvents: "none",
        }}
      >
        <span style={{ ...lbl, color: "var(--c-accent-rich)" }}>
          What We Do
        </span>
        <p
          className="services-mobile-title"
          style={{
            fontFamily: "var(--f-display)",
            fontSize: "var(--t-h3)",
            color: "var(--c-text-dark)",
            fontStyle: "italic",
            fontWeight: 400,
            lineHeight: 1.1,
            marginTop: "6px",
            maxWidth: "100%",
          }}
        >
          Three ways to begin.
        </p>
      </motion.div>

      <div
        ref={trackRef}
        className="h-scroll-track"
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "max-content",
          height: "100vh",
        }}
      >
        <div className="hide-mobile" style={{ width: "clamp(200px, 25vw, 360px)", flexShrink: 0 }} />
        {SERVICES.map((svc) => (
          <SvcCard key={svc.num} svc={svc} />
        ))}
        <div className="hide-mobile" style={{ width: "clamp(32px, 5vw, 64px)", flexShrink: 0 }} />
      </div>
    </section>
  );
}



// ═════════════════════════════════════════════════════════════════════════════
// S7 — THE EXCHANGE  (sell/trade + source split-grid)
// Brief scene 7: split grid with gotham-sell-trade.jpg / gotham-source-hero.jpg
// ═════════════════════════════════════════════════════════════════════════════
function ExchangeScene() {
  return (
    <section
      style={{
        background: "var(--c-void)",
        overflow: "hidden",
        position: "relative",
        zIndex: 3,
      }}
    >
      <div
        className="exchange-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "72vh",
        }}
      >
        {/* Left — Sell / Trade */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src="/assets/gotham-sell-trade.jpg"
            alt="Sell or trade your watch"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.26) saturate(0.55)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(140deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.32) 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "var(--s-xl) var(--s-lg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              height: "100%",
              minHeight: "72vh",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            >
              <span style={lbl}>The Exchange</span>
              <h2
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-h2)",
                  color: "var(--c-white)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1.0,
                  letterSpacing: "var(--ls-display)",
                  marginBottom: "16px",
                }}
              >
                Sell or trade
                <br />
                your timepiece.
              </h2>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-body)",
                  color: "rgba(240,235,227,0.40)",
                  fontWeight: 300,
                  lineHeight: 1.82,
                  maxWidth: "340px",
                  marginBottom: "34px",
                }}
              >
                Fair quotes based on real market value. Rolex, Patek Philippe,
                AP, Cartier, Richard Mille — we buy them all, same day.
              </p>
              <MagneticBtn href="tel:+19177570314">
                <span className="btn-primary">Get a Quote</span>
              </MagneticBtn>
            </motion.div>
          </div>
        </div>

        {/* Right — Source */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderLeft: "1px solid rgba(197,164,110,0.07)",
          }}
        >
          <img
            src="/assets/gotham-source-hero.jpg"
            alt="Source a specific watch"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(0.26) saturate(0.55)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(220deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.32) 100%)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "var(--s-xl) var(--s-lg)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              height: "100%",
              minHeight: "72vh",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.95,
                delay: 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <span style={lbl}>Source for You</span>
              <h2
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-h2)",
                  color: "var(--c-white)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1.0,
                  letterSpacing: "var(--ls-display)",
                  marginBottom: "16px",
                }}
              >
                Looking for a<br />
                specific reference?
              </h2>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-body)",
                  color: "rgba(240,235,227,0.40)",
                  fontWeight: 300,
                  lineHeight: 1.82,
                  maxWidth: "340px",
                  marginBottom: "34px",
                }}
              >
                Tell us exactly what you want. We have contacts across the
                Diamond District and beyond. If it exists, we find it.
              </p>
              <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
                <span className="btn-outline">Make a Request</span>
              </MagneticBtn>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// S6 — COLLECTION  (asymmetric 3D-tilt bento)
// ═════════════════════════════════════════════════════════════════════════════
const WATCHES = [
  {
    img: "/assets/gotham-rolex-sub.jpg",
    name: "Submariner Date",
    ref_: "126610LN",
    brand: "Rolex",
  },
  {
    img: "/assets/gotham-patek-nautilus.jpg",
    name: "Nautilus 5711",
    ref_: "5711/1A",
    brand: "Patek Philippe",
  },
  {
    img: "/assets/gotham-ap-product.jpg",
    name: "Royal Oak 33mm",
    ref_: "77350ST",
    brand: "Audemars Piguet",
  },
  {
    img: "/assets/gotham-cartier-1.jpg",
    name: "Santos Chronograph",
    ref_: "W2SA0008",
    brand: "Cartier",
  },
];

function CollectionScene() {
  return (
    <section
      style={{
        background: "var(--c-void)",
        padding: "var(--s-xl) var(--gutter)",
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginBottom: "clamp(32px, 4vw, 60px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <span style={lbl}>In Stock · Price on Request</span>
            <h2
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "var(--t-h1)",
                color: "var(--c-white)",
                fontStyle: "italic",
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: "var(--ls-heading)",
                marginTop: "8px",
              }}
            >
              The Collection.
            </h2>
          </div>
          <MagneticBtn href="/timepieces">
            <span className="btn-outline">View All Timepieces</span>
          </MagneticBtn>
        </motion.div>

        {/* Asymmetric 2fr 1fr 1fr — collapses responsively via classes in globals.css */}
        <div className="bento-grid">
          <div className="bento-item-large">
            <WatchTiltCard {...WATCHES[0]} delay={0} />
          </div>
          <div>
            <WatchTiltCard {...WATCHES[1]} delay={0.07} />
          </div>
          <div>
            <WatchTiltCard {...WATCHES[2]} delay={0.14} />
          </div>
          <div className="bento-item-wide">
            <WatchTiltCard {...WATCHES[3]} delay={0.2} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// S6 — THE CITY  (parallax closing)
// ═════════════════════════════════════════════════════════════════════════════
function CityScene() {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imgRef.current,
        { y: "-8%" },
        {
          y: "8%",
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "82vh",
        display: "flex",
        alignItems: "center",
        background: "#050505",
        zIndex: 5,
      }}
    >
      <img
        ref={imgRef}
        src="/assets/gotham-newyork.jpg"
        alt="Manhattan"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "120%",
          objectFit: "cover",
          filter: "brightness(0.18) saturate(0.3)",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.08) 100%)",
        }}
      />

      {/* Gold vertical rule */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          bottom: "14%",
          left: "var(--gutter)",
          width: "1px",
          background:
            "linear-gradient(to bottom, transparent, rgba(197,164,110,0.48) 30%, rgba(197,164,110,0.48) 70%, transparent)",
        }}
      />

      <div
        className="grid-2col city-scene-content"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "var(--max-w)",
          width: "100%",
          margin: "0 auto",
          padding: "var(--s-xl) var(--gutter)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--s-lg)",
          alignItems: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={lbl}>Find Us</span>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-h1)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.0,
              letterSpacing: "var(--ls-heading)",
              marginTop: "12px",
            }}
          >
            23 West
            <br />
            47th Street.
          </h2>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-body)",
              color: "rgba(197,164,110,0.48)",
              letterSpacing: "0.08em",
              marginTop: "16px",
            }}
          >
            Manhattan Diamond District
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "var(--c-muted)",
              marginBottom: "6px",
              fontWeight: 300,
              lineHeight: 1.82,
            }}
          >
            Suite 402, Manhattan, New York 10036.
          </p>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "var(--c-muted)",
              marginBottom: "46px",
              fontWeight: 300,
              lineHeight: 1.82,
            }}
          >
            Monday through Friday, 9am to 5pm.
            <br />
            Appointments preferred. Walk-ins welcome.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Call Now</span>
            </MagneticBtn>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
              <span className="btn-outline">Send a Message</span>
            </MagneticBtn>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// LEAD CAPTURE  — homepage inquiry form
// Client goal: "build leads forms and recurring new business"
// ═════════════════════════════════════════════════════════════════════════════
function LeadCaptureScene() {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const name = nameRef.current?.value.trim() ?? ''
    const email = emailRef.current?.value.trim() ?? ''
    const phone = phoneRef.current?.value.trim() ?? ''
    const message = messageRef.current?.value.trim() ?? ''

    const subject = encodeURIComponent('Website Inquiry' + (name ? ` — ${name}` : ''))
    const body = encodeURIComponent(
      [
        name && `Name: ${name}`,
        email && `Email: ${email}`,
        phone && `Phone: ${phone}`,
        message && `\nMessage:\n${message}`,
      ].filter(Boolean).join('\n')
    )

    window.location.href = `mailto:sales@gothamcityjewelers.com?subject=${subject}&body=${body}`
  }

  return (
    <section
      style={{
        background: "var(--c-dark)",
        padding: "var(--s-xl) var(--gutter)",
        position: "relative",
        zIndex: 4,
      }}
    >
      <div
        className="grid-2col"
        style={{
          maxWidth: "var(--max-w)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--s-lg)",
          alignItems: "center",
        }}
      >
        {/* ── Left: copy ── */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={lbl}>Start the Conversation</span>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-h1)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: "var(--lh-display)",
              letterSpacing: "var(--ls-display)",
              maxWidth: "480px",
              marginTop: "14px",
              marginBottom: "22px",
            }}
          >
            Every piece begins
            <br />
            with a question.
          </h2>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "rgba(240,235,227,0.42)",
              fontWeight: 300,
              lineHeight: 1.82,
              maxWidth: "390px",
              marginBottom: "40px",
            }}
          >
            Custom engagement rings, certified timepieces, anniversary pieces.
            We respond the same day — no pressure, no minimums, no timelines
            until you're ready.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <a
              href="tel:+19177570314"
              style={{
                fontFamily: "var(--f-label)",
                fontSize: "9px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--c-accent)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ width: "28px", height: "1px", background: "var(--c-accent)", display: "inline-block", flexShrink: 0 }} />
              +1 917 757 0314
            </a>
            <a
              href="mailto:sales@gothamcityjewelers.com"
              style={{
                fontFamily: "var(--f-label)",
                fontSize: "9px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(240,235,227,0.32)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ width: "28px", height: "1px", background: "rgba(240,235,227,0.22)", display: "inline-block", flexShrink: 0 }} />
              sales@gothamcityjewelers.com
            </a>
          </div>
        </motion.div>

        {/* ── Right: inquiry form ── */}
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.14 }}
        >
          <div
            style={{
              background: "var(--c-void)",
              border: "1px solid rgba(197,164,110,0.1)",
              padding: "var(--s-md)",
            }}
          >
            <span style={{ ...lbl, marginBottom: "28px" }}>Inquiry</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Visually-hidden labels for screen readers */}
              <label htmlFor="lc-name" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Your Name</label>
              <input
                ref={nameRef}
                id="lc-name"
                type="text"
                placeholder="Your Name"
                autoComplete="name"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(197,164,110,0.1)",
                  borderRadius: 0,
                  padding: "14px 16px",
                  color: "var(--c-text)",
                  fontFamily: "var(--f-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.1)"; }}
              />

              <label htmlFor="lc-email" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Email Address</label>
              <input
                ref={emailRef}
                id="lc-email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(197,164,110,0.1)",
                  borderRadius: 0,
                  padding: "14px 16px",
                  color: "var(--c-text)",
                  fontFamily: "var(--f-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.1)"; }}
              />

              <label htmlFor="lc-phone" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Phone (optional)</label>
              <input
                ref={phoneRef}
                id="lc-phone"
                type="tel"
                placeholder="Phone (optional)"
                autoComplete="tel"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(197,164,110,0.1)",
                  borderRadius: 0,
                  padding: "14px 16px",
                  color: "var(--c-text)",
                  fontFamily: "var(--f-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.1)"; }}
              />

              <label htmlFor="lc-message" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>Your message</label>
              <textarea
                ref={messageRef}
                id="lc-message"
                placeholder="What are you looking for? (ring, timepiece, custom piece, budget...)"
                rows={3}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(197,164,110,0.1)",
                  borderRadius: 0,
                  padding: "14px 16px",
                  color: "var(--c-text)",
                  fontFamily: "var(--f-body)",
                  fontSize: "13px",
                  letterSpacing: "0.02em",
                  outline: "none",
                  width: "100%",
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(197,164,110,0.1)"; }}
              />
              <button
                className="btn-primary"
                style={{ justifyContent: "center", width: "100%", marginTop: "4px" }}
                type="button"
                onClick={handleSubmit}
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// BRAND MARQUEE
// ═════════════════════════════════════════════════════════════════════════════
const BRANDS = [
  "Rolex",
  "Patek Philippe",
  "Audemars Piguet",
  "Cartier",
  "Richard Mille",
  "Vacheron Constantin",
  "A. Lange & Söhne",
  "Jaeger-LeCoultre",
];

function BrandMarquee() {
  return (
    <div
      style={{
        background: "var(--c-void)",
        borderTop: "1px solid rgba(197,164,110,0.07)",
        borderBottom: "1px solid rgba(197,164,110,0.07)",
        overflow: "hidden",
        padding: "17px 0",
      }}
    >
      <motion.div
        animate={{ x: [0, "-33.333%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", width: "max-content" }}
      >
        {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--f-label)",
              fontSize: "9px",
              letterSpacing: "var(--ls-label)",
              textTransform: "uppercase",
              color: "rgba(197,164,110,0.32)",
              whiteSpace: "nowrap",
              padding: "0 clamp(24px, 4vw, 54px)",
            }}
          >
            {b}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// GOLD DIVIDER
// ═════════════════════════════════════════════════════════════════════════════
const GoldLine = ({ opacity = 0.6 }: { opacity?: number }) => (
  <div
    style={{
      height: "1px",
      background: `linear-gradient(to right, transparent, rgba(197,164,110,${opacity}) 30%, rgba(197,164,110,${opacity * 1.15}) 50%, rgba(197,164,110,${opacity}) 70%, transparent)`,
    }}
  />
);

// ═════════════════════════════════════════════════════════════════════════════
// HOME
// ═════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [loaded, setLoaded] = useState(_loaderShown);

  const handleLoaderDone = useCallback(() => {
    _loaderShown = true;
    setLoaded(true);
    // Double-RAF: first frame lets React flush layout changes from the loader exit,
    // second frame runs after the browser has repainted — guarantees all pin spacers
    // are calculated against final computed positions, not the loader-covered layout.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
  }, []);

  useEffect(() => {
    // Refresh ScrollTrigger when window fully loads all assets (images, fonts, stylesheets)
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("load", handleLoad);
    
    // Refresh ScrollTrigger when DOM is fully settled
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });

    // Refresh periodically during first few seconds to account for images/lazy media loading
    const intervals = [300, 700, 1500, 3000, 5000];
    const timers = intervals.map(delay => setTimeout(() => {
      ScrollTrigger.refresh();
    }, delay));

    return () => {
      window.removeEventListener("load", handleLoad);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <>
      {/* Cinematic preloader — fixed, covers site, slides up when done */}
      {!_loaderShown && <LoadingScreen onDone={handleLoaderDone} />}

      <Nav />
      <main style={{ overflowX: "hidden", background: "var(--c-void)" }}>
        {/* S1 — Hero (content reveals as you scroll) */}
        <HeroScene live={loaded} />
        <GoldLine />

        {/* S2 — THE VAULT ★ scroll-driven watch rotation ★ */}
        <VaultScene />
        <GoldLine opacity={0.32} />

        {/* Merged Brand Statement & Ring Studio Scene with movement macro background video */}
        <MergedStatementRingScene />

        {/* Brand strip */}
        <BrandMarquee />
        <GoldLine opacity={0.32} />

        {/* S5 — Services horizontal */}
        <ServicesScene />
        <GoldLine opacity={0.32} />

        {/* S6 — Collection bento */}
        <CollectionScene />
        <GoldLine opacity={0.22} />

        {/* S7 — The Exchange (sell/trade + source split-grid) */}
        <ExchangeScene />
        <GoldLine opacity={0.32} />

        {/* Lead Capture — homepage inquiry form */}
        <LeadCaptureScene />
        <GoldLine opacity={0.22} />

        {/* The City — parallax closing visual */}
        <CityScene />
      </main>
      <Footer />
    </>
  );
}
