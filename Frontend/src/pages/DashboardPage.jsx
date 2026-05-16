import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shortenUrl, getMyShortUrls } from '../api/shortUrlapi.js'
import { getCurrentUser, logOutUser } from '../api/user.api.js'

function CopyToast({ value }) {
  if (!value) return null

  const display = value.length > 54 ? `${value.slice(0, 51)}...` : value

  return (
    <div className="fixed right-4 top-20 z-50">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="min-w-0 text-sm">
          <div className="font-semibold">Copied to clipboard</div>
          <div className="max-w-xs truncate text-xs text-slate-500">{display}</div>
        </div>
      </div>
    </div>
  )
}

const sidebarItems = [
  { label: 'Links', icon: 'link', active: true },
  { label: 'Domains', icon: 'globe' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Events', icon: 'spark' },
  { label: 'Customers', icon: 'user' },
  { label: 'Folders', icon: 'folder' },
  { label: 'Tags', icon: 'tag' },
]

const formatDate = (value) => {
  if (!value) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function SidebarIcon({ name, active = false }) {
  const className = active ? 'text-blue-600' : 'text-slate-500'

  if (name === 'link') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    )
  }

  if (name === 'globe') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 3 2 4-5" />
      </svg>
    )
  }

  if (name === 'spark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75l1.06 4.24a2.25 2.25 0 001.66 1.66l4.24 1.06-4.24 1.06a2.25 2.25 0 00-1.66 1.66l-1.06 4.24-1.06-4.24a2.25 2.25 0 00-1.66-1.66l-4.24-1.06 4.24-1.06a2.25 2.25 0 001.66-1.66l1.06-4.24z" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25a7.5 7.5 0 0115 0" />
      </svg>
    )
  }

  if (name === 'folder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" />
    </svg>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [urls, setUrls] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [composerOpen, setComposerOpen] = useState(false)

  const [aUrl, setAUrl] = useState('')
  const [aLoading, setALoading] = useState(false)
  const [aResult, setAResult] = useState('')
  const [aError, setAError] = useState('')
  const [copiedValue, setCopiedValue] = useState('')

  const composerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, urlsRes] = await Promise.all([
          getCurrentUser(),
          getMyShortUrls(),
        ])
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

  const copy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)
    setTimeout(() => setCopiedValue(''), 1800)
  }

  const refreshUrls = async () => {
    try {
      const urlsRes = await getMyShortUrls()
      setUrls(urlsRes?.urls || [])
    } catch (err) {
      setPageError(err?.message || 'Unable to refresh links.')
    }
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

  const filteredUrls = (() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return urls

    return urls.filter((item) => {
      const shortUrl = item?.shortUrl || ''
      const originalUrl = item?.originalUrl || ''
      return shortUrl.toLowerCase().includes(query) || originalUrl.toLowerCase().includes(query)
    })
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
            Loading workspace…
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-400">
        <aside className="hidden w-18.5 flex-col items-center border-r border-slate-200 bg-white py-4 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">h</div>
          <img
            src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`}
            alt="avatar"
            className="mt-4 h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
          />

          <div className="mt-8 flex flex-1 flex-col items-center gap-5 text-slate-500">
            <button className="rounded-2xl bg-blue-50 p-3 text-blue-600 shadow-sm">
              <SidebarIcon name="link" active />
            </button>
            <button className="rounded-2xl p-3 transition hover:bg-slate-100">
              <SidebarIcon name="chart" />
            </button>
            <button className="rounded-2xl p-3 transition hover:bg-slate-100">
              <SidebarIcon name="spark" />
            </button>
          </div>

          <button onClick={handleLogout} className="rounded-2xl p-3 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h12m0 0-3-3m3 3-3 3" />
            </svg>
          </button>
        </aside>

        <aside className="hidden w-65 flex-col border-r border-slate-200 bg-[#f7f7f8] px-4 py-4 lg:flex">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="text-sm font-semibold text-slate-900">Short Links</div>
            <nav className="mt-4 space-y-1">
              {sidebarItems.map((item) => (
                <div key={item.label} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${item.active ? 'bg-blue-50 font-medium text-blue-600' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <SidebarIcon name={item.icon} active={item.active} />
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>

            <div className="mt-8 border-t border-slate-200 pt-4">
              <div className="text-sm font-medium text-slate-500">Usage</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Links</span>
                  <span className="font-medium text-slate-900">{urls.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Analytics</span>
                  <span className="font-medium text-slate-900">Live</span>
                </div>
              </div>
              <button onClick={handleLogout} className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black">
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xl font-semibold tracking-tight text-slate-900">Links</div>
                <p className="mt-1 text-sm text-slate-500">Manage short links, custom aliases, and analytics in one place.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden items-center gap-2 lg:flex">
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Filter</button>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Display</button>
                </div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                  </svg>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by short link or URL"
                    className="w-65 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
                  />
                </div>
                <button onClick={() => setComposerOpen((value) => !value)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
                  Create link
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              {pageError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pageError}
                </div>
              ) : null}

              {composerOpen ? (
                <div ref={composerRef} className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Create link</p>
                      <p className="mt-1 text-sm text-slate-600">Paste a long URL and generate a short Hoopit link.</p>
                    </div>
                    <button onClick={() => setComposerOpen(false)} className="self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Close
                    </button>
                  </div>

                  <form onSubmit={submitA} className="mt-4 flex flex-col gap-3 lg:flex-row">
                    <input
                      type="url"
                      value={aUrl}
                      onChange={(e) => setAUrl(e.target.value)}
                      placeholder="https://example.com/very/long/url"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300"
                      required
                    />
                    <button type="submit" disabled={aLoading} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
                      {aLoading ? 'Creating…' : 'Shorten'}
                    </button>
                  </form>

                  {aError ? <p className="mt-3 text-sm text-red-600">{aError}</p> : null}
                  {aResult ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Your short link</p>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <a href={aResult} target="_blank" rel="noreferrer" className="break-all text-sm font-medium text-blue-700 hover:underline">
                          {aResult}
                        </a>
                        <button onClick={() => copy(aResult)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                          {copiedValue === aResult ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                <span>Viewing {filteredUrls.length || 0} of {urls.length} links</span>
                <span>{profile?.name || 'User'}</span>
              </div>

              <div className="space-y-4">
                {filteredUrls.length ? (
                  filteredUrls.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                          {((item.shortUrl || 'L').replace(/^https?:\/\//, '').charAt(0) || 'L').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <a href={item.shortUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                              {item.shortUrl}
                            </a>
                            <button onClick={() => copy(item.shortUrl)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                              {copiedValue === item.shortUrl ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="mt-1 truncate text-sm text-slate-500">↳ {item.originalUrl}</div>
                          <div className="mt-2 text-xs text-slate-400">Created {formatDate(item.createdAt)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start lg:self-center">
                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                          {item.clicks || 0} clicks
                        </div>
                        <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <p className="text-lg font-semibold text-slate-900">No links found</p>
                    <p className="mt-2 text-sm text-slate-500">Create your first short link to populate this view.</p>
                    <button onClick={() => setComposerOpen(true)} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
                      Create link
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <span>Viewing {filteredUrls.length} of {urls.length} links</span>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Previous</button>
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Next</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {copiedValue ? <CopyToast value={copiedValue} /> : null}
    </div>
  )
}
