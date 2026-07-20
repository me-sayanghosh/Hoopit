import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import SileoToast from '../components/SileoToast.jsx'
import { getMyShortUrls, deleteShortUrl } from '../api/shortUrlapi.js'

function ConfirmModal({ title, children, onCancel, onConfirm, confirmLabel = 'Confirm', danger = false, disabled = false, loading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white text-left shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
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
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DraftsPage() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false })

  const showToast = (message, type = 'success') => setToast({ message, type, isVisible: true })
  const closeToast = () => setToast(prev => ({ ...prev, isVisible: false }))

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyShortUrls()
      setDrafts(res?.drafts || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteShortUrl(deleteTarget)
      setDrafts((s) => s.filter(d => d.id !== deleteTarget))
      setDeleteTarget(null)
      showToast('Draft deleted successfully.', 'delete')
    } catch (err) {
      console.error(err)
      showToast('Failed to delete draft.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppShell
        title="Drafts"
        subtitle="Manage and publish your in-progress drafts."
      >
        <div className="space-y-6 animate-pulse">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[210px] space-y-4">
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-5.5 w-1/2 rounded-lg bg-blue-100/50" />
                  <div className="h-3.5 w-5/6 rounded bg-slate-200" />
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="h-4.5 w-16 rounded bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200" />
                    <div className="h-8.5 w-20 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <AppShell title="Drafts" subtitle="Manage and publish your in-progress drafts.">
      <div className="space-y-6">
        {drafts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:border-slate-350 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition duration-300 flex flex-col justify-between h-[210px]">
                <div>
                  <div className="truncate text-base font-extrabold text-slate-800 pr-6 group-hover:text-blue-600 transition">
                    {draft.title || 'Untitled Draft'}
                  </div>
                  <div className="mt-1.5 truncate text-xs font-bold text-blue-600 bg-blue-50/50 rounded-lg px-2.5 py-1 inline-block max-w-full">
                    {draft.destination}
                  </div>
                  {draft.alias && (
                    <div className="mt-2 text-[10px] font-bold text-slate-400">
                      Alias: <span className="text-slate-600">{draft.alias}</span>
                    </div>
                  )}
                  <div className="mt-2.5 line-clamp-2 text-xs font-semibold text-slate-500">
                    {draft.description || 'No description added yet.'}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
                  <span className="text-[10px] font-bold text-slate-400">
                    Saved {formatDate(draft.updatedAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteTarget(draft.id)}
                      className="rounded-full hover:bg-rose-50 border border-slate-100 hover:border-rose-100 p-2 text-rose-500 hover:text-rose-600 transition shadow-sm"
                      title="Delete draft"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.78 0L9 9m4.77-3.07 1.91.55c.51.15.86.61.86 1.15v.377m-15.318 0 1.353 13.622a2.25 2.25 0 0 0 2.25 2.25h9.081a2.25 2.25 0 0 0 2.25-2.25L18.735 7.697m-15.318 0 .524-5.23c.041-.41.385-.72.793-.72h6.815c.408 0 .752.31.793.72l.524 5.23m-9.25 0h12.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigate('/create', { state: { prefill: draft } })}
                      className="rounded-full bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-[0_2px_10px_rgba(37,99,235,0.2)] transition"
                    >
                      Resume
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm font-semibold text-slate-450 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-slate-350 mb-3 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            No drafts found. Try saving a draft from the link creation form!
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Draft"
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          danger
          loading={isDeleting}
        >
          Are you sure you want to permanently delete this draft? This action cannot be undone.
        </ConfirmModal>
      )}

      <SileoToast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
        isVisible={toast.isVisible}
      />
    </AppShell>
  )
}
