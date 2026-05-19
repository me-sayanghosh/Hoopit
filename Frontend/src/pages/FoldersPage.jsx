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
  const [viewFolder, setViewFolder] = useState(null)
  const [folderSearch, setFolderSearch] = useState('')
  const [activeMenuId, setActiveMenuId] = useState(null)

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
                  <div className="min-w-0 cursor-pointer group flex-1" onClick={() => setViewFolder(folder)}>
                    <div className="truncate text-lg font-bold text-slate-900 group-hover:text-blue-600 transition flex items-center gap-1.5">
                      <span>{folder.name}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-500 line-clamp-1">{folder.description || 'No description provided.'}</div>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === folder.id ? null : folder.id);
                      }}
                      className="rounded-full hover:bg-slate-100 p-2 text-slate-400 hover:text-slate-700 transition"
                      title="Folder actions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>
                    {activeMenuId === folder.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-1.5 w-32 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] z-20 animate-scale-up text-left">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setViewFolder(folder);
                            }}
                            className="w-full rounded-xl px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              startEdit(folder);
                            }}
                            className="w-full rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              setDeleteTarget(folder);
                              setDeleteVerifyText('');
                              setShowDeleteModal(true);
                            }}
                            className="w-full rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.78 0L9 9m4.77-3.07 1.91.55c.51.15.86.61.86 1.15v.377m-15.318 0 1.353 13.622a2.25 2.25 0 0 0 2.25 2.25h9.081a2.25 2.25 0 0 0 2.25-2.25L18.735 7.697m-15.318 0 .524-5.23c.041-.41.385-.72.793-.72h6.815c.408 0 .752.31.793.72l.524 5.23m-9.25 0h12.5" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-blue-600">{folder.shortUrls?.length || 0} links</span>
                  <span className="rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-500">Updated {formatDate(folder.updatedAt)}</span>
                </div>

                <div className="mt-5 space-y-2.5 max-h-48 overflow-y-auto pr-1 bg-slate-50/20 rounded-xl p-1.5 border border-slate-100/60 scrollbar-thin">
                  {(folder.shortUrls || []).map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-sm hover:border-slate-250 transition shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold text-slate-800">{item.shortUrl}</div>
                        <div className="truncate text-xs font-medium text-slate-400 mt-0.5">{item.originalUrl}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(item.shortUrl);
                          setNotice('Link copied!');
                        }}
                        className="rounded-full hover:bg-slate-100 p-1.5 text-slate-400 hover:text-slate-700 transition"
                        title="Copy short url"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v9.375c0 .621.504 1.125 1.125 1.125h9.375c.621 0 1.125-.504 1.125-1.125V18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {!(folder.shortUrls || []).length ? (
                    <div className="text-center py-4 text-xs font-semibold text-slate-400">No links assigned yet.</div>
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

        {viewFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh] animate-scale-up">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/20">
                <div className="min-w-0 pr-4">
                  <h3 className="text-xl font-extrabold text-slate-900 truncate">{viewFolder.name}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500 line-clamp-2">{viewFolder.description || 'No description provided.'}</p>
                </div>
                <button onClick={() => { setViewFolder(null); setFolderSearch(''); }} className="rounded-full bg-slate-100 hover:bg-slate-200 p-2 text-slate-400 hover:text-slate-700 transition shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search inside Folder */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/45 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                  </svg>
                  <input
                    value={folderSearch}
                    onChange={(e) => setFolderSearch(e.target.value)}
                    placeholder="Search links in this folder..."
                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const allLinks = (viewFolder.shortUrls || []).map(u => u.shortUrl).join('\n')
                      navigator.clipboard.writeText(allLinks)
                      setNotice('All short links copied to clipboard!')
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition shadow-xs"
                  >
                    Copy all links
                  </button>
                </div>
              </div>

              {/* Links list inside folder (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-50/10">
                {(viewFolder.shortUrls || [])
                  .filter(item => 
                    item.shortUrl.toLowerCase().includes(folderSearch.toLowerCase()) || 
                    item.originalUrl.toLowerCase().includes(folderSearch.toLowerCase())
                  )
                  .map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4.5 hover:border-slate-250 hover:shadow-sm transition">
                      <div className="min-w-0 flex-1">
                        <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition block truncate">
                          {item.shortUrl}
                        </a>
                        <div className="text-xs text-slate-400 font-medium truncate mt-0.5">↳ {item.originalUrl}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.shortUrl)
                            setNotice('Link copied!')
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition shadow-xs"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            setViewFolder(null)
                            navigate(`/analytics/${item.shortUrl.split('/').pop() || ''}`)
                          }}
                          className="rounded-full bg-blue-50 hover:bg-blue-100 text-[#2563EB] px-3.5 py-1.5 text-xs font-bold transition"
                        >
                          Stats
                        </button>
                      </div>
                    </div>
                  ))}
                {!(viewFolder.shortUrls || []).length && (
                  <div className="text-center py-12 text-sm font-semibold text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    This folder has no links assigned yet.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/25 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total: {(viewFolder.shortUrls || []).length} links</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setViewFolder(null)
                      startEdit(viewFolder)
                    }}
                    className="rounded-full bg-slate-900 hover:bg-black px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
                  >
                    Edit Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
