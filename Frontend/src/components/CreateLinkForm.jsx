import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { shortenUrl, getFolders, generateAiSuggestion, updateShortUrl, createFolder } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function AIGenerateButton({ onClick, loading, queued }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || queued}
      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition bg-blue-50/60 hover:bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full disabled:opacity-50 shrink-0"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Generating…
        </>
      ) : queued ? (
        'Queued…'
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
  const [aiLoading, setAiLoading] = useState(new Set())
  const [aiQueue, setAiQueue] = useState([])
  const [aiProcessing, setAiProcessing] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const isEdit = location?.state?.edit || false
  const prefill = location?.state?.prefill || null
  const hasSubmitted = useRef(false)

  const formStateRef = useRef({
    destination,
    alias,
    tags,
    comments,
    conversion,
    folder,
    title,
    description
  })

  useEffect(() => {
    formStateRef.current = {
      destination,
      alias,
      tags,
      comments,
      conversion,
      folder,
      title,
      description
    }
  }, [destination, alias, tags, comments, conversion, folder, title, description])

  useEffect(() => {
    return () => {
      // Auto-save draft on unmount if user has typed a destination URL, is creating (not editing), and hasn't intentionally submitted/created/navigated
      if (!hasSubmitted.current && formStateRef.current.destination && !isEdit) {
        const body = {
          url: formStateRef.current.destination,
          slug: formStateRef.current.alias || undefined,
          tags: formStateRef.current.tags || undefined,
          comments: formStateRef.current.comments,
          title: formStateRef.current.title,
          description: formStateRef.current.description,
          folder: formStateRef.current.folder || undefined,
          conversionTracking: formStateRef.current.conversion,
          isDraft: true
        }
        
        // Set local storage flag synchronously before navigation is fully processed by the browser
        localStorage.setItem('autoDraftSaved', 'true')
        
        // Trigger background draft save
        shortenUrl(body).catch((err) => {
          console.error('Failed to auto-save draft on unmount:', err)
        })
      }
    }
  }, [isEdit])

  // Process AI generation queue sequentially to avoid rate-limit errors
  useEffect(() => {
    if (aiProcessing || aiQueue.length === 0) return

    const processNext = async () => {
      const field = aiQueue[0]
      setAiProcessing(true)

      // Mark this field as loading
      setAiLoading((prev) => new Set(prev).add(field))

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
        // Remove this field from loading set
        setAiLoading((prev) => {
          const next = new Set(prev)
          next.delete(field)
          return next
        })

        // Remove processed item from queue and allow next
        setAiQueue((prev) => prev.slice(1))
        setAiProcessing(false)
      }
    }

    processNext()
  }, [aiQueue, aiProcessing, destination])

  const handleAiGenerate = (field) => {
    if (!destination) {
      setError('Please enter a Destination URL first to generate suggestions.')
      return
    }
    setError('')

    // Don't add duplicate fields to the queue
    if (aiLoading.has(field) || aiQueue.includes(field)) return

    setAiQueue((prev) => [...prev, field])
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
      hasSubmitted.current = true
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
        hasSubmitted.current = true
        navigate('/dashboard', { state: { updated: true } })
      } else if (prefill && prefill.id) {
        await updateShortUrl(prefill.id, { ...body, isDraft: false })
        hasSubmitted.current = true
        navigate('/dashboard', { state: { updated: true } })
      } else {
        const res = await shortenUrl(body)
        const short = res?.shortUrl || ''
        if (!short) throw new Error('No short url returned')
        
        // Copy to clipboard
        await navigator.clipboard.writeText(short)
        
        // Redirect to dashboard with state to show the popup
        hasSubmitted.current = true
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
        
        const folderFromPrefill = location.state?.prefill?.folder
        const newlyCreatedFolder = location.state?.newFolderName

        if (newlyCreatedFolder) {
          setFolder(newlyCreatedFolder)
        } else if (folderFromPrefill) {
          setFolder(folderFromPrefill)
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
    if (location.state?.newFolderName) {
      setFolder(location.state.newFolderName)
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
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white overflow-x-auto"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Alias (Slug)</label>
            <AIGenerateButton onClick={() => handleAiGenerate('alias')} loading={aiLoading.has('alias')} queued={aiQueue.includes('alias') && !aiLoading.has('alias')} />
          </div>
          <input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Auto-generated or type custom alias"
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white overflow-x-auto"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Tags</label>
            <AIGenerateButton onClick={() => handleAiGenerate('tags')} loading={aiLoading.has('tags')} queued={aiQueue.includes('tags') && !aiLoading.has('tags')} />
          </div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="growth, launch, winter"
            className="w-full rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white overflow-x-auto"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Comments</label>
            <AIGenerateButton onClick={() => handleAiGenerate('comments')} loading={aiLoading.has('comments')} queued={aiQueue.includes('comments') && !aiLoading.has('comments')} />
          </div>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Add internal notes or comments..."
            className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          />
        </div>

      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-5">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Folder</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between rounded-full border-2 border-blue-400 px-5 py-3.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white cursor-pointer shadow-[0_4px_14px_rgba(59,130,246,0.08)] hover:border-blue-500 active:scale-[0.99]"
            >
              <span>{folder || 'Select folder'}</span>
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
                <div className="absolute right-0 left-0 mt-3 z-50 rounded-[22px] border border-slate-300 bg-white p-3 shadow-[0_14px_30px_-8px_rgba(15,23,42,0.18)] focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false)
                      const currentFormState = {
                        destination,
                        alias,
                        tags,
                        comments,
                        conversion,
                        folder,
                        title,
                        description
                      }
                      hasSubmitted.current = true
                      navigate('/folders/quick-new', {
                        state: {
                          returnTo: '/create',
                          formState: currentFormState
                        }
                      })
                    }}
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition text-blue-600 bg-slate-50 hover:bg-blue-50"
                  >
                    <span>Create folder</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm border border-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                        <path fillRule="evenodd" d="M10 3.25a.75.75 0 01.75.75v5.25H16a.75.75 0 010 1.5h-5.25V16a.75.75 0 01-1.5 0v-5.25H4a.75.75 0 010-1.5h5.25V4a.75.75 0 01.75-.75z" clipRule="evenodd" />
                      </svg>
                    </span>
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
                        className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm border border-blue-100">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          </span>
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
            <AIGenerateButton onClick={() => handleAiGenerate('title')} loading={aiLoading.has('title')} queued={aiQueue.includes('title') && !aiLoading.has('title')} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add custom title..."
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white overflow-x-auto"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
            <AIGenerateButton onClick={() => handleAiGenerate('description')} loading={aiLoading.has('description')} queued={aiQueue.includes('description') && !aiLoading.has('description')} />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add custom description..."
            className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white overflow-x-auto"
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
