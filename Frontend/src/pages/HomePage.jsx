import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#1a1a1a] font-sans selection:bg-blue-100 pb-32">
      {/* Navigation */}
      <nav className="w-full">
        <div className="max-w-[1200px] mx-auto px-6 h-[80px] flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter">hoopit</div>
          <div className="flex items-center gap-8 text-[13px] font-medium text-[#4d4d4d]">
            <Link to="/login" className="hover:text-black ml-4">Log in</Link>
            <Link to="/register" className="bg-[#1f1f1f] hover:opacity-90 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 pt-12 md:pt-20 text-center">
        <h1 className="text-5xl md:text-[3.5rem] leading-[1.1] font-medium tracking-tight text-[#111] mb-4 max-w-2xl mx-auto">
          Your tasks<br />
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
          Hoopit is a platform where you can shorten your URL and track your analytics.
        </p>

        <div className="flex justify-center mb-16">
          <Link to="/try-now" className="bg-[#1f1f1f] hover:opacity-90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm text-[15px]">
            Try Now
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
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-[2rem] leading-tight font-medium tracking-tight text-[#111]">
            Everything you<br />
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
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#1f1f1f]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Shorten URLs Instantly</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Use our fast URL shortener without even signing up. Experience how quickly Hoopit works.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#1f1f1f]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Create Custom Aliases</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Sign up to unlock custom back-halves for your URLs, making them memorable and branded.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
            <div className="w-10 h-10 flex items-center justify-center mb-6 text-[#1f1f1f]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="font-medium text-[15px] text-[#111] mb-2">Track Analytics</h3>
            <p className="text-[#666] text-[13px] leading-relaxed mb-6">
              Monitor your link performance with detailed click analytics, growth graphs, and top URL tracking.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage