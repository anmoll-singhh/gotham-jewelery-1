import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NAV = [
  { label: 'Ring Builder',       href: '/ring-builder'   },
  { label: 'Custom Jewelry',     href: '/custom-jewelry' },
  { label: 'Luxury Timepieces',  href: '/timepieces'     },
]

const LEGAL = [
  { label: 'Privacy',  href: '#' },
  { label: 'Terms',    href: '#' },
  { label: 'Sitemap',  href: '#' },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com/gothamcityjewelers' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg-void-grad)', borderTop: '1px solid rgba(201,168,76,0.10)' }}>

      {/* Upper — big statement */}
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: 'var(--s-lg) var(--gutter) var(--s-md)' }}>

        {/* Gold hairline */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,0.6) 0%, rgba(201,168,76,0.15) 70%, transparent 100%)', marginBottom: 'var(--s-md)' }} />

        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--s-lg)', alignItems: 'flex-start' }}>

          {/* Left — brand + statement */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
            >
              <img src="/assets/gotham-logo.webp" alt="Gotham City Jewelers"
                style={{ height: '38px', width: 'auto', marginBottom: '28px', filter: 'invert(1) brightness(0.85)', opacity: 0.88 }}
                onError={e => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.src.includes('.webp')) { el.src = el.src.replace('.webp', '.png'); return; }
                  el.style.display = 'none';
                }}
              />
              <p style={{
                fontFamily: 'var(--f-display)',
                fontSize:   'clamp(26px, 3.5vw, 52px)',
                color:      'var(--c-white)',
                fontStyle:  'italic',
                fontWeight:  300,
                lineHeight:  1.05,
                letterSpacing: 'var(--ls-display)',
                maxWidth:   '520px',
                marginBottom: '28px',
              }}>
                Nothing leaves<br />before we're certain.
              </p>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: 'var(--t-body)', color: 'rgba(240,234,196,0.38)', fontWeight: 300, lineHeight: 1.8, maxWidth: '320px' }}>
                23 West 47th Street, Suite 402<br />
                Manhattan, New York 10036<br />
                Mon – Fri · 9am – 5pm
              </p>
            </motion.div>
          </div>

          {/* Right — nav columns: 3-col flex on desktop, 2-col grid on mobile */}
          <div className="footer-nav-cols" style={{ display: 'flex', gap: 'clamp(40px,6vw,80px)', alignItems: 'flex-start', paddingTop: '4px' }}>
            <div>
              <p style={{ fontFamily: 'var(--f-label)', fontSize: '9px', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: '20px' }}>Navigate</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {NAV.map(l => (
                  <li key={l.href}>
                    <Link to={l.href} style={{ fontFamily: 'var(--f-body)', fontSize: 'var(--t-body)', color: 'rgba(240,234,196,0.45)', transition: 'color 0.2s var(--ease-ui)', letterSpacing: '0.05em' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,196,0.45)' }}
                    >{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--f-label)', fontSize: '9px', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: '20px' }}>Contact</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: '+1 (917) 757-0314',              href: 'tel:+19177570314' },
                  { label: 'sales@gothamcityjewelers.com',    href: 'mailto:sales@gothamcityjewelers.com' },
                  { label: 'Book an Appointment',             href: '/ring-builder' },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href} style={{ fontFamily: 'var(--f-body)', fontSize: 'var(--t-body)', color: 'rgba(240,234,196,0.45)', transition: 'color 0.2s var(--ease-ui)', letterSpacing: '0.03em' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,196,0.45)' }}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{ fontFamily: 'var(--f-label)', fontSize: '9px', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginBottom: '20px' }}>Follow</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {SOCIAL.map(l => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--f-body)', fontSize: 'var(--t-body)', color: 'rgba(240,234,196,0.45)', transition: 'color 0.2s var(--ease-ui)', letterSpacing: '0.03em' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-accent)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,196,0.45)' }}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lower bar */}
        <div className="footer-lower-bar" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: 'var(--s-sm)', marginTop: 'var(--s-md)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ fontFamily: 'var(--f-body)', fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(240,234,196,0.22)' }}>
            © {year} Gotham City Jewelers LLC. Manhattan Diamond District.
          </p>
          <div className="footer-legal-links" style={{ display: 'flex', gap: '28px' }}>
            {LEGAL.map(l => (
              <a key={l.label} href={l.href} style={{ fontFamily: 'var(--f-label)', fontSize: '9px', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', color: 'rgba(240,234,196,0.22)', transition: 'color 0.2s var(--ease-ui)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(240,234,196,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,234,196,0.22)' }}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
