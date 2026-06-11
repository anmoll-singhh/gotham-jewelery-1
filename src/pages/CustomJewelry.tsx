import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Nav, Footer, MagneticBtn, ScrollReveal } from '@/components'

// ── Shared visually-hidden label style (WCAG 2.1 AA)
const srOnly: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)',
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2: THE CRAFT — 3-phase vertical reveal
// ─────────────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    num:   '01',
    title: 'Discovery',
    body:  `We start with a conversation — not a catalog. Tell us what you want to say with the piece. Who it's for. What it should feel like. We listen before we design.`,
    img:   '/assets/lifestyle-image.png',
  },
  {
    num:   '02',
    title: 'Design',
    body:  'Our team creates detailed sketches and 3D renderings until the piece looks exactly right. You see it before a single gram of metal is touched.',
    img:   '/assets/hero-image.png',
  },
  {
    num:   '03',
    title: 'Creation',
    body:  `Cast, set, polished — by hand, in New York. Pieces leave our studio only when they meet our standard. That's not a policy. It's a requirement.`,
    img:   '/assets/macro-diamond.png',
  },
]

function TheCraft() {
  return (
    <section style={{ background: 'var(--bg-void-grad)', padding: 'var(--s-xl) var(--gutter)' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <ScrollReveal>
          <span style={labelStyle}>The Craft</span>
          <h2 style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'var(--t-h2)',
            color:         'var(--c-white)',
            fontStyle:     'italic',
            fontWeight:     400,
            marginBottom:  '18px',
            maxWidth:      '560px',
            lineHeight:    'var(--lh-display)',
            letterSpacing: 'var(--ls-display)',
          }}>
            From the first sketch<br />to the final polish.
          </h2>
          <p style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'clamp(16px, 1.6vw, 22px)',
            color:         'var(--c-accent)',
            fontStyle:     'italic',
            fontWeight:     400,
            lineHeight:     1.2,
            marginBottom:  'var(--s-md)',
          }}>
            Nothing leaves our studio until it's right.
          </p>
        </ScrollReveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {PHASES.map((phase, i) => (
            <ScrollReveal key={phase.num} y={60} delay={i * 0.08}>
              <div className="craft-grid" style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 '2px',
                direction:           i % 2 === 1 ? 'rtl' : 'ltr',
              }}>
                {/* Image */}
                <div style={{
                  position:    'relative',
                  overflow:    'hidden',
                  aspectRatio: '4/3',
                  direction:   'ltr',
                }}>
                  <img
                    src={phase.img}
                    alt={phase.title}
                    loading="lazy"
                    style={{
                      width:      '100%',
                      height:     '100%',
                      objectFit: 'cover',
                      filter:     'brightness(0.45) saturate(0.8)',
                      transition: 'transform 0.9s var(--ease-out)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  />
                  {/* Phase number ghost */}
                  <div style={{ position: 'absolute', bottom: '24px', left: '28px' }}>
                    <span style={{
                      fontFamily: 'var(--f-display)',
                      fontSize:   '48px',
                      fontStyle:  'italic',
                      color:      'var(--c-accent)',
                      opacity:     0.18,
                      lineHeight:  1,
                    }}>
                      {phase.num}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div style={{
                  background:     'var(--bg-dark-grad)',
                  padding:        'clamp(32px, 6vw, 64px) var(--gutter)',
                  display:        'flex',
                  flexDirection:  'column',
                  justifyContent: 'center',
                  direction:      'ltr',
                }}>
                  <span style={labelStyle}>{phase.num}</span>
                  <h3 style={{
                    fontFamily:   'var(--f-display)',
                    fontSize:     'var(--t-h2)',
                    color:        'var(--c-white)',
                    fontStyle:    'italic',
                    fontWeight:    400,
                    marginBottom: '22px',
                    lineHeight:    1.1,
                  }}>
                    {phase.title}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--f-body)',
                    fontSize:   'var(--t-sub)',
                    color:      'var(--c-muted)',
                    fontWeight:  300,
                    lineHeight:  1.85,
                    maxWidth:   '460px',
                  }}>
                    {phase.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3: BEGIN — Contact / consultation form
// ─────────────────────────────────────────────────────────────────────────────
function BeginSection() {
  const nameRef    = useRef<HTMLInputElement>(null)
  const emailRef   = useRef<HTMLInputElement>(null)
  const phoneRef   = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const name    = nameRef.current?.value.trim()    ?? ''
    const email   = emailRef.current?.value.trim()   ?? ''
    const phone   = phoneRef.current?.value.trim()   ?? ''
    const message = messageRef.current?.value.trim() ?? ''

    const subject = encodeURIComponent('Custom Jewelry Inquiry' + (name ? ` — ${name}` : ''))
    const body    = encodeURIComponent(
      [
        name    && `Name: ${name}`,
        email   && `Email: ${email}`,
        phone   && `Phone: ${phone}`,
        message && `\nPiece Description:\n${message}`,
      ].filter(Boolean).join('\n')
    )

    window.location.href = `mailto:sales@gothamcityjewelers.com?subject=${subject}&body=${body}`
  }

  return (
    <section style={{ background: 'var(--bg-dark-grad)', padding: 'var(--s-xl) var(--gutter)' }}>
      <div className="grid-2col" style={{
        maxWidth:            'var(--max-w)',
        margin:              '0 auto',
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 'var(--s-lg)',
        alignItems:          'center',
      }}>

        {/* Left — copy */}
        <ScrollReveal>
          <span style={labelStyle}>Begin</span>
          <h2 style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'var(--t-h1)',
            color:         'var(--c-white)',
            fontStyle:     'italic',
            fontWeight:     400,
            lineHeight:    'var(--lh-display)',
            letterSpacing: 'var(--ls-display)',
            marginBottom:  '16px',
          }}>
            Tell us what<br />you're imagining.
          </h2>
          <p style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'clamp(16px, 1.6vw, 22px)',
            color:         'var(--c-accent)',
            fontStyle:     'italic',
            fontWeight:     400,
            lineHeight:     1.2,
            marginBottom:  '22px',
          }}>
            We listen before we design.
          </p>
          <p style={{
            fontFamily:    'var(--f-body)',
            fontSize:      'var(--t-sub)',
            color:         'var(--c-muted)',
            fontWeight:     300,
            lineHeight:     1.9,
            letterSpacing: '0.012em',
            marginBottom:  '40px',
          }}>
            Every custom piece starts with a conversation.
            No minimums. No pressure. No timelines until you're ready.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">+1 917 757 0314</span>
            </MagneticBtn>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
              <span className="btn-outline">Send an Email</span>
            </MagneticBtn>
          </div>
        </ScrollReveal>

        {/* Right — inquiry form */}
        <ScrollReveal delay={0.14}>
          <div style={{
            background: 'var(--bg-void-grad)',
            border:     '1px solid var(--c-border)',
            padding:    'var(--s-md)',
          }}>
            <span style={{ ...labelStyle, marginBottom: '28px' }}>Inquiry</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label htmlFor="cj-name"    style={srOnly}>Your Name</label>
              <input
                ref={nameRef}
                id="cj-name"
                type="text"
                placeholder="Your Name"
                autoComplete="name"
                style={{
                  background:  'transparent',
                  border:      '1px solid var(--c-border)',
                  borderRadius: 0,
                  padding:     '15px 18px',
                  color:       'var(--c-text)',
                  fontFamily:  'var(--f-body)',
                  fontSize:    '13px',
                  letterSpacing: '0.02em',
                  outline:     'none',
                  width:       '100%',
                  transition:  'border-color 0.2s',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--c-accent-mid)' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'var(--c-border)' }}
              />

              <label htmlFor="cj-email"   style={srOnly}>Email Address</label>
              <input
                ref={emailRef}
                id="cj-email"
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                style={{
                  background:  'transparent',
                  border:      '1px solid var(--c-border)',
                  borderRadius: 0,
                  padding:     '15px 18px',
                  color:       'var(--c-text)',
                  fontFamily:  'var(--f-body)',
                  fontSize:    '13px',
                  letterSpacing: '0.02em',
                  outline:     'none',
                  width:       '100%',
                  transition:  'border-color 0.2s',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--c-accent-mid)' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'var(--c-border)' }}
              />

              <label htmlFor="cj-phone"   style={srOnly}>Phone (optional)</label>
              <input
                ref={phoneRef}
                id="cj-phone"
                type="tel"
                placeholder="Phone (optional)"
                autoComplete="tel"
                style={{
                  background:  'transparent',
                  border:      '1px solid var(--c-border)',
                  borderRadius: 0,
                  padding:     '15px 18px',
                  color:       'var(--c-text)',
                  fontFamily:  'var(--f-body)',
                  fontSize:    '13px',
                  letterSpacing: '0.02em',
                  outline:     'none',
                  width:       '100%',
                  transition:  'border-color 0.2s',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--c-accent-mid)' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'var(--c-border)' }}
              />

              <label htmlFor="cj-message" style={srOnly}>Describe your piece</label>
              <textarea
                ref={messageRef}
                id="cj-message"
                placeholder="Describe your piece — material, occasion, inspiration, budget..."
                rows={4}
                style={{
                  background:  'transparent',
                  border:      '1px solid var(--c-border)',
                  borderRadius: 0,
                  padding:     '15px 18px',
                  color:       'var(--c-text)',
                  fontFamily:  'var(--f-body)',
                  fontSize:    '13px',
                  letterSpacing: '0.02em',
                  outline:     'none',
                  width:       '100%',
                  resize:      'vertical',
                  transition:  'border-color 0.2s',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'var(--c-accent-mid)' }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'var(--c-border)' }}
              />
              <button
                className="btn-primary"
                style={{ justifyContent: 'center', width: '100%' }}
                type="button"
                onClick={handleSubmit}
              >
                Send Inquiry
              </button>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomJewelry() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.0 },
        {
          scale: 1.08,
          ease:  'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
        }
      )
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      <Nav />

      <main>
        {/* ── SCENE 1: ATELIER HERO ──────────────────────────────── */}
        <div
          ref={heroRef}
          style={{
            position:   'relative',
            height:     '100dvh',
            overflow:   'hidden',
            background: 'var(--bg-void-grad)',
            display:    'flex',
            alignItems: 'flex-end',
          }}
        >
          <img
            ref={imgRef}
            src="/assets/lifestyle-image.png"
            alt="Custom fine jewelry — Manhattan"
            loading="eager"
            style={{
              position:       'absolute',
              inset:           0,
              width:           '100%',
              height:          '100%',
              objectFit:      'cover',
              objectPosition: 'center',
              filter:         'brightness(0.35)',
              willChange:     'transform',
            }}
          />
          <div style={{
            position:   'absolute',
            inset:       0,
            background:  'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 35%, transparent 100%)',
          }} />

          <div style={{
            position:      'relative',
            zIndex:         10,
            padding:       'var(--gutter)',
            paddingBottom: 'clamp(24px, 5vh, 48px)',
            width:         '100%',
          }}>
            <span style={labelStyle}>The Atelier · Custom Fine Jewelry</span>
            <h1 style={{
              fontFamily:    'var(--f-display)',
              fontSize:      'var(--t-hero)',
              color:         'var(--c-white)',
              fontStyle:     'italic',
              fontWeight:     400,
              lineHeight:    'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              maxWidth:      '780px',
              marginBottom:  '20px',
            }}>
              Made for one person.
              <br />Yours.
            </h1>
            <p style={{
              fontFamily:    'var(--f-display)',
              fontSize:      'var(--t-h3)',
              color:         'var(--c-accent)',
              fontStyle:     'italic',
              fontWeight:     400,
              lineHeight:     1.1,
              marginBottom:  '28px',
            }}>
              Not a catalog. A conversation.
            </p>
            <p style={{
              fontFamily:    'var(--f-body)',
              fontSize:      'var(--t-sub)',
              color:         'rgba(240,234,196,0.38)',
              maxWidth:      '440px',
              fontWeight:     300,
              lineHeight:     1.9,
              letterSpacing: '0.012em',
              marginBottom:  '40px',
            }}>
              Engagement rings, bridal sets, anniversary pieces —
              designed from scratch, built in Manhattan.
              We listen before we design.
            </p>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
              <span className="btn-primary">Start the Conversation</span>
            </MagneticBtn>
          </div>
        </div>

        {/* ── SCENE 2: THE CRAFT ─────────────────────────────────── */}
        <TheCraft />

        {/* ── SCENE 3: BEGIN ─────────────────────────────────────── */}
        <BeginSection />
      </main>

      <Footer />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily:    'var(--f-label)',
  fontSize:      '9px',
  letterSpacing: 'var(--ls-label)',
  textTransform: 'uppercase',
  color:         'var(--c-accent)',
  display:       'block',
  marginBottom:  '16px',
}
