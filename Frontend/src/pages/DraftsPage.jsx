import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getMyShortUrls, deleteShortUrl } from '../api/shortUrlapi.js'

export default function DraftsPage() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)

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

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this draft?')) return
    try {
      await deleteShortUrl(id)
      setDrafts((s) => s.filter(d => d.id !== id))
    } catch (err) { console.error(err) }
  }

  if (loading) {
    return (
      <AppShell title="Drafts" subtitle="Manage and publish your in-progress drafts.">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
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
                      onClick={() => remove(draft.id)}
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
    </AppShell>
  )
}
