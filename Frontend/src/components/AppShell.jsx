import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logOutUser, getCurrentUser } from '../api/user.api.js'

const shortLinksNav = [
  { label: 'Links', icon: 'link', to: '/dashboard' },
  { label: 'Folders', icon: 'folder', to: '/folders' },
  { label: 'Tags', icon: 'tag', to: '/tags' },
  { label: 'Drafts', icon: 'draft', to: '/drafts' },
  { label: 'Archived', icon: 'spark', to: '/archived' },
]

const insightsNav = [
  { label: 'Analytics', icon: 'chart', to: '/analytics' },
]

const accountNav = [
  { label: 'Profile Settings', icon: 'cog', to: '/profile' },
]

function SidebarIcon({ name, active = false }) {
  const className = active ? 'text-white' : 'text-slate-500 transition-colors group-hover:text-slate-900'

  if (name === 'link') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
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

  if (name === 'folder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
      </svg>
    )
  }

  if (name === 'draft') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

  if (name === 'cog') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }

  if (name === 'tag') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 3.75h4.5c.621 0 1.215.247 1.656.688l6.531 6.53a2.344 2.344 0 010 3.313l-6.75 6.75a2.344 2.344 0 01-3.313 0L3.97 14.56a2.344 2.344 0 01-.688-1.657v-4.5c0-1.29 1.045-2.333 2.333-2.333h2.26z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25h.008v.008H8.25V8.25z" />
      </svg>
    )
  }

  return null
}

function SidebarNavItem({ item }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      className={({ isActive }) =>
        `group relative w-full text-left flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <div className="w-full flex items-center gap-3">
          <SidebarIcon name={item.icon} active={isActive} />
          <span>{item.label}</span>
        </div>
      )}
    </NavLink>
  )
}

export default function AppShell({ title, subtitle, children, profile, onLogout, rightSlot }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Single source-of-truth profile used in sidebar/header to avoid inconsistencies
  const [internalProfile, setInternalProfile] = useState(profile || null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await getCurrentUser()
        if (!mounted) return
        setInternalProfile(res?.user || null)
      } catch {
        // ignore failures and keep provided profile if any
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
      return
    }

    try {
      await logOutUser()
      navigate('/')
    } catch {
      // ignore
    }
  }

  const resolvedProfile = profile || internalProfile

  const sidebar = (
    <div className="rounded-3xl bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-200/80 flex flex-col h-full z-10">
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center gap-0.5 flex-wrap p-1.5 shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i === 0 || i === 1 ? 'bg-[#2563EB]' : 'bg-white'}`} style={{ opacity: i < 2 ? 1 : 0.9 }} />
            ))}
          </div>
          <span className="font-extrabold text-lg tracking-tight text-slate-900">HoopIt</span>
        </div>
      </div>

      <div className="mt-6 flex-1 shrink-0">
        <div className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-3">Short Links</div>
        <nav className="mt-3 space-y-1.5">
          {shortLinksNav.map((item) => (
            <SidebarNavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-3">Insights</div>
        <nav className="mt-3 space-y-1.5">
          {insightsNav.map((item) => (
            <SidebarNavItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-slate-400 px-3">Account</div>
        <nav className="mt-3 space-y-1.5">
          {accountNav.map((item) => (
            <SidebarNavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
        {/* Profile card */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 px-3 py-2.5 text-left transition group active:scale-[0.98]"
        >
          <img
            src={resolvedProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedProfile?.name || 'User')}&background=2563EB&color=fff`}
            alt="avatar"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition leading-tight">
              {resolvedProfile?.name || 'User'}
            </p>
            <p className="truncate text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
              {resolvedProfile?.email || ''}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 shrink-0 transition">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-slate-900 hover:bg-black px-4 py-3 text-sm font-bold text-white shadow-sm hover:shadow transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 relative font-sans">
      {/* Full-page dotted overlay (behind content) */}
      <div className="fixed inset-0 pointer-events-none radial-dots-bg z-0 opacity-100" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-auto lg:block">
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1 min-h-0 flex flex-col">
          <header className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Menu
            </button>
            <div className="text-sm font-semibold text-slate-900">{title || 'Dashboard'}</div>
            <button
              onClick={() => navigate('/profile')}
              title="View Profile"
              className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100 hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
            >
              <img
                src={resolvedProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedProfile?.name || 'User')}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </button>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-50 bg-slate-950/40 p-3 lg:hidden">
              <div className="h-full max-w-xs">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    Close
                  </button>
                </div>
                <div className="h-[calc(100%-3rem)] overflow-auto rounded-3xl">{sidebar}</div>
              </div>
            </div>
          ) : null}

          {(title || subtitle || rightSlot) ? (
            <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title ? <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">{title}</h1> : null}
                  {subtitle ? <p className="mt-1.5 text-sm sm:text-base text-slate-500 font-medium">{subtitle}</p> : null}
                </div>
                {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
              </div>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}