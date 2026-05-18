import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/user.api.js'
import { createFolder, getFolders, getMyShortUrls, updateFolder, deleteFolder } from '../api/shortUrlapi.js'
import AppShell from '../components/AppShell.jsx'

const formatDate = (value) => {
  if (!value) return 'recently'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
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
  const [deletingId, setDeletingId] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteVerifyText, setDeleteVerifyText] = useState('')

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

  function ConfirmModal({ title, children, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false, disabled = false }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white text-left shadow-2xl">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <div className="p-6">{children}</div>
          <div className="flex items-center justify-end gap-3 border-t px-4 py-3">
            <button onClick={onCancel} className="rounded-md bg-white border px-4 py-2 text-sm">Cancel</button>
            <button disabled={disabled} onClick={onConfirm} className={`rounded-md px-4 py-2 text-sm ${danger ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    )
  }

  const startEdit = (folder) => {
    // navigate to create/edit page with folder in state
    navigate('/folders/new', { state: { folder } })
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
          <button onClick={() => navigate('/folders/new')} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            New folder +
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

            <div className="grid gap-6 px-6 py-6">
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
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(folder)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(folder)
                              setDeleteVerifyText('')
                              setShowDeleteModal(true)
                            }}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
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
                      No folders yet. Click "New folder" to create one and assign any of your saved links to it.
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
              {showDeleteModal && deleteTarget ? (
                <ConfirmModal
                  title="Delete folder"
                  onCancel={() => setShowDeleteModal(false)}
                  onConfirm={async () => {
                    try {
                      if ((deleteVerifyText || '').trim() !== (deleteTarget.name || '').trim()) {
                        alert('Please type the exact folder name to confirm deletion.')
                        return
                      }

                      setShowDeleteModal(false)
                      setDeletingId(deleteTarget.id)
                      await deleteFolder(deleteTarget.id)
                      await refresh()
                      setNotice('Folder deleted.')
                    } catch (err) {
                      setError(err?.message || 'Failed to delete folder.')
                    } finally {
                      setDeletingId('')
                    }
                  }}
                  confirmLabel="Delete"
                  danger
                  disabled={!deleteVerifyText || deleteVerifyText.trim() !== (deleteTarget.name || '').trim()}
                >
                  <div className="text-sm text-slate-700 mb-3">Deleting <strong className="text-slate-900">{deleteTarget.name}</strong> will unassign its {deleteTarget.shortUrls?.length || 0} links. This can't be undone.</div>
                  <input value={deleteVerifyText} onChange={(e) => setDeleteVerifyText(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Type the full folder name to confirm" />
                </ConfirmModal>
              ) : null}
            </div>
          </div>
      </main>
    </AppShell>
  )
}
