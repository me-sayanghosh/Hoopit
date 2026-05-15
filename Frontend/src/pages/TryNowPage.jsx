import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      const data = await shortenUrl(url)
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
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
        <div className="mb-4">
          <Link to="/" className="w-fit text-slate-500 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Try Hoopit</h1>
          <p className="text-sm text-slate-500 mt-2">Shorten your URL instantly. No account required.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1f1f1f]/20 focus:border-[#1f1f1f] transition-all bg-[#f7f7f8]"
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-[#1f1f1f] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors disabled:opacity-50"
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
          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Your Short URL</p>
            <div className="flex items-center justify-between gap-4">
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-[#0066cc] font-medium hover:underline truncate">
                {shortUrl}
              </a>
              <button 
                onClick={handleCopy}
                className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TryNowPage
