import { Link } from 'react-router-dom'

import StickyNote from './HeroStickyNote.jsx'

function AuthLayout({ title, description, children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: '#f5f5f5' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="py-6 px-8 w-full flex justify-between items-center">
        <Link to="/" className="font-bold text-xl tracking-tight text-gray-900">
          hoopit
        </Link>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Back to home
        </Link>
      </header>

      {/* Hero-like background area with clock + QR */}
      <main className="flex-1 flex items-center justify-center p-4" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />

        <div style={{ position: 'absolute', top: '6%', left: '5%', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9 }}>
          <div style={{ transform: 'rotate(-6deg)', transformOrigin: 'left top' }}>
            <StickyNote style={{ width: 140, padding: '10px 10px 14px' }}>Quick location notes</StickyNote>
          </div>
          <div style={{ transform: 'rotate(4deg)', marginLeft: 8 }}>
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