import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyShortUrls } from '../api/shortUrlapi.js'
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
  { label: 'Analytics', icon: 'chart' },
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
  const [copiedValue, setCopiedValue] = useState('')

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

  // Create composer moved to separate Create page

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="hidden lg:flex w-64 flex-col px-2 py-6 sticky top-6 self-start h-[calc(100vh-48px)] overflow-auto">
          <div className="rounded-3xl bg-[#f3f4f6] p-3 shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center gap-3 px-2">
              <div className="text-2xl font-extrabold text-slate-900">dub</div>
              <div className="ml-auto">
                <img
                  src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm shrink-0">
              <div className="text-sm font-semibold text-slate-900">Short Links</div>
              <nav className="mt-3 space-y-1">
                {sidebarItems.map((item) => (
                  <button key={item.label} onClick={() => {
                    if (item.label === 'Links') return navigate('/dashboard')
                    if (item.label === 'Analytics') return navigate('/analytics')
                    // default: no-op
                  }} className={`relative w-full text-left flex items-center gap-3 rounded-lg pl-4 pr-3 py-2 text-sm ${item.active ? 'bg-blue-50 font-medium text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {item.active ? <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-500" /> : null}
                    <SidebarIcon name={item.icon} active={item.active} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-4 text-sm text-slate-500">Insights</div>
              <nav className="mt-2 space-y-1">
                <button onClick={() => navigate('/analytics')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="chart" />
                  <span>Analytics</span>
                </button>
                
                <button onClick={() => navigate('/customers')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="user" />
                  <span>Customers</span>
                </button>
              </nav>

              <div className="mt-4 text-sm text-slate-500">Library</div>
              <nav className="mt-2 space-y-1">
                <button onClick={() => navigate('/folders')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="folder" />
                  <span>Folders</span>
                </button>
                
              </nav>
            </div>

            <div className="mt-auto px-1">
              <button onClick={handleLogout} className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Logout</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-2 py-6 sm:px-4 lg:px-6">
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-900">Links</div>
                <p className="mt-1 text-sm text-slate-500">Manage short links, custom aliases, and analytics in one place.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden items-center gap-2 lg:flex">
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Filter</button>
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Display</button>
                </div>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                  </svg>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by short link or URL"
                    className="w-96 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
                  />
                </div>
                <button onClick={() => navigate('/create')} className="relative rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
                  Create link
                  <span className="ml-2 inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-white opacity-80">C</span>
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              {pageError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pageError}
                </div>
              ) : null}

              {/* Create composer moved to its own page at /create */}

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

                      <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                          {item.clicks || 0} clicks
                        </div>
                        <button onClick={() => navigate('/analytics')} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
                          View Analytics
                        </button>
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
                    <button onClick={() => navigate('/create')} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
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
