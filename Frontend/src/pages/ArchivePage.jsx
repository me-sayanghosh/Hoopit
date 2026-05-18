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

  return (
    <AppShell title="Archived links" subtitle="Manage archived short links">
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-4">
        {loading ? <div className="text-sm text-slate-500">Loading…</div> : (
          urls.length ? (
            <div className="space-y-3">
              {urls.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <a href={item.shortUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-900">{item.shortUrl}</a>
                    <div className="text-sm text-slate-500">{item.originalUrl}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => restore(item.id)} className="rounded-md bg-emerald-50 px-3 py-1 text-emerald-700">Restore</button>
                    <button onClick={() => remove(item.id)} className="rounded-md bg-rose-50 px-3 py-1 text-rose-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-sm text-slate-500">No archived links</div>
        )}
      </div>
    </AppShell>
  )
}
