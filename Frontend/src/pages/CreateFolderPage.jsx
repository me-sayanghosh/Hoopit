import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser } from '../api/user.api.js'
import { createFolder, getMyShortUrls, updateFolder } from '../api/shortUrlapi.js'

export default function CreateFolderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editingFolder = location.state?.folder || null

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
      } else {
        await createFolder(payload)
      }

      navigate('/folders')
    } catch (err) {
      setError(err?.message || 'Failed to save folder.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title={editingFolder ? `Edit folder` : 'Create folder'} subtitle="Group links into folders" profile={profile}>
      <main className="min-w-0 flex-1 px-6 py-6 overflow-hidden h-full">
        <div className="w-full h-full">
          <div className="grid gap-6 lg:grid-cols-[520px_minmax(0,1fr)] h-full">
            <div>
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 h-full flex flex-col">
                <div className="text-lg font-semibold text-slate-900">{editingFolder ? 'Update folder' : 'Create folder'}</div>

                <div className="mt-5 space-y-4 flex-1">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Folder name</label>
                    <input ref={nameRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Marketing, Social, Launch" className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${error ? 'border-rose-500' : 'border-slate-200 bg-white'}`} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What lives in this folder?" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                  </div>

                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3">
                    <div className="text-sm text-slate-700">Selected links</div>
                    <div className="mt-2 text-sm text-slate-900 font-medium">{selectedIds.length} selected</div>
                    <div className="mt-3 max-h-40 overflow-auto text-sm text-slate-700">
                      {urls.filter(u => selectedIds.includes(u.id)).slice(0,6).map(u => (
                        <div key={u.id} className="truncate">{u.shortUrl} — <span className="text-xs text-slate-500">{u.originalUrl}</span></div>
                      ))}
                    </div>
                  </div>

                  {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button type="button" onClick={() => navigate('/folders')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Cancel</button>
                  <button disabled={saving} type="submit" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">{saving ? 'Saving…' : (editingFolder ? 'Update folder' : 'Create folder')}</button>
                </div>
              </form>
            </div>

            <div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 h-full flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">All links</div>
                    <div className="mt-1 text-sm text-slate-500">Search and pick links for the folder</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} placeholder="Search links" className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none" />
                    <button type="button" onClick={selectAllVisible} className="rounded-md border border-slate-200 px-3 py-1 text-xs">Select visible</button>
                    <button type="button" onClick={clearSelection} className="rounded-md border border-slate-200 px-3 py-1 text-xs">Clear</button>
                  </div>
                </div>

                <div className="overflow-auto flex-1">
                  {filteredUrls.length ? filteredUrls.map((item) => (
                    <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 mb-2 text-sm transition ${selectedIds.includes(item.id) ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} className="mt-1 rounded border-slate-300" />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{item.shortUrl}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">{item.originalUrl}</div>
                        {item.folder ? <div className="mt-1 text-xs text-slate-400">Current folder: {item.folder}</div> : null}
                      </div>
                    </label>
                  )) : (
                    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">No saved links yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
