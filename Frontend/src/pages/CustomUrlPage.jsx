import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCustomShortUrl } from '../api/shortUrlapi.js'

export default function CustomUrlPage() {
  const navigate = useNavigate()
  const [bUrl, setBUrl] = useState('')
  const [bAlias, setBAlias] = useState('')
  const [bLoading, setBLoading] = useState(false)
  const [bResult, setBResult] = useState('')
  const [bError, setBError] = useState('')
  const [copiedValue, setCopiedValue] = useState('')

  const copy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)
    setTimeout(() => setCopiedValue(''), 1500)
  }

  const submitB = async (e) => {
    e.preventDefault()
    if (!bUrl || !bAlias) return
    setBLoading(true)
    setBError('')
    setBResult('')
    try {
      const res = await createCustomShortUrl(bUrl, bAlias)
      const short = res?.shortUrl || ''
      if (!short) throw new Error('No custom short URL returned')
      setBResult(short)
      setBUrl('')
      setBAlias('')
    } catch (err) {
      setBError(err?.response?.data?.message || err?.message || 'Failed to create custom alias')
    } finally {
      setBLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 p-6 flex justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 sm:p-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-fit text-slate-500 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Custom URL</h1>
          <p className="mt-2 text-sm text-slate-600">Provide a URL and pick a short, memorable alias.</p>
        </div>

        <form onSubmit={submitB} className="grid gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Source URL</label>
            <input type="url" value={bUrl} onChange={(e) => setBUrl(e.target.value)} placeholder="https://example.com/your-page" className="w-full rounded-md border border-slate-200 px-3 py-2.5" required />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Custom Alias</label>
            <input type="text" value={bAlias} onChange={(e) => setBAlias(e.target.value)} placeholder="your-alias" className="w-full rounded-md border border-slate-200 px-3 py-2.5" required />
          </div>

          <button type="submit" disabled={bLoading} className="mt-2 w-full rounded-md bg-slate-900 px-4 py-3 text-white font-semibold hover:bg-black transition-colors disabled:opacity-50">
            {bLoading ? 'Creating…' : 'Create Custom Alias'}
          </button>
        </form>

        {bError ? <p className="mt-4 text-sm text-red-600 text-center bg-red-50 p-2 rounded">{bError}</p> : null}
        {bResult ? (
          <div className="mt-6 rounded-md bg-slate-50 border border-slate-100 p-4">
             <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Your Custom URL</p>
             <div className="flex items-center justify-between gap-3">
              <a href={bResult} target="_blank" rel="noreferrer" className="text-slate-900 break-all hover:underline">{bResult}</a>
              <button onClick={() => copy(bResult)} className="text-sm border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 shrink-0">
                {copiedValue === bResult ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
