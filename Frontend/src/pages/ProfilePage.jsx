import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser, updateUserProfile, deleteUserProfile, logOutUser } from '../api/user.api.js'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const nameInputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getCurrentUser()
      setProfile(res?.user || null)
      setName(res?.user?.name || '')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setUpdating(true)
    setError('')
    setSuccess('')
    try {
      const res = await updateUserProfile(name.trim())
      setProfile(res?.user || null)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update profile.')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (deleteConfirm !== profile?.email) {
      setError('Please type your exact email address to confirm deletion.')
      return
    }
    setUpdating(true)
    setError('')
    try {
      await deleteUserProfile()
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete account.')
      setUpdating(false)
    }
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    setError('')
    setLoggingOut(true)
    try {
      await logOutUser()
      setShowLogoutModal(false)
      navigate('/', { replace: true, state: { loggedOut: true } })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to logout.')
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Profile Settings" subtitle="Manage your personal details and account preferences.">
        <div className="max-w-2xl space-y-6 animate-pulse">
          {/* Back button skeleton */}
          <div className="h-9 w-40 rounded-full bg-slate-200" />

          {/* Personal Details skeleton card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-6">
            <div className="h-5 w-32 rounded-lg bg-slate-200" />

            {/* Avatar section skeleton */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="h-16 w-16 rounded-full bg-slate-200 ring-4 ring-white shadow-sm" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="h-3.5 w-44 rounded bg-slate-200" />
              </div>
            </div>

            {/* Input blocks */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-12 w-full rounded-2xl bg-slate-200" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 w-20 rounded bg-slate-200" />
                <div className="h-12 w-full rounded-2xl bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Session Control skeleton card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
            <div className="h-5 w-32 rounded-lg bg-slate-200" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-slate-200" />
              <div className="h-3.5 w-3/4 rounded bg-slate-200" />
            </div>
            <div className="h-10 w-28 rounded-full bg-slate-200" />
          </div>

          {/* Danger Zone skeleton card */}
          <div className="rounded-3xl border border-rose-100 bg-rose-50/10 p-6 shadow-[0_4px_24px_rgba(244,63,94,0.01)] space-y-4">
            <div className="h-5 w-28 rounded-lg bg-rose-100/50" />
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded bg-rose-100/40" />
              <div className="h-3.5 w-5/6 rounded bg-rose-100/40" />
            </div>
            <div className="h-10 w-36 rounded-full bg-rose-200/50" />
          </div>
        </div>
      </AppShell>
    )
  }

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=2563EB&color=fff`
  const avatarUrl = profile?.avatar || fallbackAvatar

  return (
    <AppShell
      title="Profile Settings"
      subtitle="Manage your personal details and account preferences."
      profile={profile}
      onLogout={() => setShowLogoutModal(true)}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition duration-200 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.25} stroke="currentColor" className="h-3.5 w-3.5 text-slate-500 transition-transform group-hover:-translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Personal Details</h3>

          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <img
              src={avatarUrl}
              alt="Profile"
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.src = fallbackAvatar
              }}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">{profile?.name || 'User'}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{profile?.email || ''}</p>
            </div>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <input
                type="text"
                disabled
                value={profile?.email || ''}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-500 cursor-not-allowed outline-none"
              />
              <p className="mt-1 text-[11px] font-bold text-slate-400">Email addresses are verified and cannot be changed.</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border border-slate-200 pl-5 pr-12 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-bold text-rose-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-600">
                {success}
              </div>
            )}

            {name.trim() !== (profile?.name || '').trim() && (
              <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all duration-200 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Session / Logout Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h3 className="text-base font-extrabold text-slate-900 mb-2">Session Control</h3>
          <p className="text-xs font-semibold text-slate-500 mb-4 leading-relaxed">
            Sign out of your active session on this device. You will need to log back in to access your shortened links and folders.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex items-center gap-2.5 rounded-full bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.18)] transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4.5 w-4.5 text-slate-300 transition-transform group-hover:translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Logout
          </button>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl border border-rose-100 bg-rose-50/20 p-6 shadow-[0_4px_24px_rgba(244,63,94,0.01)]">
          <h3 className="text-base font-extrabold text-rose-700 mb-2">Danger Zone</h3>
          <p className="text-xs font-semibold text-slate-500 mb-4 leading-relaxed">
            Permanently delete your Hoopit profile and all associated data including shortened links, click analytics, drafts, and folders. This action is irreversible.
          </p>

          <button
            type="button"
            onClick={() => {
              setError('')
              setShowDeleteModal(true)
            }}
            className="rounded-full bg-rose-600 hover:bg-rose-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(225,29,72,0.25)] transition"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.18)] animate-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-rose-700">Delete Permanently</h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 transition text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                To confirm deletion, please enter your email address (<strong className="text-slate-700">{profile?.email}</strong>) below:
              </p>

              <input
                type="text"
                placeholder={profile?.email}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 border-t border-slate-100 px-6 py-4 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm !== profile?.email || updating}
                onClick={handleDelete}
                className="rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)] transition disabled:opacity-40"
              >
                {updating ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.18)] animate-in zoom-in-95 duration-200">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Confirm Logout</h3>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-600 transition text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Are you sure you want to log out of your HoopIt account?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 bg-slate-50 border-t border-slate-100 px-6 py-4 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-full bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={confirmLogout}
                className="rounded-full bg-rose-600 hover:bg-rose-700 px-5 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)] transition flex items-center gap-2"
              >
                {loggingOut && (
                  <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
