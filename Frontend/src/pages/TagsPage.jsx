import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import { getTags, getUrlsByTag } from '../api/shortUrlapi.js'

export default function TagsPage() {
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)
  const [tagUrls, setTagUrls] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTags()
        setTags(res?.tags || [])
      } catch (err) { console.error(err) }
    }
    load()
  }, [])

  const openTag = async (tag) => {
    setSelectedTag(tag)
    try {
      const res = await getUrlsByTag(tag)
      setTagUrls(res?.urls || [])
    } catch (err) { console.error(err) }
  }

  return (
    <AppShell title="Tags" subtitle="Browse and filter your short links by active tags.">
      <div className="grid grid-cols-12 gap-6">
        {/* Left tags sidebar */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">All Tags</div>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-2.5">
              {tags.length ? tags.map(t => {
                const isActive = selectedTag === t.tag
                return (
                  <button
                    key={t.tag}
                    onClick={() => openTag(t.tag)}
                    className={`w-auto lg:w-full flex items-center justify-between text-left rounded-full px-5 py-2.5 text-sm font-bold transition shadow-sm border ${
                      isActive
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)]'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>#{t.tag}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 border transition ${
                      isActive
                        ? 'bg-blue-700 border-blue-700 text-blue-100'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      {t.count}
                    </span>
                  </button>
                )
              }) : <div className="text-sm font-medium text-slate-500 py-2">No tags created yet. Add tags when editing links on the dashboard!</div>}
            </div>
          </div>
        </div>

        {/* Right tag urls details */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 mb-5 flex items-center gap-2">
              {selectedTag ? (
                <>
                  <span>Links tagged with</span>
                  <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-600">#{selectedTag}</span>
                </>
              ) : 'Select a tag from the sidebar'}
            </div>

            <div className="space-y-4">
              {tagUrls.length ? tagUrls.map(u => (
                <div key={u.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <a href={u.shortUrl} target="_blank" rel="noreferrer" className="text-lg font-bold text-blue-600 hover:underline break-all">
                        {u.shortUrl}
                      </a>
                      <p className="mt-1 truncate text-sm font-medium text-slate-500">
                        {u.originalUrl}
                      </p>
                    </div>

                    <a
                      href={u.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition"
                    >
                      Visit Link &rarr;
                    </a>
                  </div>
                </div>
              )) : (
                selectedTag ? (
                  <div className="text-sm font-medium text-slate-500 py-4 text-center">No links for this tag.</div>
                ) : (
                  <div className="text-sm font-medium text-slate-400 py-10 text-center">
                    Select any tag on the left side to filter and display all corresponding short URLs.
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
