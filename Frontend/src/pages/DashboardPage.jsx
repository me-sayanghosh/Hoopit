import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import SileoToast from '../components/SileoToast.jsx'
import { getMyShortUrls, updateShortUrl, deleteShortUrl } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'

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
  } catch {
    return ''
  }
}

function NewLinkModal({ urlData, onClose }) {
  if (!urlData) return null;
  const isNew = urlData.isNew !== false;
  const themeBg = isNew ? 'bg-emerald-50/80' : 'bg-blue-50/80';
  const themeIconContainer = isNew ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600';
  const themeSubtitleText = isNew ? 'text-emerald-700' : 'text-blue-700';
  const themeBackButton = isNew 
    ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/90' 
    : 'bg-blue-100/70 text-blue-800 hover:bg-blue-200/90';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        
        {/* Absolute Back Button */}
        <button 
          onClick={onClose} 
          className={`absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm z-10 cursor-pointer ${themeBackButton}`}
          title="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className={`px-6 py-6 transition-colors duration-200 ${themeBg}`}>
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 transition-colors duration-200 ${themeIconContainer}`}>
            {isNew ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 15.75a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1-.75-.75v-2.25Zm0-10.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.008v.008H15V12Zm3 0h.008v.008H18V12Zm-3 3h.008v.008H15V15Zm6-3h.008v.008H21V12Zm-3 3h.008v.008H18V15Zm3 3h.008v.008H21V18Zm-3 3h.008v.008H18V21Zm-3-3h.008v.008H15V18ZM12 12h.008v.008H12V12Z" />
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{isNew ? 'Link created!' : 'QR Code'}</h2>
          <p className={`mt-2 text-sm font-medium transition-colors duration-200 ${themeSubtitleText}`}>
            {isNew ? 'Short URL successfully copied to clipboard' : 'Scan to instantly access your link'}
          </p>
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

function ConfirmModal({ title, children, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false, disabled = false, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white text-left shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        </div>
        <div className="p-6 text-slate-600 font-medium text-sm leading-relaxed">{children}</div>
        <div className="flex items-center justify-end gap-3 bg-slate-50/50 border-t border-slate-100 px-6 py-4">
          <button disabled={loading} onClick={onCancel} className="rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 px-5 py-2 text-sm font-bold text-slate-700 transition disabled:opacity-50">Cancel</button>
          <button disabled={disabled || loading} onClick={onConfirm} className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white transition ${danger ? 'bg-rose-600 hover:bg-rose-700 shadow-[0_4px_12px_rgba(225,29,72,0.25)]' : 'bg-[#2563EB] hover:bg-[#1d4ed8] shadow-[0_4px_12px_rgba(37,99,235,0.25)]'} disabled:opacity-50`}>
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShareIcon({ children }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
      {children}
    </span>
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

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState(null)

  const [showMoveModal, setShowMoveModal] = useState(false)
  const [moveTarget, setMoveTarget] = useState(null)
  const [moveFolderName, setMoveFolderName] = useState('')

  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const [toast, setToast] = useState({ message: '', type: 'success', actionLabel: '', action: null, isVisible: false })
  const showToast = (message, type = 'success', actionLabel = '', action = null) => {
    setToast({ message, type, actionLabel, action, isVisible: true })
  }
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }
  const [drafts, setDrafts] = useState([])

  const [layoutMode, setLayoutMode] = useState('cards') // 'cards' | 'rows'
  const [orderBy, setOrderBy] = useState('createdAt') // 'createdAt' | 'clicks'
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
  const [currentPage, setCurrentPage] = useState(1)

  const [reloading, setReloading] = useState(false)

  const reloadData = async () => {
    setReloading(true)
    try {
      const urlsRes = await getMyShortUrls()
      setUrls(urlsRes?.urls || [])
      setDrafts(urlsRes?.drafts || [])
      showToast('Links reloaded successfully!', 'success')
    } catch {
      showToast('Failed to reload links.', 'error')
    } finally {
      setReloading(false)
    }
  }

  useEffect(() => {
    if (location.state?.newLink) {
      setTimeout(() => {
        setNewLinkData({ url: location.state.newLink, qr: location.state.newQr, isNew: true })
        setShowNewLinkModal(true)
        showToast('Short link created successfully!', 'success')
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
    if (location.state?.draftSaved) {
      setTimeout(() => {
        showToast('Draft saved successfully!', 'success')
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
    if (location.state?.updated) {
      setTimeout(() => {
        showToast('Link updated successfully!', 'success')
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
  }, [location, navigate])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setPageError('')
      setProfile(null)
      setUrls([])
      setDrafts([])

      try {
        const uRes = await getCurrentUser()
        if (!mounted) return
        setProfile(uRes?.user || null)
        
        const urlsRes = await getMyShortUrls()
        if (!mounted) return
        setUrls(urlsRes?.urls || [])
        setDrafts(urlsRes?.drafts || [])
      } catch {
        if (!mounted) return
        setPageError('Failed to fetch dashboard data. Please try again.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [location.key])

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if pressing 'c' or 'C' without modifier keys
      if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        const activeEl = document.activeElement
        const isTyping = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          activeEl.isContentEditable
        )

        if (!isTyping) {
          e.preventDefault()
          navigate('/create')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  const copy = async (val) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(val)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = val
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!copied) throw new Error('Copy failed')
      }

      setCopiedValue(val)
      showToast('Link copied to clipboard!', 'copy')
      setTimeout(() => setCopiedValue(''), 2000)
      return true
    } catch (err) {
      showToast(err?.message || 'Copy failed', 'error')
      return false
    }
  }

  const canUseNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleNativeShare = async (url) => {
    if (canUseNativeShare) {
      await navigator.share({
        title: 'Hoopit link',
        text: 'Check out this link',
        url,
      })
      showToast('Share sheet opened', 'share')
      return
    }

    copy(url)
  }

  const buildShareLinks = (url) => ([
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(url)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12.04 2C6.58 2 2.14 6.39 2.14 11.79c0 1.9.55 3.74 1.58 5.33L2 22l5.12-1.66a9.83 9.83 0 0 0 4.92 1.31h.01c5.45 0 9.88-4.39 9.88-9.79C21.93 6.39 17.49 2 12.04 2zm5.78 13.83c-.24.68-1.4 1.27-1.9 1.35-.49.08-1.12.11-1.81-.11-.42-.13-.96-.31-1.65-.61-2.89-1.25-4.77-4.17-4.91-4.36-.14-.19-1.18-1.56-1.18-2.98 0-1.41.74-2.1 1-2.38.25-.28.55-.35.73-.35.18 0 .37.01.53.01.17 0 .39-.07.61.47.24.58.82 1.99.89 2.13.07.14.11.31.02.5-.09.19-.13.31-.26.48-.14.17-.27.38-.39.51-.13.14-.27.29-.11.58.16.29.72 1.17 1.55 1.9 1.07.95 1.97 1.25 2.26 1.39.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.2-.3.4-.25.67-.15.28.1 1.74.82 2.04.97.3.14.5.21.58.33.08.12.08.7-.16 1.38z" />
        </svg>
      ),
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out this link')}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M18.901 1.153h3.68l-8.04 9.19 9.46 12.504h-7.41l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.153h7.59l5.24 6.95 6.07-6.95zm-1.29 19.61h2.04L6.48 3.243H4.29l13.32 17.52z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.12 5.66 21.29 10.42 22v-7.03H7.9v-2.9h2.52V9.84c0-2.49 1.48-3.86 3.74-3.86 1.08 0 2.21.19 2.21.19v2.43h-1.24c-1.22 0-1.6.76-1.6 1.54v1.96h2.72l-.44 2.9h-2.28V22C18.34 21.29 22 17.12 22 12.07z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M4.98 3.5C4.98 4.88 3.89 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.2 8.33H4.8V24H.2V8.33zM8.67 8.33h4.41v2.14h.06c.61-1.16 2.11-2.38 4.35-2.38 4.65 0 5.51 3.06 5.51 7.04V24h-4.6v-7.67c0-1.83-.03-4.18-2.55-4.18-2.56 0-2.95 2-2.95 4.05V24h-4.6V8.33z" />
        </svg>
      ),
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('Shared Hoopit link')}&body=${encodeURIComponent(url)}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.92l-7.243 4.627a2.25 2.25 0 0 1-2.395 0L3.32 8.913a2.25 2.25 0 0 1-1.07-1.92V6.75" />
        </svg>
      ),
    },
  ])

  const filteredUrls = urls
    .filter((item) => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        item.shortUrl.toLowerCase().includes(term) ||
        item.originalUrl.toLowerCase().includes(term) ||
        (item.title && item.title.toLowerCase().includes(term))

      const matchesTag = filterTag ? (item.tags && item.tags.toLowerCase().includes(filterTag.toLowerCase())) : true
      const matchesFolder = filterFolder ? (item.folder && item.folder.toLowerCase() === filterFolder.toLowerCase()) : true

      return matchesSearch && matchesTag && matchesFolder
    })
    .sort((a, b) => {
      if (orderBy === 'clicks') {
        return (b.clicks || 0) - (a.clicks || 0)
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

  const totalPages = Math.ceil(filteredUrls.length / 10) || 1
  const paginatedUrls = filteredUrls.slice((currentPage - 1) * 10, currentPage * 10)

  if (loading) {
    return (
      <AppShell
        title="Links"
        subtitle="Manage short links, custom aliases, and analytics in one place."
        rightSlot={(
          <div className="flex flex-wrap items-center gap-3 animate-pulse">
            <div className="h-9 w-20 rounded-full bg-slate-200" />
            <div className="h-9 w-24 rounded-full bg-slate-200" />
            <div className="h-9.5 w-60 rounded-full bg-slate-200 hidden sm:block" />
            <div className="h-9.5 w-32 rounded-full bg-slate-200" />
          </div>
        )}
      >
        <div className="space-y-6 animate-pulse">
          {/* Search bar helper for mobile */}
          <div className="h-9.5 w-full rounded-full bg-slate-200 sm:hidden" />

          {/* Stats summary bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="h-4 w-48 rounded bg-slate-200" />
            <div className="h-7 w-20 rounded-full bg-slate-200" />
          </div>

          {/* Link items - grid of card skeletons */}
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4.5 w-3/4 rounded bg-slate-200" />
                      <div className="h-3.5 w-1/2 rounded bg-slate-200" />
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
                </div>
                
                <div className="h-3.5 w-5/6 rounded bg-slate-200" />
                
                <div className="flex flex-wrap gap-2 pt-1.5">
                  <div className="h-5 w-16 rounded-full bg-slate-200" />
                  <div className="h-5 w-12 rounded-full bg-slate-200" />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-12 rounded bg-slate-200" />
                    <div className="h-4 w-16 rounded bg-slate-200" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 w-12 rounded-full bg-slate-200" />
                    <div className="h-7 w-12 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterPopover(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-12 z-50 w-72.5 xs:w-80 max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-in fade-in slide-in-from-top-2 duration-200 text-left">
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
                      <div className="space-y-1 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                        <button
                          onClick={() => { setFilterFolder(''); setCurrentPage(1); }}
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
                              onClick={() => { setFilterFolder(isSelected ? '' : folder); setCurrentPage(1); }}
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
                          onClick={() => { setFilterTag(''); setCurrentPage(1); }}
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
                              onClick={() => { setFilterTag(isSelected ? '' : tag); setCurrentPage(1); }}
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
                </>
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
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDisplayPopover(false)} />
                  <div className="absolute right-1/2 translate-x-1/2 md:right-0 md:translate-x-0 top-12 z-50 w-72.5 xs:w-85 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Top layout options */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => { setLayoutMode('cards'); setCurrentPage(1); }}
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
                      onClick={() => { setLayoutMode('rows'); setCurrentPage(1); }}
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
                      onChange={(e) => { setOrderBy(e.target.value); setCurrentPage(1); }}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 outline-none hover:bg-slate-50 transition cursor-pointer"
                    >
                      <option value="createdAt">Date created</option>
                      <option value="clicks">Clicks count</option>
                    </select>
                  </div>

                  {/* Show archived links toggle */}
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
                        setCurrentPage(1)
                      }}
                      className="text-slate-500 hover:text-slate-800 font-bold transition"
                    >
                      Reset to default
                    </button>
                    <button
                      onClick={() => {
                        setShowDisplayPopover(false)
                        showToast('Display properties saved successfully!', 'success')
                      }}
                      className="rounded-full bg-slate-900 hover:bg-black px-3.5 py-1.5 font-bold text-white shadow-sm transition"
                    >
                      Set as default
                    </button>
                  </div>
                </div>
                </>
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
            <span className="ml-2 hidden sm:inline-block rounded-md bg-white/20 px-2 py-0.5 text-xs font-bold text-white">C</span>
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
                            showToast('Draft deleted', 'info');
                          } catch {
                            showToast('Failed to delete draft', 'error');
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
          <span>
            Showing {filteredUrls.length ? (currentPage - 1) * 10 + 1 : 0} -{' '}
            {Math.min(currentPage * 10, filteredUrls.length)} of {filteredUrls.length} links
          </span>
          <button
            onClick={reloadData}
            disabled={reloading}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            title="Reload links"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className={`h-3.5 w-3.5 text-slate-500 ${reloading ? 'animate-spin' : ''}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>Reload</span>
          </button>
        </div>

        <div className={`space-y-4 ${filteredUrls.length ? 'pb-72' : ''}`}>
          {filteredUrls.length ? (
            paginatedUrls.map((item) => {
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
                          <>
                            <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-10 z-40 w-48 max-h-40 overflow-y-auto scrollbar-thin rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                              <ul>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: item, edit: true } }) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Edit</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setNewLinkData({ url: item.shortUrl, qr: item.qrCodeUrl, isNew: false }); setShowNewLinkModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">QR Code</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); copy(item.shortUrl) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Copy Link ID</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: { destination: item.originalUrl, title: item.title, description: item.description }, duplicate: true } }) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Duplicate</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setMoveTarget(item); setMoveFolderName(item.folder || ''); setShowMoveModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Move</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setArchiveTarget(item); setShowArchiveModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Archive</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setShareTarget(item); setShowShareModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Share</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setDeleteTarget(item); setDeleteVerifyText(''); setShowDeleteModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-slate-50 hover:text-rose-700 transition">Delete</button>
                                </li>
                              </ul>
                            </div>
                          </>
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
                        <>
                          <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setOpenMenuId(null)} />
                           <div className="absolute left-0 lg:left-auto lg:right-0 top-11 z-40 w-48 max-h-40 overflow-y-auto scrollbar-thin rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                             <ul>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: item, edit: true } }) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Edit</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); setNewLinkData({ url: item.shortUrl, qr: item.qrCodeUrl, isNew: false }); setShowNewLinkModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">QR Code</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); copy(item.shortUrl) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Copy Link ID</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: { destination: item.originalUrl, title: item.title, description: item.description }, duplicate: true } }) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Duplicate</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); setMoveTarget(item); setMoveFolderName(item.folder || ''); setShowMoveModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Move</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); setArchiveTarget(item); setShowArchiveModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Archive</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); setShareTarget(item); setShowShareModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">Share</button>
                               </li>
                               <li>
                                 <button onClick={() => { setOpenMenuId(null); setDeleteTarget(item); setDeleteVerifyText(''); setShowDeleteModal(true) }} className="w-full text-left px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-slate-50 hover:text-rose-700 transition">Delete</button>
                               </li>
                             </ul>
                           </div>
                        </>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition disabled:opacity-50 active:scale-95 disabled:pointer-events-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Previous
            </button>

            <span className="text-xs font-bold text-slate-500">
              Page <span className="text-slate-800">{currentPage}</span> of <span className="text-slate-800">{totalPages}</span>
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 shadow-sm transition disabled:opacity-50 active:scale-95 disabled:pointer-events-none"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {showNewLinkModal ? <NewLinkModal urlData={newLinkData} onClose={() => setShowNewLinkModal(false)} /> : null}
      {showMoveModal && moveTarget ? (
        <ConfirmModal title="Move link" loading={isMoving} onCancel={() => setShowMoveModal(false)} onConfirm={async () => {
          try {
            setIsMoving(true)
            await updateShortUrl(moveTarget.id, { folder: moveFolderName })
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowMoveModal(false)
            showToast('Link moved successfully!', 'folder')
          } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Move failed', 'error')
          } finally {
            setIsMoving(false)
          }
        }} confirmLabel="Move">
          <div className="text-sm text-slate-700 mb-3">Move <strong className="text-slate-900">{moveTarget.shortUrl}</strong> to a folder.</div>
          <input value={moveFolderName} onChange={(e) => setMoveFolderName(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Folder name" />
        </ConfirmModal>
      ) : null}

      {showArchiveModal && archiveTarget ? (
        <ConfirmModal title="Archive link" loading={isArchiving} onCancel={() => setShowArchiveModal(false)} onConfirm={async () => {
          try {
            setIsArchiving(true)
            await updateShortUrl(archiveTarget.id, { archived: true })
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowArchiveModal(false)
            showToast('Successfully archived link!', 'archive', 'Undo', async () => {
              try {
                await updateShortUrl(archiveTarget.id, { archived: false })
                const refreshed2 = await getMyShortUrls()
                setUrls(refreshed2?.urls || [])
                closeToast()
              } catch { /* ignore */ }
            })
          } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Archive failed', 'error')
          } finally {
            setIsArchiving(false)
          }
        }} confirmLabel="Archive" danger={false}>
          <div className="text-sm text-slate-700 mb-3">Are you sure you want to archive <strong className="text-slate-900">{archiveTarget.shortUrl}</strong>?</div>
        </ConfirmModal>
      ) : null}

      {showShareModal && shareTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-left shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Share</h3>
              <button onClick={() => setShowShareModal(false)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close share dialog">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="max-w-45 truncate text-sm font-semibold text-slate-600">{shareTarget.shortUrl}</span>
                <button
                  onClick={async () => {
                    const success = await copy(shareTarget.shortUrl)
                    if (success) setShowShareModal(false)
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                  aria-label="Copy link"
                  title="Copy link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4.5 w-4.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V8.25a2.25 2.25 0 0 1 2.25-2.25H9m6.75 6v-6a2.25 2.25 0 0 0-2.25-2.25h-6a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25z" />
                  </svg>
                  <span className="sr-only">Copy</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={async () => {
                    try {
                      await handleNativeShare(shareTarget.shortUrl)
                    } catch (err) {
                      showToast(err?.message || 'Sharing failed', 'error')
                    }
                  }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  aria-label="Share on device"
                  title="Share on device"
                >
                  <ShareIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12.75 3.75 15 6 17.25M6 12.75V7.5A2.25 2.25 0 0 1 8.25 5.25h7.5A2.25 2.25 0 0 1 18 7.5v5.25M6 12.75h12M18 12.75 20.25 15 18 17.25" />
                    </svg>
                  </ShareIcon>
                  <span className="sr-only">Share on device</span>
                </button>
                {buildShareLinks(shareTarget.shortUrl).map((platform) => (
                  <a
                    key={platform.label}
                    href={platform.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    aria-label={platform.label}
                    title={platform.label}
                  >
                    <ShareIcon>{platform.icon}</ShareIcon>
                    <span className="sr-only">{platform.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showDeleteModal && deleteTarget ? (
        <ConfirmModal title="Delete link" loading={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={async () => {
          try {
            if ((deleteVerifyText || '').trim() !== (deleteTarget.shortUrl || '').trim()) {
              showToast('Please type the exact short link to confirm deletion.', 'error')
              return
            }
            setIsDeleting(true)
            await deleteShortUrl(deleteTarget.id)
            const refreshed = await getMyShortUrls()
            setUrls(refreshed?.urls || [])
            setShowDeleteModal(false)
            showToast('Link deleted successfully', 'delete')
          } catch (err) {
            showToast(err?.response?.data?.message || err?.message || 'Delete failed', 'error')
          } finally {
            setIsDeleting(false)
          }
        }} confirmLabel="Delete" danger={true} disabled={!deleteVerifyText || deleteVerifyText.trim() !== (deleteTarget.shortUrl || '').trim()}>
          <div className="text-sm text-slate-700 mb-3">Deleting this link will remove all analytics. This action cannot be undone.</div>
          <div className="mb-3 rounded-md border bg-slate-50 p-3 text-sm">{deleteTarget.shortUrl}<div className="text-xs text-slate-400">{deleteTarget.originalUrl}</div></div>
          <div className="text-sm text-slate-700 mb-2">To verify, type <strong className="text-slate-900">{deleteTarget.shortUrl}</strong> below</div>
          <input value={deleteVerifyText} onChange={(e) => setDeleteVerifyText(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Type the full short link to confirm" />
        </ConfirmModal>
      ) : null}



      <SileoToast 
        message={toast.message} 
        type={toast.type} 
        actionLabel={toast.actionLabel} 
        onAction={toast.action} 
        onClose={closeToast} 
        isVisible={toast.isVisible} 
      />
    </AppShell>
  )
}
