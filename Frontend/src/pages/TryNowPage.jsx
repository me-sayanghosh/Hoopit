import { useState } from 'react'
import { Link } from 'react-router-dom'
import StickyNote from '../components/HeroStickyNote.jsx'
import { shortenUrl } from '../api/shortUrlapi'

function TryNowPage() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShortUrl('')
    setCopied(false)

    try {
      // Unauthenticated call
      const data = await shortenUrl({ url })
      setShortUrl(data.shortUrl)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to shorten URL. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{ background: '#f5f5f5' }}>
      {/* inline copy tooltip will appear next to the Copy button */}
      {/* dotted overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(160,160,160,0.18) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ transform: 'rotate(-6deg)' }}><StickyNote style={{ width: 140, padding: '10px 10px 12px' }}>Quick tips</StickyNote></div>
        <div style={{ transform: 'rotate(4deg)', marginLeft: 8 }}><StickyNote style={{ width: 120, padding: '8px 10px 12px' }}>Try paste a URL</StickyNote></div>
      </div>
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8" style={{ zIndex: 40 }}>
        <Link to="/" aria-label="Back to home" className="inline-flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors bg-white/70 hover:bg-white p-2 rounded-lg border border-slate-200/60 shadow-sm backdrop-blur-sm" style={{ width: 38, height: 38 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#1f6feb" opacity="0.95" />
            <path d="M14 8l-4 4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-md" style={{ zIndex: 30 }}>
        <div className="text-center mb-6">
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>Try Hoopit</h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>Shorten your URL instantly. No account required.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none transition-all bg-white"
            style={{ boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.03)' }}
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-medium hover:brightness-95 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className="mt-6 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>Your Short URL</p>
            <div className="flex items-center justify-between gap-4">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-[#2563EB] font-medium hover:underline truncate">
                {shortUrl}
              </a>
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={handleCopy}
                  className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {copied && (
                  <div role="status" aria-live="polite" style={{ position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%) translateY(-8px)', background: '#10B981', color: 'white', padding: '6px 8px', borderRadius: 6, boxShadow: '0 6px 18px rgba(16,185,129,0.18)', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                    Successfully copied
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TryNowPage
