import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { createFolder, getMyShortUrls, updateFolder } from '../api/shortUrlapi.js'

export default function CreateFolderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editingFolder = location.state?.folder || null
  const returnTo = location.state?.returnTo || '/folders'

  const [profile, setProfile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [urls, setUrls] = useState([])
  const [filterTerm, setFilterTerm] = useState('')
  const [name, setName] = useState(editingFolder?.name || '')
  const [description, setDescription] = useState(editingFolder?.description || '')
  const [selectedIds, setSelectedIds] = useState(editingFolder?.shortUrlIds || [])
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, urlsRes] = await Promise.all([getCurrentUser(), getMyShortUrls()])
        setProfile(profileRes?.user || null)
        setUrls(urlsRes?.urls || [])
      } catch (err) {
        const msg = err?.message || 'Unable to load.'
        if (msg.toLowerCase().includes('unauthorized')) return navigate('/login')
        setError(msg)
      }
    }

    load()
  }, [navigate])

  useEffect(() => {
    // autofocus name input for better UX
    if (nameRef.current) {
      nameRef.current.focus()
      nameRef.current.select()
    }
  }, [])

  const filteredUrls = useMemo(() => {
    const q = String(filterTerm || '').trim().toLowerCase()
    if (!q) return urls
    return urls.filter((u) => (u.shortUrl || '').toLowerCase().includes(q) || (u.originalUrl || '').toLowerCase().includes(q))
  }, [urls, filterTerm])

  const toggleSelection = (urlId) => {
    setSelectedIds((current) => (
      current.includes(urlId) ? current.filter((item) => item !== urlId) : [...current, urlId]
    ))
  }

  const selectAllVisible = () => {
    const ids = filteredUrls.map((u) => u.id)
    setSelectedIds((current) => Array.from(new Set([...current, ...ids])))
  }

  const clearSelection = () => setSelectedIds([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Folder name is required.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = { name, description, shortUrlIds: selectedIds }
      if (editingFolder) {
        await updateFolder(editingFolder.id, payload)
        navigate(returnTo, { state: { folderUpdated: true } })
      } else {
        await createFolder(payload)
        navigate(returnTo, { state: { folderCreated: true } })
      }
    } catch (err) {
      setError(err?.message || 'Failed to save folder.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      title={editingFolder ? `Edit Folder` : 'Create Folder'}
      subtitle={editingFolder ? 'Update folder name, description, and link tags.' : 'Group your existing short links into a folder.'}
      profile={profile}
    >
      <div className="w-full">
        <div className="grid gap-6 lg:grid-cols-[450px_1fr]">
          {/* Left Form Panel */}
          <div>
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
                {editingFolder ? 'Update Folder Details' : 'New Folder'}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Folder Name</label>
                  <input
                    ref={nameRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Marketing, Social, Launch"
                    className={`w-full rounded-full border px-5 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition ${
                      error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500 bg-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="What lives in this folder?"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>

                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected Links</div>
                  <div className="mt-1 text-sm font-bold text-blue-600">{selectedIds.length} selected</div>
                  <div className="mt-3.5 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {urls.filter(u => selectedIds.includes(u.id)).slice(0, 6).map(u => (
                      <div key={u.id} className="truncate text-xs font-semibold text-slate-700 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
                        {u.shortUrl} <span className="text-slate-400 font-medium">— {u.originalUrl}</span>
                      </div>
                    ))}
                    {selectedIds.length > 6 ? (
                      <div className="text-[10px] font-bold text-slate-400 px-1">+ {selectedIds.length - 6} more links</div>
                    ) : null}
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => navigate('/folders')}
                  className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? 'Saving…' : (editingFolder ? 'Update Folder' : 'Create Folder')}
                </button>
              </div>
            </form>
          </div>

          {/* Right Links Selection Panel */}
          <div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col h-130">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">All Short Links</div>
                  <div className="mt-0.5 text-sm font-medium text-slate-500">Pick links to group into this folder</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    placeholder="Search links..."
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition w-36 sm:w-48"
                  />
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-2">
                {filteredUrls.length ? filteredUrls.map((item) => {
                  const isChecked = selectedIds.includes(item.id)
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition-all duration-200 ${
                        isChecked
                          ? 'border-blue-300 bg-blue-50/40 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelection(item.id)}
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-800">{item.shortUrl}</div>
                        <div className="mt-0.5 truncate text-xs font-semibold text-slate-400">{item.originalUrl}</div>
                        {item.folder ? (
                          <div className="mt-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full inline-block">
                            Current: {item.folder}
                          </div>
                        ) : null}
                      </div>
                    </label>
                  )
                }) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-medium text-slate-500">
                    No links found matching filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
