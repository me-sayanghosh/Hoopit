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
    <AppShell title="Tags" subtitle="Browse and filter links by tag">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-semibold">Tags</div>
            <div className="mt-3 space-y-2">
              {tags.length ? tags.map(t => (
                <button key={t.tag} onClick={() => openTag(t.tag)} className="w-full text-left rounded-md px-3 py-2 hover:bg-slate-50">{t.tag} <span className="text-xs text-slate-400">({t.count})</span></button>
              )) : <div className="text-sm text-slate-500">No tags found</div>}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-semibold">{selectedTag ? `Links tagged ${selectedTag}` : 'Select a tag'}</div>
            <div className="mt-3 space-y-3">
              {tagUrls.length ? tagUrls.map(u => (
                <div key={u.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <a href={u.shortUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-900">{u.shortUrl}</a>
                    <div className="text-sm text-slate-500">{u.originalUrl}</div>
                  </div>
                </div>
              )) : (selectedTag ? <div className="text-sm text-slate-500">No links for this tag</div> : null)}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
