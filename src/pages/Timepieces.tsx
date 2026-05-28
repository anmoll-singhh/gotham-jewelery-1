import { useLayoutEffect, useRef, useEffect } from "react";
import gsap from "gsap";
import { Link, useSearchParams } from "react-router-dom";
import {
  Nav,
  Footer,
  MagneticBtn,
  ScrollReveal,
  WatchTiltCard,
} from "@/components";

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2: THE HOUSES — Brand horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────
const BRANDS = [
  {
    name:  "Rolex",
    since: "Est. 1905",
    desc:  "The standard every other watch is measured against. Set in 1905 and never lowered. Every reference authenticated before it leaves our hands.",
    img:   "/assets/gotham-brand-rolex.png",
    watch: "/assets/gotham-rolex-sub.jpg",
  },
  {
    name:  "Audemars Piguet",
    since: "Est. 1875",
    desc:  "The Royal Oak didn't just change watchmaking — it ended an era. Our AP inventory is sourced exclusively from verified private collectors.",
    img:   "/assets/gotham-brand-ap.png",
    watch: "/assets/gotham-ap-product.jpg",
  },
  {
    name:  "Patek Philippe",
    since: "Est. 1839",
    desc:  "You never actually own a Patek Philippe. You merely look after it for the next generation. We look after it before it reaches you.",
    img:   "/assets/gotham-brand-patek.png",
    watch: "/assets/gotham-patek-nautilus.jpg",
  },
  {
    name:  "Cartier",
    since: "Est. 1847",
    desc:  "The jeweler of kings. The king of jewelers. Santos, Tank, Panthère — every piece certified, every provenance verified.",
    img:   "/assets/gotham-brand-cartier.png",
    watch: "/assets/gotham-cartier-1.jpg",
  },
  {
    name:  "Richard Mille",
    since: "Est. 2001",
    desc:  "Where Formula 1 meets haute horology. The most technically demanding watches ever made — and the rarest. Limited production. No exceptions.",
    img:   "/assets/gotham-brand-rm.png",
    watch: "/assets/gotham-banner-rm.jpg",
  },
];

function TheHouses() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Desktop only — on mobile CSS converts this to a vertical stack
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current!;
        const getTotal = () => track.scrollWidth - window.innerWidth;

        gsap.to(track, {
          x: () => -getTotal(),
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${getTotal()}`,
            pin: true,
            anticipatePin: 1,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-scroll-container"
      style={{ overflow: "hidden", background: "var(--c-dark)" }}
    >
      <div
        ref={trackRef}
        className="h-scroll-track"
        style={{
          display: "flex",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {/* Intro panel */}
        <div
          className="h-scroll-panel"
          style={{
            width: "40vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "var(--s-lg) var(--gutter)",
            flexShrink: 0,
            borderRight: "1px solid var(--c-border)",
          }}
        >
          <span style={labelStyle}>The Houses</span>
          <h2
            style={{
              fontFamily:    "var(--f-display)",
              fontSize:      "var(--t-h2)",
              color:         "var(--c-white)",
              fontStyle:     "italic",
              fontWeight:     400,
              lineHeight:    "var(--lh-display)",
              letterSpacing: "var(--ls-display)",
              marginBottom:  "18px",
            }}
          >
            Five names.
            <br />
            No compromises.
          </h2>
          <p style={{
            fontFamily:    "var(--f-display)",
            fontSize:      "clamp(16px, 1.6vw, 22px)",
            color:         "var(--c-accent)",
            fontStyle:     "italic",
            fontWeight:     400,
            lineHeight:     1.2,
            marginBottom:  "22px",
          }}>
            If it isn't on this list,<br />we don't carry it.
          </p>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize:   "var(--t-sub)",
              color:      "var(--c-muted)",
              fontWeight:  300,
              lineHeight:  1.85,
              maxWidth:   "300px",
            }}
          >
            Every timepiece authenticated. Every seller verified. Every watch
            inspected to our 14-point standard before it reaches you.
          </p>
        </div>

        {/* Brand panels */}
        {BRANDS.map((brand) => (
          <div
            key={brand.name}
            className="h-scroll-panel"
            style={{
              width: "45vw",
              height: "100vh",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <img
              src={brand.watch}
              alt={brand.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "brightness(0.38) saturate(0.85)",
                transition: "transform 0.9s var(--ease-out)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,8,8,0.97) 0%, rgba(8,8,8,0.25) 60%, rgba(8,8,8,0.08) 100%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "var(--s-lg) var(--gutter)",
              }}
            >
              <img
                src={brand.img}
                alt={brand.name}
                style={{
                  height: "30px",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                  opacity: 0.7,
                  marginBottom: "20px",
                }}
              />
              <span
                style={{
                  display: "block",
                  ...labelStyle,
                  marginBottom: "12px",
                }}
              >
                {brand.since}
              </span>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize: "var(--t-sub)",
                  color: "var(--c-muted)",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  maxWidth: "380px",
                  marginBottom: "28px",
                }}
              >
                {brand.desc}
              </p>
              <Link
                to="/timepieces"
                className="btn-outline"
                style={{
                  fontSize: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Price on Request →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3: FEATURED WATCHES — Grid
// ─────────────────────────────────────────────────────────────────────────────
const WATCHES = [
  {
    name: "Rolex Submariner",
    ref: "126613LN",
    img: "/assets/gotham-rolex-sub.jpg",
    brand: "Rolex",
  },
  {
    name: "Patek Philippe Nautilus",
    ref: "5712/1A",
    img: "/assets/gotham-patek-nautilus.jpg",
    brand: "Patek Philippe",
  },
  {
    name: "Cartier",
    ref: "W2SA0008",
    img: "/assets/gotham-cartier-1.jpg",
    brand: "Cartier",
  },
  {
    name: "Audemars Piguet Royal Oak",
    ref: "77351ST",
    img: "/assets/gotham-ap-product.jpg",
    brand: "Audemars Piguet",
  },
  {
    name: "Rolex Submariner Gold",
    ref: "126618LN",
    img: "/assets/gotham-rolex-sub-gold.jpg",
    brand: "Rolex",
  },
  {
    name: "Rolex Datejust",
    ref: "124273",
    img: "/assets/gotham-rolex-datejust.jpg",
    brand: "Rolex",
  },
];

// All brands represented in the inventory + those available by request
const FILTER_BRANDS = ["All", "Rolex", "Audemars Piguet", "Patek Philippe", "Cartier", "Richard Mille", "Vacheron Constantin"];

function FeaturedWatches({ activeBrand, sectionRef }: { activeBrand: string; sectionRef: { current: HTMLElement | null } }) {
  const normalised = activeBrand.trim().toLowerCase();
  const filtered =
    !activeBrand || activeBrand === "All"
      ? WATCHES
      : WATCHES.filter((w) => w.brand.toLowerCase() === normalised);

  const hasInventory = filtered.length > 0;

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--c-surface)",
        padding: "var(--s-xl) var(--gutter)",
      }}
    >
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
        <ScrollReveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "var(--s-md)",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <span style={{ ...labelStyle, color: "var(--c-accent-rich)" }}>
                {activeBrand && activeBrand !== "All" ? activeBrand : "Featured"}
              </span>
              <h2
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: "var(--t-h2)",
                  color: "var(--c-text-dark)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1.1,
                }}
              >
                {activeBrand && activeBrand !== "All"
                  ? `${activeBrand} inventory.`
                  : "Current inventory."}
              </h2>
            </div>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize: "12px",
                color: "var(--c-muted-dark)",
                maxWidth: "280px",
                textAlign: "right",
                lineHeight: 1.7,
                fontWeight: 300,
              }}
            >
              All prices on request. Call or email to inquire about availability.
            </p>
          </div>

          {/* ── Brand filter chips ─────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "var(--s-md)",
            }}
          >
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
                    border:        `1px solid ${isActive ? "var(--c-accent-rich)" : "rgba(28,27,25,0.15)"}`,
                    color:          isActive ? "var(--c-accent-rich)" : "rgba(28,27,25,0.42)",
                    background:     isActive ? "rgba(168,134,79,0.08)" : "transparent",
                    transition:    "all 0.22s var(--ease-ui)",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {brand}
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        {hasInventory ? (
          <div
            className="grid-3col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(16px, 2vw, 28px)",
            }}
          >
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
          /* ── Empty state: brand requested but no inventory yet ── */
          <div
            style={{
              padding:       "var(--s-lg) 0",
              display:       "flex",
              flexDirection: "column",
              alignItems:    "flex-start",
              gap:           "28px",
              borderTop:     "1px solid rgba(28,27,25,0.08)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--f-display)",
                fontSize:   "var(--t-h3)",
                color:      "var(--c-text-dark)",
                fontStyle:  "italic",
                fontWeight:  400,
                lineHeight:  1.15,
                maxWidth:   "480px",
              }}
            >
              {activeBrand} pieces are available by private consultation.
            </p>
            <p
              style={{
                fontFamily: "var(--f-body)",
                fontSize:   "var(--t-sub)",
                color:      "var(--c-muted-dark)",
                fontWeight:  300,
                lineHeight:  1.82,
                maxWidth:   "440px",
              }}
            >
              We source specific references on request. Tell us exactly what you're looking for — reference number, condition, year — and we'll find it.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <MagneticBtn href="tel:+19177570314">
                <span className="btn-ghost">Call to Inquire</span>
              </MagneticBtn>
              <MagneticBtn href={`mailto:sales@gothamcityjewelers.com?subject=Sourcing%20Request%20—%20${encodeURIComponent(activeBrand)}`}>
                <span className="btn-ghost">Email a Request</span>
              </MagneticBtn>
            </div>
          </div>
        )}

        {hasInventory && (
          <ScrollReveal>
            <div style={{ textAlign: "center", paddingTop: "var(--s-lg)" }}>
              <p
                style={{
                  fontFamily: "var(--f-body)",
                  fontSize:   "var(--t-body)",
                  color:      "var(--c-muted-dark)",
                  marginBottom: "28px",
                  fontWeight:  300,
                  lineHeight:  1.82,
                }}
              >
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
// SCENE 4: EXCHANGE — Sell / Trade CTA
// ─────────────────────────────────────────────────────────────────────────────
function ExchangeCTA() {
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
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        background: "#080808",
      }}
    >
      <img
        ref={imgRef}
        src="/assets/gotham-sell-trade.jpg"
        alt="Sell or trade your luxury watch"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "120%",
          objectFit: "cover",
          filter: "brightness(0.28) saturate(0.65)",
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(8,8,8,0.96) 0%, rgba(8,8,8,0.55) 100%)",
        }}
      />

      <div
        className="exchange-grid"
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "var(--max-w)",
          margin: "0 auto",
          padding: "var(--s-xl) var(--gutter)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--s-lg)",
          alignItems: "center",
          width: "100%",
        }}
      >
        <ScrollReveal>
          <span style={labelStyle}>The Exchange</span>
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "var(--t-h1)",
              color: "var(--c-white)",
              fontStyle: "italic",
              fontWeight: 400,
              lineHeight: 1.08,
              marginBottom: "22px",
            }}
          >
            Sell or trade
            <br />
            your timepiece.
          </h2>
          <p
            style={{
              fontFamily: "var(--f-body)",
              fontSize: "var(--t-sub)",
              color: "var(--c-muted)",
              fontWeight: 300,
              lineHeight: 1.8,
              marginBottom: "40px",
              maxWidth: "420px",
            }}
          >
            Fair quotes based on real market value. NYC-based, trusted. Rolex,
            AP, Patek, Cartier, Richard Mille — we buy them all.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Get a Quote</span>
            </MagneticBtn>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
              <span className="btn-outline">Email Photos</span>
            </MagneticBtn>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[
              {
                step: "01",
                text: "Send us photos and the reference number of your piece.",
              },
              {
                step: "02",
                text: "Receive a fair market quote within 24 hours.",
              },
              {
                step: "03",
                text: "Accept, ship insured, and receive payment. Done.",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: "flex",
                  gap: "24px",
                  alignItems: "flex-start",
                  padding: "24px 0",
                  borderBottom: "1px solid var(--c-border)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: "32px",
                    color: "var(--c-accent)",
                    fontStyle: "italic",
                    opacity: 0.35,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </span>
                <p
                  style={{
                    fontFamily: "var(--f-body)",
                    fontSize: "var(--t-sub)",
                    color: "var(--c-muted)",
                    fontWeight: 300,
                    lineHeight: 1.75,
                    paddingTop: "4px",
                  }}
                >
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
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function Timepieces() {
  const heroRef      = useRef<HTMLDivElement>(null);
  const heroImgRef   = useRef<HTMLImageElement>(null);
  const inventoryRef = useRef<HTMLElement>(null);

  const [searchParams] = useSearchParams();
  const activeBrand = searchParams.get("brand") ?? "All";

  // When arriving via nav dropdown with a brand param, smooth-scroll to inventory
  useEffect(() => {
    if (activeBrand && activeBrand !== "All") {
      // Small delay so the page has painted before scrolling
      const id = setTimeout(() => {
        inventoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 320);
      return () => clearTimeout(id);
    }
  }, [activeBrand]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroImgRef.current,
        { scale: 1.0 },
        {
          scale: 1.07,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Nav />

      <main>

        {/* ══ SCENE 1: HERO ══════════════════════════════════════════════ */}
        <div
          ref={heroRef}
          style={{
            position:   "relative",
            height:     "100vh",
            overflow:   "hidden",
            background: "#060606",
            display:    "flex",
            alignItems: "flex-end",
          }}
        >
          <img
            ref={heroImgRef}
            src="/assets/gotham-rolex-sub.jpg"
            alt="Luxury timepieces — Gotham City Jewelers"
            loading="eager"
            style={{
              position:       "absolute",
              inset:           0,
              width:           "100%",
              height:          "100%",
              objectFit:      "cover",
              objectPosition: "center 30%",
              filter:         "brightness(0.28) saturate(0.7)",
              willChange:     "transform",
            }}
          />
          {/* Gradient overlay — heavy bottom, light top */}
          <div style={{
            position:   "absolute",
            inset:       0,
            background:  "linear-gradient(to top, rgba(6,6,6,0.98) 0%, rgba(6,6,6,0.22) 55%, rgba(6,6,6,0.06) 100%)",
          }} />

          {/* Content — bottom-left */}
          <div style={{
            position:      "relative",
            zIndex:         10,
            padding:       "var(--s-md) var(--gutter)",
            paddingBottom: "var(--s-lg)",
            width:         "100%",
          }}>
            <span style={{ ...labelStyle, marginBottom: "24px" }}>The Vault · Swiss Horology</span>
            <h1 style={{
              fontFamily:    "var(--f-display)",
              fontSize:      "var(--t-hero)",
              color:         "var(--c-white)",
              fontStyle:     "italic",
              fontWeight:     400,
              lineHeight:    "var(--lh-display)",
              letterSpacing: "var(--ls-display)",
              maxWidth:      "720px",
              marginBottom:  "12px",
            }}>
              Mechanical mastery.
            </h1>
            <h2 style={{
              fontFamily:    "var(--f-display)",
              fontSize:      "var(--t-h1)",
              color:         "var(--c-accent)",
              fontStyle:     "italic",
              fontWeight:     400,
              lineHeight:     1.0,
              letterSpacing: "var(--ls-display)",
              maxWidth:      "560px",
              marginBottom:  "36px",
            }}>
              Authenticated.
            </h2>
            <p style={{
              fontFamily:    "var(--f-body)",
              fontSize:      "var(--t-sub)",
              color:         "rgba(240,235,227,0.38)",
              maxWidth:      "420px",
              fontWeight:     300,
              lineHeight:     1.9,
              letterSpacing: "0.012em",
              marginBottom:  "40px",
            }}>
              Every reference GIA-verified. Every seller cleared.
              <br />
              Every watch inspected to our 14-point standard
              <br />
              before it reaches you.
            </p>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Inquire Now</span>
            </MagneticBtn>
          </div>

          {/* Bottom-right — brand whisper */}
          <div className="hide-mobile" style={{ position: "absolute", bottom: "var(--s-sm)", right: "var(--gutter)", textAlign: "right" }}>
            <p style={{
              fontFamily:    "var(--f-body)",
              fontSize:      "9px",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color:         "rgba(237,232,224,0.14)",
              lineHeight:     2.2,
            }}>
              Rolex · Audemars Piguet<br />
              Patek Philippe · Cartier<br />
              Richard Mille
            </p>
          </div>
        </div>

        {/* ── Gold divider ─────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(197,164,110,0.6) 30%, rgba(197,164,110,0.9) 50%, rgba(197,164,110,0.6) 70%, transparent)' }} />

        {/* ── Breathing space ──────────────────────────────────────── */}
        <div style={{ height: 'var(--s-xl)', background: 'var(--c-void)' }} />

        {/* ══ SCENE 2: THE HOUSES — Horizontal brand scroll ═══════════ */}
        <TheHouses />

        {/* ── Gold divider ─────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(197,164,110,0.6) 30%, rgba(197,164,110,0.9) 50%, rgba(197,164,110,0.6) 70%, transparent)' }} />

        {/* ══ SCENE 3: FEATURED WATCHES — Light cream ════════════════ */}
        <FeaturedWatches activeBrand={activeBrand} sectionRef={inventoryRef} />

        {/* ── Gold divider ─────────────────────────────────────────── */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, rgba(197,164,110,0.6) 30%, rgba(197,164,110,0.9) 50%, rgba(197,164,110,0.6) 70%, transparent)' }} />

        {/* ══ SCENE 4: EXCHANGE CTA — Dark ════════════════════════════ */}
        <ExchangeCTA />

      </main>

      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "var(--f-label)",
  fontSize: "9px",
  letterSpacing: "var(--ls-label)",
  textTransform: "uppercase",
  color: "var(--c-accent)",
  display: "block",
  marginBottom: "16px",
};
