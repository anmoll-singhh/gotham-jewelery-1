/**
 * HOME — Gotham City Jewelers
 *
 * Sequence
 *  S1  HERO SLIDER      3-slide carousel — ring · store · watch
 *  S2  STONE JOURNEY    Scroll-pinned diamond craft narrative → Begin at the Ring Studio
 *  ──  BRAND MARQUEE    Credential strip
 *  S3  QUOTE PANEL      Cream breathing moment — single brand statement
 *  S4  NIGHT REVEAL     NYC skyline → The Standard → Enter the Vault
 *  S5  STORE            Parallax showroom walk-through
 *  S6  CONTACT          Editorial numbered inquiry form
 *  S7  THE CITY         Manhattan address close
 */

import {
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Nav,
  Footer,
  MagneticBtn,
  HeroSkeleton,
  LoadingScreen,
} from "@/components";
import { WatchCanvas } from "@/components/WatchCanvas";

const c01 = (v: number) => Math.max(0, Math.min(1, v));

const lbl: React.CSSProperties = {
  fontFamily:    "var(--f-label)",
  fontSize:      "9px",
  fontWeight:    400,
  letterSpacing: "var(--ls-label)",
  textTransform: "uppercase",
  color:         "var(--c-accent)",
  display:       "block",
  marginBottom:  "18px",
};

const GoldLine = ({ opacity = 0.5 }: { opacity?: number }) => (
  <div style={{
    height:     "1px",
    background: `linear-gradient(to right, transparent, rgba(201,168,76,${opacity}) 30%, rgba(201,168,76,${opacity * 1.1}) 50%, rgba(201,168,76,${opacity}) 70%, transparent)`,
  }} />
);

let _loaderShown = false;


// ═══════════════════════════════════════════════════════════════════════════════
// S1 — HERO SLIDER  (3 slides, crossfade bg, AnimatePresence text)
// ═══════════════════════════════════════════════════════════════════════════════
const HERO_SLIDES = [
  {
    img:   "/assets/gotham-hero-diamond-ring.png",
    pos:   "center 40%",
    label: "Manhattan Diamond District · Est. 47th Street",
    h1a:   "Where every stone",
    h1b:   "carries a promise.",
    sub:   "GIA-certified. Custom-built. Nothing made until you say yes.",
  },
  {
    img:   "/assets/gotham-store-interior-1.jpg",
    pos:   "center 30%",
    label: "23 West 47th Street · Suite 402",
    h1a:   "Forty years.",
    h1b:   "One address.",
    sub:   "New York's most trusted name in diamonds and certified timepieces.",
  },
  {
    img:   "/assets/editorial-wrist.png",
    pos:   "center center",
    label: "Certified Timepieces · The Vault",
    h1a:   "Authenticated.",
    h1b:   "Nothing less.",
    sub:   "14-point inspection. Every piece verified before it enters the case.",
  },
] as const;

function HeroScene({ live }: { live: boolean }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div style={{ position: "relative", height: "100dvh", overflow: "hidden", background: "#000" }}>
      <AnimatePresence>{!live && <HeroSkeleton key="sk" />}</AnimatePresence>

      {HERO_SLIDES.map((s, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: i === slide ? 1 : 0, transition: "opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)", pointerEvents: "none" }}>
          <img src={s.img} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos, filter: "brightness(0.50) saturate(0.65) contrast(1.05)" }} />
        </div>
      ))}

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.40) 38%, rgba(0,0,0,0.08) 70%, transparent 100%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to right, rgba(0,0,0,0.60) 0%, transparent 55%)" }} />

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "var(--gutter)", paddingBottom: "clamp(24px, 5vh, 56px)", zIndex: 10, maxWidth: "1100px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ ...lbl, marginBottom: "20px", display: "block" }}>{current.label}</span>
            {live && (
              <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-hero)", color: "var(--c-white)", lineHeight: "var(--lh-display)", fontStyle: "italic", fontWeight: 400, letterSpacing: "var(--ls-display)", maxWidth: "960px", marginBottom: "28px" }}>
                {current.h1a}<br />{current.h1b}
              </h1>
            )}
            <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.42)", fontWeight: 300, lineHeight: 1.9, maxWidth: "340px", marginBottom: "40px", letterSpacing: "0.012em" }}>
              {current.sub}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <MagneticBtn href="/ring-builder"><span className="btn-primary">Design Your Ring</span></MagneticBtn>
          <MagneticBtn href="/timepieces"><span className="btn-outline">Enter the Vault</span></MagneticBtn>
        </div>
      </div>

      {/* Slide dots */}
      <div style={{ position: "absolute", bottom: "clamp(20px,3.5vh,36px)", right: "var(--gutter)", zIndex: 10, display: "flex", gap: "8px", alignItems: "center" }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)}
            style={{ width: i === slide ? "22px" : "6px", height: "2px", background: i === slide ? "var(--c-accent)" : "rgba(201,168,76,0.28)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.4s ease", outline: "none" }}
          />
        ))}
      </div>

      <div className="hide-mobile" style={{ position: "absolute", top: "50%", right: "var(--gutter)", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center", fontFamily: "var(--f-label)", fontSize: "8px", letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(201,168,76,0.22)", whiteSpace: "nowrap", zIndex: 10 }}>
        23 West 47th Street · Suite 402 · Manhattan
      </div>

      <div className="hide-mobile" style={{ position: "absolute", bottom: "28px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "7px" }}>
        <span style={{ fontFamily: "var(--f-label)", fontSize: "7px", letterSpacing: "0.34em", textTransform: "uppercase", color: "rgba(201,168,76,0.3)" }}>Scroll</span>
        <motion.div animate={{ scaleY: [1, 1.55, 1], opacity: [0.22, 0.65, 0.22] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "1px", height: "38px", background: "linear-gradient(to bottom, rgba(201,168,76,0.65), transparent)", transformOrigin: "top" }} />
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S2 — STONE JOURNEY  (scroll-pinned: rough → GIA → your ring)
// CTA ownership: "Begin at the Ring Studio" — appears nowhere else on page
// ═══════════════════════════════════════════════════════════════════════════════
function StoneJourneyScene() {
  const wrapRef     = useRef<HTMLDivElement>(null);
  const p1Ref       = useRef<HTMLDivElement>(null);
  const p2Ref       = useRef<HTMLDivElement>(null);
  const p3Ref       = useRef<HTMLDivElement>(null);
  const imgRef      = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([p1Ref.current, p2Ref.current, p3Ref.current], { opacity: 0, y: 50, immediateRender: true });
      if (progressRef.current) gsap.set(progressRef.current, { scaleY: 0, transformOrigin: "top center" });

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: wrapRef.current,
          start:   "top top",
          end:     "+=280%",
          pin:     true,
          anticipatePin:    1,
          invalidateOnRefresh: true,
          scrub: 1,
          onUpdate(self) {
            const p = self.progress;

            if (progressRef.current) gsap.set(progressRef.current, { scaleY: p });

            const p1i = c01((p - 0)    / 0.15);
            const p1o = c01((p - 0.30) / 0.12);
            const p1v = p1i - p1o;
            if (p1Ref.current) gsap.set(p1Ref.current, { opacity: p1v, y: (1 - p1i) * 50 - p1o * 40 });

            const p2i = c01((p - 0.38) / 0.14);
            const p2o = c01((p - 0.64) / 0.12);
            const p2v = p2i - p2o;
            if (p2Ref.current) gsap.set(p2Ref.current, { opacity: p2v, y: (1 - p2i) * 50 - p2o * 40 });

            const p3i = c01((p - 0.72) / 0.13);
            if (p3Ref.current) gsap.set(p3Ref.current, { opacity: p3i, y: (1 - p3i) * 50 });

            if (imgRef.current) {
              const bright = 0.12 + p * 0.10;
              imgRef.current.style.filter = `brightness(${bright}) saturate(0.5)`;
            }
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set([p1Ref.current, p2Ref.current, p3Ref.current], { opacity: 1, y: 0, immediateRender: true });
      });
    }, wrapRef);
    return () => ctx.revert();
  }, []);

  const panelBase: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    zIndex: 10, willChange: "opacity, transform",
  };
  const stageLabel: React.CSSProperties = {
    fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "var(--ls-label)",
    textTransform: "uppercase", color: "var(--c-accent)", display: "block", marginBottom: "20px",
  };
  const stageTitle: React.CSSProperties = {
    fontFamily: "var(--f-display)", fontSize: "clamp(48px, 7.5vw, 120px)",
    color: "var(--c-white)", fontStyle: "italic", fontWeight: 400,
    lineHeight: 0.9, letterSpacing: "var(--ls-display)",
  };
  const stageBody: React.CSSProperties = {
    fontFamily: "var(--f-body)", fontSize: "var(--t-body)",
    color: "rgba(240,234,196,0.40)", fontWeight: 300,
    lineHeight: 1.85, maxWidth: "300px", marginTop: "22px", letterSpacing: "0.012em",
  };

  return (
    <section ref={wrapRef} style={{ position: "relative", height: "100dvh", overflow: "hidden", background: "var(--bg-dark-grad)" }}>
      <img
        ref={imgRef}
        src="/assets/gotham-diamond-macro.jpg"
        alt="" aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "brightness(0.12) saturate(0.5)", transition: "filter 0.1s linear", willChange: "filter" }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 70% at 50% 50%, transparent 0%, rgba(0,0,0,0.88) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, var(--c-void) 0%, transparent 30%)" }} />

      {/* Progress bar */}
      <div className="hide-mobile" style={{ position: "absolute", left: "var(--gutter)", top: "15%", bottom: "15%", width: "1px", background: "rgba(201,168,76,0.12)", zIndex: 20 }}>
        <div ref={progressRef} style={{ position: "absolute", top: 0, left: 0, right: 0, background: "var(--c-accent)" }} />
      </div>
      <div className="hide-mobile" style={{ position: "absolute", left: "calc(var(--gutter) - 3px)", top: "15%", bottom: "15%", zIndex: 21, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {["01", "02", "03"].map((n) => (
          <div key={n} style={{ width: "7px", height: "7px", borderRadius: "50%", border: "1px solid rgba(201,168,76,0.4)", background: "var(--c-dark)" }} />
        ))}
      </div>

      {/* Desktop panels */}
      <div className="hide-mobile" style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <div ref={p1Ref} style={{ ...panelBase, left: "clamp(72px, 12vw, 160px)" }}>
          <span style={stageLabel}>Stage 01 · The Earth</span>
          <p style={stageTitle}>Rough.</p>
          <p style={stageBody}>
            Millions of years.<br />One point of light.<br />We source only what passes our loupe.
          </p>
        </div>

        <div ref={p2Ref} style={{ ...panelBase, right: "clamp(72px, 12vw, 160px)", textAlign: "right" }}>
          <span style={{ ...stageLabel, textAlign: "right" }}>Stage 02 · The Standard</span>
          <p style={stageTitle}>Certified.</p>
          <p style={{ ...stageBody, marginLeft: "auto", textAlign: "right" }}>
            GIA graded. 14-point inspection.<br />Nothing leaves before we're certain.
          </p>
        </div>

        <div ref={p3Ref} style={{ position: "absolute", bottom: "var(--s-md)", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center", willChange: "opacity, transform" }}>
          <span style={{ ...lbl, textAlign: "center", marginBottom: "12px" }}>The Ring Studio · Custom Engagement</span>
          <p style={{ fontFamily: "var(--f-display)", fontSize: "clamp(28px, 4vw, 56px)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.0, letterSpacing: "var(--ls-display)", marginBottom: "28px" }}>
            Yours, from the first sketch.
          </p>
          <MagneticBtn href="/ring-builder">
            <span className="btn-primary">Begin at the Ring Studio</span>
          </MagneticBtn>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="show-mobile-only" style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "clamp(48px, 10vw, 72px)", padding: "var(--s-xl) var(--gutter)", minHeight: "100%", justifyContent: "center" }}>
        {[
          { num: "01", label: "The Earth",    title: "Rough.",      body: "Every diamond begins as carbon under pressure — millions of years compressed into light. We source only what passes our loupe on day one." },
          { num: "02", label: "The Standard", title: "Certified.",  body: "GIA grading. Swiss-trained authentication. 14-point inspection before any stone is set. Nothing leaves before we're certain." },
          { num: "03", label: "Your Ring",    title: "Yours.",      body: "Custom settings built from your first conversation. Nothing is made until you say yes." },
        ].map((s) => (
          <motion.div key={s.num} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span style={stageLabel}>Stage {s.num} · {s.label}</span>
            <p style={{ ...stageTitle, fontSize: "clamp(38px, 9vw, 64px)", marginBottom: "16px" }}>{s.title}</p>
            <p style={{ ...stageBody, maxWidth: "100%" }}>{s.body}</p>
          </motion.div>
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          <MagneticBtn href="/ring-builder"><span className="btn-primary">Begin at the Ring Studio</span></MagneticBtn>
        </motion.div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// BRAND MARQUEE
// ═══════════════════════════════════════════════════════════════════════════════
const MARQUEE_BRANDS = ["Rolex", "Patek Philippe", "Audemars Piguet", "Cartier", "Richard Mille", "Vacheron Constantin", "A. Lange & Söhne", "Jaeger-LeCoultre"];

function BrandMarquee() {
  return (
    <div style={{ background: "var(--bg-void-grad)", borderTop: "1px solid rgba(201,168,76,0.07)", borderBottom: "1px solid rgba(201,168,76,0.07)", overflow: "hidden", padding: "17px 0" }}>
      <motion.div
        animate={{ x: [0, "-33.333%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", width: "max-content" }}
      >
        {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b, i) => (
          <span key={i} style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "rgba(201,168,76,0.30)", whiteSpace: "nowrap", padding: "0 clamp(24px, 4vw, 54px)" }}>
            {b}
          </span>
        ))}
      </motion.div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S3 — QUOTE PANEL  (cream breath — single brand statement)
// ═══════════════════════════════════════════════════════════════════════════════
function QuotePanel() {
  return (
    <section style={{ background: "var(--c-surface)", padding: "clamp(72px,14vh,130px) var(--gutter)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(50,61,34,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: "linear-gradient(to right, transparent, var(--c-accent-rich), transparent)", transformOrigin: "left center", marginBottom: "clamp(36px, 5vh, 56px)" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ fontFamily: "var(--f-display)", fontSize: "clamp(22px, 3.2vw, 44px)", color: "var(--c-text-dark)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.4, letterSpacing: "var(--ls-display)", marginBottom: "clamp(24px, 4vh, 40px)" }}
        >
          "In 40 years on 47th Street,<br />we have never sold a piece<br />we weren't certain of."
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--c-accent-rich)", opacity: 0.8, display: "block" }}
        >
          Gotham City Jewelers · Est. 1985 · Manhattan Diamond District
        </motion.span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ height: "1px", background: "linear-gradient(to right, transparent, var(--c-accent-rich), transparent)", transformOrigin: "right center", marginTop: "clamp(36px, 5vh, 56px)" }}
        />
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S4 — NIGHT REVEAL  (WatchCanvas frame-sequence — NYC → The Standard)
// CTA ownership: "Enter the Vault" — appears nowhere else on page
// ═══════════════════════════════════════════════════════════════════════════════
function NightRevealScene() {
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const ctaRef   = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.set([text1Ref.current, text2Ref.current, ctaRef.current], { opacity: 0, y: 44, immediateRender: true });
  }, []);

  const onProgress = useCallback((p: number) => {
    const t1i = c01((p - 0)    / 0.14);
    const t1o = c01((p - 0.32) / 0.12);
    if (text1Ref.current) gsap.set(text1Ref.current, { opacity: t1i - t1o, y: (1 - t1i) * 44 - t1o * 32, immediateRender: false });

    const t2i = c01((p - 0.50) / 0.13);
    const t2o = c01((p - 0.76) / 0.10);
    if (text2Ref.current) gsap.set(text2Ref.current, { opacity: t2i - t2o, y: (1 - t2i) * 44 - t2o * 28, immediateRender: false });

    const ca = c01((p - 0.80) / 0.10);
    if (ctaRef.current) gsap.set(ctaRef.current, { opacity: ca, y: (1 - ca) * 32, immediateRender: false });
  }, []);

  return (
    <>
      {/* Desktop: frame-sequence canvas */}
      <div className="hide-mobile">
        <WatchCanvas
          totalFrames={193}
          framesPath="/assets/nyc-reveal-frames"
          videoSrc="/assets/gotham-nyc-reveal.mp4"
          scrubLength="280%"
          onProgress={onProgress}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 75% 85% at 50% 50%, transparent 0%, rgba(0,0,0,0.50) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 52%)" }} />

          <div ref={text1Ref} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 10, willChange: "opacity, transform", pointerEvents: "none" }}>
            <p style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-hero)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 0.9, letterSpacing: "var(--ls-display)" }}>
              New York.
            </p>
          </div>

          <div ref={text2Ref} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", zIndex: 10, willChange: "opacity, transform", pointerEvents: "none" }}>
            <span style={{ ...lbl, display: "block", textAlign: "center", marginBottom: "16px" }}>The Collector's Standard</span>
            <p style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-hero)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 0.9, letterSpacing: "var(--ls-display)" }}>
              The Standard.
            </p>
          </div>

          <div ref={ctaRef} style={{ position: "absolute", bottom: "clamp(48px,9vh,88px)", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", willChange: "opacity, transform" }}>
            <MagneticBtn href="/timepieces"><span className="btn-primary">Enter the Vault</span></MagneticBtn>
            <MagneticBtn href="/ring-builder"><span className="btn-outline">Design Your Ring</span></MagneticBtn>
          </div>
        </WatchCanvas>
      </div>

      {/* Mobile: autoplay video */}
      <div className="show-mobile-only" style={{ flexDirection: "column", position: "relative", overflow: "hidden", minHeight: "85vmax", background: "#000" }}>
        <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.44)" }}>
          <source src="/assets/gotham-nyc-reveal.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", minHeight: "85vmax", padding: "var(--s-lg) var(--gutter) var(--s-md)", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <span style={{ ...lbl, display: "block", textAlign: "center", marginBottom: "16px" }}>The Collector's Standard</span>
            <p style={{ fontFamily: "var(--f-display)", fontSize: "clamp(38px,9vw,56px)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 0.92, letterSpacing: "var(--ls-display)", marginBottom: "32px" }}>
              New York.<br />The Standard.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <MagneticBtn href="/timepieces"><span className="btn-primary">Enter the Vault</span></MagneticBtn>
              <MagneticBtn href="/ring-builder"><span className="btn-outline">Design Your Ring</span></MagneticBtn>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S5 — STORE WALK-THROUGH  (parallax showroom — 3 depth layers)
// Final layer ends with single direct action: Call Now
// ═══════════════════════════════════════════════════════════════════════════════
function StoreScene() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const layer1Ref   = useRef<HTMLDivElement>(null);
  const layer2Ref   = useRef<HTMLDivElement>(null);
  const layer3Ref   = useRef<HTMLDivElement>(null);
  const text1Ref    = useRef<HTMLDivElement>(null);
  const text2Ref    = useRef<HTMLDivElement>(null);
  const text3Ref    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start:   "top top",
          end:     "+=260%",
          pin:     true,
          anticipatePin:    1,
          invalidateOnRefresh: true,
          scrub: 1,
          onUpdate(self) {
            const p = self.progress;

            if (progressRef.current) gsap.set(progressRef.current, { scaleX: p, transformOrigin: "left center" });

            const l1out = c01(p / 0.30);
            if (layer1Ref.current) gsap.set(layer1Ref.current, { opacity: 1 - l1out * 0.85, scale: 1 + l1out * 0.08 });
            if (text1Ref.current)  gsap.set(text1Ref.current,  { opacity: Math.max(0, 1 - l1out * 2), y: -l1out * 40 });

            const l2i = c01((p - 0.25) / 0.20);
            const l2o = c01((p - 0.65) / 0.13);
            const l2v = l2i * (1 - l2o);
            if (layer2Ref.current) gsap.set(layer2Ref.current, { opacity: l2v, scale: 1 + (1 - l2i) * 0.06 });
            if (text2Ref.current)  gsap.set(text2Ref.current,  { opacity: l2v, y: (1 - l2i) * 30 - l2o * 25 });

            const l3i = c01((p - 0.72) / 0.16);
            if (layer3Ref.current) gsap.set(layer3Ref.current, { opacity: l3i, scale: 1 + (1 - l3i) * 0.05 });
            if (text3Ref.current)  gsap.set(text3Ref.current,  { opacity: l3i, y: (1 - l3i) * 30 });
          },
        });

        if (layer2Ref.current) gsap.set(layer2Ref.current, { opacity: 0, scale: 1.06 });
        if (layer3Ref.current) gsap.set(layer3Ref.current, { opacity: 0, scale: 1.05 });
        if (text2Ref.current)  gsap.set(text2Ref.current,  { opacity: 0, y: 30 });
        if (text3Ref.current)  gsap.set(text3Ref.current,  { opacity: 0, y: 30 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const textBox: React.CSSProperties = {
    position: "absolute", bottom: "clamp(36px, 6vh, 64px)", left: "var(--gutter)",
    zIndex: 20, willChange: "opacity, transform", maxWidth: "520px",
  };

  return (
    <section ref={sectionRef} style={{ position: "relative", height: "100dvh", overflow: "hidden", background: "var(--bg-void-grad)" }}>
      {/* Progress bar */}
      <div className="hide-mobile" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "rgba(201,168,76,0.10)", zIndex: 30 }}>
        <div ref={progressRef} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "100%", background: "var(--c-accent)", willChange: "transform" }} />
      </div>

      <div className="hide-mobile" style={{ position: "absolute", top: "var(--s-sm)", right: "var(--gutter)", zIndex: 30 }}>
        <span style={{ fontFamily: "var(--f-label)", fontSize: "8px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(201,168,76,0.35)" }}>Step Inside</span>
      </div>

      {/* Layer 1: Exterior */}
      <div ref={layer1Ref} style={{ position: "absolute", inset: 0, willChange: "opacity, transform" }}>
        <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.72)" }}>
          <source src="/assets/gotham-showroom-walk.mp4" type="video/mp4" />
        </video>
        <img src="/assets/gotham-store-interior-1.jpg" alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.70)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.10) 50%, transparent 100%)" }} />
        <div ref={text1Ref} style={textBox}>
          <span style={lbl}>23 West 47th Street · Suite 402</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", marginBottom: "16px" }}>
            Step inside.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.45)", fontWeight: 300, lineHeight: 1.82 }}>
            Mon – Fri, 9am – 5pm.
          </p>
        </div>
      </div>

      {/* Layer 2: Display Cases */}
      <div ref={layer2Ref} style={{ position: "absolute", inset: 0, willChange: "opacity, transform" }}>
        <img src="/assets/gotham-store-interior-2.jpg" alt="Jewelry display cases" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.50) saturate(0.65)" }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = "/assets/gotham-hf-flatlay.png"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)" }} />
        <div ref={text2Ref} style={textBox}>
          <span style={lbl}>The Collection · Price on Request</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", marginBottom: "16px" }}>
            Every piece under<br />our loupe first.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.45)", fontWeight: 300, lineHeight: 1.82, marginBottom: "28px" }}>
            Rolex. Patek. AP. Cartier. RM.<br />Authenticated before it reaches the case.
          </p>
          <MagneticBtn href="/timepieces"><span className="btn-outline">View Timepieces</span></MagneticBtn>
        </div>
      </div>

      {/* Layer 3: The Consultation — single CTA: Call */}
      <div ref={layer3Ref} style={{ position: "absolute", inset: 0, willChange: "opacity, transform" }}>
        <img src="/assets/gotham-diamond-macro.jpg" alt="Private consultation" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(0.60)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
        <div ref={text3Ref} style={{ ...textBox, maxWidth: "600px" }}>
          <span style={lbl}>Private Consultation · By Appointment</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", marginBottom: "16px" }}>
            It starts with<br />a conversation.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.45)", fontWeight: 300, lineHeight: 1.82, marginBottom: "32px" }}>
            Same-day response. No pressure. No minimums.
          </p>
          <MagneticBtn href="tel:+19177570314">
            <span className="btn-primary">Call +1 917 757 0314</span>
          </MagneticBtn>
        </div>
      </div>

      {/* Mobile fallback */}
      <div className="show-mobile-only" style={{ display: "none", flexDirection: "column", position: "relative", zIndex: 10 }}>
        {[
          { img: "/assets/gotham-store-interior-1.jpg", label: "23 W 47th Street · Manhattan",    title: "Step inside.",              body: "Monday – Friday, 9am to 5pm. Walk-ins welcome.", cta: null },
          { img: "/assets/gotham-store-interior-2.jpg", label: "The Collection",                   title: "Every piece authenticated.", body: "Rolex, Patek, AP, Cartier, RM — each cleared our 14-point inspection.", cta: { label: "View Timepieces", href: "/timepieces" } },
          { img: "/assets/gotham-diamond-macro.jpg",    label: "Private Consultation",             title: "Begin with a conversation.", body: "Same-day response. No pressure. No minimums.", cta: { label: "Call +1 917 757 0314", href: "tel:+19177570314" } },
        ].map((s, i) => (
          <div key={i} style={{ position: "relative", minHeight: "70vh", overflow: "hidden" }}>
            <img src={s.img} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4) saturate(0.6)" }} onError={e => { (e.currentTarget as HTMLImageElement).src = "/assets/gotham-newyork.jpg"; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 55%)" }} />
            <div style={{ position: "relative", zIndex: 10, padding: "var(--s-xl) var(--gutter) var(--s-md)", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "70vh" }}>
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}>
                <span style={lbl}>{s.label}</span>
                <h3 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: "var(--lh-display)", marginBottom: "12px" }}>{s.title}</h3>
                <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-body)", color: "rgba(240,234,196,0.45)", fontWeight: 300, lineHeight: 1.82, marginBottom: s.cta ? "24px" : "0" }}>{s.body}</p>
                {s.cta && <MagneticBtn href={s.cta.href}><span className="btn-outline">{s.cta.label}</span></MagneticBtn>}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S6 — CONTACT  (editorial numbered form)
// ═══════════════════════════════════════════════════════════════════════════════
const fieldBase: React.CSSProperties = {
  width: "100%", background: "transparent", border: "none",
  borderBottom: "1px solid rgba(201,168,76,0.12)", padding: "10px 0 14px",
  color: "var(--c-text)", fontFamily: "var(--f-body)", fontSize: "15px",
  fontWeight: 300, outline: "none", letterSpacing: "0.01em",
};

function LeadCaptureScene() {
  const nameRef    = useRef<HTMLInputElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const name    = nameRef.current?.value.trim()    ?? "";
    const email   = emailRef.current?.value.trim()   ?? "";
    const message = messageRef.current?.value.trim() ?? "";
    const subject = encodeURIComponent("Website Inquiry" + (name ? ` — ${name}` : ""));
    const body    = encodeURIComponent([
      name    && `Name: ${name}`,
      email   && `Email: ${email}`,
      message && `\nMessage:\n${message}`,
    ].filter(Boolean).join("\n"));
    window.location.href = `mailto:sales@gothamcityjewelers.com?subject=${subject}&body=${body}`;
  };

  const numStyle: React.CSSProperties = {
    fontFamily: "var(--f-display)", fontSize: "clamp(11px,1vw,13px)",
    color: "rgba(201,168,76,0.32)", fontStyle: "italic", paddingTop: "2px", minWidth: "28px", userSelect: "none",
  };
  const fieldLabel: React.CSSProperties = {
    display: "block", fontFamily: "var(--f-label)", fontSize: "8px",
    letterSpacing: "0.32em", textTransform: "uppercase",
    color: "rgba(201,168,76,0.52)", marginBottom: "10px",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = "rgba(201,168,76,0.55)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderBottomColor = "rgba(201,168,76,0.12)";
  };

  return (
    <section style={{ background: "var(--bg-dark-grad)", padding: "var(--s-xl) var(--gutter)", position: "relative", zIndex: 4 }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-xl)", alignItems: "start" }} className="contact-grid">

        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
          <span style={lbl}>Start the Conversation</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)", marginTop: "16px", marginBottom: "var(--s-md)" }}>
            Every piece begins<br />with a question.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: "var(--s-sm)" }}>
            <a href="tel:+19177570314" style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-accent)", fontWeight: 300, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "24px", height: "1px", background: "var(--c-accent)", display: "inline-block", flexShrink: 0 }} />
              +1 917 757 0314
            </a>
            <a href="mailto:sales@gothamcityjewelers.com" style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.32)", fontWeight: 300, letterSpacing: "0.02em", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "24px", height: "1px", background: "rgba(240,234,196,0.18)", display: "inline-block", flexShrink: 0 }} />
              sales@gothamcityjewelers.com
            </a>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "rgba(240,234,196,0.22)", fontWeight: 300, lineHeight: 1.8, maxWidth: "280px", marginTop: "4px" }}>
              Same-day response. No pressure, no minimums, no timelines until you're ready.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", padding: "26px 0" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <span style={numStyle}>01</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="lc-name" style={fieldLabel}>Your Name</label>
                <input ref={nameRef} id="lc-name" type="text" placeholder="First and last name" autoComplete="name" style={fieldBase} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", padding: "26px 0" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <span style={numStyle}>02</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="lc-email" style={fieldLabel}>Email Address</label>
                <input ref={emailRef} id="lc-email" type="email" placeholder="your@email.com" autoComplete="email" style={fieldBase} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", padding: "26px 0" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <span style={numStyle}>03</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="lc-msg" style={fieldLabel}>What are you looking for?</label>
                <textarea ref={messageRef} id="lc-msg" placeholder="Ring, timepiece, custom piece — whatever helps." rows={3} style={{ ...fieldBase, resize: "none" }} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: "28px" }}>
            <button className="btn-primary" type="button" onClick={handleSubmit} style={{ width: "100%", justifyContent: "center" }}>
              Send Inquiry →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// S7 — THE CITY  (parallax close — address only, no duplicate CTAs)
// ═══════════════════════════════════════════════════════════════════════════════
function CityScene() {
  const ref    = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current, { y: "-8%" }, {
        y: "8%", ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} style={{ position: "relative", overflow: "hidden", minHeight: "72vh", display: "flex", alignItems: "center", background: "var(--bg-void-grad)", zIndex: 5 }}>
      <img ref={imgRef} src="/assets/gotham-newyork.jpg" alt="Manhattan" style={{ position: "absolute", inset: 0, width: "100%", height: "120%", objectFit: "cover", filter: "brightness(0.18) saturate(0.28)", willChange: "transform" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.06) 100%)" }} />

      <div style={{ position: "absolute", top: "14%", bottom: "14%", left: "var(--gutter)", width: "1px", background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.48) 30%, rgba(201,168,76,0.48) 70%, transparent)" }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: "var(--max-w)", width: "100%", margin: "0 auto", padding: "var(--s-xl) var(--gutter)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-lg)", alignItems: "center" }} className="city-grid">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}>
          <span style={lbl}>Find Us</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.0, letterSpacing: "var(--ls-heading)", marginTop: "12px" }}>
            23 West<br />47th Street.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-body)", color: "rgba(201,168,76,0.48)", letterSpacing: "0.08em", marginTop: "16px" }}>Manhattan Diamond District</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted)", marginBottom: "6px", fontWeight: 300, lineHeight: 1.82 }}>Suite 402, Manhattan, New York 10036.</p>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted)", fontWeight: 300, lineHeight: 1.82 }}>
            Monday through Friday, 9am to 5pm.<br />Appointments preferred. Walk-ins welcome.
          </p>
        </motion.div>
      </div>
    </section>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// HOME ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const [loaded, setLoaded] = useState(_loaderShown);

  const handleLoaderDone = useCallback(() => {
    _loaderShown = true;
    setLoaded(true);
    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
  }, []);

  useEffect(() => {
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", handleLoad);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    const timers = [300, 700, 1500, 3000, 5000].map(d => setTimeout(() => ScrollTrigger.refresh(), d));
    return () => {
      window.removeEventListener("load", handleLoad);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <>
      {!_loaderShown && <LoadingScreen onDone={handleLoaderDone} />}
      <Nav />
      <main style={{ overflowX: "hidden", background: "var(--bg-void-grad)" }}>

        <HeroScene live={loaded} />
        <GoldLine />

        <StoneJourneyScene />
        <GoldLine opacity={0.3} />

        <BrandMarquee />
        <GoldLine opacity={0.3} />

        <QuotePanel />
        <GoldLine opacity={0.25} />

        <NightRevealScene />
        <GoldLine opacity={0.3} />

        <StoreScene />
        <GoldLine opacity={0.3} />

        <LeadCaptureScene />
        <GoldLine opacity={0.22} />

        <CityScene />

      </main>
      <Footer />
    </>
  );
}
