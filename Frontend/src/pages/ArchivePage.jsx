import { useEffect, useRef, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import SileoToast from '../components/SileoToast.jsx'
import { getArchivedShortUrls, updateShortUrl, deleteShortUrl } from '../api/shortUrlapi.js'

export default function ArchivePage() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Undo snackbar state
  const [undoItem, setUndoItem] = useState(null)       // item being "soft-deleted"
  const [undoVisible, setUndoVisible] = useState(false) // controls toast visibility
  const undoTimerRef = useRef(null)                     // timer ref so we can cancel it

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await getArchivedShortUrls()
        setUrls(res?.urls || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(undoTimerRef.current), [])

  const restore = async (id) => {
    try {
      await updateShortUrl(id, { archived: false })
      setUrls((s) => s.filter(u => u.id !== id))
    } catch (err) { console.error(err) }
  }

  const remove = (item) => setDeleteTarget(item)

  // Called from the confirm modal → soft-remove from UI, start 4-second undo window
  const confirmDelete = () => {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)

    // Remove from visible list immediately
    setUrls((s) => s.filter(u => u.id !== target.id))

    // Show undo snackbar
    setUndoItem(target)
    setUndoVisible(true)

    // After 4 s, actually hit the API
    clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(async () => {
      setUndoVisible(false)
      try {
        await deleteShortUrl(target.id)
      } catch (err) {
        console.error(err)
        // If API fails, put the item back
        setUrls((s) => [target, ...s])
      }
      setUndoItem(null)
    }, 4000)
  }

  // Undo: cancel the pending delete, re-insert item
  const handleUndo = () => {
    clearTimeout(undoTimerRef.current)
    setUndoVisible(false)
    if (undoItem) {
      setUrls((s) => [undoItem, ...s])
      setUndoItem(null)
    }
  }

  if (loading) {
    return (
      <AppShell title="Archived Links" subtitle="Manage and restore your archived short links.">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Archived Links" subtitle="Manage and restore your archived short links.">
      <div className="space-y-4">
        {urls.length ? (
          <div className="grid gap-4">
            {urls.map((item) => (
              <div key={item.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-lg font-bold text-slate-800 hover:text-blue-600 hover:underline break-all">
                      {item.shortUrl}
                    </a>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">
                      {item.originalUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => restore(item.id)}
                      className="rounded-full bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 px-5 py-2 text-xs font-bold text-emerald-700 transition shadow-sm active:scale-95"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="rounded-full bg-rose-50 border border-rose-100 hover:bg-rose-100/70 px-5 py-2 text-xs font-bold text-rose-600 transition shadow-sm active:scale-95"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm font-medium text-slate-500">
            No archived links found.
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] animate-scale-up">

            {/* Icon header */}
            <div className="flex flex-col items-center px-8 pt-8 pb-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 border border-rose-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="h-8 w-8 text-rose-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 6.6m-4.78 0L9 9m4.77-3.07 1.91.55c.51.15.86.61.86 1.15v.377m-15.318 0 1.353 13.622a2.25 2.25 0 0 0 2.25 2.25h9.081a2.25 2.25 0 0 0 2.25-2.25L18.735 7.697m-15.318 0 .524-5.23c.041-.41.385-.72.793-.72h6.815c.408 0 .752.31.793.72l.524 5.23m-9.25 0h12.5" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Delete permanently?</h3>
              <p className="mt-2 text-sm font-medium text-slate-500">This action cannot be undone. The link will be removed forever.</p>
            </div>

            {/* Link preview */}
            <div className="mx-6 mb-6 rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3">
              <p className="truncate text-sm font-bold text-rose-700">{deleteTarget.shortUrl}</p>
              <p className="mt-0.5 truncate text-xs font-medium text-rose-400">{deleteTarget.originalUrl}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 border-t border-slate-100 px-6 py-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 py-3 text-sm font-bold text-slate-700 shadow-sm transition active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-full bg-rose-600 hover:bg-rose-700 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(220,38,38,0.35)] transition active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Undo Snackbar Toast ── */}
      <SileoToast
        message="Link deleted successfully"
        type="success"
        actionLabel="Undo"
        onAction={handleUndo}
        onClose={() => setUndoVisible(false)}
        isVisible={undoVisible}
      />

    </AppShell>
  )
}
