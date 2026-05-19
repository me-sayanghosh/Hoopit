import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { getArchivedShortUrls, updateShortUrl, deleteShortUrl } from '../api/shortUrlapi.js'

export default function ArchivePage() {
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)

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

  const restore = async (id) => {
    try {
      await updateShortUrl(id, { archived: false })
      setUrls((s) => s.filter(u => u.id !== id))
    } catch (err) { console.error(err) }
  }

  const remove = async (id) => {
    if (!window.confirm('Permanently delete this link?')) return
    try {
      await deleteShortUrl(id)
      setUrls((s) => s.filter(u => u.id !== id))
    } catch (err) { console.error(err) }
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
                      className="rounded-full bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 px-5 py-2 text-xs font-bold text-emerald-700 transition shadow-sm"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="rounded-full bg-rose-50 border border-rose-100 hover:bg-rose-100/70 px-5 py-2 text-xs font-bold text-rose-600 transition shadow-sm"
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
    </AppShell>
  )
}
