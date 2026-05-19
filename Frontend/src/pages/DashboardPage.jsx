import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getMyShortUrls, updateShortUrl, deleteShortUrl, transferShortUrl } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'

function CopyToast({ value }) {
  if (!value) return null

  const display = value.length > 54 ? `${value.slice(0, 51)}...` : value

  return (
    <div className="fixed right-4 top-20 z-50">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="min-w-0 text-sm">
          <div className="font-semibold">Copied to clipboard</div>
          <div className="max-w-xs truncate text-xs text-slate-500">{display}</div>
        </div>
      </div>
    </div>
  )
}

const formatDate = (value) => {
  if (!value) return 'Just now'

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const getDomainFavicon = (url) => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
  } catch (e) {
    return ''
  }
}

function NewLinkModal({ urlData, onClose }) {
  if (!urlData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        <div className="bg-emerald-50 px-6 py-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Link created!</h2>
          <p className="mt-2 text-sm font-medium text-emerald-700">Short URL successfully copied to clipboard</p>
        </div>
        
        <div className="p-6">
          {urlData.qr && (
            <div className="mb-5 flex flex-col items-center">
               <img src={urlData.qr} alt="QR Code" className="h-40 w-40 rounded-2xl border border-slate-200 shadow-sm p-2 bg-white" />
               <div className="mt-2 text-xs font-semibold text-slate-500">Real-time QR Code generated</div>
            </div>
          )}
          
          <div className="mb-6 truncate rounded-xl bg-slate-50 px-4 py-3.5 text-sm font-bold text-blue-600 border border-slate-100">
             <a href={urlData.url} target="_blank" rel="noreferrer" className="hover:underline">{urlData.url}</a>
          </div>
          
          <button onClick={onClose} className="w-full rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-black transition-all shadow-sm">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ title, children, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false, disabled = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white text-left shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <div className="p-6 text-slate-600 font-medium text-sm leading-relaxed">{children}</div>
        <div className="flex items-center justify-end gap-3 bg-slate-50/50 border-t border-slate-100 px-6 py-4">
          <button onClick={onCancel} className="rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 px-5 py-2 text-sm font-bold text-slate-700 transition">Cancel</button>
          <button disabled={disabled} onClick={onConfirm} className={`rounded-full px-5 py-2 text-sm font-bold text-white transition ${danger ? 'bg-rose-600 hover:bg-rose-700 shadow-[0_4px_12px_rgba(225,29,72,0.25)]' : 'bg-[#2563EB] hover:bg-[#1d4ed8] shadow-[0_4px_12px_rgba(37,99,235,0.25)]'} disabled:opacity-50`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function Snackbar({ message, actionLabel, onAction, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/80 animate-in fade-in slide-in-from-bottom-2 duration-200"> 
        <div className="text-sm font-semibold text-slate-700">{message}</div>
        {actionLabel ? <button onClick={onAction} className="rounded-full bg-[#2563EB] px-3.5 py-1.5 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition">{actionLabel}</button> : null}
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600 transition">✕</button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [urls, setUrls] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedValue, setCopiedValue] = useState('')
  const [showNewLinkModal, setShowNewLinkModal] = useState(false)
  const [newLinkData, setNewLinkData] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteVerifyText, setDeleteVerifyText] = useState('')

  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState(null)

  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferTarget, setTransferTarget] = useState(null)
  const [transferEmail, setTransferEmail] = useState('')

  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)
  const [moveFolderName, setMoveFolderName] = useState('')

  const [snackbar, setSnackbar] = useState({ message: '', actionLabel: '', action: null })
  const [drafts, setDrafts] = useState([])

  const [layoutMode, setLayoutMode] = useState('cards') // 'cards' | 'rows'
  const [orderBy, setOrderBy] = useState('createdAt') // 'createdAt' | 'clicks'
  const [showArchived, setShowArchived] = useState(false)
  const [displayProperties, setDisplayProperties] = useState({
    shortLink: true,
    destinationUrl: true,
    title: true,
    description: true,
    createdAt: true,
    creator: true,
    tags: true,
    analytics: true,
  })
  const [showDisplayPopover, setShowDisplayPopover] = useState(false)
  const [showFilterPopover, setShowFilterPopover] = useState(false)
  const [filterTag, setFilterTag] = useState('')
  const [filterFolder, setFilterFolder] = useState('')

  useEffect(() => {
    if (location.state?.newLink) {
      setTimeout(() => {
        setNewLinkData({ url: location.state.newLink, qr: location.state.newQr })
        setShowNewLinkModal(true)
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
    if (location.state?.draftSaved) {
      setTimeout(() => {
        setSnackbar({ message: 'Draft saved successfully!', actionLabel: '', action: null })
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
  }, [location, navigate])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const uRes = await getCurrentUser()
        if (!mounted) return
        setProfile(uRes?.user || null)
        
        const urlsRes = await getMyShortUrls()
        if (!mounted) return
        setUrls(urlsRes?.urls || [])
        setDrafts(urlsRes?.drafts || [])
      } catch (err) {
        if (!mounted) return
        setPageError('Failed to fetch dashboard data. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [location.key])

  const copy = (val) => {
    navigator.clipboard.writeText(val)
    setCopiedValue(val)
    setTimeout(() => setCopiedValue(''), 2000)
  }

  const filteredUrls = urls
    .filter((item) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        item.shortUrl.toLowerCase().includes(term) ||
        item.originalUrl.toLowerCase().includes(term) ||
        (item.title && item.title.toLowerCase().includes(term))

      const matchesArchive = showArchived ? true : !item.archived
      const matchesTag = filterTag ? (item.tags && item.tags.toLowerCase().includes(filterTag.toLowerCase())) : true
      const matchesFolder = filterFolder ? (item.folder && item.folder.toLowerCase() === filterFolder.toLowerCase()) : true

      return matchesSearch && matchesArchive && matchesTag && matchesFolder
    })
    .sort((a, b) => {
      if (orderBy === 'clicks') {
        return (b.clicks || 0) - (a.clicks || 0)
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

  if (loading) {
    return (
      <AppShell title="Links" subtitle="Loading your dashboard...">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Links"
      subtitle="Manage short links, custom aliases, and analytics in one place."
      profile={profile}
      rightSlot={(
        <div className="flex flex-wrap items-center gap-3">          <div className="flex items-center gap-2">
            {/* Filter Popover Container */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterPopover(!showFilterPopover); setShowDisplayPopover(false); }}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  showFilterPopover
                    ? 'border-slate-400 bg-slate-50 text-slate-900 ring-2 ring-slate-100 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                </svg>
                Filter
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d={showFilterPopover ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                </svg>
              </button>

              {showFilterPopover && (
                <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-12 z-50 w-[290px] xs:w-80 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <div className="space-y-4">
                    {/* Folders Section */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                        <span>Folder</span>
                        {filterFolder && (
                          <button onClick={() => setFilterFolder('')} className="text-blue-600 hover:text-blue-800 transition lowercase font-bold text-[10px]">
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        <button
                          onClick={() => { setFilterFolder(''); }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                            !filterFolder
                              ? 'bg-blue-50/50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0 text-slate-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.62-3.21a1.875 1.875 0 0 0-2.538 0L8.75 11.25l-1.06-1.06a1.875 1.875 0 0 0-2.538 0L2.25 13.06m19.5 0v7.5A2.25 2.25 0 0 1 19.5 22.8H4.5A2.25 2.25 0 0 1 2.25 20.55v-7.5" />
                            </svg>
                            All Folders
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-500">{urls.length}</span>
                        </button>
                        {[...new Set(urls.map(u => u.folder).filter(Boolean))].map(folder => {
                          const folderCount = urls.filter(u => u.folder?.toLowerCase() === folder.toLowerCase()).length;
                          const isSelected = filterFolder === folder;
                          return (
                            <button
                              key={folder}
                              onClick={() => { setFilterFolder(isSelected ? '' : folder); }}
                              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18" />
                                </svg>
                                <span className="truncate">{folder}</span>
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100/80 text-slate-500'}`}>{folderCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                        <span>Tag</span>
                        {filterTag && (
                          <button onClick={() => setFilterTag('')} className="text-blue-600 hover:text-blue-800 transition lowercase font-bold text-[10px]">
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        <button
                          onClick={() => { setFilterTag(''); }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                            !filterTag
                              ? 'bg-blue-50/50 text-blue-600'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 shrink-0 text-slate-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.002 1.002 0 0 0 1.417 0l4.318-4.318a1.002 1.002 0 0 0 0-1.417L9.581 3.659A2.25 2.25 0 0 0 7.99 3H5.25Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                            </svg>
                            All Tags
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-500">{urls.length}</span>
                        </button>
                        {[...new Set(urls.flatMap(u => (u.tags || '').split(',').map(t => t.trim())).filter(Boolean))].map(tag => {
                          const tagCount = urls.filter(u => (u.tags || '').split(',').map(t => t.trim().toLowerCase()).includes(tag.toLowerCase())).length;
                          const isSelected = filterTag === tag;
                          return (
                            <button
                              key={tag}
                              onClick={() => { setFilterTag(isSelected ? '' : tag); }}
                              className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate pr-2">
                                <span className={`text-sm shrink-0 ${isSelected ? 'text-blue-500 font-extrabold' : 'text-slate-400'}`}>#</span>
                                <span className="truncate">{tag}</span>
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100/80 text-slate-500'}`}>{tagCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Popover Footer Summary */}
                    {(filterFolder || filterTag) ? (
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">{filteredUrls.length} matches found</span>
                        <button
                          onClick={() => { setFilterFolder(''); setFilterTag(''); }}
                          className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 text-[10px] font-bold transition"
                        >
                          Clear all
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Display Popover Container */}
            <div className="relative">
              <button
                onClick={() => { setShowDisplayPopover(!showDisplayPopover); setShowFilterPopover(false); }}
                className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  showDisplayPopover
                    ? 'border-slate-400 bg-slate-50 text-slate-900 ring-2 ring-slate-100 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-600" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 0V21m6-8.25V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 0V21m6-12V3.75m0 5.25a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 0V21" />
                </svg>
                Display
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d={showDisplayPopover ? "M4.5 15.75l7.5-7.5 7.5 7.5" : "M19.5 8.25l-7.5 7.5-7.5-7.5"} />
                </svg>
              </button>

              {showDisplayPopover && (
                <div className="absolute right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 top-12 z-50 w-[290px] xs:w-[340px] rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Top layout options */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setLayoutMode('cards')}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                        layoutMode === 'cards'
                          ? 'border-slate-300 bg-slate-50/80 text-slate-900 font-bold'
                          : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" />
                      </svg>
                      <span className="text-xs">Cards</span>
                    </button>
                    <button
                      onClick={() => setLayoutMode('rows')}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                        layoutMode === 'rows'
                          ? 'border-slate-350 bg-slate-50/80 text-slate-900 font-bold'
                          : 'border-slate-100 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                      </svg>
                      <span className="text-xs">Rows</span>
                    </button>
                  </div>

                  {/* Ordering option */}
                  <div className="flex items-center justify-between border-t border-slate-100 py-3.5 text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                      </svg>
                      Ordering
                    </span>
                    <select
                      value={orderBy}
                      onChange={(e) => setOrderBy(e.target.value)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 transition cursor-pointer"
                    >
                      <option value="createdAt">Date created</option>
                      <option value="clicks">Clicks count</option>
                    </select>
                  </div>

                  {/* Show archived links toggle */}
                  <div className="flex items-center justify-between border-t border-slate-100 py-3.5 text-sm font-medium text-slate-700">
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                      Show archived links
                    </span>
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showArchived ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          showArchived ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* DISPLAY PROPERTIES */}
                  <div className="border-t border-slate-100 pt-4 mb-4">
                    <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-3">Display Properties</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(displayProperties).map((prop) => {
                        const labelMap = {
                          shortLink: 'Short link',
                          destinationUrl: 'Destination URL',
                          title: 'Title',
                          description: 'Description',
                          createdAt: 'Created Date',
                          creator: 'Creator',
                          tags: 'Tags',
                          analytics: 'Analytics',
                        }
                        const label = labelMap[prop] || prop
                        const active = displayProperties[prop]
                        return (
                          <button
                            key={prop}
                            onClick={() => setDisplayProperties(prev => ({ ...prev, [prop]: !prev[prop] }))}
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight transition-all duration-150 ${
                              active
                                ? 'bg-slate-100 border-slate-200/80 text-slate-800'
                                : 'bg-white border-slate-150 text-slate-400 hover:border-slate-250 hover:bg-slate-50'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reset/Set default */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
                    <button
                      onClick={() => {
                        setDisplayProperties({
                          shortLink: true,
                          destinationUrl: true,
                          title: true,
                          description: true,
                          createdAt: true,
                          creator: true,
                          tags: true,
                          analytics: true,
                        })
                        setLayoutMode('cards')
                        setOrderBy('createdAt')
                        setShowArchived(false)
                      }}
                      className="text-slate-500 hover:text-slate-800 font-bold transition"
                    >
                      Reset to default
                    </button>
                    <button
                      onClick={() => {
                        setShowDisplayPopover(false)
                        setSnackbar({ message: 'Display properties saved successfully!', actionLabel: '', action: null })
                      }}
                      className="rounded-full bg-slate-900 hover:bg-black px-3.5 py-1.5 font-bold text-white shadow-sm transition"
                    >
                      Set as default
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by short link or URL"
              className="w-80 rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-all"
            />
          </div>
          <button onClick={() => navigate('/create')} className="relative rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_18px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_22px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150">
            Create link
            <span className="ml-2 inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold text-white">C</span>
          </button>
        </div>
      )}
    >
      <div className="space-y-6">
        {pageError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        ) : null}

        {/* Saved Drafts */}
        {drafts.length > 0 && (
          <div className="rounded-3xl border border-amber-200/60 bg-amber-50/20 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </span>
                <h3 className="text-sm font-bold text-slate-800">Saved Drafts ({drafts.length})</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-600/90 bg-amber-100/50 px-2.5 py-0.5 rounded-full">Saved locally to this browser</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => (
                <div key={draft.id} className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-350 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="truncate font-bold text-slate-900 pr-6">{draft.title || 'Untitled Draft'}</div>
                    <div className="mt-1 truncate text-xs font-semibold text-blue-600">{draft.destination}</div>
                    {draft.alias && <div className="mt-1 text-[10px] font-bold text-slate-400">Alias: {draft.alias}</div>}
                    <div className="mt-2 line-clamp-2 text-xs font-medium text-slate-500">{draft.description || 'No description added yet.'}</div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-semibold text-slate-450">Saved {formatDate(draft.updatedAt)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await deleteShortUrl(draft.id);
                            const refreshed = await getMyShortUrls();
                            setUrls(refreshed?.urls || []);
                            setDrafts(refreshed?.drafts || []);
                            setSnackbar({ message: 'Draft deleted', actionLabel: '', action: null });
                          } catch (err) {
                            setSnackbar({ message: 'Failed to delete draft', actionLabel: '', action: null });
                          }
                        }}
                        className="rounded-full hover:bg-rose-50 p-1.5 text-rose-500 hover:text-rose-600 transition"
                        title="Delete draft"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.78 0L9 9m4.77-3.07 1.91.55c.51.15.86.61.86 1.15v.377m-15.318 0 1.353 13.622a2.25 2.25 0 0 0 2.25 2.25h9.081a2.25 2.25 0 0 0 2.25-2.25L18.735 7.697m-15.318 0 .524-5.23c.041-.41.385-.72.793-.72h6.815c.408 0 .752.31.793.72l.524 5.23m-9.25 0h12.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => navigate('/create', { state: { prefill: draft } })}
                        className="rounded-full bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 text-[10px] font-bold text-blue-600 transition"
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm font-bold text-slate-500 px-1">
          <span>Viewing {filteredUrls.length || 0} of {urls.length} links</span>
          <span>{profile?.name || 'User'}</span>
        </div>

        <div className="space-y-4">
          {filteredUrls.length ? (
            filteredUrls.map((item) => {
              if (layoutMode === 'rows') {
                return (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border border-slate-200/60 bg-white px-5 py-3.5 shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:border-slate-350 transition duration-150">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {/* Favicon Icon badge */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200 shadow-sm overflow-hidden p-1">
                        {item.originalUrl && getDomainFavicon(item.originalUrl) ? (
                          <img
                            src={getDomainFavicon(item.originalUrl)}
                            alt="Logo"
                            className="h-5 w-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement.querySelector('.fallback-letter');
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="fallback-letter h-full w-full items-center justify-center font-extrabold text-blue-600 text-xs"
                          style={{ display: item.originalUrl ? 'none' : 'flex' }}
                        >
                          {((item.shortUrl || 'L').replace(/^https?:\/\//, '').charAt(0) || 'L').toUpperCase()}
                        </div>
                      </div>

                      {/* Grid columns */}
                      <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        {/* Col 1: Title and Shortlink */}
                        <div className="min-w-0">
                          {displayProperties.title && item.title && (
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5 truncate">{item.title}</div>
                          )}
                          {displayProperties.shortLink ? (
                            <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition truncate block">
                              {item.shortUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-slate-400 italic">Short Link hidden</span>
                          )}
                        </div>

                        {/* Col 2: Destination URL & Description */}
                        <div className="min-w-0">
                          {displayProperties.destinationUrl && (
                            <span className="text-xs font-semibold text-slate-500 truncate block">↳ {item.originalUrl}</span>
                          )}
                          {displayProperties.description && item.description && (
                            <span className="text-[11px] font-medium text-slate-400 truncate block mt-0.5">{item.description}</span>
                          )}
                        </div>

                        {/* Col 3: Date created, Creator, & Tags */}
                        <div className="min-w-0 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-medium">
                          {displayProperties.createdAt && <span>{formatDate(item.createdAt)}</span>}
                          {displayProperties.createdAt && displayProperties.creator && <span>•</span>}
                          {displayProperties.creator && <span>by {profile?.name || 'User'}</span>}
                          {displayProperties.tags && item.tags && (
                            <span className="rounded-full bg-blue-50/50 border border-blue-100/60 px-2 py-0.5 text-[9px] font-bold text-[#2563EB]">
                              #{item.tags.split(',')[0].trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                      {displayProperties.analytics && (
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-bold whitespace-nowrap border border-emerald-100/50">
                            {item.clicks || 0} clicks
                          </span>
                          <button onClick={() => {
                            const shortCode = item.shortUrl.split('/').pop() || '';
                            navigate(`/analytics/${shortCode}`);
                          }} className="rounded-full border border-blue-100 bg-blue-50/50 hover:bg-blue-100/80 px-2.5 py-1 text-[11px] font-bold text-[#2563EB] transition">
                            Stats
                          </button>
                        </div>
                      )}
                      <button onClick={() => copy(item.shortUrl)} className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.675A2.006 2.006 0 0 0 15 2.25h-3a2.006 2.006 0 0 0-1.85 1.125M18 10.5h.008v.008H18V10.5Zm3 0h.008v.008H21V10.5Zm-3 3h.008v.008H18v-.008Zm3 0h.008v.008H21v-.008Zm-3 3h.008v.008H18v-.008Zm3 3h.008v.008H21v-.008z" />
                        </svg>
                      </button>

                      {/* Action Menu (Ellipsis dropdown) */}
                      <div className="relative">
                        <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                          </svg>
                        </button>

                        {openMenuId === item.id ? (
                          <div className="absolute right-0 top-10 z-40 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl py-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                            <ul>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: item, edit: true } }) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Edit</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); setNewLinkData({ url: item.shortUrl, qr: item.qrCodeUrl }); setShowNewLinkModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">QR Code</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); copy(item.shortUrl) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Copy Link ID</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: { destination: item.originalUrl, title: item.title, description: item.description }, duplicate: true } }) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Duplicate</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); setMoveTarget(item); setMoveFolderName(item.folder || ''); setShowMoveModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Move</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); setArchiveTarget(item); setShowArchiveModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Archive</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); setTransferTarget(item); setTransferEmail(''); setShowTransferModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Transfer</button>
                              </li>
                              <li>
                                <button onClick={() => { setOpenMenuId(null); setDeleteTarget(item); setDeleteVerifyText(''); setShowDeleteModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-slate-50 hover:text-rose-700 transition">Delete</button>
                              </li>
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              }

              // Default Cards Mode
              return (
                <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-slate-300/80 lg:flex-row lg:items-center lg:justify-between transition-all duration-200">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 shadow-sm overflow-hidden p-1">
                      {item.originalUrl && getDomainFavicon(item.originalUrl) ? (
                        <img
                          src={getDomainFavicon(item.originalUrl)}
                          alt="Logo"
                          className="h-6 w-6 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fb = e.currentTarget.parentElement.querySelector('.fallback-letter');
                            if (fb) fb.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="fallback-letter h-full w-full items-center justify-center font-extrabold text-blue-600 text-sm"
                        style={{ display: item.originalUrl ? 'none' : 'flex' }}
                      >
                        {((item.shortUrl || 'L').replace(/^https?:\/\//, '').charAt(0) || 'L').toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      {displayProperties.title && item.title && (
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1 truncate max-w-sm">{item.title}</div>
                      )}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {displayProperties.shortLink ? (
                          <a href={item.shortUrl} target="_blank" rel="noreferrer" className="truncate text-base font-bold text-slate-900 hover:text-blue-600 transition">
                            {item.shortUrl}
                          </a>
                        ) : (
                          <span className="text-base font-semibold text-slate-400 italic">Short Link hidden</span>
                        )}
                        <button onClick={() => copy(item.shortUrl)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                          {copiedValue === item.shortUrl ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      {displayProperties.destinationUrl && (
                        <div className="mt-1.5 truncate text-sm font-medium text-slate-500">↳ {item.originalUrl}</div>
                      )}
                      {displayProperties.description && item.description && (
                        <div className="mt-2 text-xs font-medium text-slate-500 max-w-xl">{item.description}</div>
                      )}
                      {displayProperties.tags && item.tags && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.tags.split(',').map((t, idx) => (
                            <span key={idx} className="rounded-full bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              #{t.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {(displayProperties.createdAt || displayProperties.creator) && (
                        <div className="mt-2 text-xs font-semibold text-slate-400 flex items-center gap-2">
                          {displayProperties.createdAt && <span>Created {formatDate(item.createdAt)}</span>}
                          {displayProperties.createdAt && displayProperties.creator && <span>•</span>}
                          {displayProperties.creator && <span>By {profile?.name || 'User'}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2.5 lg:flex-row lg:items-center lg:gap-3.5">
                    {displayProperties.analytics && (
                      <>
                        <div className="rounded-full bg-emerald-50 text-emerald-700 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm">
                          {item.clicks || 0} clicks
                        </div>
                        <button onClick={() => {
                          const shortCode = item.shortUrl.split('/').pop() || '';
                          navigate(`/analytics/${shortCode}`);
                        }} className="rounded-full border border-blue-100 bg-blue-50/50 hover:bg-blue-100/80 px-4 py-2 text-sm font-bold text-[#2563EB] transition duration-150">
                          View Analytics
                        </button>
                      </>
                    )}
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                          <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </button>

                      {openMenuId === item.id ? (
                        <div className="absolute right-0 top-11 z-40 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl py-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          <ul>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: item, edit: true } }) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Edit</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); setNewLinkData({ url: item.shortUrl, qr: item.qrCodeUrl }); setShowNewLinkModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">QR Code</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); copy(item.shortUrl) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Copy Link ID</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: { destination: item.originalUrl, title: item.title, description: item.description }, duplicate: true } }) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Duplicate</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); setMoveTarget(item); setMoveFolderName(item.folder || ''); setShowMoveModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Move</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); setArchiveTarget(item); setShowArchiveModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Archive</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); setTransferTarget(item); setTransferEmail(''); setShowTransferModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Transfer</button>
                            </li>
                            <li>
                              <button onClick={() => { setOpenMenuId(null); setDeleteTarget(item); setDeleteVerifyText(''); setShowDeleteModal(true) }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-slate-50 hover:text-rose-700 transition">Delete</button>
                            </li>
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <p className="text-xl font-bold text-slate-900">No links found</p>
              <p className="mt-2 text-sm font-medium text-slate-500">Create your first short link to populate this view.</p>
              <button onClick={() => navigate('/create')} className="mt-5 rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition">
                Create link
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <span>Viewing {filteredUrls.length} of {urls.length} links</span>
          <div className="flex gap-2">
            <button className="rounded-full border border-slate-200 hover:bg-slate-50 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition duration-150 cursor-pointer">Previous</button>
            <button className="rounded-full border border-slate-200 hover:bg-slate-50 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition duration-150 cursor-pointer">Next</button>
          </div>
        </div>
      </div>
      {showNewLinkModal ? <NewLinkModal urlData={newLinkData} onClose={() => setShowNewLinkModal(false)} /> : null}
      {copiedValue ? <CopyToast value={copiedValue} /> : null}
      {showMoveModal && moveTarget ? (
        <ConfirmModal title="Move link" onCancel={() => setShowMoveModal(false)} onConfirm={async () => {
          try {
            await updateShortUrl(moveTarget.id, { folder: moveFolderName })
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowMoveModal(false)
            setSnackbar({ message: 'Link moved', actionLabel: '', action: null })
          } catch (err) {
            alert(err?.response?.data?.message || err?.message || 'Move failed')
          }
        }} confirmLabel="Move">
          <div className="text-sm text-slate-700 mb-3">Move <strong className="text-slate-900">{moveTarget.shortUrl}</strong> to a folder.</div>
          <input value={moveFolderName} onChange={(e) => setMoveFolderName(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Folder name" />
        </ConfirmModal>
      ) : null}

      {showArchiveModal && archiveTarget ? (
        <ConfirmModal title="Archive link" onCancel={() => setShowArchiveModal(false)} onConfirm={async () => {
          try {
            await updateShortUrl(archiveTarget.id, { archived: true })
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowArchiveModal(false)
            setSnackbar({ message: 'Successfully archived link!', actionLabel: 'Undo', action: async () => {
              try { await updateShortUrl(archiveTarget.id, { archived: false }); const refreshed2 = await getMyShortUrls(); setUrls(refreshed2?.urls || []); setSnackbar({ message: '', actionLabel: '', action: null }) } catch { /* ignore */ }
            } })
          } catch (err) {
            alert(err?.response?.data?.message || err?.message || 'Archive failed')
          }
        }} confirmLabel="Archive" danger={false}>
          <div className="text-sm text-slate-700 mb-3">Are you sure you want to archive <strong className="text-slate-900">{archiveTarget.shortUrl}</strong>?</div>
        </ConfirmModal>
      ) : null}

      {showTransferModal && transferTarget ? (
        <ConfirmModal title="Transfer link" onCancel={() => setShowTransferModal(false)} onConfirm={async () => {
          try {
            await transferShortUrl(transferTarget.id, transferEmail)
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowTransferModal(false)
            setSnackbar({ message: 'Transfer completed', actionLabel: '', action: null })
          } catch (err) {
            alert(err?.response?.data?.message || err?.message || 'Transfer failed')
          }
        }} confirmLabel="Transfer">
          <div className="text-sm text-slate-700 mb-3">Transfer <strong className="text-slate-900">{transferTarget.shortUrl}</strong> to another user by email.</div>
          <input value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Target user's email" />
        </ConfirmModal>
      ) : null}

      {showDeleteModal && deleteTarget ? (
        <ConfirmModal title="Delete link" onCancel={() => setShowDeleteModal(false)} onConfirm={async () => {
          try {
            if ((deleteVerifyText || '').trim() !== (deleteTarget.shortUrl || '').trim()) {
              alert('Please type the exact short link to confirm deletion.')
              return
            }
            await deleteShortUrl(deleteTarget.id)
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowDeleteModal(false)
            setSnackbar({ message: 'Link deleted', actionLabel: '', action: null })
          } catch (err) {
            alert(err?.response?.data?.message || err?.message || 'Delete failed')
          }
        }} confirmLabel="Delete" danger={true} disabled={!deleteVerifyText || deleteVerifyText.trim() !== (deleteTarget.shortUrl || '').trim()}>
          <div className="text-sm text-slate-700 mb-3">Deleting this link will remove all analytics. This action cannot be undone.</div>
          <div className="mb-3 rounded-md border bg-slate-50 p-3 text-sm">{deleteTarget.shortUrl}<div className="text-xs text-slate-400">{deleteTarget.originalUrl}</div></div>
          <div className="text-sm text-slate-700 mb-2">To verify, type <strong className="text-slate-900">{deleteTarget.shortUrl}</strong> below</div>
          <input value={deleteVerifyText} onChange={(e) => setDeleteVerifyText(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Type the full short link to confirm" />
        </ConfirmModal>
      ) : null}

      <Snackbar message={snackbar.message} actionLabel={snackbar.actionLabel} onAction={snackbar.action} onClose={() => setSnackbar({ message: '', actionLabel: '', action: null })} />
    </AppShell>
  )
}
