import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyShortUrls } from '../api/shortUrlapi.js'

const formatDate = (value) => {
  if (!value) return 'Just now'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function MyCreationsPage() {
  const navigate = useNavigate()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [copiedValue, setCopiedValue] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const urlsRes = await getMyShortUrls()
        setUrls(urlsRes?.urls || [])
      } catch (err) {
        setPageError(err?.message || 'Unable to load your creations.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const copy = async (value) => {
    await navigator.clipboard.writeText(value)
    setCopiedValue(value)
    setTimeout(() => setCopiedValue(''), 1500)
  }

  // Split logic if backend provides custom alias flag. If not, just show them all in one list.
  // Assuming 'isCustom' or 'alias' property exists, but for safety, we'll display everything clearly.

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="rounded-xl bg-white p-6 shadow">Loading your creations…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-fit text-slate-500 hover:text-black flex items-center gap-2 text-sm font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold">My Creations</h1>
          </div>
          <Link 
            to="/analytics"
            className="w-fit text-white bg-slate-900 hover:bg-black flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-lg shadow-sm"
          >
            View Analytics
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {pageError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">All Short URLs</h2>
          
          {urls.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="px-4 py-3">Source URL</th>
                    <th className="px-4 py-3">Short URL</th>
                    <th className="px-4 py-3">Clicks</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {urls.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 max-w-[300px] truncate">
                        <a href={item.originalUrl} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:text-blue-700">{item.originalUrl}</a>
                      </td>
                      <td className="px-4 py-3">
                        <a href={item.shortUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{item.shortUrl}</a>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{item.clicks || 0}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => copy(item.shortUrl)} 
                          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {copiedValue === item.shortUrl ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
              <p className="text-base font-medium text-slate-700 mb-1">No creations found</p>
              <p>You haven't created any short URLs yet.</p>
              <Link to="/dashboard" className="inline-block mt-4 text-[#0066cc] hover:underline font-medium">Go create one</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
