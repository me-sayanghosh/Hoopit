import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/user.api.js'
import AppShell from '../components/AppShell.jsx'

export default function CustomersPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentUser()
        setProfile(res?.user || null)
      } catch (err) {
        if (err?.message?.toLowerCase().includes('unauthorized')) {
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  if (loading) {
    return (
      <AppShell
        title="Customers"
        subtitle="Track and manage your customer profiles."
      >
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 flex flex-col items-center justify-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-pulse space-y-4">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="space-y-2 max-w-sm mx-auto flex flex-col items-center">
            <div className="h-3.5 w-64 rounded bg-slate-200" />
            <div className="h-3.5 w-48 rounded bg-slate-200" />
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Customers"
      subtitle="Track and manage your customer profiles."
      profile={profile}
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-blue-100 mb-4 text-blue-600 text-lg font-bold">
          &uarr;&darr;
        </div>
        <h3 className="text-lg font-bold text-slate-900">No customers yet</h3>
        <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm mx-auto">
          Customer segments and visitor profiles will automatically populate here as they click your tracked short links.
        </p>
      </div>
    </AppShell>
  )
}
