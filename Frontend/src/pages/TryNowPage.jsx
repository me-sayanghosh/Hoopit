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
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white/50 hover:bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/60 shadow-sm">
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
