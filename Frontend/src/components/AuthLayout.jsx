import { Link } from 'react-router-dom'

function AuthLayout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Simple Header */}
      <header className="py-6 px-8 w-full flex justify-between items-center">
        <Link to="/" className="font-bold text-xl tracking-tight text-gray-900">
          hoopit
        </Link>
        <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Back to home
        </Link>
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Text Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-500 text-[0.95rem]">{description}</p>
            )}
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Hoopit Inc. All rights reserved.
      </footer>
    </div>
  )
}

export default AuthLayout