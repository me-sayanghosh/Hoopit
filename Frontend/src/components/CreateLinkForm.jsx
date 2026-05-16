import { useState } from 'react'
import { shortenUrl } from '../api/shortUrlapi.js'
import { useNavigate } from 'react-router-dom'

export default function CreateLinkForm() {
  const navigate = useNavigate()
  const [destination, setDestination] = useState('')
  const [domain, setDomain] = useState('sayannn.com')
  const [alias, setAlias] = useState('')
  const [tags, setTags] = useState('')
  const [comments, setComments] = useState('')
  const [conversion, setConversion] = useState(false)
  const [folder, setFolder] = useState('Links')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!destination) return setError('Please enter a destination URL')
    setLoading(true)
    setError('')
    try {
      const res = await shortenUrl(destination)
      const short = res?.shortUrl || res?.data || ''
      if (!short) throw new Error('No short url returned')
      // success: navigate back to dashboard
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleCreate} className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Destination URL</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="https://dub.co/help/article/dub-links"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Short Link</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="sayannn.com">sayannn.com</option>
                <option value="hoopit.app">hoopit.app</option>
              </select>
            </div>
            <div className="col-span-8">
              <label className="mb-2 block text-sm font-medium text-slate-700">Alias</label>
              <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Auto-generated or type alias" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Select tags..." className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Comments</label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} placeholder="Add comments" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm" />
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={conversion} onChange={(e) => setConversion(e.target.checked)} className="rounded" />
              Conversion Tracking
            </label>
          </div>

        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Folder</label>
            <select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option>Links</option>
              <option>Marketing</option>
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <div className="mb-2 text-sm font-medium text-slate-700">QR Code</div>
            <div className="mx-auto my-2 h-28 w-28 rounded bg-slate-50 border border-dashed" />
            <div className="mt-2 text-xs text-slate-500">QR code preview</div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 text-sm font-medium text-slate-700">Custom Link Preview</div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md border px-2 py-1 text-xs">🌐</button>
              <button type="button" className="rounded-md border px-2 py-1 text-xs">X</button>
              <button type="button" className="rounded-md border px-2 py-1 text-xs">in</button>
              <button type="button" className="rounded-md border px-2 py-1 text-xs">f</button>
            </div>
            <div className="mt-3 h-24 w-full rounded border border-dashed bg-slate-50 flex items-center justify-center text-slate-400">Enter a link to generate a preview</div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Add a title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a title..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Add a description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a description..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </aside>

      <div className="col-span-12">
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">UTM</button>
            <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">Targeting</button>
            <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">A/B Test</button>
            <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">Password</button>
            <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm">Expiration</button>
          </div>

          <div>
            {error ? <div className="text-sm text-red-600 mr-4 inline">{error}</div> : null}
            <button type="submit" disabled={loading} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black">
              {loading ? 'Creating…' : 'Create link'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
