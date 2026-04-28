import React from 'react'

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            URL Shortener
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Shorten any link in seconds
          </h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Paste a long URL, generate a short one, and copy it instantly.
          </p>
        </div>

        

        

        
      </div>
    </div>
  )
}

export default HomePage