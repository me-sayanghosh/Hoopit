import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCustomShortUrl } from '../api/shortUrlapi.js'
import AppShell from '../components/AppShell.jsx'

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
    <AppShell
      title="Custom URL"
      subtitle="Create a short, memorable alias for any long destination."
    >
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-lg items-center justify-center px-4 py-8">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6" />

          <div className="mb-8 text-center">
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

            <button type="submit" disabled={bLoading} className="mt-2 w-full rounded-md bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-black disabled:opacity-50">
              {bLoading ? 'Creating…' : 'Create Custom Alias'}
            </button>
          </form>

          {bError ? <p className="mt-4 rounded bg-red-50 p-2 text-center text-sm text-red-600">{bError}</p> : null}
          {bResult ? (
            <div className="mt-6 rounded-md border border-slate-100 bg-slate-50 p-4">
               <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Your Custom URL</p>
               <div className="flex items-center justify-between gap-3">
                <a href={bResult} target="_blank" rel="noreferrer" className="break-all text-slate-900 hover:underline">{bResult}</a>
                <button onClick={() => copy(bResult)} className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
                  {copiedValue === bResult ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ) : null}
          {copiedValue ? (
            <div className="fixed right-4 top-16 z-50">
              <div className="flex items-center gap-3 rounded-md border border-slate-100 bg-white px-4 py-2 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                </svg>
                <div className="text-sm">
                  <div className="font-medium text-slate-900">Copied to clipboard</div>
                  <div className="max-w-xs break-all text-xs text-slate-500">{copiedValue.length > 48 ? `${copiedValue.slice(0,45)}...` : copiedValue}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}
