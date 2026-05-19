import { Link } from 'react-router-dom'

import StickyNote from './HeroStickyNote.jsx'

function AuthLayout({ title, description, children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#f5f5f5', position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)', backgroundSize: '24px 24px', zIndex: 0 }} />

      {/* Header */}
      <header className="py-6 px-8 w-full flex justify-between items-center" style={{ position: 'relative', zIndex: 30 }}>
        <Link to="/" className="font-bold text-xl tracking-tight text-gray-900">
          hoopit
        </Link>
        <Link to="/" aria-label="Back to home" title="Back to home" className="transform-gpu transition-transform inline-flex items-center justify-center p-2 rounded-xl shadow-lg hover:scale-105 active:scale-95" style={{ background: 'linear-gradient(135deg,#2fa8ff 0%,#0b64e6 60%)', width: 44, height: 44, zIndex: 40 }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </header>

      {/* Hero-like background area with clock + QR */}
      <main className="flex-1 flex items-center justify-center p-4" style={{ position: 'relative', zIndex: 10 }}>
        

        <div style={{ position: 'absolute', top: 36, left: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 20 }}>
          <div style={{ transform: 'rotate(-6deg)', transformOrigin: 'left top', marginLeft: -8 }}>
            <StickyNote style={{ width: 140, padding: '10px 10px 14px' }}>Quick location notes</StickyNote>
          </div>
          <div style={{ transform: 'rotate(4deg)', marginLeft: -4 }}>
            <StickyNote style={{ width: 120, padding: '8px 10px 12px' }}>Find where ?</StickyNote>
          </div>
        </div>

        <div className="w-full max-w-md" style={{ zIndex: 10 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-500 text-[0.95rem]">{description}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Hoopit Inc. All rights reserved.
      </footer>
    </div>
  )
}

export default AuthLayout