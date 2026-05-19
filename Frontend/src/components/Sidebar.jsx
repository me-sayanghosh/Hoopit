import { useNavigate, NavLink } from 'react-router-dom'
import { logOutUser } from '../api/user.api.js'

function NavItem({ label, icon, to }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `relative w-full text-left flex items-center gap-3 rounded-lg pl-4 pr-3 py-2 text-sm ${isActive ? 'bg-blue-50 font-medium text-blue-600' : 'text-slate-600 hover:bg-slate-50 transition'}`}>
      {({ isActive }) => (
        <div className="w-full flex items-center gap-3">
          {isActive ? <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-500" /> : null}
          <SidebarIcon name={icon} active={isActive} />
          <span>{label}</span>
        </div>
      )}
    </NavLink>
  )
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

  if (name === 'draft') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" />
    </svg>
  )
}

export default function Sidebar({ profile }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logOutUser()
      navigate('/')
    } catch {
      // ignore
    }
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col px-2 py-6 sticky top-6 self-start h-[calc(100vh-48px)] overflow-auto">
      <div className="rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-200/80 p-4 flex flex-col h-full">
        <div className="flex items-center gap-3 px-2 mb-2">
          <div className="text-2xl font-extrabold tracking-tight text-blue-600">hoopit</div>
          <div className="ml-auto">
            <img
              src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`}
              alt="avatar"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50/50 border border-slate-100 p-4 shadow-sm shrink-0">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Short Links</div>
          <nav className="mt-3 space-y-1">
            <NavItem label="Links" icon="link" to="/dashboard" />
            <NavItem label="Folders" icon="folder" to="/folders" />
            <NavItem label="Tags" icon="tag" to="/tags" />
            <NavItem label="Drafts" icon="draft" to="/drafts" />
            <NavItem label="Archived" icon="spark" to="/archived" />
          </nav>

          <div className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Insights</div>
          <nav className="mt-2 space-y-1">
            <NavItem label="Customers" icon="user" to="/customers" />
          </nav>
        </div>

        <div className="mt-auto px-1 pt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}[]