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
    try {
      const [foldersRes, urlsRes] = await Promise.all([getFolders(), getMyShortUrls()])
      setFolders(foldersRes || [])
      setUrls(urlsRes?.urls || [])
    } catch (err) {
      setError(err?.message || 'Failed to refresh data.')
    }
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
          <div className="mb-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
          </div>
          <div className="mb-6">{children}</div>
          <div className="flex items-center justify-end gap-3">
            <button onClick={onCancel} className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition">
              Cancel
            </button>
            <button
              disabled={disabled}
              onClick={onConfirm}
              className={`rounded-full px-5 py-2.5 text-sm font-bold text-white transition ${
                danger
                  ? 'bg-red-600 hover:bg-red-700 shadow-[0_4px_20px_rgba(220,38,38,0.25)]'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-[0_4px_20px_rgba(37,99,235,0.25)]'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              {confirmLabel}
            </button>
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

  // auto-hide notices after a short delay
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(id)
  }, [notice])

  if (loading) {
    return (
      <AppShell title="Folders" subtitle="Organize your short links into folders.">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Folders"
      subtitle="Organize your short links into folders."
      profile={profile}
      rightSlot={(
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition">
            Back to Dashboard
          </button>
          <button onClick={() => navigate('/folders/new')} className="rounded-full bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 text-sm font-bold shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition">
            New Folder +
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Your folders</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Folders stay synced with the links you picked.</p>
          </div>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-600">{folders.length} total</span>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {folders.length ? folders.map((folder) => (
            <div key={folder.id} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-bold text-slate-900">{folder.name}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500">{folder.description || 'No description provided.'}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(folder)} className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(folder)
                        setDeleteVerifyText('')
                        setShowDeleteModal(true)
                      }}
                      className="rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-600">{folder.shortUrls?.length || 0} links</span>
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-500">Updated {formatDate(folder.updatedAt)}</span>
                </div>

                <div className="mt-5 space-y-2.5">
                  {(folder.shortUrls || []).slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm">
                      <div className="truncate font-bold text-slate-800">{item.shortUrl}</div>
                      <div className="truncate text-xs font-medium text-slate-400 mt-0.5">{item.originalUrl}</div>
                    </div>
                  ))}
                  {(folder.shortUrls || []).length > 3 ? (
                    <div className="text-xs font-bold text-slate-400 px-1">+{(folder.shortUrls || []).length - 3} more links</div>
                  ) : null}
                </div>
              </div>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-medium text-slate-500 xl:col-span-2">
              No folders yet. Click "New folder" to create one and assign any of your saved links to it.
            </div>
          )}
        </div>

        {/* Links by folder */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <div className="text-base font-bold text-slate-900">Links by folder</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {Object.entries(groupedUrls).map(([folderName, items]) => (
              <div key={folderName} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 mb-3">
                  <div className="font-bold text-slate-800">{folderName}</div>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="truncate text-sm font-medium text-slate-600">{item.shortUrl}</div>
                  ))}
                </div>
              </div>
            ))}
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
            <div className="text-sm font-medium text-slate-600 mb-4">
              Deleting <strong className="text-slate-900 font-bold">{deleteTarget.name}</strong> will unassign its {deleteTarget.shortUrls?.length || 0} links. This cannot be undone.
            </div>
            <input
              value={deleteVerifyText}
              onChange={(e) => setDeleteVerifyText(e.target.value)}
              className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Type the full folder name to confirm"
            />
          </ConfirmModal>
        ) : null}
      </div>

      {notice ? (
        <div className="fixed right-6 bottom-6 z-50 animate-slide-in">
          <div className="rounded-full border border-slate-200/80 bg-white px-5 py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-sm font-bold text-slate-800">{notice}</div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
