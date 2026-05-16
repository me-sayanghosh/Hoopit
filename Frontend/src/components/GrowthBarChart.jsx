import { useRef, useState, useEffect } from 'react'

function formatNumber(v) {
  try {
    return new Intl.NumberFormat('en-US').format(v)
  } catch (e) {
    return String(v)
  }
}

function chunkArray(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export default function GrowthBarChart({ series = [], width = 760, height = 220 }) {
  const [mode, setMode] = useState('week')
  const ref = useRef(null)
  const [hover, setHover] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState({ left: 0, top: 0, visible: false })

  const padding = { left: 28, right: 28, top: 20, bottom: 32 }
  const usableWidth = width - padding.left - padding.right
  const usableHeight = height - padding.top - padding.bottom

  // prepare display series based on mode
  let display = series || []
  if (mode === 'week' && series.length > 1) {
    const chunks = chunkArray(series, 7)
    display = chunks.map((chunk, i) => ({
      id: chunk[0].id + '-w' + i,
      label: chunk.length > 1 ? `${chunk[0].label} - ${chunk[chunk.length - 1].label}` : chunk[0].label,
      value: chunk.reduce((s, it) => s + (it.value || it.v || it.y || 0), 0),
    }))
  }

  const max = Math.max(...display.map((s) => s.value), 1)

  useEffect(() => {
    if (!hover) setTooltipStyle((t) => ({ ...t, visible: false }))
  }, [hover])

  const onEnter = (idx, evt) => {
    setHover(idx)
    const bbox = ref.current.getBoundingClientRect()
    const step = usableWidth / Math.max(display.length, 1)
    const x = padding.left + step * idx + step / 2
    const left = Math.max(8, bbox.left + x - 48)
    const top = bbox.top + padding.top + usableHeight - (display[idx].value / max) * usableHeight - 48
    setTooltipStyle({ left, top, visible: true })
  }

  const step = usableWidth / Math.max(display.length, 1)
  const barW = Math.max(12, Math.min(48, step * 0.7))

  return (
    <div className="relative" ref={ref} style={{ width: '100%', maxWidth: width }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold text-slate-700">Activity</div>
        <div className="inline-flex gap-2 rounded-md bg-white p-1 shadow-sm">
          <button onClick={() => setMode('day')} className={`px-2 py-1 text-xs ${mode === 'day' ? 'bg-slate-900 text-white rounded' : 'text-slate-600'}`}>Day</button>
          <button onClick={() => setMode('week')} className={`px-2 py-1 text-xs ${mode === 'week' ? 'bg-slate-900 text-white rounded' : 'text-slate-600'}`}>Week</button>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {[0.25, 0.5, 0.75, 1].map((r) => {
          const y = padding.top + usableHeight * (1 - r)
          return <line key={r} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e6eef8" strokeDasharray="4 6" />
        })}

        {display.map((item, idx) => {
          const x = padding.left + step * idx + step / 2
          const h = (item.value / max) * usableHeight
          const y = padding.top + usableHeight - h

          return (
            <g key={item.id} transform={`translate(${x - barW / 2},0)`}> 
              <rect
                x={0}
                y={y}
                width={barW}
                height={h}
                rx={6}
                fill={idx % 2 === 0 ? '#2563eb' : '#60a5fa'}
                onMouseEnter={(e) => onEnter(idx, e)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              />
              <text x={barW / 2} y={height - 8} textAnchor="middle" className="text-[11px] fill-slate-500">
                {item.label}
              </text>
            </g>
          )
        })}
      </svg>

      {tooltipStyle.visible && hover != null ? (
        <div style={{ position: 'fixed', left: tooltipStyle.left, top: tooltipStyle.top, zIndex: 60 }}>
          <div className="rounded-md bg-[#0f172a] px-3 py-2 text-sm text-white shadow-lg">
            <div className="text-xs text-slate-200">{display[hover].label}</div>
            <div className="font-semibold">{formatNumber(display[hover].value)}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
