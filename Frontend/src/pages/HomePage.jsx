import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#1a1a1a] font-sans selection:bg-blue-100 pb-32">
      {/* Navigation */}
      <nav className="w-full">
        <div className="max-w-[1200px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter">hoopit</div>
          <div className="flex items-center gap-8 text-[13px] font-medium text-[#4d4d4d]">
            <Link to="/features" className="hover:text-black hidden sm:block">Features</Link>
            <Link to="/pricing" className="hover:text-black hidden sm:block">Pricing</Link>
            <Link to="/about" className="hover:text-black hidden sm:block">About</Link>
            <Link to="/support" className="hover:text-black hidden sm:block">Support</Link>
            <Link to="/login" className="hover:text-black ml-4">Log in</Link>
            <Link to="/register" className="bg-[#0066cc] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-[6px] transition-colors shadow-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 pt-20 text-center">
        <h1 className="text-[3.5rem] leading-[1.1] font-medium tracking-tight text-[#111] mb-4 max-w-2xl mx-auto">
          Your tasks<br/>
          deserve more than <span className="relative inline-block whitespace-nowrap">
            <span className="relative z-10">guessing.</span>
            <svg 
              className="absolute left-[-2%] w-[104%] h-[12px] bottom-[-2px] text-[#0066cc] z-0 pointer-events-none" 
              viewBox="0 0 100 12" 
              preserveAspectRatio="none"
            >
              <path 
                className="animate-draw-line"
                d="M -2 3 L 102 3" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
              <path 
                className="animate-draw-line delay-200"
                d="M 2 9 L 98 9" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                pathLength="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </span>
        </h1>
        
        <p className="text-[15px] text-[#666] mb-8">
          Start organizing like a professional.
        </p>

        <div className="flex justify-center mb-16">
          <Link to="/register" className="bg-[#0066cc] hover:bg-[#005bb5] text-white px-6 py-2.5 rounded-[6px] font-medium transition-colors shadow-sm text-[15px]">
            Start for free
          </Link>
        </div>

        {/* Hero Image */}
        <div className="flex justify-center mb-8 relative">
          <img 
            src="/hero-mockup-2.png" 
            alt="Hoopit mobile experience" 
            className="w-full max-w-[600px] object-contain drop-shadow-2xl"
            style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
          />
        </div>
        
        {/* Caption */}
        <p className="text-[12px] text-[#888] mb-32">
          Private by default. Journal, review, and plan at your own pace.
        </p>

        {/* Mid Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-[2rem] leading-tight font-medium tracking-tight text-[#111]">
            Everything you<br/>
            need, all in <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">one workspace</span>
              <svg 
                className="absolute left-[-2%] w-[104%] h-[10px] bottom-[0px] text-[#0066cc] z-0 pointer-events-none" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <path 
                  className="animate-draw-line delay-400"
                  d="M -2 2 L 102 2" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  pathLength="1"
                  vectorEffect="non-scaling-stroke"
                />
                <path 
                  className="animate-draw-line delay-600"
                  d="M 2 8 L 98 8" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  pathLength="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>.
          </h2>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left max-w-[1000px] mx-auto">
          {/* Card 1 */}
          <div className="bg-[#ecedf0] rounded-[16px] p-8 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#0066cc]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Workspace that still reads clean months later</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Log tasks with tags, priority, and notes so your future self knows exactly what you were thinking.
            </p>
            <Link to="/features" className="text-[#0066cc] text-[13px] font-medium hover:underline">Learn more</Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#ecedf0] rounded-[16px] p-8 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#0066cc]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Calendar built around sessions, not noise</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Log progress on a timeline that matches how you really work the week.
            </p>
            <Link to="/features" className="text-[#0066cc] text-[13px] font-medium hover:underline">Learn more</Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#ecedf0] rounded-[16px] p-8 transition-colors">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#0066cc]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Analytics, month to day</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Rollups and daily drill-downs, P&L, buckets, and streaks in one place.
            </p>
            <Link to="/features" className="text-[#0066cc] text-[13px] font-medium hover:underline">Learn more</Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage