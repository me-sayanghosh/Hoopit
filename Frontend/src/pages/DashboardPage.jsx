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
  if (!message) return null
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/80"> 
        <div className="text-sm font-semibold text-slate-700">{message}</div>
        {actionLabel ? <button onClick={onAction} className="rounded-full bg-[#2563EB] px-3.5 py-1.5 text-white text-xs font-bold shadow-sm">{actionLabel}</button> : null}
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">✕</button>
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

  useEffect(() => {
    if (location.state?.newLink) {
      setTimeout(() => {
        setNewLinkData({ url: location.state.newLink, qr: location.state.newQr })
        setShowNewLinkModal(true)
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

  const filteredUrls = urls.filter((item) => {
    const term = searchTerm.toLowerCase()
    return (
      item.shortUrl.toLowerCase().includes(term) ||
      item.originalUrl.toLowerCase().includes(term) ||
      (item.title && item.title.toLowerCase().includes(term))
    )
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 lg:flex">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Filter</button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Display</button>
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

        <div className="flex items-center justify-between text-sm font-bold text-slate-500 px-1">
          <span>Viewing {filteredUrls.length || 0} of {urls.length} links</span>
          <span>{profile?.name || 'User'}</span>
        </div>

        <div className="space-y-4">
          {filteredUrls.length ? (
            filteredUrls.map((item) => (
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
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a href={item.shortUrl} target="_blank" rel="noreferrer" className="truncate text-base font-bold text-slate-900 hover:text-blue-600 transition">
                        {item.shortUrl}
                      </a>
                      <button onClick={() => copy(item.shortUrl)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
                        {copiedValue === item.shortUrl ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="mt-1.5 truncate text-sm font-medium text-slate-500">↳ {item.originalUrl}</div>
                    <div className="mt-2 text-xs font-semibold text-slate-400">Created {formatDate(item.createdAt)}</div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2.5 lg:flex-row lg:items-center lg:gap-3.5">
                  <div className="rounded-full bg-emerald-50 text-emerald-700 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm">
                    {item.clicks || 0} clicks
                  </div>
                  <button onClick={() => {
                    const shortCode = item.shortUrl.split('/').pop() || '';
                    navigate(`/analytics/${shortCode}`);
                  }} className="rounded-full border border-blue-100 bg-blue-50/50 hover:bg-blue-100/80 px-4 py-2 text-sm font-bold text-[#2563EB] transition duration-150">
                    View Analytics
                  </button>
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
            ))
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
