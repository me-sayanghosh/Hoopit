import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { createFolder } from '../api/shortUrlapi.js'

export default function QuickCreateFolderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo || '/folders'
  const formState = location.state?.formState || null

  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentUser()
        setProfile(res?.user || null)
      } catch (err) {
        if (err?.message?.toLowerCase().includes('unauthorized')) {
          navigate('/login')
        }
      }
    }
    load()
  }, [navigate])

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Folder name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createFolder({ name: name.trim() })
      // Navigate back preserving the form state so the create link form doesn't lose data
      navigate(returnTo, {
        state: {
          folderCreated: true,
          newFolderName: name.trim(),
          ...(formState ? { prefill: formState } : {})
        }
      })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create folder.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      title="Create Folder"
      subtitle="Add a new folder to organize your short links."
      profile={profile}
      rightSlot={(
        <button
          onClick={() => navigate(returnTo, { state: formState ? { prefill: formState } : {} })}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Cancel
        </button>
      )}
    >
      <div className="max-w-md">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)] space-y-5">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Folder Name
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing, Social, Launch"
              className={`w-full rounded-full border px-5 py-3.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition ${
                error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500 bg-white'
              }`}
            />
            <p className="mt-2 text-[11px] font-semibold text-slate-400">
              Use a descriptive name like "Marketing Q1" or "Social Media".
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs font-semibold text-rose-600 flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-rose-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => navigate(returnTo, { state: formState ? { prefill: formState } : {} })}
              className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {saving && (
                <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {saving ? 'Creating…' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}
