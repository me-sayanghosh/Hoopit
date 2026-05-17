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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <AppShell
      title="Customers"
      subtitle="Track and manage your customers."
      profile={profile}
    >
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-12 text-center">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12">
            <p className="text-lg font-semibold text-slate-900">No customers yet</p>
            <p className="mt-2 text-sm text-slate-500">Customers will appear here as you track links.</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
