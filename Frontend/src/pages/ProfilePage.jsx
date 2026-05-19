import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser, updateUserProfile, deleteUserProfile } from '../api/user.api.js'

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
    load()
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

  if (loading) {
    return (
      <AppShell title="Profile Settings" subtitle="Manage your personal details and account preferences.">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile Settings" subtitle="Manage your personal details and account preferences.">
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
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
              />
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

            <button
              type="submit"
              disabled={updating}
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_2px_10px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-all duration-200 disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
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
    </AppShell>
  )
}
