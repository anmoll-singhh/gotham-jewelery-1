import { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
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

// ── Focusable element selector for focus trap ─────────────────────────────────
const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    if (focusables.length === 0) return;

    // Move focus to the first item when menu opens
    const firstFocusable = focusables[0];
    const lastFocusable  = focusables[focusables.length - 1];

    // Small delay so AnimatePresence animation has started before we steal focus
    const timer = setTimeout(() => firstFocusable?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, containerRef]);
}

export function Nav() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location     = useLocation();
  const ctxRef       = useRef<gsap.Context | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menu and restore focus on route change
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setMenuOpen(false));
    return () => cancelAnimationFrame(raf);
  }, [location]);

  // Restore focus to hamburger when menu closes
  const prevMenuOpen = useRef(menuOpen);
  useEffect(() => {
    if (prevMenuOpen.current && !menuOpen) {
      hamburgerRef.current?.focus();
    }
    prevMenuOpen.current = menuOpen;
  }, [menuOpen]);

  // ESC closes both mobile menu and dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (menuOpen) {
          setMenuOpen(false);
        }
        if (openDropdown) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen, openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Focus trap inside the mobile menu overlay
  useFocusTrap(menuOpen, mobileMenuRef);

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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ── Dropdown keyboard handler ───────────────────────────────────────────────
  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent, href: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpenDropdown(prev => (prev === href ? null : href));
      }
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    },
    []
  );

  return (
    <>
      {/* ── Nav header landmark ──────────────────────────────────────────────── */}
      <header>
        <motion.nav
          aria-label="Main navigation"
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
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            aria-label="Gotham City Jewelers — Home"
          >
            <img
              src="/assets/gotham-logo.webp"
              alt="Gotham City Jewelers"
              style={{ height: "30px", width: "auto", display: "block", filter: "brightness(0) invert(1)", opacity: 0.9 }}
              onError={e => {
                const el = e.currentTarget as HTMLImageElement;
                if (el.src.includes('.webp')) { el.src = el.src.replace('.webp', '.png'); return; }
                el.style.display = "none";
                const next = el.nextSibling as HTMLElement | null;
                if (next?.style) next.style.display = "block";
              }}
            />
            <span style={{ display: "none", fontFamily: "var(--f-label)", fontSize: "11px", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--c-accent)" }}>GCJ</span>
          </Link>

          {/* Desktop links */}
          <ul
            className="nav-desktop"
            role="list"
            style={{ display: "flex", gap: "40px", listStyle: "none", alignItems: "center" }}
          >
            {LINKS.map(link => (
              <li
                key={link.href}
                style={{ position: "relative" }}
                onMouseEnter={() => link.dropdown && setOpenDropdown(link.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.dropdown ? (
                  /* Disclosure pattern: main link + separate toggle button */
                  <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                    <Link
                      to={link.href}
                      aria-current={location.pathname === link.href ? "page" : undefined}
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
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--c-accent)"; }}
                      onMouseLeave={e => {
                        const active = location.pathname === link.href;
                        e.currentTarget.style.opacity = active ? "1" : "0.65";
                        e.currentTarget.style.color   = active ? "var(--c-accent)" : "var(--c-text)";
                      }}
                    >
                      {link.label}
                    </Link>
                    {/* Separate toggle button for the dropdown */}
                    <button
                      aria-expanded={openDropdown === link.href}
                      aria-haspopup="true"
                      aria-label={`${openDropdown === link.href ? "Close" : "Open"} ${link.label} menu`}
                      onClick={() => setOpenDropdown(prev => prev === link.href ? null : link.href)}
                      onKeyDown={e => handleDropdownKeyDown(e, link.href)}
                      style={{
                        background:  "transparent",
                        border:      "none",
                        cursor:      "pointer",
                        padding:     "4px 3px",
                        display:     "inline-flex",
                        alignItems:  "center",
                        color:       "var(--c-text)",
                        opacity:     0.45,
                        lineHeight:  1,
                        fontSize:    "5.5px",
                      }}
                    >
                      <motion.span
                        animate={{ rotate: openDropdown === link.href ? 180 : 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        style={{ display: "inline-block" }}
                        aria-hidden="true"
                      >▼</motion.span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to={link.href}
                    aria-current={location.pathname === link.href ? "page" : undefined}
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
                  </Link>
                )}

                {/* Dropdown */}
                {link.dropdown && (
                  <AnimatePresence>
                    {openDropdown === link.href && (
                      <div
                        style={{ position: "absolute", top: "calc(100% + 18px)", left: "50%", transform: "translateX(-50%)", zIndex: 200 }}
                      >
                        <motion.ul
                          role="menu"
                          aria-label={`${link.label} submenu`}
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
                          <li aria-hidden="true" style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(201,168,76,0.45), transparent)", margin: "0 0 8px" }} />
                          {link.dropdown.map((item, idx) => (
                            <motion.li
                              key={item.label}
                              role="none"
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.035, duration: 0.18 }}
                            >
                              <Link
                                to={item.href}
                                role="menuitem"
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
            ref={hamburgerRef}
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            style={{ display: "none", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "5px", width: "44px", height: "44px", background: "transparent", border: "none", cursor: "pointer", padding: "0", flexShrink: 0 }}
          >
            <motion.span animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }} aria-hidden="true" />
            <motion.span animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} style={{ display: "block", width: "16px", height: "1.5px", background: "var(--c-accent)", alignSelf: "flex-end" }} aria-hidden="true" />
            <motion.span animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ display: "block", width: "22px", height: "1.5px", background: "var(--c-accent)", transformOrigin: "center" }} aria-hidden="true" />
          </button>
        </motion.nav>
      </header>

      {/* Mobile overlay — role="dialog" for proper modal semantics */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)"   }}
            exit={{    opacity: 0, clipPath: "inset(0 0 100% 0)"  }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(24,30,15,0.98)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            {/* Visible close button at top-right (also available via ESC) */}
            <button
              onClick={closeMenu}
              aria-label="Close navigation menu"
              style={{
                position: "absolute", top: "14px", right: "var(--gutter)",
                width: "44px", height: "44px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--c-accent)", fontSize: "20px",
              }}
              aria-hidden="true"
              tabIndex={-1}
            >
              ✕
            </button>

            <div style={{ position: "absolute", top: "68px", left: "var(--gutter)", right: "var(--gutter)", height: "1px", background: "rgba(201,168,76,0.15)" }} />

            <nav
              aria-label="Mobile navigation"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", width: "100%" }}
            >
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
                    onClick={closeMenu}
                    aria-current={location.pathname === link.href ? "page" : undefined}
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
                    <span aria-hidden="true" style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", color: "rgba(201,168,76,0.45)" }}>→</span>
                  </Link>

                  {link.dropdown && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px var(--gutter)", padding: "0 var(--gutter) 24px" }}>
                      {link.dropdown.map(sub => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          onClick={closeMenu}
                          style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(240,234,196,0.45)", display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: "1px solid rgba(201,168,76,0.05)", transition: "color 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--c-accent)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(240,234,196,0.45)"; }}
                        >
                          <span aria-hidden="true" style={{ width: "4px", height: "4px", background: "var(--c-accent)", borderRadius: "50%", opacity: 0.5 }} />
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
                <Link to="/ring-builder" onClick={closeMenu}>
                  <span className="btn-primary" style={{ justifyContent: "center", width: "100%", display: "flex" }}>Book a Visit</span>
                </Link>
                <a
                  href="tel:+19177570314"
                  style={{ fontFamily: "var(--f-label)", fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(201,168,76,0.5)", textAlign: "center", paddingTop: "8px" }}
                >
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
