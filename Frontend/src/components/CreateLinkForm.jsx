import { useState, useEffect } from 'react'
import { shortenUrl, getFolders } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

export default function CreateLinkForm() {
  
  const [destination, setDestination] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [alias, setAlias] = useState('')
  const [tags, setTags] = useState('')
  const [comments, setComments] = useState('')
  const [conversion, setConversion] = useState(false)
  const [folder, setFolder] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [createdShort, setCreatedShort] = useState('')
  const [folderOptions, setFolderOptions] = useState([])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!destination) return setError('Please enter a destination URL')
    setLoading(true)
    setError('')
    try {
      const body = {
        url: destination,
        slug: alias || undefined,
        tags: tags || undefined,
        comments,
        title,
        description,
        folder: folder || undefined,
        conversionTracking: conversion
      }

      const res = await shortenUrl(body)
      const short = res?.shortUrl || ''
      if (!short) throw new Error('No short url returned')
      // show returned QR code if provided
      if (res?.qrCodeUrl) setQrCode(res.qrCodeUrl)
      setCreatedShort(short)
    } catch (err) {
      setError(err?.message || 'Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const fetchFolders = async () => {
      try {
        const list = await getFolders()
        if (!mounted) return
        setFolderOptions(list || [])
        if (!folder && list?.length) {
          setFolder(list[0].name || '')
        }
      } catch {
        // ignore unauthenticated or empty folder states
      }
    }

    const checkAuth = async () => {
      try {
        const data = await getCurrentUser()
        if (data?.user) setIsAuthenticated(true)
      } catch (e) {
        setIsAuthenticated(false)
      }
    }

    fetchFolders()
    checkAuth()
    return () => { mounted = false }
  }, [])

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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Alias</label>
            <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Auto-generated or type alias" className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm" />
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
              <option value="">No folder</option>
              {folderOptions.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <div className="mb-2 text-sm font-medium text-slate-700">QR Code</div>
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="mx-auto my-2 h-28 w-28 rounded bg-white" />
            ) : (
              <div className="mx-auto my-2 h-28 w-28 rounded bg-slate-50 border border-dashed" />
            )}
            <div className="mt-2 text-xs text-slate-500">QR code preview</div>
            {createdShort ? (
              <div className="mt-3 text-sm">
                <div className="truncate text-blue-700"><a href={createdShort} target="_blank" rel="noreferrer">{createdShort}</a></div>
                <div className="mt-2">
                  <button onClick={() => navigate('/dashboard')} className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Back to dashboard</button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Custom link preview removed per request */}

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
        <div className="flex items-center justify-end border-t border-slate-200 pt-4">
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
