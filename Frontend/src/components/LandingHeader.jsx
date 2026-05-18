import { Link } from 'react-router-dom'

export default function LandingHeader() {
  return (
    <nav className="w-full">
      <div className="max-w-[1200px] mx-auto px-6 h-[88px] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-2xl font-extrabold tracking-tight">hoopit</div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a className="hover:text-black">Features</a>
            <a className="hover:text-black">Solutions</a>
            <a className="hover:text-black">Resources</a>
            <a className="hover:text-black">Pricing</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-slate-600 hidden md:inline">Sign in</Link>
          <Link to="/try-now" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:opacity-95">Get demo</Link>
        </div>
      </div>
    </nav>
  )
}
