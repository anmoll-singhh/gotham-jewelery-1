import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { Nav, Footer, MagneticBtn, ScrollReveal } from '@/components'

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2: THE PROCESS — 3-step horizontal scroll
// ─────────────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num:    '01',
    title:  'Choose Your Stone',
    body:   'Select from our curated inventory of GIA-certified diamonds and gemstones. Every stone is examined by our team before it reaches you.',
    detail: 'Round Brilliant · Cushion · Oval · Princess · Emerald · Radiant',
  },
  {
    num:    '02',
    title:  'Design the Setting',
    body:   'Work with our designers to choose the metal, the prong style, the profile. We produce detailed 3D renders before anything is cast.',
    detail: 'Platinum · 18K Gold · Rose Gold · White Gold',
  },
  {
    num:    '03',
    title:  'Begin the Conversation',
    body:   `Contact us to schedule your consultation. No pressure. No timelines until you're ready. We work until the piece is exactly right.`,
    detail: 'In-person · Phone · Email — 23 West 47th St, New York',
  },
]

function TheProcess() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef     = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Desktop only — CSS converts to vertical stack on mobile
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const track = trackRef.current!
        const getTotal = () => track.scrollWidth - window.innerWidth

        gsap.to(track, {
          x:    () => -getTotal(),
          ease: 'none',
          scrollTrigger: {
            trigger:             containerRef.current,
            start:               'top top',
            end:                 () => `+=${getTotal()}`,
            pin:                 true,
            anticipatePin:       1,
            scrub:               1,
            invalidateOnRefresh: true,
          },
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <>
      {/* DESKTOP VERSION — hidden on mobile */}
      <div ref={containerRef} className="h-scroll-container hide-mobile" style={{ overflow: 'hidden', background: 'var(--bg-dark-grad)' }}>
        <div ref={trackRef} className="h-scroll-track" style={{ display: 'flex', width: 'max-content', willChange: 'transform', alignItems: 'stretch' }}>

          {/* Intro panel */}
          <div className="h-scroll-panel h-scroll-panel-text" style={{
            width:          '50vw',
            minHeight:      '100vh',
            display:        'flex',
            flexDirection:  'column',
            justifyContent: 'center',
            padding:        'var(--s-lg) var(--gutter)',
            flexShrink:      0,
            borderRight:    '1px solid var(--c-border)',
          }}>
            <span style={labelStyle}>The Process</span>
            <h2 style={{
              fontFamily: 'var(--f-display)',
              fontSize:   'var(--t-h2)',
              color:      'var(--c-white)',
              fontStyle:  'italic',
              fontWeight:  400,
              lineHeight:  1.1,
            }}>
              Three steps between<br />idea and forever.
            </h2>
          </div>

          {/* Step panels */}
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="h-scroll-panel h-scroll-panel-text"
              style={{
                width:          '45vw',
                minHeight:      '100vh',
                display:        'flex',
                flexDirection:  'column',
                justifyContent: 'center',
                padding:        'var(--s-lg) var(--gutter)',
                flexShrink:      0,
                borderRight:    '1px solid var(--c-border)',
              }}
            >
              <span style={{
                fontFamily:   'var(--f-display)',
                fontSize:     'clamp(36px, 4.5vw, 56px)',
                fontStyle:    'italic',
                color:        'var(--c-accent)',
                opacity:       0.12,
                lineHeight:    1,
                display:      'block',
                marginBottom: '36px',
              }}>
                {step.num}
              </span>
              <h3 style={{
                fontFamily:   'var(--f-display)',
                fontSize:     'var(--t-h3)',
                color:        'var(--c-white)',
                fontStyle:    'italic',
                fontWeight:    400,
                marginBottom: '20px',
                lineHeight:    1.15,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontFamily:   'var(--f-body)',
                fontSize:     'var(--t-sub)',
                color:        'var(--c-muted)',
                marginBottom: '28px',
                fontWeight:    300,
                lineHeight:    1.8,
                maxWidth:     '360px',
              }}>
                {step.body}
              </p>
              <span style={{
                fontFamily:    'var(--f-body)',
                fontSize:      '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         'var(--c-accent-mid)',
                lineHeight:     1.8,
              }}>
                {step.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE VERSION — visible on mobile via CSS class */}
      <div className="process-mobile-container show-mobile-only" style={{ background: 'var(--bg-dark-grad)' }}>
        {/* Intro header */}
        <div className="process-mobile-header">
          <span style={labelStyle}>The Process</span>
          <h2
            style={{
              fontFamily:    'var(--f-display)',
              fontSize:      '28px',
              color:         'var(--c-white)',
              fontStyle:     'italic',
              fontWeight:     400,
              lineHeight:    '1.2',
              letterSpacing: 'var(--ls-display)',
              marginBottom:  '16px',
            }}
          >
            Three steps between
            <br />
            idea and forever.
          </h2>
        </div>

        {/* Steps Stack */}
        <div className="process-mobile-stack">
          {STEPS.map((step) => (
            <div key={step.num} className="process-mobile-card">
              <span className="process-mobile-card-num">
                {step.num}
              </span>
              <h3 className="process-mobile-card-title">
                {step.title}
              </h3>
              <p className="process-mobile-card-body">
                {step.body}
              </p>
              <div className="process-mobile-card-divider" />
              <span className="process-mobile-card-detail">
                {step.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3: THE INVITATION — Consultation CTA
// ─────────────────────────────────────────────────────────────────────────────
function Invitation() {
  const ref    = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { y: '-8%' },
        {
          y:    '8%',
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      )
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} className="invitation-section" style={{
      position:   'relative',
      overflow:   'hidden',
      minHeight:  '80vh',
      display:    'flex',
      alignItems: 'center',
      background: 'var(--bg-void-grad)',
    }}>
      <img
        ref={imgRef}
        src="/assets/macro-diamond.png"
        alt="Diamond detail"
        loading="lazy"
        style={{
          position:       'absolute',
          inset:           0,
          width:           '100%',
          height:          '120%',
          objectFit:      'cover',
          objectPosition: 'center',
          filter:         'brightness(0.22)',
          willChange:     'transform',
        }}
      />
      <div style={{
        position:   'absolute',
        inset:       0,
        background:  'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 100%)',
      }} />

      <div style={{
        position:  'relative',
        zIndex:     10,
        maxWidth:  'var(--max-w)',
        margin:    '0 auto',
        padding:   'var(--s-xl) var(--gutter)',
        textAlign: 'center',
        width:     '100%',
      }}>
        <ScrollReveal>
          <span style={labelStyle}>Begin Here</span>
          <h2 style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'var(--t-h1)',
            color:         'var(--c-white)',
            fontStyle:     'italic',
            fontWeight:     400,
            maxWidth:      '680px',
            margin:        '0 auto 16px',
            lineHeight:    'var(--lh-display)',
            letterSpacing: 'var(--ls-display)',
          }}>
            The right stone.
            <br />The right question.
          </h2>
          <p style={{
            fontFamily:    'var(--f-display)',
            fontSize:      'clamp(18px, 2vw, 26px)',
            color:         'var(--c-accent)',
            fontStyle:     'italic',
            fontWeight:     400,
            lineHeight:     1.2,
            margin:        '0 auto 24px',
            maxWidth:      '480px',
          }}>
            We help you ask it perfectly.
          </p>
          <p style={{
            fontFamily:    'var(--f-body)',
            fontSize:      'var(--t-sub)',
            color:         'var(--c-muted)',
            maxWidth:      '440px',
            margin:        '0 auto 48px',
            fontWeight:     300,
            lineHeight:     1.9,
            letterSpacing: '0.012em',
          }}>
            We don't use configurators. We use conversations.
            Every ring is built from your first question — nothing exists
            until you say yes. We respond the same day.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Call +1 917 757 0314</span>
            </MagneticBtn>
            <MagneticBtn href="mailto:sales@gothamcityjewelers.com">
              <span className="btn-outline">Email Us</span>
            </MagneticBtn>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function RingBuilder() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imgRef  = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 1.0 },
        {
          scale: 1.08,
          ease: 'none',
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
        {/* ── SCENE 1: STUDIO HERO ──────────────────────────────── */}
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
            src="/assets/macro-diamond.png"
            alt="Diamond macro detail"
            loading="eager"
            style={{
              position:       'absolute',
              inset:           0,
              width:           '100%',
              height:          '100%',
              objectFit:      'cover',
              objectPosition: 'center',
              filter:         'brightness(0.38)',
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
            <span style={labelStyle}>The Ring Studio · Custom Engagement</span>
            <h1 style={{
              fontFamily:    'var(--f-display)',
              fontSize:      'var(--t-hero)',
              color:         'var(--c-white)',
              fontStyle:     'italic',
              fontWeight:     400,
              lineHeight:    'var(--lh-display)',
              letterSpacing: 'var(--ls-display)',
              maxWidth:      '800px',
              marginBottom:  '20px',
            }}>
              Every stone has
              <br />a question inside it.
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
              She'll say yes. We make sure the ring does too.
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
              Custom engagement rings, designed with you from the first conversation.
              Built in Manhattan. Nothing is made until you say yes.
            </p>
            <MagneticBtn href="tel:+19177570314">
              <span className="btn-primary">Start the Conversation</span>
            </MagneticBtn>
          </div>

          {/* Scroll cue */}
          <div className="hide-mobile" style={{
            position:      'absolute',
            bottom:        '32px',
            right:         'var(--gutter)',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            gap:           '10px',
          }}>
            <span style={{
              fontFamily:    'var(--f-label)',
              fontSize:      '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color:         'var(--c-muted)',
              writingMode:   'vertical-rl',
            }}>
              Scroll
            </span>
            <div style={{ width: '1px', height: '48px', background: 'var(--c-accent-mid)' }} />
          </div>
        </div>

        {/* ── SCENE 2: THE PROCESS ──────────────────────────────── */}
        <TheProcess />

        {/* ── SCENE 3: THE INVITATION ───────────────────────────── */}
        <Invitation />
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
