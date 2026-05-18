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



function NewLinkModal({ urlData, onClose }) {
  if (!urlData) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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
               <img src={urlData.qr} alt="QR Code" className="h-40 w-40 rounded-2xl border border-slate-200 shadow-sm p-2" />
               <div className="mt-2 text-xs font-medium text-slate-500">Real-time QR Code generated</div>
            </div>
          )}
          
          <div className="mb-6 truncate rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-blue-600 border border-slate-100">
             <a href={urlData.url} target="_blank" rel="noreferrer" className="hover:underline">{urlData.url}</a>
          </div>
          
          <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-black transition-colors">
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  )
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

function Snackbar({ message, actionLabel, onAction, onClose }) {
  if (!message) return null
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="flex items-center gap-4 rounded-lg bg-white px-4 py-3 shadow"> 
        <div className="text-sm text-slate-700">{message}</div>
        {actionLabel ? <button onClick={onAction} className="rounded-md bg-black px-3 py-1 text-white text-sm">{actionLabel}</button> : null}
        <button onClick={onClose} className="text-sm text-slate-400">✕</button>
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
      // schedule state updates to avoid synchronous setState within effect
      setTimeout(() => {
        setNewLinkData({ url: location.state.newLink, qr: location.state.newQr })
        setShowNewLinkModal(true)
        // Clear state so it doesn't show again on refresh
        navigate('/dashboard', { replace: true, state: {} })
      }, 0)
    }
  }, [location, navigate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [profileRes, urlsRes] = await Promise.all([
          getCurrentUser(),
          getMyShortUrls(),
        ])
        setProfile(profileRes?.user || null)
        setUrls(urlsRes?.urls || [])
      } catch (err) {
        const msg = err?.message || 'Unable to load dashboard.'
        if (msg.toLowerCase().includes('unauthorized')) return navigate('/login')
        setPageError(msg)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  

  const copy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)
    setTimeout(() => setCopiedValue(''), 1800)
  }

  // Create composer moved to separate Create page

  const filteredUrls = (() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return urls

    return urls.filter((item) => {
      const shortUrl = item?.shortUrl || ''
      const originalUrl = item?.originalUrl || ''
      return shortUrl.toLowerCase().includes(query) || originalUrl.toLowerCase().includes(query)
    })
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
            Loading workspace…
          </div>
        </div>
      </div>
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
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Filter</button>
            <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Display</button>
          </div>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by short link or URL"
              className="w-96 rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300"
            />
          </div>
          <button onClick={() => navigate('/create')} className="relative rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
            Create link
            <span className="ml-2 inline-block rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium text-white opacity-80">C</span>
          </button>
        </div>
      )}
    >
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4">
              {pageError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pageError}
                </div>
              ) : null}

              {/* Create composer moved to its own page at /create */}

              <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
                <span>Viewing {filteredUrls.length || 0} of {urls.length} links</span>
                <span>{profile?.name || 'User'}</span>
              </div>

              <div className="space-y-4">
                {filteredUrls.length ? (
                  filteredUrls.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                          {((item.shortUrl || 'L').replace(/^https?:\/\//, '').charAt(0) || 'L').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <a href={item.shortUrl} target="_blank" rel="noreferrer" className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700">
                              {item.shortUrl}
                            </a>
                            <button onClick={() => copy(item.shortUrl)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                              {copiedValue === item.shortUrl ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <div className="mt-1 truncate text-sm text-slate-500">↳ {item.originalUrl}</div>
                          <div className="mt-2 text-xs text-slate-400">Created {formatDate(item.createdAt)}</div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-3">
                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {item.clicks || 0} clicks
                        </div>
                        <button onClick={() => {
                          const shortCode = item.shortUrl.split('/').pop() || '';
                          navigate(`/analytics/${shortCode}`);
                        }} className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
                          View Analytics
                        </button>
                        <div className="relative">
                          <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                              <path d="M12 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                            </svg>
                          </button>

                          {openMenuId === item.id ? (
                            <div className="absolute right-0 top-10 z-40 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
                              <ul className="py-2">
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: item, edit: true } }) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setNewLinkData({ url: item.shortUrl, qr: item.qrCodeUrl }); setShowNewLinkModal(true) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">QR Code</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); copy(item.shortUrl) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Copy Link ID</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); navigate('/create', { state: { prefill: { destination: item.originalUrl, title: item.title, description: item.description }, duplicate: true } }) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Duplicate</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setMoveTarget(item); setMoveFolderName(item.folder || ''); setShowMoveModal(true) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Move</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setArchiveTarget(item); setShowArchiveModal(true) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Archive</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setTransferTarget(item); setTransferEmail(''); setShowTransferModal(true) }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Transfer</button>
                                </li>
                                <li>
                                  <button onClick={() => { setOpenMenuId(null); setDeleteTarget(item); setDeleteVerifyText(''); setShowDeleteModal(true) }} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-slate-50">Delete</button>
                                </li>
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                    <p className="text-lg font-semibold text-slate-900">No links found</p>
                    <p className="mt-2 text-sm text-slate-500">Create your first short link to populate this view.</p>
                    <button onClick={() => navigate('/create')} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
                      Create link
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <span>Viewing {filteredUrls.length} of {urls.length} links</span>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Previous</button>
                  <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Next</button>
                </div>
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
