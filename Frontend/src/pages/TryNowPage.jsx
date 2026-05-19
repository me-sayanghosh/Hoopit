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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-slate-50">
      {/* radial dotted overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(160,160,160,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 0 }} />

      {/* Sticky tips */}
      <div className="absolute top-24 left-6 sm:top-28 sm:left-8 hidden md:flex flex-col gap-3" style={{ zIndex: 20 }}>
        <div style={{ transform: 'rotate(-6deg)' }}><StickyNote style={{ width: 140, padding: '10px 10px 12px' }}>Quick tips</StickyNote></div>
        <div style={{ transform: 'rotate(4deg)', marginLeft: 8 }}><StickyNote style={{ width: 120, padding: '8px 10px 12px' }}>Paste & Shorten</StickyNote></div>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8" style={{ zIndex: 40 }}>
        <Link
          to="/"
          aria-label="Back to home"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition"
        >
          <span>&larr; Back to Home</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative" style={{ zIndex: 30 }}>
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-blue-100 mb-3 text-blue-600 font-extrabold text-xl">
            ⚡
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Try Hoopit</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Shorten your URL instantly. No account required.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            required
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        {shortUrl && (
          <div className="mt-6 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Your Short URL</p>
            <div className="flex items-center justify-between gap-4">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline truncate text-sm">
                {shortUrl}
              </a>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleCopy}
                  className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {copied && (
                  <div role="status" aria-live="polite" className="absolute left-1/2 bottom-full -translate-x-1/2 -translate-y-2 bg-emerald-500 text-white px-3 py-1 rounded-lg shadow-[0_4px_12px_rgba(16,185,129,0.2)] font-extrabold text-[10px] white-space-nowrap">
                    Copied!
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
