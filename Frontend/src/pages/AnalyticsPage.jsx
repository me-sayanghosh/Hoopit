import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyShortUrlAnalytics, getMyShortUrls, getSingleShortUrlAnalytics } from '../api/shortUrlapi.js'
import GrowthBarChart from '../components/GrowthBarChart.jsx'
import ChannelGauge from '../components/ChannelGauge.jsx'
import GeoMapView from '../components/GeoMapView.jsx'
import { getCurrentUser } from '../api/user.api.js'
import AppShell from '../components/AppShell.jsx'


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

const chartPalette = ['#2563eb', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B']
const devicePalette = {
  Desktop: '#2563eb',
  Mobile: '#10B981',
  Tablet: '#F59E0B',
  Other: '#8B5CF6',
}

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
  const { shortUrl } = useParams()
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
    trafficByCity: [],
    trafficByDevice: [],
    trafficByBrowser: [],
    clickMapPoints: [],
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
          shortUrl ? getSingleShortUrlAnalytics(shortUrl) : getMyShortUrlAnalytics(),
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
          trafficByCity: analyticsResponse?.trafficByCity || [],
          trafficByDevice: analyticsResponse?.trafficByDevice || [],
          trafficByBrowser: analyticsResponse?.trafficByBrowser || [],
          clickMapPoints: analyticsResponse?.clickMapPoints || [],
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
  }, [navigate, shortUrl])



  const topUrl = analytics.topUrl || urls[0] || null
  const chartSourceUrls = shortUrl
    ? (topUrl ? [topUrl] : [])
    : urls
  const chartSegments = getChartSegments(chartSourceUrls, analytics.totalClicks)
  const chartTotal = chartSegments.reduce((sum, segment) => sum + segment.value, 0)
  const growthSeries = getGrowthSeries(urls)
  const realtimeSeries = analytics.realtimeClicks || []
  const realtimeWidth = 860
  const realtimeHeight = 240
  const realtimePadding = { top: 20, right: 20, bottom: 36, left: 20 }
  const realtimePath = buildGrowthLinePath(realtimeSeries, realtimeWidth, realtimeHeight, realtimePadding)
  const realtimeMax = Math.max(...realtimeSeries.map((item) => item.value), 1)
  const clickThroughRate = analytics.totalClicks ? Number(((analytics.uniqueClicks / analytics.totalClicks) * 100).toFixed(1)) : 0
  const deviceTotal = analytics.trafficByDevice.reduce((sum, item) => sum + (item.value || 0), 0)
  const normalizedDeviceData = ['Desktop', 'Mobile', 'Tablet', 'Other'].map((label) => ({
    label,
    value: analytics.trafficByDevice.find((item) => item.label === label)?.value || 0,
  }))

  if (loading) {
    return (
      <AppShell
        title="Analytics"
        subtitle="Overview of your links and click activity."
      >
        <div className="space-y-6 animate-pulse">
          {/* Top Growth timeline block skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-5 w-64 rounded bg-slate-200" />
              </div>
              <div className="h-4 w-44 rounded bg-slate-200" />
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[270px] rounded-2xl bg-slate-50 border border-slate-100" />
              <div className="h-[270px] rounded-2xl bg-slate-50 border border-slate-100" />
            </div>
          </div>

          {/* Metric counters skeletons */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3">
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="h-8 w-12 rounded bg-slate-200" />
              </div>
            ))}
          </div>

          {/* Core charts & Map split skeletons */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Click share skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="h-5 w-44 rounded bg-slate-200" />
                </div>
                <div className="h-6 w-16 rounded-full bg-slate-200" />
              </div>
              <div className="h-[200px] rounded-2xl bg-slate-50 border border-slate-100" />
            </div>

            {/* Real-time clicks skeleton */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-slate-200" />
                  <div className="h-5 w-36 rounded bg-slate-200" />
                </div>
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="h-[200px] rounded-2xl bg-slate-50 border border-slate-100" />
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={shortUrl ? `Analytics for /${shortUrl}` : 'Analytics'}
      subtitle="Overview of your links and click activity."
      profile={profile}
      rightSlot={shortUrl ? (
        <button onClick={() => navigate('/analytics')} className="rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition">
          &larr; Back to All Analytics
        </button>
      ) : null}
    >
      <div className="space-y-6">
        {pageError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {pageError}
          </div>
        ) : null}

        {/* Growth timeline */}
        {growthSeries.length ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Growth graph</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Short URL create count by date</h3>
              </div>
              <p className="text-sm font-medium text-slate-500">Timeline of how many short URLs were created each day.</p>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <GrowthBarChart series={growthSeries.map((s) => ({ id: s.id, label: s.label, value: s.value }))} width={640} height={240} />
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              {analytics.trafficByCountry && analytics.trafficByCountry.length ? (
                <ChannelGauge data={analytics.trafficByCountry.slice(0,4).map((d)=>({label:d.label,value:d.value}))} />
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6">
                  <p className="text-sm font-medium text-slate-500">No country traffic data yet. Data will appear after users click your short links.</p>
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm font-medium text-slate-500">
            Create your first short URL and the growth graph will appear here.
          </div>
        )}

        {/* Core Stats counters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total URLs</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{analytics.totalUrls}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Clicks</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{analytics.totalClicks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Clicks</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{analytics.averageClicks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Clicks</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{analytics.uniqueClicks}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Rate</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{clickThroughRate}%</p>
          </div>
        </div>

        {/* Charts & Map split */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Click share Pie Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Click Share</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Link click distribution</h3>
              </div>
              <div className="rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-500">
                {chartTotal || 0} total
              </div>
            </div>

            {chartSegments.length ? (
              <div className="grid gap-6 md:grid-cols-[200px_1fr] md:items-center">
                <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
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
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clicks</span>
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900">{analytics.totalClicks}</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  {chartSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 shadow-sm">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{segment.label}</p>
                        <p className="text-xs font-medium text-slate-400">
                          {chartTotal > 0 ? `${Math.round((segment.value / chartTotal) * 100)}% of clicks` : 'Created link'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{segment.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm font-medium text-slate-500">
                Create a few URLs first and the pie chart will show click distribution.
              </div>
            )}
          </div>

          {/* Real-time Graph */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Real-time clicks</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Last 24 hours</h3>
              </div>
              <p className="text-sm font-medium text-slate-500">Updated from redirect events.</p>
            </div>

            {realtimeSeries.length ? (
              <div className="grid gap-5">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <svg viewBox={`0 0 ${realtimeWidth} ${realtimeHeight}`} className="h-auto w-full">
                    <defs>
                      <linearGradient id="realtimeFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
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

                    <path d={realtimePath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                    {realtimeSeries.map((item, index) => {
                      const usableWidth = realtimeWidth - realtimePadding.left - realtimePadding.right
                      const usableHeight = realtimeHeight - realtimePadding.top - realtimePadding.bottom
                      const x = realtimePadding.left + (index / Math.max(realtimeSeries.length - 1, 1)) * usableWidth
                      const y = realtimePadding.top + usableHeight - (item.value / realtimeMax) * usableHeight

                      return (
                        <g key={item.label}>
                          <circle cx={x} cy={y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="3" />
                          <text x={x} y={realtimeHeight - 14} textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">
                            {index % 3 === 0 ? item.label : ''}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-xs font-bold text-slate-400">Clicks in 24h</p>
                    <p className="mt-1 text-xl font-extrabold text-slate-900">
                      {realtimeSeries.reduce((sum, item) => sum + item.value, 0)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-xs font-bold text-slate-400">Top referrer</p>
                    <p className="mt-1 truncate text-base font-extrabold text-slate-900">
                      {analytics.topReferrers[0]?.label || 'Direct'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <p className="text-xs font-bold text-slate-400">Top country</p>
                    <p className="mt-1 truncate text-base font-extrabold text-slate-900">
                      {analytics.trafficByCountry[0]?.label || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm font-medium text-slate-500">
                Real-time click activity will appear here after users start opening your short links.
              </div>
            )}
          </div>
        </div>

        {/* Map & Lists grids */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map Geography */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Geography</p>
              <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Top countries and cities</h3>
            </div>
            <div className="grid gap-5">
              <div className="rounded-2xl overflow-hidden border border-slate-100">
                <GeoMapView points={analytics.clickMapPoints} />
              </div>

              <div>
                <p className="mb-3 text-sm font-bold text-slate-800">Cities</p>
                {analytics.trafficByCity.length ? (
                  <div className="grid gap-2">
                    {analytics.trafficByCity.slice(0, 6).map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5">
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-500">No city data yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Audience split */}
          <div className="space-y-6">
            {/* Devices & Browsers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Audience</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Devices and browsers</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="mb-3.5 text-sm font-bold text-slate-800">Devices</p>
                  <div className="grid gap-3">
                    {normalizedDeviceData.length ? normalizedDeviceData.map((item) => {
                      const percent = deviceTotal ? Math.round((item.value / deviceTotal) * 100) : 0
                      return (
                        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                            <span className="text-sm font-bold text-slate-700">{item.value}</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${percent}%`, backgroundColor: devicePalette[item.label] || '#64748b' }}
                            />
                          </div>
                          <div className="mt-1 text-[10px] font-bold text-slate-400">{percent}% of clicks</div>
                        </div>
                      )
                    }) : <p className="text-sm font-medium text-slate-500">No device data yet.</p>}
                  </div>
                </div>

                <div>
                  <p className="mb-3.5 text-sm font-bold text-slate-800">Browsers</p>
                  <div className="grid gap-2">
                    {analytics.trafficByBrowser.length ? analytics.trafficByBrowser.slice(0, 5).map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5">
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                        <span className="text-sm font-bold text-slate-700">{item.value}</span>
                      </div>
                    )) : <p className="text-sm font-medium text-slate-500">No browser data yet.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Referrers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Traffic Sources</p>
                <h3 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900">Top referrers</h3>
              </div>
              {analytics.topReferrers.length ? (
                <div className="grid gap-2">
                  {analytics.topReferrers.slice(0, 6).map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5">
                      <span className="truncate text-sm font-semibold text-slate-800">{item.label}</span>
                      <span className="text-sm font-bold text-slate-700">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500">No referrer data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Best Performing URL */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Performing URL</p>
          {topUrl ? (
            <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-600">
              <p className="break-all"><span className="font-bold text-slate-400">Original:</span> {topUrl.originalUrl}</p>
              <p className="break-all"><span className="font-bold text-slate-400">Short URL:</span> <a href={topUrl.shortUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{topUrl.shortUrl}</a></p>
              <p><span className="font-bold text-slate-400">Unique clicks:</span> {topUrl.uniqueClicks || 0}</p>
              <p><span className="font-bold text-slate-400">Created:</span> {formatDate(topUrl.createdAt)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-slate-500">No URLs created yet.</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default AnalyticsPage
