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
      title="Create Link"
      subtitle="Configure and design a brand-new short link."
      profile={profile}
      rightSlot={(
        <button
          onClick={() => navigate(-1)}
          className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Cancel
        </button>
      )}
    >
      <div className="max-w-2xl">
        <CreateLinkForm />
      </div>
    </AppShell>
  )
}
