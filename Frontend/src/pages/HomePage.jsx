import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StickyNote from '../components/HeroStickyNote.jsx'
import { ClockIcon, QRCard } from '../components/HeroExtras.jsx'

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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", background: '#f5f5f5', minHeight: '100vh', color: '#111' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Caveat:wght@500&display=swap" rel="stylesheet" />
      {/* Full-page dotted overlay (behind content) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(160,160,160,0.28) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0, opacity: 1 }} />
      <div style={{ position: 'relative', zIndex: 10 }}>

      <nav style={{
        position: 'sticky',
        top: 0,
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

      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px 80px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '6%', animation: 'floatA 6s ease-in-out infinite' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StickyNote>Take notes to keep track of crucial details, and accomplish more tasks with ease.</StickyNote>
            <div style={{ marginTop: 8 }}><CheckIcon /></div>
          </div>
        </div>

        {/* Floating four-square icon removed per request */}

        <div style={{ position: 'absolute', top: '8%', right: '5%', display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'floatA 5s ease-in-out infinite 1s', zIndex: 20 }}>
          <ClockIcon />
          <QRCard />
        </div>

        <div className="hide-on-mobile" style={{ position: 'absolute', bottom: '8%', left: '5%', animation: 'floatB 6s ease-in-out infinite 0.5s' }}>
          <TodayTasksCard />
        </div>

        <div style={{ position: 'absolute', bottom: '8%', right: '5%', animation: 'floatA 7s ease-in-out infinite 1.5s' }}>
          <LocationTypeCard />
        </div>

        <div style={{ textAlign: 'center', zIndex: 10, maxWidth: 700 }}>
          <h1 style={{ fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 4px', color: '#111' }}>Paste, Short, and track</h1>
          <h1 style={{ fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 28px', color: '#c8c8c8' }}>all in one place</h1>
          <p style={{ fontSize: 16, color: '#666', marginBottom: 36, lineHeight: 1.6 }}>Efficiently manage your tasks and boost productivity.</p>
          <Link to="/try-now" style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>Get free demo</Link>
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
            <div key={item.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 18, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
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
        }
      `}</style>
    </div>
  )
}