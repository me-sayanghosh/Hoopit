import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { shortenUrl, getFolders, generateAiSuggestion, updateShortUrl } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function AIGenerateButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition bg-blue-50/60 hover:bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full disabled:opacity-50 shrink-0"
    >
      {loading ? (
        'Generating...'
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M9.75 3.75l1.06 4.24a2.25 2.25 0 001.66 1.66l4.24 1.06-4.24 1.06a2.25 2.25 0 00-1.66 1.66l-1.06 4.24-1.06-4.24a2.25 2.25 0 00-1.66-1.66l-4.24-1.06 4.24-1.06a2.25 2.25 0 001.66-1.66l1.06-4.24z" />
          </svg>
          AI Generate
        </>
      )}
    </button>
  )
}

export default function CreateLinkForm() {
  const navigate = useNavigate()
  
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
  const [aiLoading, setAiLoading] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const isEdit = location?.state?.edit || false
  const prefill = location?.state?.prefill || null

  const handleAiGenerate = async (field) => {
    if (!destination) {
      setError('Please enter a Destination URL first to generate suggestions.')
      return
    }
    setError('')
    setAiLoading(field)
    try {
      const res = await generateAiSuggestion(destination, field)
      if (res?.suggestion) {
        if (field === 'alias') setAlias(res.suggestion)
        if (field === 'tags') setTags(res.suggestion)
        if (field === 'comments') setComments(res.suggestion)
        if (field === 'title') setTitle(res.suggestion)
        if (field === 'description') setDescription(res.suggestion)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate AI suggestion.')
    } finally {
      setAiLoading(null)
    }
  }

  const handleSaveDraft = async () => {
    if (!destination) {
      setError('Please enter a Destination URL to save a draft.')
      return
    }
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
        conversionTracking: conversion,
        isDraft: true
      }
      
      if (prefill && prefill.id) {
        await updateShortUrl(prefill.id, body)
      } else {
        await shortenUrl(body)
      }
      
      navigate('/dashboard', { state: { draftSaved: true } })
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save draft.')
    } finally {
      setLoading(false)
    }
  }

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

      if (isEdit) {
        const id = prefill.id || prefill._id
        if (!id) throw new Error('Missing id for update')
        await updateShortUrl(id, body)
        navigate('/dashboard', { state: { updated: true } })
      } else if (prefill && prefill.id) {
        await updateShortUrl(prefill.id, { ...body, isDraft: false })
        navigate('/dashboard', { state: { updated: true } })
      } else {
        const res = await shortenUrl(body)
        const short = res?.shortUrl || ''
        if (!short) throw new Error('No short url returned')
        
        // Copy to clipboard
        await navigator.clipboard.writeText(short)
        
        // Redirect to dashboard with state to show the popup
        navigate('/dashboard', { state: { newLink: short, newQr: res?.qrCodeUrl } })
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create link')
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
    // apply prefill if provided via navigation state
    if (prefill) {
      if (prefill.destination || prefill.originalUrl) setDestination(prefill.destination || prefill.originalUrl || '')
      if (prefill.alias) setAlias(prefill.alias)
      if (prefill.tags) setTags(prefill.tags)
      if (prefill.comments) setComments(prefill.comments)
      if (typeof prefill.conversion === 'boolean') setConversion(prefill.conversion)
      if (prefill.folder) setFolder(prefill.folder)
      if (prefill.title) setTitle(prefill.title)
      if (prefill.description) setDescription(prefill.description)
    }
    return () => { mounted = false }
  }, [])

  return (
    <form onSubmit={handleCreate} className="grid grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="col-span-12 lg:col-span-8 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Destination URL</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="https://example.com/some/long/link"
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Alias (Slug)</label>
            <AIGenerateButton onClick={() => handleAiGenerate('alias')} loading={aiLoading === 'alias'} />
          </div>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Auto-generated or type custom alias"
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tags</label>
            <AIGenerateButton onClick={() => handleAiGenerate('tags')} loading={aiLoading === 'tags'} />
          </div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="growth, launch, winter"
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Comments</label>
            <AIGenerateButton onClick={() => handleAiGenerate('comments')} loading={aiLoading === 'comments'} />
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Add internal notes or comments..."
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

        <div className="flex items-center gap-3 py-1">
          <label className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={conversion}
              onChange={(e) => setConversion(e.target.checked)}
              className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Enable Conversion Tracking</span>
          </label>
        </div>
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Folder</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white cursor-pointer shadow-sm hover:border-slate-300 active:scale-[0.99]"
            >
              <span>{folder || 'No folder'}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showDropdown ? 'rotate-180 text-blue-500' : ''}`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 left-0 mt-2 z-50 rounded-2xl border border-slate-150 bg-white p-2 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_16px_-6px_rgba(0,0,0,0.04)] focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setFolder('')
                      setShowDropdown(false)
                    }}
                    className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      !folder ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>No folder</span>
                    {!folder && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-blue-600">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {folderOptions.map((item) => {
                    const isSelected = folder === item.name
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setFolder(item.name)
                          setShowDropdown(false)
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          isSelected ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 text-blue-600">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {createdShort && (
          <div className="rounded-2xl border border-slate-200 p-4 text-center bg-slate-50/50">
            <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">QR Code</div>
            {qrCode ? (
              <img src={qrCode} alt="QR Code" className="mx-auto my-2 h-28 w-28 rounded bg-white shadow-sm border border-slate-100 p-1" />
            ) : null}
            <div className="mt-3 text-sm">
              <div className="truncate text-blue-600 font-bold">
                <a href={createdShort} target="_blank" rel="noreferrer">{createdShort}</a>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-full bg-slate-900 hover:bg-black px-4 py-2 text-xs font-bold text-white transition shadow"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Title</label>
            <AIGenerateButton onClick={() => handleAiGenerate('title')} loading={aiLoading === 'title'} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add custom title..."
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <AIGenerateButton onClick={() => handleAiGenerate('description')} loading={aiLoading === 'description'} />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add custom description..."
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>
      </aside>

      <div className="col-span-12 border-t border-slate-100 pt-5 mt-2">
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-250 bg-rose-50/50 px-4.5 py-3.5 text-xs font-semibold text-rose-600 flex items-center gap-2.5 shadow-[0_2px_8px_rgba(244,63,94,0.04)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 shrink-0 text-rose-500 animate-pulse">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update link' : 'Create link')}
          </button>
        </div>
      </div>
    </form>
  )
}
