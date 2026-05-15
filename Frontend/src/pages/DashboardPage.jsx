import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { shortenUrl } from '../api/shortUrlapi.js'
import { getCurrentUser, logOutUser } from '../api/user.api.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [aUrl, setAUrl] = useState('')
  const [aLoading, setALoading] = useState(false)
  const [aResult, setAResult] = useState('')
  const [aError, setAError] = useState('')
  const [copiedValue, setCopiedValue] = useState('')

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const profileRes = await getCurrentUser()
        setProfile(profileRes?.user || null)
      } catch (err) {
        const msg = err?.message || 'Unable to load dashboard.'
        if (msg.toLowerCase().includes('unauthorized')) return navigate('/login')
        setPageError(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  const handleLogout = async () => {
    try {
      await logOutUser()
      navigate('/')
    } catch (err) {
      setPageError(err?.message || 'Logout failed')
    }
  }

  const copy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)
    setTimeout(() => setCopiedValue(''), 1500)
  }

  const submitA = async (e) => {
    e.preventDefault()
    if (!aUrl) return
    setALoading(true)
    setAError('')
    setAResult('')
    try {
      const res = await shortenUrl(aUrl)
      const short = res?.shortUrl || ''
      if (!short) throw new Error('No short URL returned')
      setAResult(short)
      setAUrl('')
    } catch (err) {
      setAError(err?.message || 'Failed to shorten')
    } finally {
      setALoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="rounded-xl bg-white p-6 shadow">Loading dashboard…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-black mr-4 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </Link>
            <div className="h-9 w-9 rounded-md bg-[#1f1f1f] flex items-center justify-center text-white font-bold">H</div>
            <div className="hidden sm:block font-bold text-xl tracking-tighter">hoopit</div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full transition-colors relative"
            >
              <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`} alt="avatar" className="h-9 w-9 rounded-full object-cover shadow-sm border border-slate-200" />
              <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white shadow-sm"></span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1">
                <Link to="/creations" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Creations</Link>
                <Link to="/analytics" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Analytics</Link>
                <div className="border-t border-slate-100 my-1"></div>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {pageError ? (
        <div className="max-w-4xl mx-auto px-4 py-4 mt-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>
        </div>
      ) : null}

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Welcome, {profile?.name || 'User'}
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          Shorten your links, create custom memorable aliases, and track your analytics all in one place.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8 text-left">
          <h2 className="text-xl font-semibold mb-2">Generate short url</h2>
          <p className="text-sm text-slate-500 mb-6">Paste your long URL below to instantly generate a short link.</p>
          
          <form onSubmit={submitA} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="url" 
              value={aUrl} 
              onChange={(e) => setAUrl(e.target.value)} 
              placeholder="https://example.com/very/long/url" 
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1f1f1f]/20 focus:border-[#1f1f1f] transition-all bg-[#f7f7f8]" 
              required 
            />
            <button 
              type="submit" 
              disabled={aLoading} 
              className="rounded-xl bg-[#1f1f1f] hover:bg-black px-6 py-3 text-white font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {aLoading ? 'Generating…' : 'Shorten'}
            </button>
          </form>

          {aError ? <p className="mt-3 text-sm text-red-600">{aError}</p> : null}
          {aResult ? (
            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Your Short URL</p>
                <a href={aResult} target="_blank" rel="noreferrer" className="text-[#0066cc] font-medium hover:underline break-all">{aResult}</a>
              </div>
              <button onClick={() => copy(aResult)} className="text-sm border border-slate-200 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 shrink-0 font-medium text-slate-700">
                {copiedValue === aResult ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : null}
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm">
              You can create your <Link to="/custom-url" className="text-[#0066cc] font-semibold hover:underline">custom url</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
