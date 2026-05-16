import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/user.api.js'

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="flex min-h-screen w-full">
        <main className="min-w-0 flex-1 px-2 py-6 sm:px-4 lg:px-6">
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-900">Customers</div>
                <p className="mt-1 text-sm text-slate-500">Track and manage your customers.</p>
              </div>
            </div>

            <div className="px-6 py-12 text-center">
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12">
                <p className="text-lg font-semibold text-slate-900">No customers yet</p>
                <p className="mt-2 text-sm text-slate-500">Customers will appear here as you track links.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
