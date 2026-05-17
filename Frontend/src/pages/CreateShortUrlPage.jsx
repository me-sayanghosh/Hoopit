import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { getCurrentUser } from '../api/user.api.js'
import CreateLinkForm from '../components/CreateLinkForm.jsx'

export default function CreateShortUrlPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentUser()
        setProfile(res?.user || null)
      } catch (err) {
        if (err?.message?.toLowerCase().includes('unauthorized')) {
          navigate('/login')
        }
      }
    }

    load()
  }, [navigate])

  return (
    <AppShell
      title="Create link"
      subtitle="Build a new short link from the same workspace navigation as every other page."
      profile={profile}
      rightSlot={(
        <button onClick={() => navigate(-1)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          Close
        </button>
      )}
    >
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="px-4 py-4 sm:px-6">
          <CreateLinkForm />
        </div>
      </div>
    </AppShell>
  )
}
