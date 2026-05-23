import { useEffect, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import StickyNote from '../components/HeroStickyNote.jsx'
import { ClockIcon, QRCard } from '../components/HeroExtras.jsx'
import gsap from 'gsap'
import SileoToast from '../components/SileoToast.jsx'

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#2563EB" />
    <path d="M8 14.5l4.5 4.5 7.5-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ReminderCard removed per request


const TodayTasksCard = () => {
  const items = [
    { key: 'shorturls', title: 'Short URLs', desc: 'Create and manage short links', count: 24, to: '/create-short-url', color: '#2563EB' },
    { key: 'folders', title: 'Folders', desc: 'Organize links into folders', count: 6, to: '/folders', color: '#10B981' },
    { key: 'tags', title: 'Tags', desc: 'Filter and group links by tags', count: 12, to: '/tags', color: '#F59E0B' },
  ]

  return (
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '18px 20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      width: 260,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#111' }}>Quick actions</div>
      {items.map((it, i) => (
        <div key={it.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: i < items.length - 1 ? 12 : 0 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: it.color }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{it.title} <span style={{ fontWeight: 600, color: '#6b7280', fontSize: 12, marginLeft: 8 }}>{it.count}</span></div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{it.desc}</div>
            </div>
          </div>
          <Link to={it.to} style={{ background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 13, textDecoration: 'none', color: '#111' }}>Open</Link>
        </div>
      ))}
    </div>
  )
}

const LocationTypeCard = ({ title = 'Find where ?' }) => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    padding: '16px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
    width: 220,
    fontSize: 13,
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>
    <div style={{ width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
      <svg width="56" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M32 6C23 6 16 13.5 16 22.5 16 36 32 54 32 54s16-18 16-31.5C48 13.5 41 6 32 6z" fill="#EF4444" />
        <circle cx="32" cy="22.5" r="6.5" fill="#fff" />
        <g stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <circle cx="46" cy="46" r="7" />
          <line x1="51" y1="51" x2="58" y2="58" />
        </g>
      </svg>
    </div>

    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 800, fontSize: 15, color: '#111', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#6b7280' }}>Locate visitors and map activity quickly.</div>
    </div>
  </div>
)

// ClockIcon and QRCard are now shared in ../components/HeroExtras.jsx

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const homeRef = useRef(null)
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })

  useEffect(() => {
    if (location.state?.loggedOut) {
      setToast({
        message: 'Successfully logged out',
        type: 'success',
        isVisible: true
      })
      navigate('/', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })

      // Animate Nav
      tl.from('.home-nav', {
        y: -40,
        opacity: 0,
        duration: 0.8
      })

      // Animate Hero text and CTA
      tl.from('.hero-heading-1', {
        y: 60,
        opacity: 0,
        duration: 0.8
      }, '-=0.5')
      .from('.hero-heading-2', {
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)',
        duration: 0.8
      }, '-=0.4')
      .from('.hero-sub', {
        y: 30,
        opacity: 0,
        duration: 0.6
      }, '-=0.4')
      .from('.hero-cta', {
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(2)',
        duration: 0.6
      }, '-=0.4')

      // Animate floating items
      tl.from('.float-item-left-top', {
        x: -80,
        opacity: 0,
        ease: 'back.out(1.5)',
        duration: 1
      }, '-=0.8')
      .from('.float-item-right-top', {
        x: 80,
        opacity: 0,
        ease: 'back.out(1.5)',
        duration: 1
      }, '-=0.8')
      .from('.float-item-left-bottom', {
        y: 80,
        opacity: 0,
        ease: 'back.out(1.5)',
        duration: 1
      }, '-=0.8')
      .from('.float-item-right-bottom', {
        y: 80,
        opacity: 0,
        ease: 'back.out(1.5)',
        duration: 1
      }, '-=0.8')

      // Animate feature cards below the fold
      tl.from('.feature-card', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.6
      }, '-=0.6')

    }, homeRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={homeRef} style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", background: '#f5f5f5', minHeight: '100vh', color: '#111' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      {/* Full-page dotted overlay (behind content) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(160,160,160,0.28) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0, opacity: 1 }} />
      <nav className="home-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(245,245,245,0.95)' : '#f5f5f5',
        backdropFilter: 'blur(8px)',
        padding: '0 32px',
        height: 64,
        borderBottom: scrolled ? '1px solid #e5e5e5' : 'none',
        transition: 'all 0.2s',
      }}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap', padding: 6 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i === 0 ? '#2563EB' : i === 1 ? '#2563EB' : '#fff', opacity: i < 2 ? 1 : 0.9 }} />
              ))}
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>HoopIt</span>
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/login" style={{ color: '#444', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            <Link to="/register" style={{ background: 'white', border: '1.5px solid #d0d0d0', borderRadius: 10, padding: '9px 18px', fontSize: 14, fontWeight: 700, color: '#111', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ height: 64 }} />

      <section className="home-hero-section" style={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px 80px',
        overflow: 'hidden',
      }}>
        <div className="float-item-left-top" style={{ position: 'absolute', top: '10%', left: '6%', animation: 'floatA 6s ease-in-out infinite' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StickyNote>Take notes to keep track of crucial details, and accomplish more tasks with ease.</StickyNote>
            <div style={{ marginTop: 8 }}><CheckIcon /></div>
          </div>
        </div>

        {/* Floating four-square icon removed per request */}

        <div className="float-item-right-top" style={{ position: 'absolute', top: '8%', right: '5%', display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'floatA 5s ease-in-out infinite 1s', zIndex: 20 }}>
          <ClockIcon />
          <QRCard />
        </div>

        <div className="hide-on-mobile float-item-left-bottom" style={{ position: 'absolute', bottom: '8%', left: '5%', animation: 'floatB 6s ease-in-out infinite 0.5s' }}>
          <TodayTasksCard />
        </div>

        <div className="float-item-right-bottom" style={{ position: 'absolute', bottom: '8%', right: '5%', animation: 'floatA 7s ease-in-out infinite 1.5s' }}>
          <LocationTypeCard />
        </div>

        <div className="home-hero-copy" style={{ textAlign: 'center', zIndex: 10, maxWidth: 700 }}>
          <h1 className="hero-heading-1" style={{ fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 4px', color: '#111' }}>Paste, Short, and track</h1>
          <h1 className="home-highlight-heading hero-heading-2" style={{ fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 28px', color: '#fff' }}>
            <span className="paper-highlight-red">all in one place</span>
          </h1>
          <p className="hero-sub" style={{ fontSize: 16, color: '#666', marginBottom: 36, lineHeight: 1.6 }}>Efficiently manage your tasks and boost productivity.</p>
          <div className="hero-cta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 50 }}>
            <Link to="/try-now" className="primary-btn">Try Now</Link>
            <Link to="/login" className="secondary-btn">Log in</Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <h2 style={{ fontSize: 'clamp(30px, 4vw, 42px)', lineHeight: 1.1, letterSpacing: '-1px', margin: 0 }}>Everything you need below the hero</h2>
          <p style={{ marginTop: 12, color: '#6b7280', fontSize: 16 }}>Smart links, folders, analytics, and collaboration in one clean workflow.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { title: 'Custom short links', desc: 'Create clean, memorable URLs for campaigns and sharing.' },
            { title: 'Folders & tags', desc: 'Organize all links with fast filters and structured views.' },
            { title: 'Real-time analytics', desc: 'Track clicks, growth, top links, and location insights.' },
            { title: 'Team-ready controls', desc: 'Share ownership and manage links without confusion.' },
          ].map((item) => (
            <div key={item.title} className="feature-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 8 }}>{item.title}</div>
              <div style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 90px', textAlign: 'center' }}>
        <div style={{ background: '#111827', color: '#fff', borderRadius: 18, padding: '34px 20px' }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(24px, 3.5vw, 34px)', lineHeight: 1.15 }}>Start shortening and tracking today</h3>
          <p style={{ margin: '10px 0 22px', color: '#d1d5db' }}>Create your account and launch your first branded link in seconds.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: '#2563EB', color: '#fff', textDecoration: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 700 }}>Create account</Link>
            <Link to="/login" style={{ background: '#fff', color: '#111827', textDecoration: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 700 }}>I already have an account</Link>
          </div>
        </div>
      </section>

      </div>
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        /* Hide quick actions on small screens */
        @media (max-width: 640px) {
          .hide-on-mobile { display: none !important; }
          .home-hero-section {
            padding: 46px 16px 64px !important;
          }
          .home-hero-copy {
            max-width: 100% !important;
          }
          .home-highlight-heading {
            font-size: clamp(34px, 10.5vw, 44px) !important;
            letter-spacing: -1px !important;
            line-height: 1.05 !important;
            margin-bottom: 24px !important;
          }
          .paper-highlight-red {
            white-space: nowrap;
            padding: 0.1em 0.18em 0.16em;
          }
          .paper-highlight-red::before {
            inset: -0.03em -0.1em -0.04em -0.1em;
          }
          .paper-highlight-red::after {
            inset: 0.06em -0.08em 0.04em -0.08em;
          }
        }
        .paper-highlight-red {
          position: relative;
          display: inline-block;
          padding: 0.08em 0.26em 0.18em;
          color: #fff;
          transform: rotate(-0.4deg);
          text-shadow: 0 1px 0 rgba(0,0,0,0.08);
          isolation: isolate;
        }
        .paper-highlight-red::before,
        .paper-highlight-red::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
        }
        .paper-highlight-red::before {
          inset: -0.02em -0.18em -0.04em -0.18em;
          background:
            radial-gradient(ellipse at 0% 40%, transparent 0 7%, #ef2f2f 8% 100%),
            radial-gradient(ellipse at 100% 52%, transparent 0 6%, #c91f24 7% 100%),
            repeating-linear-gradient(92deg, rgba(255,255,255,0.1) 0 7px, rgba(120,0,0,0.08) 8px 13px, transparent 14px 23px),
            linear-gradient(2deg, #b91c1c 0%, #ef2f2f 18%, #ff3f35 52%, #d9232b 100%);
          border-radius: 999px 32px 999px 36px;
          clip-path: polygon(2% 18%, 9% 9%, 24% 12%, 32% 6%, 48% 10%, 63% 7%, 78% 13%, 96% 9%, 99% 22%, 96% 36%, 99% 49%, 95% 62%, 98% 77%, 86% 84%, 69% 82%, 55% 89%, 38% 84%, 23% 88%, 8% 79%, 4% 64%, 0% 55%, 5% 43%, 0% 31%);
          box-shadow: 0 8px 18px rgba(201,31,36,0.18);
        }
        .paper-highlight-red::after {
          inset: 0.06em -0.14em 0.04em -0.14em;
          background:
            linear-gradient(90deg, transparent 0 2%, rgba(255,255,255,0.18) 6%, transparent 18% 82%, rgba(145,18,22,0.18) 94%, transparent 100%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 7px);
          border-radius: 999px;
          filter: blur(0.4px);
          opacity: 0.75;
          transform: rotate(0.5deg);
          mix-blend-mode: soft-light;
        }
        .primary-btn {
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px 36px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(37,99,235,0.35);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
        }
        .primary-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.45);
        }
        .primary-btn:active {
          transform: translateY(0);
        }

        .secondary-btn {
          background: transparent;
          border: 1.5px solid #111827;
          border-radius: 50px;
          padding: 14px 36px;
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          text-decoration: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
        }
        .secondary-btn:hover {
          background: rgba(17, 24, 39, 0.05);
          border-color: #111827;
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }
        .secondary-btn:active {
          transform: translateY(0);
        }
      `}</style>
      <SileoToast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />
    </div>
  )
}
