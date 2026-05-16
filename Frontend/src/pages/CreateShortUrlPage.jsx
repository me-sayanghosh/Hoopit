import { useNavigate } from 'react-router-dom'
import CreateLinkForm from '../components/CreateLinkForm.jsx'

export default function CreateShortUrlPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-slate-900 flex items-start justify-center py-12">
      <div className="w-full max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Links › New link</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Draft saved</div>
              <button onClick={() => navigate(-1)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                X
              </button>
            </div>
          </div>

          <div className="p-6">
            <CreateLinkForm />
          </div>
        </div>
      </div>
    </div>
  )
}
