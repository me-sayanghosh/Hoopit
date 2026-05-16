import { useEffect, useState } from 'react'
import { getDomains, createDomain } from '../api/shortUrlapi.js'
import { getCurrentUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

export default function DomainsPage() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDomain, setNewDomain] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const [d, u] = await Promise.all([getDomains(), getCurrentUser().catch(() => null)])
        if (!mounted) return
        setDomains(d || [])
        setUser(u?.user || null)
      } catch (err) {
        setError(err?.message || 'Failed to load domains')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const handleCreate = async () => {
    if (!newDomain) return setError('Enter a domain')
    try {
      const created = await createDomain(newDomain.trim())
      setDomains(prev => [...prev, created.domain || created])
      setNewDomain('')
      setError('')
    } catch (err) {
      setError(err?.message || 'Failed to create domain')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-slate-600 hover:underline">← Back to dashboard</button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Domains</h2>
              <div className="text-sm text-slate-500">Manage custom domains for your account.</div>
            </div>
            <div className="text-sm text-slate-500">Total: <span className="font-medium text-slate-900">{domains.length}</span></div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : (
              <div className="grid gap-2">
                {domains.map((d) => (
                  <div key={d} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="text-sm text-slate-700">{d.domain || d}</div>
                    <div className="text-xs text-slate-500">{d.verified ? 'Verified' : 'Unverified'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-4">
            {user ? (
              <div className="flex gap-2">
                <input className="flex-1 rounded-lg border px-3 py-2" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="example.com" />
                <button onClick={handleCreate} className="rounded-lg bg-slate-900 px-4 py-2 text-white">Create</button>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Log in to add domains. <button onClick={() => navigate('/login')} className="underline">Login</button></div>
            )}
            {error ? <div className="mt-2 text-sm text-red-600">{error}</div> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
