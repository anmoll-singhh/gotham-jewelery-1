import { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useLocation } from "react-router-dom";

type NavLink = {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
};

// Order matches client priority: rings → custom jewelry → timepieces
// Client brief: "Ring Builder should be the primary conversion focus"
const LINKS: NavLink[] = [
  { label: "Ring Studio", href: "/ring-builder"   },
  { label: "The Atelier", href: "/custom-jewelry" },
  {
    label: "The Vault",
    href:  "/timepieces",
    // Each brand filters the FeaturedWatches grid via ?brand= URL param
    dropdown: [
      { label: "Rolex",               href: "/timepieces?brand=Rolex" },
      { label: "Audemars Piguet",     href: "/timepieces?brand=Audemars+Piguet" },
      { label: "Patek Philippe",      href: "/timepieces?brand=Patek+Philippe" },
      { label: "Cartier",             href: "/timepieces?brand=Cartier" },
      { label: "Richard Mille",       href: "/timepieces?brand=Richard+Mille" },
      { label: "Vacheron Constantin", href: "/timepieces?brand=Vacheron+Constantin" },
    ],
  },
];

export function Nav() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location  = useLocation();
  const ctxRef    = useRef<gsap.Context | null>(null);

  // Close mobile menu on route change
  useLayoutEffect(() => { setMenuOpen(false); }, [location]);

  useLayoutEffect(() => {
    ctxRef.current = gsap.context(() => {
      ScrollTrigger.create({
        start:    "top -60px",
        end:      99999,
        onUpdate: (self) => setScrolled(self.isActive),
      });
    });
    return () => ctxRef.current?.revert();
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1  }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{
          position:       "fixed",
          top:            0,
          left:           0,
          right:          0,
          zIndex:         100,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "0 var(--gutter)",
          height:         "68px",
          transition:     "background 0.45s cubic-bezier(0.16,1,0.3,1), backdrop-filter 0.45s cubic-bezier(0.16,1,0.3,1)",
          background:     scrolled ? "rgba(8,8,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom:   scrolled ? "1px solid rgba(197,164,110,0.08)" : "1px solid transparent",
        }}
      >
        {/* ── Logo ── */}
        <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }} aria-label="Gotham City Jewelers — Home">
          <img
            src="/assets/gotham-logo.png"
            alt="Gotham City Jewelers"
            style={{
              height:  "30px",
              width:   "auto",
              display: "block",
              filter:  "brightness(0) invert(1)",
              opacity: 0.9,
            }}
            onError={e => {
              // Fallback: text wordmark if logo fails to load
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              (el.nextSibling as HTMLElement | null)?.style && ((el.nextSibling as HTMLElement).style.display = "block");
            }}
          />
          {/* Text fallback — hidden by default, shown if image fails */}
          <span style={{
            display:       "none",
            fontFamily:    "var(--f-label)",
            fontSize:      "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color:         "var(--c-accent)",
          }}>GCJ</span>
        </Link>

        {/* ── Desktop links (hidden below 768px) ── */}
        <ul className="nav-desktop" style={{ display: "flex", gap: "40px", listStyle: "none", alignItems: "center" }}>
          {LINKS.map(link => (
            <li
              key={link.href}
              style={{ position: "relative" }}
              onMouseEnter={() => link.dropdown && setOpenDropdown(link.href)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                to={link.href}
                style={{
                  fontFamily:    "var(--f-label)",
                  fontSize:      "9px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color:         location.pathname === link.href ? "var(--c-accent)" : "var(--c-text)",
                  opacity:       location.pathname === link.href ? 1 : 0.6,
                  transition:    "opacity 0.25s var(--ease-ui), color 0.25s var(--ease-ui)",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "5px",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--c-accent)"; }}
                onMouseLeave={e => {
                  const active = location.pathname === link.href;
                  e.currentTarget.style.opacity = active ? "1" : "0.6";
                  e.currentTarget.style.color   = active ? "var(--c-accent)" : "var(--c-text)";
                }}
              >
                {link.label}
                {link.dropdown && (
                  <motion.span
                    animate={{ rotate: openDropdown === link.href ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ fontSize: "5.5px", opacity: 0.4, lineHeight: 1, display: "inline-block" }}
                  >
                    ▼
                  </motion.span>
                )}
              </Link>

              {/* ── Brand dropdown ── */}
              {link.dropdown && (
                <AnimatePresence>
                  {openDropdown === link.href && (
                    <div style={{
                      position:  "absolute",
                      top:       "calc(100% + 18px)",
                      left:      "50%",
                      transform: "translateX(-50%)",
                      zIndex:    200,
                    }}>
                      <motion.ul
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{    opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background:     "rgba(8,8,8,0.97)",
                          border:         "1px solid rgba(197,164,110,0.12)",
                          backdropFilter: "blur(24px) saturate(180%)",
                          padding:        "6px 0 10px",
                          minWidth:       "210px",
                          listStyle:      "none",
                        }}
                      >
                        {/* Gold top hairline */}
                        <li aria-hidden style={{
                          height:     "1px",
                          background: "linear-gradient(to right, transparent, rgba(197,164,110,0.45), transparent)",
                          margin:     "0 0 8px",
                        }} />
                        {link.dropdown.map((item, idx) => (
                          <motion.li
                            key={item.label}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.035, duration: 0.18 }}
                          >
                            <Link
                              to={item.href}
                              onClick={() => setOpenDropdown(null)}
                              style={{
                                display:       "block",
                                padding:       "8px 20px",
                                fontFamily:    "var(--f-label)",
                                fontSize:      "9px",
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                color:         "rgba(240,235,227,0.5)",
                                transition:    "color 0.18s ease, background 0.18s ease",
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.color      = "var(--c-accent)";
                                e.currentTarget.style.background = "rgba(197,164,110,0.05)";
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.color      = "rgba(240,235,227,0.5)";
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              {item.label}
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </li>
          ))}

          {/* Book a visit CTA */}
          <li>
            <Link to="/ring-builder">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  display:       "inline-block",
                  padding:       "9px 22px",
                  border:        "1px solid rgba(197,164,110,0.45)",
                  fontFamily:    "var(--f-label)",
                  fontSize:      "9px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color:         "var(--c-accent)",
                  cursor:        "pointer",
                  transition:    "border-color 0.25s var(--ease-ui), background 0.25s var(--ease-ui)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent)";
                  (e.currentTarget as HTMLElement).style.background  = "rgba(197,164,110,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(197,164,110,0.45)";
                  (e.currentTarget as HTMLElement).style.background  = "transparent";
                }}
              >
                Book a Visit
              </motion.span>
            </Link>
          </li>
        </ul>

        {/* ── Hamburger (visible below 768px) ── */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{
            display:        "none",       /* shown via CSS on mobile */
            flexDirection:  "column",
            justifyContent: "center",
            alignItems:     "center",
            gap:            "5px",
            width:          "40px",
            height:         "40px",
            background:     "transparent",
            border:         "none",
            cursor:         "pointer",
            padding:        "0",
            flexShrink:      0,
          }}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45,  y: 7,  scaleX: 1 } : { rotate: 0, y: 0, scaleX: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }}
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            style={{ display: "block", width: "16px", height: "1.5px", background: "var(--c-accent)", alignSelf: "flex-end" }}
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7, scaleX: 1 } : { rotate: 0, y: 0, scaleX: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }}
          />
        </button>
      </motion.nav>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)"   }}
            exit={{    opacity: 0, clipPath: "inset(0 0 100% 0)"  }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:       "fixed",
              inset:           0,
              zIndex:          99,
              background:      "rgba(8,8,8,0.98)",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "center",
              justifyContent:  "center",
              gap:             "0",
            }}
          >
            {/* Gold hairline top */}
            <div style={{ position: "absolute", top: "68px", left: "var(--gutter)", right: "var(--gutter)", height: "1px", background: "rgba(197,164,110,0.15)" }} />

            <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", width: "100%" }}>
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -14 }}
                  transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1], duration: 0.55 }}
                  style={{ width: "100%", borderBottom: "1px solid rgba(197,164,110,0.07)" }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display:       "flex",
                      alignItems:    "center",
                      justifyContent:"space-between",
                      padding:       "28px var(--gutter)",
                      fontFamily:    "var(--f-display)",
                      fontSize:      "clamp(28px, 6vw, 42px)",
                      fontStyle:     "italic",
                      fontWeight:     400,
                      color:         location.pathname === link.href ? "var(--c-accent)" : "var(--c-white)",
                      letterSpacing: "var(--ls-heading)",
                    }}
                  >
                    {link.label}
                    <span style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", color: "rgba(197,164,110,0.45)" }}>→</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: 0.28, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "40px var(--gutter) 0", display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}
              >
                <Link to="/ring-builder" onClick={() => setMenuOpen(false)}>
                  <span className="btn-primary" style={{ justifyContent: "center", width: "100%", display: "flex" }}>Book a Visit</span>
                </Link>
                <a href="tel:+19177570314" style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(197,164,110,0.5)", textAlign: "center", paddingTop: "8px" }}>
                  +1 917 757 0314
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
