/**
 * PRODUCT — Conversion-focused PDP for the headless Shopify storefront.
 *
 * Sections
 *  1  Breadcrumb
 *  2  Buy area   Gallery (sticky thumbs) | Buy box (sticky): price · variants ·
 *               financing · scarcity · Add to Cart / Buy Now · trust badges
 *  3  Trust strip (authentication · insured shipping · warranty · returns)
 *  4  Specifications
 *  5  The 14-Point Standard (authentication story)
 *  6  Description
 *  7  Reviews (summary + list)
 *  8  FAQ accordion
 *  9  Related / cross-sell
 * 10  Concierge CTA
 *  +  Cart drawer  +  Sticky mobile buy bar
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Nav, Footer, Pic, ScrollReveal } from "@/components";
import {
  getProduct,
  getRelatedProducts,
  formatMoney,
  type Product,
  type ProductVariant,
} from "@/data/products";
import { createCartAndCheckout, isShopifyConfigured } from "@/lib/shopify";
import "@/styles/product.css";

// ── Inline icons (zero-dependency) ───────────────────────────────────────────
type IProps = { size?: number; color?: string; stroke?: number };
const Ico = (d: string) => ({ size = 18, color = "currentColor", stroke = 1.5 }: IProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ShieldIcon = Ico("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4");
const TruckIcon  = Ico("M1 3h15v13H1z M16 8h4l3 3v5h-7 M5.5 19a2 2 0 100-4 2 2 0 000 4z M18.5 19a2 2 0 100-4 2 2 0 000 4z");
const ReturnIcon = Ico("M3 7v6h6 M21 17a9 9 0 00-15-6.7L3 13");
const LockIcon   = Ico("M5 11h14v10H5z M8 11V7a4 4 0 018 0v4");
const CheckIcon  = Ico("M20 6L9 17l-5-5");
const PlusIcon   = Ico("M12 5v14 M5 12h14");
const MinusIcon  = Ico("M5 12h14");
const ChevronIcon= Ico("M6 9l6 6 6-6");
const CloseIcon  = Ico("M18 6L6 18 M6 6l12 12");
const CalendarIcon = Ico("M3 4h18v18H3z M3 10h18 M8 2v4 M16 2v4");
const PhoneIcon  = Ico("M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z");

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`s${i}-${rating}`}>
                <stop offset={`${fill * 100}%`} stopColor="var(--c-accent)" />
                <stop offset={`${fill * 100}%`} stopColor="rgba(201,168,76,0.28)" />
              </linearGradient>
            </defs>
            <path d="M12 2l3 6.5 7 .9-5 4.9 1.3 7L12 18l-6.3 3.3L7 14.3l-5-4.9 7-.9z"
              fill={`url(#s${i}-${rating})`} />
          </svg>
        );
      })}
    </span>
  );
}

const lbl: React.CSSProperties = {
  fontFamily: "var(--f-label)", fontSize: "10px", fontWeight: 600,
  letterSpacing: "0.32em", textTransform: "uppercase", color: "var(--c-accent)",
};

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is this watch authentic?", a: "Every timepiece passes our in-house 14-point authentication — movement, serial, hallmarks, and papers are all verified by a watchmaker before it is listed. You receive a written guarantee of authenticity with your purchase." },
  { q: "How does shipping work?", a: "Free, fully-insured overnight shipping within the continental US, signature required. International delivery is arranged with a dedicated courier — contact a specialist for a quote." },
  { q: "What is your return policy?", a: "14-day returns. If the piece isn't right, send it back in the condition you received it for a full refund. Bespoke and special-order items are final sale." },
  { q: "Do you offer financing?", a: "Yes — apply at checkout with Affirm or Shop Pay for terms up to 36 months. Approval takes about a minute and doesn't affect your credit to check your rate." },
  { q: "Can I see it before I buy?", a: "Absolutely. Book a private viewing at our 47th Street showroom, or request a video walkthrough with a specialist. No obligation." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(201,168,76,0.14)" }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "22px 0", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
        <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(17px,2vw,21px)", color: "var(--c-white)",
          fontStyle: "italic", fontWeight: 400, paddingRight: "20px" }}>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}
          style={{ color: "var(--c-accent)", flexShrink: 0, display: "flex" }}><ChevronIcon size={18} /></motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "15px", fontWeight: 300, lineHeight: 1.8,
              color: "var(--c-muted)", paddingBottom: "22px", maxWidth: "60ch" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function Product() {
  const { handle } = useParams<{ handle: string }>();
  const product = handle ? getProduct(handle) : undefined;

  if (!product) return <Navigate to="/timepieces" replace />;
  return <ProductView key={product.handle} product={product} />;
}

type CartItem = { variant: ProductVariant; product: Product; quantity: number };

function ProductView({ product }: { product: Product }) {
  const related = useMemo(() => getRelatedProducts(product.handle), [product.handle]);

  // Variant selection
  const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(
    () => Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value]))
  );
  const variant = useMemo<ProductVariant>(() => {
    return (
      product.variants.find((v) =>
        v.selectedOptions.every((o) => selected[o.name] === o.value)
      ) ?? firstAvailable
    );
  }, [selected, product.variants, firstAvailable]);

  const [qty, setQty] = useState(1);
  const [gallery, setGallery] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "notice">("idle");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyBtnRef = useRef<HTMLDivElement>(null);
  const [viewers] = useState(() => 4 + (product.title.length % 6));

  useEffect(() => { setSelected(Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value]))); setQty(1); setGallery(0); window.scrollTo(0, 0); }, [product.handle]); // reset on product change

  // Sticky mobile bar — show once the main CTA scrolls out of view
  useEffect(() => {
    const onScroll = () => {
      const el = buyBtnRef.current;
      if (!el) return;
      setShowStickyBar(el.getBoundingClientRect().bottom < 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const price = variant.price;
  const compareAt = variant.compareAtPrice;
  const saving = compareAt && compareAt.amount > price.amount ? compareAt.amount - price.amount : 0;
  const available = variant.availableForSale;

  function addToCart(open = true) {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.variant.id === variant.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [...prev, { variant, product, quantity: qty }];
    });
    if (open) setCartOpen(true);
  }

  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);
  const cartSubtotal = cart.reduce((n, c) => n + c.variant.price.amount * c.quantity, 0);

  async function checkout() {
    if (cart.length === 0) return;
    setCheckoutState("loading");
    try {
      const url = await createCartAndCheckout(
        cart.map((c) => ({ merchandiseId: c.variant.id, quantity: c.quantity }))
      );
      window.location.href = url; // Shopify hosted checkout
    } catch (e) {
      // SHOPIFY_NOT_CONFIGURED (or network) → graceful notice
      setCheckoutState("notice");
    }
  }

  function buyNow() {
    addToCart(false);
    setCartOpen(true);
    // A specialist can also complete express checkout — same path as checkout()
  }

  const gutter = "var(--gutter)";

  return (
    <>
      <Nav />
      <main style={{ background: "var(--bg-void-grad)", paddingTop: "74px" }}>

        {/* ── 1 · Breadcrumb ───────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" style={{ padding: `20px ${gutter} 0`, maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <ol style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center",
            fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {[["Home", "/"], ["Timepieces", "/timepieces"], [product.vendor, `/timepieces?brand=${encodeURIComponent(product.vendor)}`]].map(([label, to]) => (
              <li key={to} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <Link to={to} style={{ color: "var(--c-muted)" }}>{label}</Link>
                <span style={{ color: "rgba(201,168,76,0.4)" }}>/</span>
              </li>
            ))}
            <li style={{ color: "var(--c-accent)" }}>{product.title}</li>
          </ol>
        </nav>

        {/* ── 2 · Buy area ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `32px ${gutter} 80px`,
          display: "grid", gridTemplateColumns: "1fr", gap: "48px" }} className="pdp-buyarea">
          {/* Gallery */}
          <div className="pdp-gallery">
            <div className="pdp-gallery-main" style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden",
              background: "#0d130a", border: "1px solid rgba(201,168,76,0.14)" }}>
              <AnimatePresence mode="wait">
                <motion.div key={gallery} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", inset: 0 }}>
                  <Pic src={product.images[gallery].url} alt={product.images[gallery].altText}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </motion.div>
              </AnimatePresence>
              <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ ...lbl, fontSize: "9px", letterSpacing: "0.22em", background: "rgba(20,28,12,0.82)",
                  backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.3)", padding: "7px 12px",
                  display: "inline-flex", gap: "6px", alignItems: "center" }}>
                  <ShieldIcon size={13} color="var(--c-accent)" /> Certified Authentic
                </span>
                {saving > 0 && (
                  <span style={{ ...lbl, fontSize: "9px", letterSpacing: "0.18em", background: "var(--c-accent)",
                    color: "var(--c-void)", padding: "7px 12px" }}>
                    Save {formatMoney({ amount: saving, currencyCode: price.currencyCode })}
                  </span>
                )}
              </div>
            </div>
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                {product.images.map((img, i) => (
                  <button key={img.url} onClick={() => setGallery(i)} aria-label={`View ${img.altText}`}
                    style={{ width: "72px", height: "88px", padding: 0, overflow: "hidden", cursor: "pointer",
                      background: "#0d130a", border: `1px solid ${i === gallery ? "var(--c-accent)" : "rgba(201,168,76,0.16)"}`,
                      transition: "border-color 0.2s", opacity: i === gallery ? 1 : 0.72 }}>
                    <Pic src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="pdp-buybox">
            <div style={{ position: "sticky", top: "96px" }}>
              <span style={lbl}>{product.vendor}</span>
              <h1 style={{ fontFamily: "var(--f-display)", fontSize: "clamp(34px,4.5vw,56px)", color: "var(--c-white)",
                fontStyle: "italic", fontWeight: 400, lineHeight: 1.02, letterSpacing: "-0.02em", margin: "10px 0 8px" }}>
                {product.title}
              </h1>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "14px", fontWeight: 300, letterSpacing: "0.04em",
                color: "var(--c-muted)", marginBottom: "16px" }}>{product.tagline}</p>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px" }}>
                <Stars rating={product.rating} />
                <span style={{ fontFamily: "var(--f-body)", fontSize: "13px", color: "var(--c-muted)" }}>
                  {product.rating.toFixed(1)} · {product.reviewCount} reviews
                </span>
              </div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "14px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(30px,3.6vw,40px)", color: "var(--c-white)", fontWeight: 500 }}>
                  {formatMoney(price)}
                </span>
                {compareAt && compareAt.amount > price.amount && (
                  <span style={{ fontFamily: "var(--f-body)", fontSize: "18px", color: "var(--c-muted-light)", textDecoration: "line-through" }}>
                    {formatMoney(compareAt)}
                  </span>
                )}
              </div>
              {product.financeFromMonthly && (
                <p style={{ fontFamily: "var(--f-body)", fontSize: "13px", color: "rgba(226,192,98,0.9)", marginTop: "8px" }}>
                  or from <strong style={{ fontWeight: 600 }}>{formatMoney(product.financeFromMonthly)}/mo</strong> with Affirm · {product.financeMonths} mo
                </p>
              )}

              {/* Scarcity */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", marginTop: "18px" }}>
                {available && variant.quantityAvailable <= 3 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "var(--f-body)",
                    fontSize: "12.5px", letterSpacing: "0.03em", color: "#E8C56A" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#E8C56A", boxShadow: "0 0 8px #E8C56A" }} />
                    Only {variant.quantityAvailable} in stock
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "var(--f-body)", fontSize: "12.5px", color: "var(--c-muted)" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7FB77E" }} />
                  {viewers} people are viewing this now
                </span>
              </div>

              {/* Options */}
              <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {product.options.map((opt) => (
                  <div key={opt.name}>
                    <div style={{ ...lbl, fontSize: "10px", letterSpacing: "0.2em", marginBottom: "10px", color: "var(--c-muted)" }}>
                      {opt.name}: <span style={{ color: "var(--c-white)", fontWeight: 600 }}>{selected[opt.name]}</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {opt.values.map((val) => {
                        const isSel = selected[opt.name] === val;
                        // is this value combinable into an available variant?
                        const combo = { ...selected, [opt.name]: val };
                        const hasStock = product.variants.some((v) =>
                          v.availableForSale && v.selectedOptions.every((o) => combo[o.name] === o.value));
                        return (
                          <button key={val} onClick={() => setSelected(combo)}
                            style={{ fontFamily: "var(--f-label)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em",
                              textTransform: "uppercase", padding: "11px 16px", cursor: "pointer",
                              color: isSel ? "var(--c-void)" : hasStock ? "var(--c-white)" : "var(--c-muted-light)",
                              background: isSel ? "var(--c-accent)" : "transparent",
                              border: `1px solid ${isSel ? "var(--c-accent)" : "rgba(201,168,76,0.28)"}`,
                              opacity: hasStock ? 1 : 0.5, transition: "all 0.2s",
                              textDecoration: hasStock ? "none" : "line-through" }}>
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity + CTAs */}
              <div ref={buyBtnRef} style={{ marginTop: "28px" }}>
                <div style={{ display: "flex", gap: "14px", alignItems: "stretch" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(201,168,76,0.28)", flexShrink: 0 }}>
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity"
                      style={{ width: "42px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-white)", background: "none", border: "none", cursor: "pointer" }}>
                      <MinusIcon size={15} />
                    </button>
                    <span style={{ minWidth: "28px", textAlign: "center", fontFamily: "var(--f-body)", fontSize: "15px", color: "var(--c-white)" }}>{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(variant.quantityAvailable || 1, q + 1))} aria-label="Increase quantity"
                      style={{ width: "42px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-white)", background: "none", border: "none", cursor: "pointer" }}>
                      <PlusIcon size={15} />
                    </button>
                  </div>
                  <button onClick={() => addToCart(true)} disabled={!available}
                    className="btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: "12px",
                      opacity: available ? 1 : 0.5, cursor: available ? "pointer" : "not-allowed", height: "auto", padding: "16px 20px" }}>
                    {available ? "Add to Cart" : "Sold Out"}
                  </button>
                </div>
                <button onClick={buyNow} disabled={!available}
                  style={{ width: "100%", marginTop: "12px", padding: "16px", cursor: available ? "pointer" : "not-allowed",
                    fontFamily: "var(--f-label)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase",
                    color: "var(--c-white)", background: "transparent", border: "1px solid rgba(201,168,76,0.4)",
                    opacity: available ? 1 : 0.5, transition: "background 0.2s, border-color 0.2s" }}
                  onMouseEnter={(e) => { if (available) { e.currentTarget.style.background = "rgba(201,168,76,0.08)"; e.currentTarget.style.borderColor = "var(--c-accent)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)"; }}>
                  Buy Now — Express Checkout
                </button>
                <div style={{ display: "flex", gap: "18px", marginTop: "14px", flexWrap: "wrap" }}>
                  <a href="tel:+19177570314" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--c-muted)" }}>
                    <PhoneIcon size={14} color="var(--c-accent)" /> Ask a Specialist
                  </a>
                  <Link to="/ring-builder" style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--c-muted)" }}>
                    <CalendarIcon size={14} color="var(--c-accent)" /> Book a Viewing
                  </Link>
                </div>
              </div>

              {/* Highlights */}
              <ul style={{ marginTop: "26px", display: "flex", flexDirection: "column", gap: "11px" }}>
                {product.highlights.map((h) => (
                  <li key={h} style={{ display: "flex", gap: "10px", alignItems: "flex-start", fontFamily: "var(--f-body)", fontSize: "14px", fontWeight: 300, color: "var(--c-text)" }}>
                    <span style={{ color: "var(--c-accent)", flexShrink: 0, marginTop: "2px" }}><CheckIcon size={15} /></span>{h}
                  </li>
                ))}
              </ul>

              {/* Payment / security line */}
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid rgba(201,168,76,0.14)",
                display: "flex", alignItems: "center", gap: "9px", fontFamily: "var(--f-body)", fontSize: "12px", color: "var(--c-muted)" }}>
                <LockIcon size={14} color="var(--c-accent)" /> Secure checkout · Shop Pay · Affirm · Visa · Amex · {product.soldRecently}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 · Trust strip ──────────────────────────────────────────── */}
        <section style={{ borderTop: "1px solid rgba(201,168,76,0.14)", borderBottom: "1px solid rgba(201,168,76,0.14)", background: "rgba(0,0,0,0.14)" }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `28px ${gutter}`, display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "24px" }}>
            {[
              { I: ShieldIcon, t: "14-Point Authentication", s: "Verified by a watchmaker in-house" },
              { I: TruckIcon, t: "Free Insured Shipping", s: "Overnight, signature required" },
              { I: ReturnIcon, t: "14-Day Returns", s: "Money-back if it isn't right" },
              { I: LockIcon, t: "2-Year Warranty", s: "Gotham mechanical guarantee" },
            ].map(({ I, t, s }) => (
              <div key={t} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <span style={{ color: "var(--c-accent)", flexShrink: 0 }}><I size={26} stroke={1.3} /></span>
                <div>
                  <div style={{ fontFamily: "var(--f-label)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-white)" }}>{t}</div>
                  <div style={{ fontFamily: "var(--f-body)", fontSize: "12.5px", fontWeight: 300, color: "var(--c-muted)", marginTop: "3px" }}>{s}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4 · Specifications ───────────────────────────────────────── */}
        <ScrollReveal>
          <section style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `80px ${gutter} 40px` }}>
            <span style={lbl}>Specifications</span>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, margin: "12px 0 32px" }}>The details.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0 56px" }}>
              {product.specs.map((s) => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "15px 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  <span style={{ fontFamily: "var(--f-label)", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--f-body)", fontSize: "14.5px", color: "var(--c-white)", textAlign: "right" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ── 5 · The Standard (authentication story) ──────────────────── */}
        <ScrollReveal>
          <section style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `48px ${gutter}` }}>
            <div style={{ border: "1px solid rgba(201,168,76,0.18)", padding: "clamp(28px,4vw,56px)", background: "linear-gradient(160deg, rgba(53,87,31,0.35), rgba(36,64,26,0.15))" }}>
              <span style={lbl}>The Gotham Standard</span>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, margin: "12px 0 18px", maxWidth: "16ch" }}>
                Nothing enters the case unverified.
              </h2>
              <p style={{ fontFamily: "var(--f-body)", fontSize: "15.5px", fontWeight: 300, lineHeight: 1.85, color: "var(--c-muted)", maxWidth: "60ch", marginBottom: "34px" }}>
                Grey-market anxiety ends here. Every reference we sell passes a 14-point inspection — movement, serial, hallmarks, magnetism, timing and papers — signed off by a watchmaker before it's listed and again before it ships. You get the paperwork, the guarantee, and someone to call.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
                {[["Movement & timing", "Regulated on a timegrapher; within chronometer spec."], ["Serial & hallmarks", "Cross-checked against the manufacturer register."], ["Papers & provenance", "Box, card and service history verified."], ["Written guarantee", "Authenticity in writing with every purchase."]].map(([t, s]) => (
                  <div key={t}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ color: "var(--c-accent)" }}><CheckIcon size={16} /></span>
                      <span style={{ fontFamily: "var(--f-label)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-white)" }}>{t}</span>
                    </div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: "13px", fontWeight: 300, lineHeight: 1.7, color: "var(--c-muted)" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 6 · Description ──────────────────────────────────────────── */}
        <ScrollReveal>
          <section style={{ maxWidth: "800px", margin: "0 auto", padding: `40px ${gutter}` }}>
            <span style={lbl}>Overview</span>
            <div className="pdp-desc" style={{ marginTop: "14px", fontFamily: "var(--f-body)", fontSize: "16px", fontWeight: 300, lineHeight: 1.9, color: "var(--c-text)" }}
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          </section>
        </ScrollReveal>

        {/* ── 7 · Reviews ──────────────────────────────────────────────── */}
        {product.reviews.length > 0 && (
          <ScrollReveal>
            <section style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `56px ${gutter}` }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "20px", flexWrap: "wrap", marginBottom: "34px" }}>
                <div>
                  <span style={lbl}>Owner Reviews</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "12px" }}>
                    <span style={{ fontFamily: "var(--f-display)", fontSize: "clamp(40px,6vw,64px)", color: "var(--c-white)", fontWeight: 500, lineHeight: 1 }}>{product.rating.toFixed(1)}</span>
                    <div>
                      <Stars rating={product.rating} size={18} />
                      <div style={{ fontFamily: "var(--f-body)", fontSize: "13px", color: "var(--c-muted)", marginTop: "4px" }}>{product.reviewCount} verified reviews</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {product.reviews.map((r) => (
                  <div key={r.author + r.date} style={{ border: "1px solid rgba(201,168,76,0.14)", padding: "24px", background: "rgba(0,0,0,0.14)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <Stars rating={r.rating} size={13} />
                      {r.verified && <span style={{ display: "inline-flex", gap: "5px", alignItems: "center", fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--c-accent)" }}><CheckIcon size={11} /> Verified</span>}
                    </div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: "18px", fontStyle: "italic", color: "var(--c-white)", marginBottom: "8px" }}>{r.title}</div>
                    <p style={{ fontFamily: "var(--f-body)", fontSize: "14px", fontWeight: 300, lineHeight: 1.75, color: "var(--c-muted)", marginBottom: "14px" }}>{r.body}</p>
                    <div style={{ fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted-light)" }}>{r.author}{r.location ? ` · ${r.location}` : ""}</div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── 8 · FAQ ──────────────────────────────────────────────────── */}
        <ScrollReveal>
          <section style={{ maxWidth: "800px", margin: "0 auto", padding: `56px ${gutter}` }}>
            <span style={lbl}>Questions</span>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, margin: "12px 0 20px" }}>Good to know.</h2>
            <div>{FAQS.map((f) => <FaqItem key={f.q} {...f} />)}</div>
          </section>
        </ScrollReveal>

        {/* ── 9 · Related / cross-sell ─────────────────────────────────── */}
        {related.length > 0 && (
          <ScrollReveal>
            <section style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `56px ${gutter} 80px` }}>
              <span style={lbl}>Complete the Collection</span>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h2)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, margin: "12px 0 32px" }}>You may also consider.</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "22px" }}>
                {related.map((r) => (
                  <Link key={r.handle} to={`/products/${r.handle}`} style={{ display: "block" }} className="pdp-related-card">
                    <div style={{ aspectRatio: "4 / 5", overflow: "hidden", background: "#0d130a", border: "1px solid rgba(201,168,76,0.14)", marginBottom: "14px" }}>
                      <Pic src={r.featuredImage.url} alt={r.featuredImage.altText}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)" }} className="pdp-related-img" />
                    </div>
                    <span style={{ ...lbl, fontSize: "9px", letterSpacing: "0.24em" }}>{r.vendor}</span>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: "19px", fontStyle: "italic", color: "var(--c-white)", margin: "6px 0 4px" }}>{r.title}</div>
                    <div style={{ fontFamily: "var(--f-body)", fontSize: "14px", color: "var(--c-accent)", fontWeight: 500 }}>{formatMoney(r.variants[0].price)}</div>
                  </Link>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── 10 · Concierge CTA ───────────────────────────────────────── */}
        <section style={{ borderTop: "1px solid rgba(201,168,76,0.16)" }}>
          <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: `64px ${gutter}`, textAlign: "center" }}>
            <span style={lbl}>Private Client Service</span>
            <h2 style={{ fontFamily: "var(--f-display)", fontSize: "var(--t-h1)", color: "var(--c-white)", fontStyle: "italic", fontWeight: 400, margin: "14px auto 18px", maxWidth: "18ch" }}>
              Prefer to see it in person first?
            </h2>
            <p style={{ fontFamily: "var(--f-body)", fontSize: "15px", fontWeight: 300, color: "var(--c-muted)", maxWidth: "48ch", margin: "0 auto 30px", lineHeight: 1.8 }}>
              Book a private viewing at our 47th Street showroom, or have a specialist walk you through this piece over video. No obligation.
            </p>
            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/ring-builder" className="btn-primary" style={{ fontSize: "11px" }}>Book a Viewing</Link>
              <a href="tel:+19177570314" className="btn-outline" style={{ fontSize: "11px" }}>Call +1 917 757 0314</a>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* ── Sticky mobile buy bar ──────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && available && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pdp-sticky-bar"
            style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, display: "flex", alignItems: "center", gap: "14px",
              padding: "12px var(--gutter)", background: "rgba(24,34,15,0.96)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(201,168,76,0.22)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "15px", fontStyle: "italic", color: "var(--c-white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: "13px", color: "var(--c-accent)", fontWeight: 600 }}>{formatMoney(price)}</div>
            </div>
            <button onClick={() => addToCart(true)} className="btn-primary" style={{ fontSize: "11px", padding: "13px 22px", flexShrink: 0 }}>Add to Cart</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }} />
            <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 121, width: "min(420px, 92vw)",
                background: "#1c2812", borderLeft: "1px solid rgba(201,168,76,0.2)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px var(--gutter)", borderBottom: "1px solid rgba(201,168,76,0.14)" }}>
                <span style={{ fontFamily: "var(--f-label)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--c-white)" }}>Your Cart · {cartCount}</span>
                <button onClick={() => setCartOpen(false)} aria-label="Close cart" style={{ color: "var(--c-white)", background: "none", border: "none", cursor: "pointer", display: "flex" }}><CloseIcon size={20} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "8px var(--gutter)" }}>
                {cart.length === 0 ? (
                  <p style={{ fontFamily: "var(--f-body)", fontSize: "14px", color: "var(--c-muted)", padding: "40px 0", textAlign: "center" }}>Your cart is empty.</p>
                ) : cart.map((c) => (
                  <div key={c.variant.id} style={{ display: "flex", gap: "14px", padding: "18px 0", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <div style={{ width: "64px", height: "80px", flexShrink: 0, overflow: "hidden", background: "#0d130a" }}>
                      <Pic src={c.product.featuredImage.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--f-display)", fontSize: "16px", fontStyle: "italic", color: "var(--c-white)" }}>{c.product.title}</div>
                      <div style={{ fontFamily: "var(--f-body)", fontSize: "11.5px", color: "var(--c-muted)", margin: "3px 0 8px" }}>{c.variant.title}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "var(--c-muted)" }}>Qty {c.quantity}</span>
                        <span style={{ fontFamily: "var(--f-body)", fontSize: "14px", color: "var(--c-accent)", fontWeight: 600 }}>{formatMoney({ amount: c.variant.price.amount * c.quantity, currencyCode: c.variant.price.currencyCode })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "20px var(--gutter)", borderTop: "1px solid rgba(201,168,76,0.14)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "var(--f-label)", fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--c-muted)" }}>Subtotal</span>
                  <span style={{ fontFamily: "var(--f-display)", fontSize: "22px", color: "var(--c-white)", fontWeight: 500 }}>{formatMoney({ amount: cartSubtotal, currencyCode: "USD" })}</span>
                </div>
                <p style={{ fontFamily: "var(--f-body)", fontSize: "11.5px", color: "var(--c-muted)", marginBottom: "14px" }}>Shipping, taxes & duties calculated at checkout.</p>
                {checkoutState === "notice" && (
                  <p style={{ fontFamily: "var(--f-body)", fontSize: "12px", color: "#E8C56A", marginBottom: "12px", lineHeight: 1.6 }}>
                    {isShopifyConfigured() ? "Couldn't reach checkout — please try again or call a specialist." : "Secure checkout goes live the moment the Shopify Storefront is connected. A specialist can complete your order now at +1 917 757 0314."}
                  </p>
                )}
                <button onClick={checkout} disabled={cart.length === 0 || checkoutState === "loading"}
                  className="btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "12px", padding: "16px" }}>
                  {checkoutState === "loading" ? "Redirecting…" : "Secure Checkout"}
                </button>
                <button onClick={() => setCartOpen(false)} style={{ width: "100%", marginTop: "10px", padding: "10px", fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--c-muted)", background: "none", border: "none", cursor: "pointer" }}>Continue Browsing</button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
