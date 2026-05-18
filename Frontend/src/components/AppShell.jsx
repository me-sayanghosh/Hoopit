import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Links', icon: 'link', to: '/dashboard' },
  { label: 'Create', icon: 'spark', to: '/create' },
  { label: 'Analytics', icon: 'chart', to: '/analytics' },
  { label: 'Folders', icon: 'folder', to: '/folders' },
  { label: 'Customers', icon: 'user', to: '/customers' },
  
]

function Icon({ name, active = false }) {
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

  if (name === 'folder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
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

function SidebarLink({ item, active, onNavigate }) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.to)}
      className={`relative w-full text-left flex items-center gap-3 rounded-lg pl-4 pr-3 py-2 text-sm ${active ? 'bg-blue-50 font-medium text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
    >
      {active ? <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-500" /> : null}
      <Icon name={item.icon} active={active} />
      <span>{item.label}</span>
    </button>
  )
}

export default function AppShell({ title, subtitle, children, profile, onLogout, rightSlot }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const activePath = useMemo(() => {
    return navItems.find((item) => location.pathname.startsWith(item.to))?.to || '/dashboard'
  }, [location.pathname])

  const handleNavigate = (to) => {
    setMobileOpen(false)
    navigate(to)
  }

  const sidebar = (
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
        <div className="text-sm font-semibold text-slate-900">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navItems.map((item) => (
            <SidebarLink
              key={item.label}
              item={item}
              active={activePath === item.to}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4 px-1">
        <div className="text-xs font-medium text-slate-500">Quick actions</div>
        <div className="mt-3 space-y-1">
          <button onClick={() => handleNavigate('/create')} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 transition">
            Create link
          </button>
          <button onClick={() => handleNavigate('/dashboard')} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 transition">
            Dashboard
          </button>
          <button onClick={() => handleNavigate('/analytics')} className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 transition">
            Analytics
          </button>
        </div>
      </div>

      {onLogout ? (
        <div className="mt-auto px-1 pt-4">
          <button onClick={onLogout} className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full gap-4 px-3 py-3 sm:px-4 lg:px-6 lg:py-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 shrink-0 overflow-auto lg:block">
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
            <button type="button" onClick={() => setMobileOpen((value) => !value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Menu
            </button>
            <div className="text-sm font-semibold text-slate-900">{title || 'Dashboard'}</div>
            <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              <img
                src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </header>

          {mobileOpen ? (
            <div className="fixed inset-0 z-50 bg-slate-950/40 p-3 lg:hidden">
              <div className="h-full max-w-xs">
                <div className="mb-2 flex justify-end">
                  <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    Close
                  </button>
                </div>
                <div className="h-[calc(100%-3rem)] overflow-auto rounded-3xl">{sidebar}</div>
              </div>
            </div>
          ) : null}

          {(title || subtitle || rightSlot) ? (
            <div className="mb-4 rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title ? <div className="text-2xl font-semibold tracking-tight text-slate-900">{title}</div> : null}
                  {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
                </div>
                {rightSlot ? <div>{rightSlot}</div> : null}
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  )
}