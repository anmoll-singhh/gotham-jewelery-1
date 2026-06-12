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

const LINKS: NavLink[] = [
  { label: "Ring Builder",    href: "/ring-builder"   },
  { label: "Custom Jewelry",  href: "/custom-jewelry" },
  {
    label: "Luxury Timepieces",
    href:  "/timepieces",
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
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const ctxRef   = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [location]);

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
          transition:     "background 0.45s var(--ease-silk), backdrop-filter 0.45s var(--ease-silk)",
          background:     scrolled ? "rgba(24,30,15,0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          borderBottom:   scrolled ? "1px solid rgba(201,168,76,0.10)" : "1px solid transparent",
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }} aria-label="Gotham City Jewelers — Home">
          <img
            src="/assets/gotham-logo.webp"
            alt="Gotham City Jewelers"
            style={{ height: "30px", width: "auto", display: "block", filter: "brightness(0) invert(1)", opacity: 0.9 }}
            onError={e => {
              const el = e.currentTarget as HTMLImageElement;
              // webp not supported → try original PNG
              if (el.src.includes('.webp')) { el.src = el.src.replace('.webp', '.png'); return; }
              // PNG also missing → show text fallback
              el.style.display = "none";
              const next = el.nextSibling as HTMLElement | null;
              if (next?.style) next.style.display = "block";
            }}
          />
          <span style={{ display: "none", fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--c-accent)" }}>GCJ</span>
        </Link>

        {/* Desktop links */}
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
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color:         location.pathname === link.href ? "var(--c-accent)" : "var(--c-text)",
                  opacity:       location.pathname === link.href ? 1 : 0.65,
                  transition:    "opacity 0.25s var(--ease-ui), color 0.25s var(--ease-ui)",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           "5px",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--c-accent)"; }}
                onMouseLeave={e => {
                  const active = location.pathname === link.href;
                  e.currentTarget.style.opacity = active ? "1" : "0.65";
                  e.currentTarget.style.color   = active ? "var(--c-accent)" : "var(--c-text)";
                }}
              >
                {link.label}
                {link.dropdown && (
                  <motion.span
                    animate={{ rotate: openDropdown === link.href ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut" }}
                    style={{ fontSize: "5.5px", opacity: 0.4, lineHeight: 1, display: "inline-block" }}
                  >▼</motion.span>
                )}
              </Link>

              {/* Dropdown */}
              {link.dropdown && (
                <AnimatePresence>
                  {openDropdown === link.href && (
                    <div style={{ position: "absolute", top: "calc(100% + 18px)", left: "50%", transform: "translateX(-50%)", zIndex: 200 }}>
                      <motion.ul
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{    opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background:     "rgba(24,30,15,0.97)",
                          border:         "1px solid rgba(201,168,76,0.14)",
                          backdropFilter: "blur(24px) saturate(160%)",
                          padding:        "6px 0 10px",
                          minWidth:       "210px",
                          listStyle:      "none",
                        }}
                      >
                        <li aria-hidden style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.45), transparent)", margin: "0 0 8px" }} />
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
                                color:         "rgba(240,234,196,0.5)",
                                transition:    "color 0.18s ease, background 0.18s ease",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = "var(--c-accent)"; e.currentTarget.style.background = "rgba(201,168,76,0.06)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,234,196,0.5)"; e.currentTarget.style.background = "transparent"; }}
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

          {/* CTA */}
          <li>
            <Link to="/ring-builder">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  display:       "inline-block",
                  padding:       "9px 22px",
                  border:        "1px solid rgba(201,168,76,0.45)",
                  fontFamily:    "var(--f-label)",
                  fontSize:      "9px",
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color:         "var(--c-accent)",
                  cursor:        "pointer",
                  transition:    "border-color 0.25s var(--ease-ui), background 0.25s var(--ease-ui)",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--c-accent)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.45)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                Book a Visit
              </motion.span>
            </Link>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          style={{ display: "none", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "5px", width: "40px", height: "40px", background: "transparent", border: "none", cursor: "pointer", padding: "0", flexShrink: 0 }}
        >
          <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }} />
          <motion.span animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} style={{ display: "block", width: "16px", height: "1.5px", background: "var(--c-accent)", alignSelf: "flex-end" }} />
          <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }} />
        </button>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)"   }}
            exit={{    opacity: 0, clipPath: "inset(0 0 100% 0)"  }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(24,30,15,0.98)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <div style={{ position: "absolute", top: "68px", left: "var(--gutter)", right: "var(--gutter)", height: "1px", background: "rgba(201,168,76,0.15)" }} />

            <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", width: "100%" }}>
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{    opacity: 0, y: -14 }}
                  transition={{ delay: i * 0.07, ease: [0.16, 1, 0.3, 1], duration: 0.55 }}
                  style={{ width: "100%", borderBottom: "1px solid rgba(201,168,76,0.08)" }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "24px var(--gutter)",
                      fontFamily:     "var(--f-display)",
                      fontSize:       "clamp(28px, 6vw, 42px)",
                      fontStyle:      "italic",
                      fontWeight:      400,
                      color:          location.pathname === link.href ? "var(--c-accent)" : "var(--c-white)",
                      letterSpacing:  "var(--ls-heading)",
                    }}
                  >
                    {link.label}
                    <span style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", color: "rgba(201,168,76,0.45)" }}>→</span>
                  </Link>

                  {link.dropdown && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px var(--gutter)", padding: "0 var(--gutter) 24px" }}>
                      {link.dropdown.map(sub => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={() => setMenuOpen(false)}
                          style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(240,234,196,0.45)", display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.05)", transition: "color 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--c-accent)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,234,196,0.45)"; }}
                        >
                          <span style={{ width: "4px", height: "4px", background: "var(--c-accent)", borderRadius: "50%", opacity: 0.5 }} />
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: 0.28, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ padding: "40px var(--gutter) 0", display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}
              >
                <Link to="/ring-builder" onClick={() => setMenuOpen(false)}>
                  <span className="btn-primary" style={{ justifyContent: "center", width: "100%", display: "flex" }}>Book a Visit</span>
                </Link>
                <a href="tel:+19177570314" style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", textAlign: "center", paddingTop: "8px" }}>
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
