import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/user.api.js'
import { createFolder, getFolders, getMyShortUrls, updateFolder } from '../api/shortUrlapi.js'
import AppShell from '../components/AppShell.jsx'

const formatDate = (value) => {
  if (!value) return 'recently'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
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

  if (name === 'folder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
      </svg>
    )
  }

  return null
}

export default function FoldersPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [folders, setFolders] = useState([])
  const [urls, setUrls] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [userRes, foldersRes, urlsRes] = await Promise.all([
          getCurrentUser(),
          getFolders(),
          getMyShortUrls(),
        ])
        setProfile(userRes?.user || null)
        setFolders(foldersRes || [])
        setUrls(urlsRes?.urls || [])
      } catch (err) {
        if (err?.message?.toLowerCase().includes('unauthorized')) {
          navigate('/login')
          return
        }
        setError(err?.message || 'Unable to load folders.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  const refresh = async () => {
    const [foldersRes, urlsRes] = await Promise.all([getFolders(), getMyShortUrls()])
    setFolders(foldersRes || [])
    setUrls(urlsRes?.urls || [])
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedIds([])
    setEditingId('')
    setError('')
  }

  const startEdit = (folder) => {
    setEditingId(folder.id)
    setName(folder.name || '')
    setDescription(folder.description || '')
    setSelectedIds(folder.shortUrlIds || [])
    setError('')
    setNotice('')
  }

  const toggleSelection = (urlId) => {
    setSelectedIds((current) => (
      current.includes(urlId)
        ? current.filter((item) => item !== urlId)
        : [...current, urlId]
    ))
  }

  const groupedUrls = useMemo(() => {
    return urls.reduce((acc, item) => {
      const groupName = item.folder || 'No folder'
      if (!acc[groupName]) acc[groupName] = []
      acc[groupName].push(item)
      return acc
    }, {})
  }, [urls])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Folder name is required.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        name,
        description,
        shortUrlIds: selectedIds,
      }

      if (editingId) {
        await updateFolder(editingId, payload)
        setNotice('Folder updated successfully.')
      } else {
        await createFolder(payload)
        setNotice('Folder created successfully.')
      }

      await refresh()
      resetForm()
    } catch (err) {
      setError(err?.message || 'Failed to save folder.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <AppShell
      title="Folders"
      subtitle="Create folders from your existing links and update them later."
      profile={profile}
      rightSlot={(
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to dashboard
          </button>
          <button onClick={resetForm} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            New folder
          </button>
        </div>
      )}
    >
      <main className="min-w-0 flex-1 px-0 py-0">
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-2xl font-semibold tracking-tight text-slate-900">Folders</div>
              <p className="mt-1 text-sm text-slate-500">Create folders from your existing links and update them later.</p>
            </div>

            <div className="grid gap-6 px-6 py-6 lg:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{editingId ? 'Update folder' : 'Create folder'}</div>
                    <p className="mt-1 text-sm text-slate-500">Pick the links you want to group together.</p>
                  </div>
                  {editingId ? <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Editing</span> : null}
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Folder name</label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Marketing, Social, Launch"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      placeholder="What lives in this folder?"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">Links in folder</label>
                      <span className="text-xs text-slate-400">{selectedIds.length} selected</span>
                    </div>
                    <div className="max-h-90 space-y-2 overflow-auto rounded-xl border border-slate-200 bg-white p-3">
                      {urls.length ? urls.map((item) => {
                        const checked = selectedIds.includes(item.id)

                        return (
                          <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-sm transition ${checked ? 'border-blue-200 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSelection(item.id)}
                              className="mt-1 rounded border-slate-300"
                            />
                            <div className="min-w-0">
                              <div className="truncate font-medium text-slate-900">{item.shortUrl}</div>
                              <div className="mt-1 truncate text-xs text-slate-500">{item.originalUrl}</div>
                              {item.folder ? <div className="mt-1 text-xs text-slate-400">Current folder: {item.folder}</div> : null}
                            </div>
                          </label>
                        )
                      }) : (
                        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                          No saved links yet. Create a short link first, then come back to group it here.
                        </div>
                      )}
                    </div>
                  </div>

                  {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
                  {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white">
                      Clear
                    </button>
                    <button disabled={saving} type="submit" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60">
                      {saving ? 'Saving…' : (editingId ? 'Update folder' : 'Create folder')}
                    </button>
                  </div>
                </div>
              </form>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">Your folders</div>
                    <p className="mt-1 text-sm text-slate-500">Folders stay synced with the links you picked.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{folders.length} total</span>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {folders.length ? folders.map((folder) => (
                    <div key={folder.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold text-slate-900">{folder.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{folder.description || 'No description provided.'}</div>
                        </div>
                        <button onClick={() => startEdit(folder)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          Edit
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{folder.shortUrls?.length || 0} links</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Updated {formatDate(folder.updatedAt)}</span>
                      </div>

                      <div className="mt-4 space-y-2">
                        {(folder.shortUrls || []).slice(0, 3).map((item) => (
                          <div key={item.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                            <div className="truncate font-medium">{item.shortUrl}</div>
                            <div className="truncate text-xs text-slate-500">{item.originalUrl}</div>
                          </div>
                        ))}
                        {(folder.shortUrls || []).length > 3 ? (
                          <div className="text-xs text-slate-400">+{(folder.shortUrls || []).length - 3} more links</div>
                        ) : null}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500 xl:col-span-2">
                      No folders yet. Create one on the left and assign any of your saved links to it.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">Links by folder</div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {Object.entries(groupedUrls).map(([folderName, items]) => (
                      <div key={folderName} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-slate-900">{folderName}</div>
                          <span className="text-xs text-slate-500">{items.length}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {items.slice(0, 3).map((item) => (
                            <div key={item.id} className="truncate text-sm text-slate-600">{item.shortUrl}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </main>
    </AppShell>
  )
}
