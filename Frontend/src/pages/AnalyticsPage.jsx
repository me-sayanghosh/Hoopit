import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyShortUrlAnalytics, getMyShortUrls } from '../api/shortUrlapi.js'
import GrowthBarChart from '../components/GrowthBarChart.jsx'
import ChannelGauge from '../components/ChannelGauge.jsx'
import { getCurrentUser, logOutUser } from '../api/user.api.js'

const sidebarItems = [
  { label: 'Links', icon: 'link', active: true },
  { label: 'Domains', icon: 'globe' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Events', icon: 'spark' },
  { label: 'Folders', icon: 'folder' },
  { label: 'Tags', icon: 'tag' },
]

function SidebarIcon({ name, active = false }) {
  const className = active ? 'text-blue-600' : 'text-slate-500'

  if (name === 'link') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    )
  }

  if (name === 'globe') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18" />
      </svg>
    )
  }

  if (name === 'chart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l3-3 3 2 4-5" />
      </svg>
    )
  }

  if (name === 'spark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.75l1.06 4.24a2.25 2.25 0 001.66 1.66l4.24 1.06-4.24 1.06a2.25 2.25 0 00-1.66 1.66l-1.06 4.24-1.06-4.24a2.25 2.25 0 00-1.66-1.66l-4.24-1.06 4.24-1.06a2.25 2.25 0 001.66-1.66l1.06-4.24z" />
      </svg>
    )
  }

  if (name === 'folder') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379a2.25 2.25 0 011.59.659l1.372 1.372a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9.75v7.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25v-10.5z" />
      </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={`h-4 w-4 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" />
    </svg>
  )
}


const formatDate = (value) => {
  if (!value) {
    return 'Just now'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const chartPalette = ['#2563eb', '#0f766e', '#f59e0b', '#7c3aed', '#ef4444', '#14b8a6']

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeArc = (centerX, centerY, radius, startAngle, endAngle) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

const getChartSegments = (urls, totalClicks) => {
  const rankedUrls = [...urls].sort((first, second) => (second.clicks || 0) - (first.clicks || 0))
  const clicksData = rankedUrls.filter((item) => (item.clicks || 0) > 0)

  if (totalClicks > 0 && clicksData.length) {
    const topItems = clicksData.slice(0, 4)
    const remainingClicks = clicksData.slice(4).reduce((sum, item) => sum + (item.clicks || 0), 0)

    const chartItems = topItems.map((item, index) => ({
      id: item.id,
      label: item.shortUrl,
      value: item.clicks || 0,
      color: chartPalette[index % chartPalette.length],
    }))

    if (remainingClicks > 0) {
      chartItems.push({
        id: 'other-clicks',
        label: 'Other links',
        value: remainingClicks,
        color: chartPalette[chartItems.length % chartPalette.length],
      })
    }

    return chartItems
  }

  const fallbackItems = rankedUrls.slice(0, 5)
  return fallbackItems.map((item, index) => ({
    id: item.id,
    label: item.shortUrl,
    value: 1,
    color: chartPalette[index % chartPalette.length],
  }))
}

const getGrowthSeries = (urls) => {
  const countsByDate = new Map()

  urls.forEach((item) => {
    if (!item?.createdAt) {
      return
    }

    const date = new Date(item.createdAt)
    if (Number.isNaN(date.getTime())) {
      return
    }

    const key = date.toLocaleDateString('en-CA')
    countsByDate.set(key, (countsByDate.get(key) || 0) + 1)
  })

  return [...countsByDate.entries()]
    .sort(([firstDate], [secondDate]) => new Date(firstDate) - new Date(secondDate))
    .map(([dateKey, count]) => ({
      id: dateKey,
      label: new Date(dateKey).toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
      }),
      value: count,
    }))
}

const buildGrowthLinePath = (series, width, height, padding) => {
  if (!series.length) {
    return ''
  }

  const usableWidth = width - padding.left - padding.right
  const usableHeight = height - padding.top - padding.bottom
  const maxValue = Math.max(...series.map((item) => item.value), 1)

  return series
    .map((item, index) => {
      const x = padding.left + (index / Math.max(series.length - 1, 1)) * usableWidth
      const y = padding.top + usableHeight - (item.value / maxValue) * usableHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function AnalyticsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [urls, setUrls] = useState([])
  const [analytics, setAnalytics] = useState({
    totalUrls: 0,
    totalClicks: 0,
    uniqueClicks: 0,
    averageClicks: 0,
    topUrl: null,
    recentUrls: [],
    realtimeClicks: [],
    topReferrers: [],
    trafficByCountry: [],
    trafficByDevice: [],
    trafficByBrowser: [],
  })
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      setPageError('')

      try {
        const [profileRes, urlsResponse, analyticsResponse] = await Promise.all([
          getCurrentUser(),
          getMyShortUrls(),
          getMyShortUrlAnalytics(),
        ])

        setProfile(profileRes?.user || null)
        setUrls(urlsResponse?.urls || [])
        setAnalytics({
          totalUrls: analyticsResponse?.totalUrls || 0,
          totalClicks: analyticsResponse?.totalClicks || 0,
          uniqueClicks: analyticsResponse?.uniqueClicks || 0,
          averageClicks: analyticsResponse?.averageClicks || 0,
          topUrl: analyticsResponse?.topUrl || null,
          recentUrls: analyticsResponse?.recentUrls || [],
          realtimeClicks: analyticsResponse?.realtimeClicks || [],
          topReferrers: analyticsResponse?.topReferrers || [],
          trafficByCountry: analyticsResponse?.trafficByCountry || [],
          trafficByDevice: analyticsResponse?.trafficByDevice || [],
          trafficByBrowser: analyticsResponse?.trafficByBrowser || [],
        })
      } catch (error) {
        const message = error?.message || 'Unable to load your analytics right now.'

        if (message.toLowerCase().includes('unauthorized')) {
          navigate('/login')
          return
        }

        setPageError(message)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [navigate])



  const topUrl = analytics.topUrl || urls[0] || null
  const chartSegments = getChartSegments(urls, analytics.totalClicks)
  const chartTotal = chartSegments.reduce((sum, segment) => sum + segment.value, 0)
  const growthSeries = getGrowthSeries(urls)
  const growthWidth = 860
  const growthHeight = 280
  const growthPadding = { top: 24, right: 20, bottom: 48, left: 24 }
  const growthPath = buildGrowthLinePath(growthSeries, growthWidth, growthHeight, growthPadding)
  const growthMax = Math.max(...growthSeries.map((item) => item.value), 1)
  const realtimeSeries = analytics.realtimeClicks || []
  const realtimeWidth = 860
  const realtimeHeight = 240
  const realtimePadding = { top: 20, right: 20, bottom: 36, left: 20 }
  const realtimePath = buildGrowthLinePath(realtimeSeries, realtimeWidth, realtimeHeight, realtimePadding)
  const realtimeMax = Math.max(...realtimeSeries.map((item) => item.value), 1)
  const clickThroughRate = analytics.totalClicks ? Number(((analytics.uniqueClicks / analytics.totalClicks) * 100).toFixed(1)) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] text-[#111827]">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-sm">
            Loading your analytics...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="flex min-h-screen w-full">
        <aside className="hidden lg:flex w-64 flex-col px-2 py-6 sticky top-6 self-start h-[calc(100vh-48px)] overflow-auto">
          <div className="rounded-3xl bg-[#f3f4f6] p-3 shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center gap-3 px-2">
              <div className="text-2xl font-extrabold text-slate-900">dub</div>
              <div className="ml-auto">
                <img
                  src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white p-4 shadow-sm flex-shrink-0">
              <div className="text-sm font-semibold text-slate-900">Short Links</div>
              <nav className="mt-3 space-y-1">
                {sidebarItems.map((item) => (
                  <div key={item.label} className={`relative flex items-center gap-3 rounded-lg pl-4 pr-3 py-2 text-sm ${item.active ? 'bg-blue-50 font-medium text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {item.active ? <span className="absolute left-0 top-0 h-full w-1 rounded-r-md bg-blue-500" /> : null}
                    <SidebarIcon name={item.icon} active={item.active} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              <div className="mt-4 text-sm text-slate-500">Insights</div>
              <nav className="mt-2 space-y-1">
                <button onClick={() => navigate('/analytics')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="chart" />
                  <span>Analytics</span>
                </button>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  <SidebarIcon name="spark" />
                  <span>Events</span>
                </div>
                <button onClick={() => navigate('/customers')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="user" />
                  <span>Customers</span>
                </button>
              </nav>

              <div className="mt-4 text-sm text-slate-500">Library</div>
              <nav className="mt-2 space-y-1">
                <button onClick={() => navigate('/folders')} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition">
                  <SidebarIcon name="folder" />
                  <span>Folders</span>
                </button>
              </nav>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4 px-1">
              <div className="text-xs font-medium text-slate-500">Usage</div>
              <div className="mt-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /></svg> Events</span>
                  <span className="text-xs text-slate-400">1 of 1K</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{width: '10%'}} />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /></svg> Links</span>
                  <span className="text-xs text-slate-400">2 of 25</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-blue-500" style={{width: '8%'}} />
                </div>

              </div>
            </div>

            <div className="mt-auto px-1">
                <button onClick={async () => { try { await logOutUser(); navigate('/'); } catch (e) { /* ignore */ } }} className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Logout</button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-2 py-6 sm:px-4 lg:px-6">
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</div>
                <p className="mt-1 text-sm text-slate-500">Overview of your links and click activity.</p>
              </div>

              <div />
            </div>

            <div className="px-5 py-4">
              {pageError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {pageError}
                </div>
              ) : null}

              <div className="flex flex-col gap-6">


            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-7">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Analytics section</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Your URL performance</h2>
              </div>

              <div className="mb-6 rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Growth graph</p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Short URL create count by date</h3>
                  </div>
                  <p className="text-sm text-slate-500">Timeline of how many short URLs were created each day.</p>
                </div>

                {growthSeries.length ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <GrowthBarChart series={growthSeries.map((s) => ({ id: s.id, label: s.label, value: s.value }))} width={640} height={240} />
                    </div>
                    <div>
                      <ChannelGauge data={analytics.trafficByCountry && analytics.trafficByCountry.length ? analytics.trafficByCountry.slice(0,4).map((d,i)=>({label:d.label,value:d.value})): [{label:'Google',value:78},{label:'Facebook',value:12},{label:'YouTube',value:6},{label:'Others',value:4}]} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                    Create your first short URL and the growth graph will appear here.
                  </div>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:content-start">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Total URLs</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{analytics.totalUrls}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Total clicks</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{analytics.totalClicks}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Average clicks</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{analytics.averageClicks}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Unique clicks</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{analytics.uniqueClicks}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Unique rate</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{clickThroughRate}%</p>
                  </div>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Click share</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Pie chart</h3>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                      {chartTotal || 0} total
                    </div>
                  </div>

                  {chartSegments.length ? (
                    <div className="grid gap-5 md:grid-cols-[240px_1fr] md:items-center">
                      <div className="relative mx-auto flex h-60 w-60 items-center justify-center">
                        <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
                          {chartTotal > 0 ? (
                            (() => {
                              let cumulative = 0

                              return chartSegments.map((segment) => {
                                const startAngle = (cumulative / chartTotal) * 360
                                cumulative += segment.value
                                const endAngle = (cumulative / chartTotal) * 360

                                return (
                                  <path
                                    key={segment.id}
                                    d={describeArc(120, 120, 86, startAngle, endAngle)}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth="28"
                                    strokeLinecap="round"
                                  />
                                )
                              })
                            })()
                          ) : (
                            <circle cx="120" cy="120" r="86" fill="none" stroke="#e2e8f0" strokeWidth="28" />
                          )}
                        </svg>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Clicks</span>
                          <span className="mt-1 text-4xl font-bold tracking-tight text-slate-900">{analytics.totalClicks}</span>
                          <span className="mt-1 text-sm text-slate-500">across your links</span>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {chartSegments.map((segment) => (
                          <div key={segment.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <span
                              className="h-3.5 w-3.5 rounded-full"
                              style={{ backgroundColor: segment.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{segment.label}</p>
                              <p className="text-xs text-slate-500">
                                {chartTotal > 0 ? `${Math.round((segment.value / chartTotal) * 100)}% of clicks` : 'Created link'}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{segment.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                      Create a few URLs first and the pie chart will show click distribution.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Real-time clicks</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Last 24 hours</h3>
                    </div>
                    <p className="text-sm text-slate-500">Updated from each redirect event.</p>
                  </div>

                  {realtimeSeries.length ? (
                    <div className="grid gap-5 lg:grid-cols-[1fr_220px] lg:items-center">
                      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <svg viewBox={`0 0 ${realtimeWidth} ${realtimeHeight}`} className="h-auto w-full">
                          <defs>
                            <linearGradient id="realtimeFill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#0f766e" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          {[0.25, 0.5, 0.75, 1].map((ratio) => {
                            const y = realtimePadding.top + (realtimeHeight - realtimePadding.top - realtimePadding.bottom) * ratio

                            return (
                              <line
                                key={ratio}
                                x1={realtimePadding.left}
                                y1={y}
                                x2={realtimeWidth - realtimePadding.right}
                                y2={y}
                                stroke="#e2e8f0"
                                strokeDasharray="4 8"
                              />
                            )
                          })}

                          {realtimeSeries.length > 1 ? (
                            <path
                              d={`${realtimePath} L ${realtimeWidth - realtimePadding.right} ${realtimeHeight - realtimePadding.bottom} L ${realtimePadding.left} ${realtimeHeight - realtimePadding.bottom} Z`}
                              fill="url(#realtimeFill)"
                            />
                          ) : null}

                          <path d={realtimePath} fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                          {realtimeSeries.map((item, index) => {
                            const usableWidth = realtimeWidth - realtimePadding.left - realtimePadding.right
                            const usableHeight = realtimeHeight - realtimePadding.top - realtimePadding.bottom
                            const x = realtimePadding.left + (index / Math.max(realtimeSeries.length - 1, 1)) * usableWidth
                            const y = realtimePadding.top + usableHeight - (item.value / realtimeMax) * usableHeight

                            return (
                              <g key={item.label}>
                                <circle cx={x} cy={y} r="5" fill="#0f766e" stroke="#ffffff" strokeWidth="3" />
                                <text x={x} y={realtimeHeight - 14} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">
                                  {index % 3 === 0 ? item.label : ''}
                                </text>
                              </g>
                            )
                          })}
                        </svg>
                      </div>

                      <div className="grid gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-500">Clicks in last 24h</p>
                          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            {realtimeSeries.reduce((sum, item) => sum + item.value, 0)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-500">Top referrer</p>
                          <p className="mt-2 wrap-break-word text-lg font-semibold text-slate-900">
                            {analytics.topReferrers[0]?.label || 'Direct'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-medium text-slate-500">Top country</p>
                          <p className="mt-2 text-lg font-semibold text-slate-900">
                            {analytics.trafficByCountry[0]?.label || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                      Real-time click activity will appear here after users start opening your short links.
                    </div>
                  )}
                </section>

                <section className="grid gap-6">
                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Geography</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Top locations</h3>
                    </div>
                    {analytics.trafficByCountry.length ? (
                      <div className="grid gap-3">
                        {analytics.trafficByCountry.slice(0, 6).map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-900">{item.label}</span>
                            <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No location data yet.</p>
                    )}
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Audience</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Devices and browsers</h3>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-700">Devices</p>
                        <div className="grid gap-2">
                          {analytics.trafficByDevice.length ? analytics.trafficByDevice.slice(0, 5).map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <span className="text-sm text-slate-900">{item.label}</span>
                              <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                            </div>
                          )) : <p className="text-sm text-slate-500">No device data yet.</p>}
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-700">Browsers</p>
                        <div className="grid gap-2">
                          {analytics.trafficByBrowser.length ? analytics.trafficByBrowser.slice(0, 5).map((item) => (
                            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <span className="text-sm text-slate-900">{item.label}</span>
                              <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                            </div>
                          )) : <p className="text-sm text-slate-500">No browser data yet.</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Traffic sources</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Top referrers</h3>
                    </div>
                    {analytics.topReferrers.length ? (
                      <div className="grid gap-3">
                        {analytics.topReferrers.slice(0, 6).map((item) => (
                          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="truncate text-sm font-medium text-slate-900">{item.label}</span>
                            <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No referrer data yet.</p>
                    )}
                  </div>
                </section>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Best performing URL</p>
                {topUrl ? (
                  <div className="mt-3 grid gap-3 text-sm text-slate-600">
                    <p className="break-all"><span className="font-medium text-slate-500">Original:</span> {topUrl.originalUrl}</p>
                    <p className="break-all"><span className="font-medium text-slate-500">Short:</span> {topUrl.shortUrl}</p>
                    <p><span className="font-medium text-slate-500">Unique clicks:</span> {topUrl.uniqueClicks || 0}</p>
                    <p><span className="font-medium text-slate-500">Created:</span> {formatDate(topUrl.createdAt)}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No URLs created yet.</p>
                )}
              </div>
            </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AnalyticsPage
