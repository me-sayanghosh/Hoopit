import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="7" fill="#2563EB" />
    <path d="M8 14.5l4.5 4.5 7.5-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const StickyNote = () => (
  <div style={{
    width: 175,
    background: '#FEF08A',
    borderRadius: 4,
    padding: '16px 16px 28px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    transform: 'rotate(-2deg)',
    fontFamily: "'Caveat', cursive",
    fontSize: 15,
    lineHeight: 1.5,
    color: '#333',
    position: 'relative',
  }}>
    <div style={{
      position: 'absolute',
      top: -8,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: '#ef4444',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    }} />
    Take notes to keep track of crucial details, and accomplish more tasks with ease.
  </div>
)

const ReminderCard = () => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    padding: '16px 20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    width: 220,
    fontSize: 13,
  }}>
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, color: '#111' }}>Reminders</div>
    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meetings</div>
    <div style={{ fontWeight: 600, fontSize: 13, color: '#111' }}>Today's Meeting</div>
    <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>Call with marketing team</div>
    <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>Time</div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: '#EFF6FF',
      borderRadius: 8,
      padding: '6px 10px',
      marginBottom: 12,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
      <span style={{ color: '#2563EB', fontWeight: 600, fontSize: 12 }}>13:00 - 13:45</span>
    </div>
    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
      <div style={{ fontSize: 11, color: '#777', marginBottom: 6 }}>Meeting Link</div>
      <div style={{
        background: '#f7f7f7',
        borderRadius: 8,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2563EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>chrono.link/meet-today</div>
          <div style={{ fontSize: 10, color: '#bbb', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>meet.google.com/abc-def-ghi</div>
        </div>
      </div>
    </div>
  </div>
)

const TodayTasksCard = () => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    padding: '18px 20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    width: 240,
    fontSize: 13,
  }}>
    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#111' }}>Today's tasks</div>
    {[
      { num: 8, title: 'New Ideas for campaign', percent: 60, color: '#2563EB', date: 'Sep 10' },
      { num: 3, title: 'Design PPT #4', percent: 112, color: '#EF4444', date: 'Sep 18' },
    ].map((task, i) => (
      <div key={task.title} style={{ marginBottom: i === 0 ? 14 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: task.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{task.num}</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#222' }}>{task.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 28 }}>
          <span style={{ fontSize: 11, color: '#999', minWidth: 36 }}>{task.date}</span>
          <div style={{ flex: 1, height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(task.percent, 100)}%`, background: task.color }} />
          </div>
          <span style={{ fontSize: 11, color: '#999', minWidth: 32, textAlign: 'right' }}>{task.percent}%</span>
        </div>
      </div>
    ))}
  </div>
)

const IntegrationsCard = () => (
  <div style={{
    background: 'white',
    borderRadius: 16,
    padding: '18px 20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    width: 200,
  }}>
    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#111' }}>100+ Integrations</div>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M6 40h8V24L4 16v20c0 2.2 1.8 4 4 4z" />
          <path fill="#34A853" d="M34 40h8c2.2 0 4-1.8 4-4V16l-12 8z" />
          <path fill="#4285F4" d="M34 8h-4L24 14 18 8H6L24 22 42 8z" />
          <path fill="#FBBC05" d="M14 24V8H6c-2.2 0-4 1.8-4 4v4l12 8z" />
        </svg>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 48 48">
          <path fill="#E01E5A" d="M14 28a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4h4v4z" />
          <path fill="#36C5F0" d="M20 14a4 4 0 01-4-4 4 4 0 014-4 4 4 0 014 4v4h-4z" />
          <path fill="#2EB67D" d="M34 20a4 4 0 014 4 4 4 0 01-4 4h-4v-4a4 4 0 014-4z" />
          <path fill="#ECB22E" d="M28 34a4 4 0 01-4 4 4 4 0 01-4-4v-4h4a4 4 0 014 4z" />
        </svg>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 48 48">
          <rect x="6" y="6" width="36" height="36" rx="4" fill="white" stroke="#E0E0E0" strokeWidth="2" />
          <rect x="6" y="6" width="36" height="12" rx="4" fill="#1A73E8" />
          <text x="24" y="36" textAnchor="middle" fill="#1A73E8" fontSize="14" fontWeight="bold" fontFamily="Arial">31</text>
        </svg>
      </div>
    </div>
  </div>
)

const ClockIcon = () => (
  <div style={{
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'white',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="white" stroke="#e8e8e8" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="15" fill="#fafafa" />
      <line x1="20" y1="20" x2="13.5" y2="13" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="20" x2="27" y2="10" stroke="#333" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#ef4444" />
    </svg>
  </div>
)

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
        backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '6%', animation: 'floatA 6s ease-in-out infinite' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StickyNote />
            <div style={{ marginTop: 8 }}><CheckIcon /></div>
          </div>
        </div>

        <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', animation: 'floatB 7s ease-in-out infinite' }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#2563EB' }} />
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} /></div>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#111' }} />
            <div style={{ width: 22, height: 22, borderRadius: 5, background: '#111' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', top: '8%', right: '5%', display: 'flex', alignItems: 'flex-start', gap: 12, animation: 'floatA 5s ease-in-out infinite 1s' }}>
          <ClockIcon />
          <ReminderCard />
        </div>

        <div style={{ position: 'absolute', bottom: '8%', left: '5%', animation: 'floatB 6s ease-in-out infinite 0.5s' }}>
          <TodayTasksCard />
        </div>

        <div style={{ position: 'absolute', bottom: '8%', right: '5%', animation: 'floatA 7s ease-in-out infinite 1.5s' }}>
          <IntegrationsCard />
        </div>

        <div style={{ textAlign: 'center', zIndex: 10, maxWidth: 700 }}>
          <h1 style={{ fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 4px', color: '#111' }}>Think, plan, and track</h1>
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

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}