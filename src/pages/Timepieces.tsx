import { useLayoutEffect, useRef, useEffect, useCallback, useState } from "react";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Nav,
  Footer,
  MagneticBtn,
  Pic,
  ScrollReveal,
  WatchTiltCard,
  WatchCanvas,
} from "@/components";

// ─────────────────────────────────────────────────────────────────────────────
// Shared label style
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--f-label)",
  fontSize:      "9px",
  letterSpacing: "var(--ls-label)",
  textTransform: "uppercase",
  color:         "var(--c-accent)",
  display:       "block",
  marginBottom:  "16px",
};

const divider = (
  <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.6) 30%, rgba(201,168,76,0.9) 50%, rgba(201,168,76,0.6) 70%, transparent)" }} />
);

// ── util ─────────────────────────────────────────────────────────────────────
const c01 = (v: number) => Math.max(0, Math.min(1, v));

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2: VAULT — Scroll-driven watch frame animation (original GSAP-ref approach)
// ─────────────────────────────────────────────────────────────────────────────
function VaultScene() {
  const p1     = useRef<HTMLDivElement>(null);
  const p2     = useRef<HTMLDivElement>(null);
  const p3     = useRef<HTMLDivElement>(null);
  const p1Wrap = useRef<HTMLDivElement>(null);
  const p2Wrap = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Desktop: all panels start hidden and are driven by onProgress scroll callback
      gsap.set([p1.current, p2.current, p3.current], { opacity: 0, y: 70, immediateRender: true });
      gsap.set([p1Wrap.current, p2Wrap.current], { opacity: 0, pointerEvents: "none", immediateRender: true });
    });
    mm.add("(max-width: 767px)", () => {
      // Mobile: WatchCanvas sticky scroll-listener drives onProgress.
      // Side panels stay hidden (they'd overlap at the same absolute position on mobile).
      // P3 starts hidden and animates in via onProgress at 82%+ scroll.
      gsap.set([p1Wrap.current, p2Wrap.current], { opacity: 0, pointerEvents: "none", immediateRender: true });
      gsap.set(p3.current, { opacity: 0, y: 60, immediateRender: true });
    });
    return () => mm.revert();
  }, []);

  const onProgress = useCallback((prog: number) => {
    // P1 "Mechanical." — enter 8→22%, hold, exit 35→46%
    const p1i = c01((prog - 0.08) / 0.14);
    const p1o = c01((prog - 0.35) / 0.11);
    const p1val = p1i - p1o;
    if (p1.current) gsap.set(p1.current, { opacity: p1val, y: (1 - p1i) * 70 - p1o * 50, immediateRender: false });
    if (p1Wrap.current) gsap.set(p1Wrap.current, { opacity: p1val, pointerEvents: p1val > 0.01 ? "auto" : "none", immediateRender: false });

    // P2 "Perfected." — enter 50→64%, hold, exit 68→79%
    const p2i = c01((prog - 0.5) / 0.14);
    const p2o = c01((prog - 0.68) / 0.11);
    const p2val = p2i - p2o;
    if (p2.current) gsap.set(p2.current, { opacity: p2val, y: (1 - p2i) * 70 - p2o * 50, immediateRender: false });
    if (p2Wrap.current) gsap.set(p2Wrap.current, { opacity: p2val, pointerEvents: p2val > 0.01 ? "auto" : "none", immediateRender: false });

    // P3 CTA — enter 82%+
    const p3i = c01((prog - 0.82) / 0.1);
    if (p3.current) gsap.set(p3.current, { opacity: p3i, y: (1 - p3i) * 60, immediateRender: false });
  }, []);

  return (
    <WatchCanvas
      totalFrames={193}
      framesPath="/assets/watch-frames-new"
      scrubLength="320%"
      onProgress={onProgress}
    >
          {/* Radial vignette */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 52% 62% at 50% 50%, transparent 0%, rgba(0,0,0,0.82) 100%)" }} />
          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "44%", pointerEvents: "none", background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)" }} />

          {/* P1 — Rolex Submariner */}
          <div className="vault-panel-1" ref={p1Wrap}>
            <div ref={p1}>
              <span style={labelStyle}>Rolex · In Stock</span>
              <p style={{ fontFamily: "var(--f-display)", fontSize: "clamp(38px, 6.5vw, 106px)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 0.9, letterSpacing: "var(--ls-display)" }}>
                Submariner<br />Date.
              </p>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-body)", color: "rgba(240,234,196,0.36)", fontWeight: 300, lineHeight: 1.8, marginTop: "20px", maxWidth: "260px", textAlign: "center", marginInline: "auto" }}>
                Ref. 126610LN. Oystersteel.<br />Ceramic bezel. 300m. Authenticated.
              </p>
            </div>
          </div>

          {/* P2 — Authentication standard */}
          <div className="vault-panel-2" ref={p2Wrap}>
            <div ref={p2}>
              <p style={{ fontFamily: "var(--f-display)", fontSize: "clamp(38px, 6.5vw, 106px)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 0.9, letterSpacing: "var(--ls-display)" }}>
                14-Point<br />Cleared.
              </p>
              <span style={{ ...labelStyle, textAlign: "inherit", marginTop: "14px", marginBottom: 0 }}>Every Reference · Every Time</span>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-body)", color: "rgba(240,234,196,0.36)", fontWeight: 300, lineHeight: 1.8, marginTop: "12px" }}>
                Nothing enters the case without passing<br />our full authentication standard.
              </p>
            </div>
          </div>

          {/* P3 — CTA */}
          <div className="vault-p3-wrap" style={{ position: "absolute", bottom: "var(--s-sm)", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
            <div ref={p3} style={{ textAlign: "center" }}>
              <p className="vault-brand-list" style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", marginBottom: "24px", whiteSpace: "nowrap" }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3: PROVENANCE — 4 clean stats
// ─────────────────────────────────────────────────────────────────────────────

const PROVENANCE = [
  { num: "14",   line1: "Point",      line2: "Inspection",         note: "Every reference cleared before it reaches you." },
  { num: "40+",  line1: "Years",      line2: "On 47th Street",     note: "New York's diamond district since 1985." },
  { num: "100%", line1: "Pieces",     line2: "Authenticated",      note: "We have never sold a piece we weren't certain of." },
  { num: "GIA",  line1: "Certified",  line2: "Staff",              note: "Swiss-trained. Professionally certified." },
];

function ProvenanceStats() {
  return (
    <section style={{ background: "var(--bg-void-grad)", padding: "var(--s-xl) var(--gutter)" }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
        {/* 4-stat row */}
        <div className="provenance-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid rgba(201,168,76,0.12)", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
          {PROVENANCE.map((s, i) => (
            <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16,1,0.3,1], delay: i * 0.08 }}
              style={{ padding: "clamp(28px,4vh,52px) clamp(16px,2.5vw,36px)", borderLeft: i > 0 ? "1px solid rgba(201,168,76,0.08)" : "none" }}>
              <p style={{ fontFamily: "var(--f-display)", fontSize: "clamp(30px,4.5vw,60px)", color: "var(--c-accent)", fontStyle: "italic", fontWeight: 400, lineHeight: 1, marginBottom: "14px" }}>{s.num}</p>
              <p style={{ fontFamily: "var(--f-label)", fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--c-white)", lineHeight: 1.6, marginBottom: "10px" }}>{s.line1}<br />{s.line2}</p>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "rgba(240,234,196,0.32)", fontWeight: 300, lineHeight: 1.7 }}>{s.note}</p>
            </motion.div>
          ))}
        </div>
        {/* Quote */}
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.35 }}
          style={{ fontFamily: "var(--f-display)", fontSize: "clamp(15px,1.4vw,20px)", color: "rgba(240,234,196,0.22)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.65, maxWidth: "560px", margin: "var(--s-md) auto 0", textAlign: "center", letterSpacing: "var(--ls-display)" }}>
          "In 40 years on 47th Street, we've never sold a piece we weren't certain of."
        </motion.p>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4: THE HOUSES — Brand horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────
const BRANDS = [
  {
    name:  "Rolex",
    since: "Est. 1905",
    desc:  "The standard every other watch is measured against. Set in 1905 and never lowered. Every reference authenticated before it leaves our hands.",
    img:   "/assets/gotham-brand-rolex.webp",
    watch: "/assets/gotham-rolex-sub.webp",
  },
  {
    name:  "Audemars Piguet",
    since: "Est. 1875",
    desc:  "The Royal Oak didn't just change watchmaking — it ended an era. Our AP inventory is sourced exclusively from verified private collectors.",
    img:   "/assets/gotham-brand-ap.webp",
    watch: "/assets/gotham-ap-product.webp",
  },
  {
    name:  "Patek Philippe",
    since: "Est. 1839",
    desc:  "You never actually own a Patek Philippe. You merely look after it for the next generation. We look after it before it reaches you.",
    img:   "/assets/gotham-brand-patek.webp",
    watch: "/assets/gotham-patek-nautilus.webp",
  },
  {
    name:  "Cartier",
    since: "Est. 1847",
    desc:  "The jeweler of kings. The king of jewelers. Santos, Tank, Panthère — every piece certified, every provenance verified.",
    img:   "/assets/gotham-brand-cartier.webp",
    watch: "/assets/gotham-cartier-1.webp",
  },
  {
    name:  "Richard Mille",
    since: "Est. 2001",
    desc:  "Where Formula 1 meets haute horology. The most technically demanding watches ever made — and the rarest. Limited production. No exceptions.",
    img:   "/assets/gotham-brand-rm.webp",
    watch: "/assets/gotham-banner-rm.webp",
  },
];

function TheHouses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current!;
        const getTotal = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x:    () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger:          containerRef.current,
            start:            "top top",
            end:              () => `+=${getTotal()}`,
            pin:              true,
            anticipatePin:    1,
            scrub:            1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* DESKTOP */}
      <div ref={containerRef} className="h-scroll-container hide-mobile" style={{ overflow: "hidden", background: "var(--bg-void-grad)" }}>
        <div ref={trackRef} className="h-scroll-track" style={{ display: "flex", width: "max-content", willChange: "transform" }}>

          {/* Intro panel */}
          <div className="h-scroll-panel h-scroll-panel-text" style={{
            width: "40vw", height: "100vh", display: "flex", flexDirection: "column",
            justifyContent: "center", padding: "var(--s-lg) var(--gutter)", flexShrink: 0,
            borderRight: "1px solid var(--c-border)",
          }}>
            <span style={labelStyle}>The Houses</span>
            <h2 style={{
              fontFamily:    "var(--f-display)",
              fontSize:      "var(--t-h2)",
              color:         "var(--c-white)",
              fontStyle:     "italic",
              fontWeight:     400,
              lineHeight:    "var(--lh-display)",
              letterSpacing: "var(--ls-display)",
              marginBottom:  "18px",
            }}>
              Five names.<br />No compromises.
            </h2>
            <p style={{
              fontFamily: "var(--f-display)",
              fontSize:   "clamp(16px,1.6vw,22px)",
              color:      "var(--c-accent)",
              fontStyle:  "italic",
              fontWeight:  400,
              lineHeight:  1.2,
              marginBottom: "22px",
            }}>
              If it isn't on this list,<br />we don't carry it.
            </p>
            <p style={{
              fontFamily: "var(--f-body)",
              fontSize:   "var(--t-sub)",
              color:      "var(--c-muted)",
              fontWeight:  300,
              lineHeight:  1.85,
              maxWidth:   "300px",
            }}>
              Every timepiece authenticated. Every seller verified. Every watch
              inspected to our 14-point standard before it reaches you.
            </p>
          </div>

          {/* Brand panels */}
          {BRANDS.map((brand) => (
            <div key={brand.name} className="h-scroll-panel" style={{
              width: "45vw", height: "100vh", position: "relative", overflow: "hidden", flexShrink: 0,
            }}>
              <img
                src={brand.watch}
                alt={brand.name}
                loading="lazy"
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", filter: "brightness(0.30) saturate(0.8)",
                  transition: "transform 0.9s var(--ease-out)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.06) 100%)",
              }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(20px,4vw,40px) var(--gutter)" }}>
                <img
                  src={brand.img}
                  alt={brand.name}
                  loading="lazy"
                  style={{ height: "30px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.65, marginBottom: "20px" }}
                />
                <span style={{ display: "block", ...labelStyle, marginBottom: "12px" }}>{brand.since}</span>
                <p style={{
                  fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted)",
                  fontWeight: 300, lineHeight: 1.8, maxWidth: "380px", marginBottom: "28px",
                }}>
                  {brand.desc}
                </p>
                <Link to="/timepieces" className="btn-outline" style={{ fontSize: "10px", display: "inline-flex", alignItems: "center" }}>
                  Price on Request →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE stack */}
      <div className="show-mobile-only" style={{ flexDirection: "column", background: "var(--bg-void-grad)" }}>
        <div style={{ padding: "var(--s-lg) var(--gutter) var(--s-md)" }}>
          <span style={labelStyle}>The Houses</span>
          <h2 style={{
            fontFamily: "var(--f-display)", fontSize: "28px", color: "var(--c-white)",
            fontStyle: "italic", fontWeight: 400, lineHeight: 1.2, letterSpacing: "var(--ls-display)", marginBottom: "12px",
          }}>
            Five names.<br />No compromises.
          </h2>
          <p style={{ fontFamily: "var(--f-display)", fontSize: "16px", color: "var(--c-accent)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.2 }}>
            If it isn't on this list,<br />we don't carry it.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {BRANDS.map((brand) => (
            <div key={brand.name} style={{ position: "relative", height: "65vw", overflow: "hidden", flexShrink: 0 }}>
              <img
                src={brand.watch} alt={brand.name}
                loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(0.8)" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)",
              }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px var(--gutter)" }}>
                <img src={brand.img} alt={brand.name} loading="lazy" style={{ height: "22px", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.6, marginBottom: "10px" }} />
                <p style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "rgba(240,234,196,0.42)", fontWeight: 300, lineHeight: 1.7, maxWidth: "280px" }}>{brand.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5: FEATURED WATCHES — Cream grid
// ─────────────────────────────────────────────────────────────────────────────
const WATCHES = [
  { name: "Submariner Date",      ref: "126610LN",    img: "/assets/gotham-rolex-sub.webp",        brand: "Rolex"             },
  { name: "Nautilus 5711",        ref: "5711/1A",     img: "/assets/gotham-patek-nautilus.webp",   brand: "Patek Philippe"    },
  { name: "Santos Chronograph",   ref: "W2SA0008",    img: "/assets/gotham-cartier-1.webp",        brand: "Cartier"           },
  { name: "Royal Oak 33mm",       ref: "77350ST",     img: "/assets/gotham-ap-product.webp",       brand: "Audemars Piguet"   },
  { name: "Submariner Date Gold", ref: "126618LN",    img: "/assets/gotham-rolex-sub-gold.webp",   brand: "Rolex"             },
  { name: "Datejust 41",          ref: "126334",      img: "/assets/gotham-rolex-datejust.webp",   brand: "Rolex"             },
  { name: "GMT-Master II Sprite", ref: "126720VTNR",  img: "/assets/gotham-rolex-gmt.webp",        brand: "Rolex"             },
  { name: "Datejust 36 Rosé",     ref: "126281RBR",   img: "/assets/gotham-rolex-rainbow.webp",    brand: "Rolex"             },
];

const FILTER_BRANDS = ["All", "Rolex", "Audemars Piguet", "Patek Philippe", "Cartier", "Richard Mille", "Vacheron Constantin"];

function FeaturedWatches({ activeBrand, sectionRef }: { activeBrand: string; sectionRef: { current: HTMLElement | null } }) {
  const normalised = activeBrand.trim().toLowerCase();
  const filtered   = !activeBrand || activeBrand === "All"
    ? WATCHES
    : WATCHES.filter((w) => w.brand.toLowerCase() === normalised);

  const hasInventory = filtered.length > 0;

  return (
    <section ref={sectionRef} style={{ background: "var(--c-surface)", padding: "var(--s-xl) var(--gutter)" }}>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
        <ScrollReveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--s-md)", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ ...labelStyle, color: "var(--c-accent-rich)" }}>
                {activeBrand && activeBrand !== "All" ? activeBrand : "Featured"}
              </span>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-text-dark)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.1 }}>
                {activeBrand && activeBrand !== "All" ? `${activeBrand} inventory.` : "Current inventory."}
              </h2>
            </div>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "var(--c-muted-dark)", maxWidth: "280px", textAlign: "right", lineHeight: 1.7, fontWeight: 300 }}>
              All prices on request. Call or email to inquire about availability.
            </p>
          </div>

          {/* Brand filter chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "var(--s-md)" }}>
            {FILTER_BRANDS.map((brand) => {
              const isActive = brand === "All"
                ? (!activeBrand || activeBrand === "All")
                : activeBrand === brand;
              return (
                <Link
                  key={brand}
                  to={brand === "All" ? "/timepieces" : `/timepieces?brand=${encodeURIComponent(brand)}`}
                  style={{
                    fontFamily:    "var(--f-label)",
                    fontSize:      "9px",
                    letterSpacing: "var(--ls-label)",
                    textTransform: "uppercase",
                    padding:       "8px 18px",
                    border:        `1px solid ${isActive ? "var(--c-accent-rich)" : "rgba(50,61,34,0.18)"}`,
                    color:          isActive ? "var(--c-accent-rich)" : "rgba(50,61,34,0.70)",
                    background:     isActive ? "rgba(168,134,79,0.08)" : "rgba(50,61,34,0.04)",
                    transition:    "all 0.22s var(--ease-ui)",
                    whiteSpace:    "nowrap",
                    borderRadius:  "2px",
                  }}
                >
                  {brand}
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        {hasInventory ? (
          <div className="grid-3col">
            {filtered.map((watch, i) => (
              <WatchTiltCard
                key={watch.ref}
                img={watch.img}
                name={watch.name}
                ref_={watch.ref}
                brand={watch.brand}
                delay={i * 0.08}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "var(--s-lg) 0", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "28px", borderTop: "1px solid rgba(50,61,34,0.08)" }}>
            <p style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h3)", color: "var(--c-text-dark)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.15, maxWidth: "480px" }}>
              {activeBrand} pieces are available by private consultation.
            </p>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted-dark)", fontWeight: 300, lineHeight: 1.82, maxWidth: "440px" }}>
              We source specific references on request. Tell us exactly what you're looking for — reference number, condition, year — and we'll find it.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <MagneticBtn href="tel:+19177570314"><span className="btn-ghost">Call to Inquire</span></MagneticBtn>
              <MagneticBtn href={`mailto:sales@gothamcityjewelers.com?subject=Sourcing%20Request%20—%20${encodeURIComponent(activeBrand)}`}><span className="btn-ghost">Email a Request</span></MagneticBtn>
            </div>
          </div>
        )}

        {hasInventory && (
          <ScrollReveal>
            <div style={{ textAlign: "center", paddingTop: "var(--s-lg)" }}>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-body)", color: "var(--c-text-dark)", marginBottom: "28px", fontWeight: 300, lineHeight: 1.82 }}>
                Full inventory available by appointment. Wire transfer accepted.
              </p>
              <MagneticBtn href="tel:+19177570314">
                <span className="btn-primary">Inquire by Phone</span>
              </MagneticBtn>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 6: EXCHANGE — Sell / Trade CTA
// ─────────────────────────────────────────────────────────────────────────────
function ExchangeCTA() {
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
    <section ref={ref} style={{ position: "relative", overflow: "hidden", minHeight: "75vh", display: "flex", alignItems: "center", background: "var(--bg-void-grad)" }}>
      <Pic
        ref={imgRef}
        src="/assets/gotham-sell-trade.webp"
        alt="Sell or trade your luxury watch"
        loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "120%", objectFit: "cover", filter: "brightness(0.25) saturate(0.7)", willChange: "transform" }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 100%)" }} />

      <div style={{
        position: "relative", zIndex: 10, maxWidth: "var(--max-w)", margin: "0 auto",
        padding: "var(--s-xl) var(--gutter)", display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "var(--s-lg)", alignItems: "center", width: "100%",
      }} className="exchange-grid">
        <ScrollReveal>
          <span style={labelStyle}>The Exchange</span>
          <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, lineHeight: 1.08, marginBottom: "22px" }}>
            Sell or trade<br />your timepiece.
          </h2>
          <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted)", fontWeight: 300, lineHeight: 1.8, marginBottom: "40px", maxWidth: "420px" }}>
            Fair quotes based on real market value. NYC-based, trusted. Rolex,
            AP, Patek, Cartier, Richard Mille — we buy them all.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <MagneticBtn href="tel:+19177570314"><span className="btn-primary">Get a Quote</span></MagneticBtn>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com"><span className="btn-outline">Email Photos</span></MagneticBtn>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              { step: "01", text: "Send us photos and the reference number of your piece." },
              { step: "02", text: "Receive a fair market quote within 24 hours."            },
              { step: "03", text: "Accept, ship insured, and receive payment. Done."         },
            ].map((item) => (
              <div key={item.step} style={{ display: "flex", gap: "24px", alignItems: "flex-start", padding: "24px 0", borderBottom: "1px solid var(--c-border)" }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: "32px", color: "var(--c-accent)", fontStyle: "italic", opacity: 0.3, flexShrink: 0, lineHeight: 1 }}>
                  {item.step}
                </span>
                <p style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "var(--c-muted)", fontWeight: 300, lineHeight: 1.75, paddingTop: "4px" }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VAULT HERO SLIDES  — real inventory, 4 brands
// ─────────────────────────────────────────────────────────────────────────────
const VAULT_SLIDES = [
  { img: "/assets/gotham-banner-rolex.webp",  mobileImg: "/assets/gotham-mobile-rolex.webp",   pos: "center center", label: "Rolex · Submariner Date",      ref_: "Ref. 126610LN · In Stock",          h1a: "The one they",  h1b: "all copy.",       sub: "Oystersteel. Ceramic bezel. 300m water resistance. Authenticated." },
  { img: "/assets/gotham-banner-patek.webp",  mobileImg: "/assets/gotham-mobile-patek.webp",   pos: "center center", label: "Patek Philippe · Nautilus",    ref_: "Ref. 5711/1A · Price on Request",    h1a: "You never",     h1b: "own it.",         sub: "Integrated bracelet. 8-day power reserve. You hold it for the next generation." },
  { img: "/assets/gotham-banner-ap.webp",     mobileImg: "/assets/gotham-mobile-ap.webp",      pos: "center center", label: "Audemars Piguet · Royal Oak",  ref_: "Ref. 77350ST · Available",           h1a: "It changed",    h1b: "everything.",     sub: "Gérald Genta. 1972. Grande Tapisserie. Still unmatched." },
  { img: "/assets/gotham-hf-flatlay.webp",    mobileImg: "/assets/gotham-mobile-cartier.webp", pos: "center center", label: "Cartier · Santos Chronograph", ref_: "Ref. W2SA0008 · Available",          h1a: "The first",     h1b: "wristwatch.",     sub: "Built for Santos-Dumont in 1904. The most elegant piece in any room." },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Timepieces() {
  const heroRef      = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLElement>(null);
  const [heroSlide, setHeroSlide] = useState(0);

  const [searchParams] = useSearchParams();
  const activeBrand = searchParams.get("brand") ?? "All";

  useEffect(() => {
    if (activeBrand && activeBrand !== "All") {
      const id = setTimeout(() => {
        inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 320);
      return () => clearTimeout(id);
    }
  }, [activeBrand]);

  useEffect(() => {
    const id = setInterval(() => setHeroSlide(s => (s + 1) % VAULT_SLIDES.length), 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <Nav />

      <main>

        {/* ══ S1: HERO SLIDER — 4 inventory watches ════════════════════ */}
        <div ref={heroRef} className="vault-hero" style={{ position: "relative", overflow: "hidden", background: "#000" }}>

          {/* Crossfading background slides */}
          {VAULT_SLIDES.map((s, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: i === heroSlide ? 1 : 0, transition: "opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1)", pointerEvents: "none" }}>
              {/* <picture> serves portrait AI-generated shots on mobile, landscape banners on desktop */}
              <picture style={{ position: "absolute", inset: 0, display: "block" }}>
                <source media="(max-width: 767px)" srcSet={s.mobileImg} type="image/webp" />
                <img src={s.img} alt="" aria-hidden="true" className="vault-hero-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos, filter: "brightness(0.45) saturate(0.80) contrast(1.08)" }} />
              </picture>
            </div>
          ))}

          {/* Gradient overlays */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.40) 38%, rgba(0,0,0,0.08) 70%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to right, rgba(0,0,0,0.60) 0%, transparent 55%)" }} />

          {/* Animated text content */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "var(--gutter)", paddingBottom: "clamp(28px, 5vh, 56px)", zIndex: 10, maxWidth: "1100px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={{ ...labelStyle, marginBottom: "4px", display: "block" }}>{VAULT_SLIDES[heroSlide].label}</span>
                <span style={{ ...labelStyle, opacity: 0.45, marginBottom: "clamp(12px,2.5vh,24px)", display: "block" }}>{VAULT_SLIDES[heroSlide].ref_}</span>
                <h1 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-hero)", color: "var(--c-white)", lineHeight: "var(--lh-display)", fontStyle: "italic", fontWeight: 400, letterSpacing: "var(--ls-display)", maxWidth: "900px", marginBottom: "clamp(16px,2.5vh,24px)" }}>
                  {VAULT_SLIDES[heroSlide].h1a}<br />{VAULT_SLIDES[heroSlide].h1b}
                </h1>
                <p className="vault-hero-desc" style={{ fontFamily: "var(--f-body)", fontSize: "var(--t-sub)", color: "rgba(240,234,196,0.42)", fontWeight: 300, lineHeight: 1.9, maxWidth: "380px", marginBottom: "clamp(24px,4vh,40px)" }}>
                  {VAULT_SLIDES[heroSlide].sub}
                </p>
              </motion.div>
            </AnimatePresence>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Inquire About a Reference</span>
            </MagneticBtn>
          </div>

          {/* Slide dots */}
          <div style={{ position: "absolute", bottom: "clamp(20px,3.5vh,36px)", right: "var(--gutter)", zIndex: 10, display: "flex", gap: "8px", alignItems: "center" }}>
            {VAULT_SLIDES.map((_, i) => (
              <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setHeroSlide(i)}
                style={{ width: i === heroSlide ? "22px" : "6px", height: "2px", background: i === heroSlide ? "var(--c-accent)" : "rgba(201,168,76,0.28)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.4s ease", outline: "none" }}
              />
            ))}
          </div>

          {/* Address tag */}
          <div className="hide-mobile" style={{ position: "absolute", top: "50%", right: "var(--gutter)", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "right center", fontFamily: "var(--f-label)", fontSize: "8px", letterSpacing: "0.30em", textTransform: "uppercase", color: "rgba(201,168,76,0.22)", whiteSpace: "nowrap", zIndex: 10 }}>
            23 West 47th Street · Suite 402 · Manhattan
          </div>
        </div>

        {divider}

        {/* ══ S2: VAULT — Watch frame animation ════════════════════════ */}
        <VaultScene />

        {divider}

        {/* ══ S3: AUTHENTICATION — 14 Points ═══════════════════════════ */}
        <ProvenanceStats />

        {divider}

        {/* ══ S4: THE HOUSES — Horizontal brand scroll ═════════════════ */}
        <TheHouses />

        {divider}

        {/* ══ S5: FEATURED WATCHES ════════════════════════════════════ */}
        <FeaturedWatches activeBrand={activeBrand} sectionRef={inventoryRef} />

        {divider}

        {/* ══ S6: EXCHANGE CTA ════════════════════════════════════════ */}
        <ExchangeCTA />

      </main>

      <Footer />
    </>
  );
}
