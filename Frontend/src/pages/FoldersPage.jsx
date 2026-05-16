import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../api/user.api.js'

const folders = [
  { id: 1, name: 'Marketing', description: 'Marketing campaign links', links: 0 },
  { id: 2, name: 'Social Media', description: 'Social media posts', links: 0 },
  { id: 3, name: 'Email', description: 'Email marketing links', links: 0 },
]

export default function FoldersPage() {
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
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-900">Folders</div>
                <p className="mt-1 text-sm text-slate-500">Organize your links into folders.</p>
              </div>
              <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
                Create Folder
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {folders.map((folder) => (
                  <div key={folder.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{folder.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{folder.description}</p>
                        <p className="mt-2 text-xs text-slate-400">{folder.links} links</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
