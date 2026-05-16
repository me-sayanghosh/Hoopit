import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyShortUrlAnalytics, getMyShortUrls } from '../api/shortUrlapi.js'


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


  const [urls, setUrls] = useState([])
  const [analytics, setAnalytics] = useState({
    totalUrls: 0,
    totalClicks: 0,
    averageClicks: 0,
    topUrl: null,
    recentUrls: [],
  })
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      setPageError('')

      try {
        const [urlsResponse, analyticsResponse] = await Promise.all([
          getMyShortUrls(),
          getMyShortUrlAnalytics(),
        ])

        setUrls(urlsResponse?.urls || [])
        setAnalytics({
          totalUrls: analyticsResponse?.totalUrls || 0,
          totalClicks: analyticsResponse?.totalClicks || 0,
          averageClicks: analyticsResponse?.averageClicks || 0,
          topUrl: analyticsResponse?.topUrl || null,
          recentUrls: analyticsResponse?.recentUrls || [],
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
    <div className="min-h-screen bg-[#f7f7f8] text-[#111827]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        </header>

        {pageError ? (
          <p className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </p>
        ) : null}

        <main className="flex flex-col gap-6">


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
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <svg viewBox={`0 0 ${growthWidth} ${growthHeight}`} className="h-auto w-full">
                      <defs>
                        <linearGradient id="growthFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {[0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = growthPadding.top + (growthHeight - growthPadding.top - growthPadding.bottom) * ratio

                        return (
                          <g key={ratio}>
                            <line
                              x1={growthPadding.left}
                              y1={y}
                              x2={growthWidth - growthPadding.right}
                              y2={y}
                              stroke="#e2e8f0"
                              strokeDasharray="4 8"
                            />
                          </g>
                        )
                      })}

                      {growthSeries.length > 1 ? (
                        <path
                          d={`${growthPath} L ${growthWidth - growthPadding.right} ${growthHeight - growthPadding.bottom} L ${growthPadding.left} ${growthHeight - growthPadding.bottom} Z`}
                          fill="url(#growthFill)"
                        />
                      ) : null}

                      <path d={growthPath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                      {growthSeries.map((item, index) => {
                        const usableWidth = growthWidth - growthPadding.left - growthPadding.right
                        const usableHeight = growthHeight - growthPadding.top - growthPadding.bottom
                        const x = growthPadding.left + (index / Math.max(growthSeries.length - 1, 1)) * usableWidth
                        const y = growthPadding.top + usableHeight - (item.value / growthMax) * usableHeight

                        return (
                          <g key={item.id}>
                            <circle cx={x} cy={y} r="7" fill="#2563eb" stroke="#ffffff" strokeWidth="4" />
                          </g>
                        )
                      })}

                      {growthSeries.map((item, index) => {
                        const usableWidth = growthWidth - growthPadding.left - growthPadding.right
                        const usableHeight = growthHeight - growthPadding.top - growthPadding.bottom
                        const x = growthPadding.left + (index / Math.max(growthSeries.length - 1, 1)) * usableWidth
                        const y = growthPadding.top + usableHeight - (item.value / growthMax) * usableHeight

                        return (
                          <g key={`${item.id}-value`}>
                            <rect x={x - 18} y={y - 42} width="36" height="22" rx="11" fill="#0f172a" opacity="0.92" />
                            <text x={x} y={y - 27} textAnchor="middle" className="fill-white text-[12px] font-semibold">
                              {item.value}
                            </text>
                          </g>
                        )
                      })}

                      {growthSeries.map((item, index) => {
                        const usableWidth = growthWidth - growthPadding.left - growthPadding.right
                        const x = growthPadding.left + (index / Math.max(growthSeries.length - 1, 1)) * usableWidth

                        return (
                          <g key={`${item.id}-label`}>
                            <text x={x} y={growthHeight - 16} textAnchor="middle" className="fill-slate-500 text-[12px] font-medium">
                              {item.label}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
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
                    <p className="text-sm font-medium text-slate-500">Top URL clicks</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{topUrl?.clicks || 0}</p>
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

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Best performing URL</p>
                {topUrl ? (
                  <div className="mt-3 grid gap-3 text-sm text-slate-600">
                    <p className="break-all"><span className="font-medium text-slate-500">Original:</span> {topUrl.originalUrl}</p>
                    <p className="break-all"><span className="font-medium text-slate-500">Short:</span> {topUrl.shortUrl}</p>
                    <p><span className="font-medium text-slate-500">Created:</span> {formatDate(topUrl.createdAt)}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No URLs created yet.</p>
                )}
              </div>
            </section>
        </main>
      </div>
    </div>
  )
}

export default AnalyticsPage
