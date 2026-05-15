import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { shortenUrl, createCustomShortUrl, getMyShortUrls } from '../api/shortUrlapi.js'
import { getCurrentUser, logOutUser } from '../api/user.api.js'

const formatDate = (value) => {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  // Card A - shorten
  const [aUrl, setAUrl] = useState('')
  const [aLoading, setALoading] = useState(false)
  const [aResult, setAResult] = useState('')
  const [aError, setAError] = useState('')

  // Card B - custom alias
  const [bUrl, setBUrl] = useState('')
  const [bAlias, setBAlias] = useState('')
  const [bLoading, setBLoading] = useState(false)
  const [bResult, setBResult] = useState('')
  const [bError, setBError] = useState('')

  const [copiedValue, setCopiedValue] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, urlsRes] = await Promise.all([getCurrentUser(), getMyShortUrls()])
        setProfile(profileRes?.user || null)
        setUrls(urlsRes?.urls || [])
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

  const handleLogout = async () => {
    try {
      await logOutUser()
      navigate('/')
    } catch (err) {
      setPageError(err?.message || 'Logout failed')
    }
  }

  const refreshUrls = async () => {
    try {
      const res = await getMyShortUrls()
      setUrls(res?.urls || [])
    } catch {
      // ignore
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
      await refreshUrls()
    } catch (err) {
      setAError(err?.message || 'Failed to shorten')
    } finally {
      setALoading(false)
    }
  }

  const submitB = async (e) => {
    e.preventDefault()
    if (!bUrl || !bAlias) return
    setBLoading(true)
    setBError('')
    setBResult('')
    try {
      const res = await createCustomShortUrl(bUrl, bAlias)
      const short = res?.shortUrl || ''
      if (!short) throw new Error('No custom short URL returned')
      setBResult(short)
      setBUrl('')
      setBAlias('')
      await refreshUrls()
    } catch (err) {
      setBError(err?.message || 'Failed to create custom alias')
    } finally {
      setBLoading(false)
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
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">H</div>
            <div className="hidden sm:block font-semibold">Hoopit</div>
          </div>

          <nav className="hidden md:flex gap-6 text-sm text-slate-700">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <Link to="/analytics" className="hover:text-slate-900">Analytics</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
              <button onClick={handleLogout} className="rounded-md bg-slate-900 px-3 py-1 text-sm font-medium text-white">Logout</button>
            </div>
          </div>
        </div>
      </header>
      {pageError ? (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageError}</p>
        </div>
      ) : null}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
          <aside className="md:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-4">
                <img src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`} alt="avatar" className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold truncate">{profile?.name || 'User'}</h3>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Signed in</span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{profile?.email || ''}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600">Quick tools to shorten links and create memorable aliases.</p>
            </div>
          </aside>

          <section className="md:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-semibold">Shorten any link</h4>
              <p className="mt-1 text-sm text-slate-600">Paste a long URL and generate a short link.</p>

              <form onSubmit={submitA} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input type="url" value={aUrl} onChange={(e) => setAUrl(e.target.value)} placeholder="https://example.com/very/long/url" className="flex-1 rounded-md border border-slate-200 px-3 py-2" required />
                <button type="submit" disabled={aLoading} className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold">{aLoading ? 'Generating…' : 'Generate short URL'}</button>
              </form>

              {aError ? <p className="mt-3 text-sm text-red-600">{aError}</p> : null}
              {aResult ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 flex items-center justify-between gap-3">
                  <a href={aResult} target="_blank" rel="noreferrer" className="text-blue-700 break-all">{aResult}</a>
                  <button onClick={() => copy(aResult)} className="text-sm text-slate-700">{copiedValue === aResult ? 'Copied' : 'Copy'}</button>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-semibold">Create a custom alias</h4>
              <p className="mt-1 text-sm text-slate-600">Provide a URL and pick a short, memorable alias.</p>

              <form onSubmit={submitB} className="mt-4 grid gap-3">
                <input type="url" value={bUrl} onChange={(e) => setBUrl(e.target.value)} placeholder="https://example.com/your-page" className="rounded-md border border-slate-200 px-3 py-2" required />
                <input type="text" value={bAlias} onChange={(e) => setBAlias(e.target.value)} placeholder="your-alias" className="rounded-md border border-slate-200 px-3 py-2" required />
                <div className="flex justify-end">
                  <button type="submit" disabled={bLoading} className="rounded-md bg-slate-900 px-4 py-2 text-white font-semibold">{bLoading ? 'Creating…' : 'Create custom alias'}</button>
                </div>
              </form>

              {bError ? <p className="mt-3 text-sm text-red-600">{bError}</p> : null}
              {bResult ? (
                <div className="mt-3 rounded-md bg-slate-50 p-3 flex items-center justify-between gap-3">
                  <a href={bResult} target="_blank" rel="noreferrer" className="text-slate-900 break-all">{bResult}</a>
                  <button onClick={() => copy(bResult)} className="text-sm text-slate-700">{copiedValue === bResult ? 'Copied' : 'Copy'}</button>
                </div>
              ) : null}
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-semibold">URLs created by you</h4>
              <p className="mt-1 text-sm text-slate-600">A list of saved links with click counts.</p>

              {urls.length ? (
                <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                  <div className="hidden md:grid grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.7fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                    <span>Original URL</span>
                    <span>Short URL</span>
                    <span>Clicks</span>
                    <span>Created</span>
                    <span>Action</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {urls.map((item) => (
                      <div key={item.id} className="grid gap-4 px-4 py-4 md:grid-cols-[1.4fr_1fr_0.6fr_0.7fr_0.7fr] md:items-center">
                        <a href={item.originalUrl} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-slate-900 hover:text-blue-700">{item.originalUrl}</a>
                        <a href={item.shortUrl} target="_blank" rel="noreferrer" className="break-all text-sm text-blue-700 hover:underline">{item.shortUrl}</a>
                        <span className="text-sm font-semibold text-slate-700">{item.clicks || 0}</span>
                        <span className="text-sm text-slate-500">{formatDate(item.createdAt)}</span>
                        <button type="button" onClick={() => copy(item.shortUrl)} className="justify-self-start rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">{copiedValue === item.shortUrl ? 'Copied' : 'Copy'}</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">You have not created any URLs yet.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

