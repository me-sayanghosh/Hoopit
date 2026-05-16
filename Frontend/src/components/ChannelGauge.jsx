export default function ChannelGauge({ data = [] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1
  const primary = data[0]
  const primaryPct = total ? Math.round(((primary?.value || 0) / total) * 100) : 0
  const colors = ['#7c3aed', '#60a5fa', '#fca5a5', '#c7f9f1']

  const segments = data.map((d, i) => ({
    ...d,
    color: colors[i % colors.length],
    pct: total ? (d.value / total) : 0,
  }))

  // semicircle radius
  const size = 220
  const r = 90
  const cx = size / 2
  const cy = size / 2 + 10

  let start = -180
  const arcs = segments.map((s) => {
    const angle = s.pct * 180
    const seg = { start, end: start + angle, color: s.color }
    start += angle
    return seg
  })

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Channel</p>
          <p className="text-xs text-slate-500">User from all channels</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div style={{ width: 220 }}>
          <svg viewBox={`0 0 ${size} ${size / 1.4}`} className="w-full">
            {arcs.map((a, i) => {
              const startRad = (a.start * Math.PI) / 180
              const endRad = (a.end * Math.PI) / 180
              const x1 = cx + r * Math.cos(startRad)
              const y1 = cy + r * Math.sin(startRad)
              const x2 = cx + r * Math.cos(endRad)
              const y2 = cy + r * Math.sin(endRad)
              const large = a.end - a.start > 180 ? 1 : 0
              const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
              return <path key={i} d={d} stroke={a.color} strokeWidth={28} fill="none" strokeLinecap="round" />
            })}
          </svg>
        </div>

        <div>
          <div className="text-5xl font-bold text-slate-900">{primaryPct}%</div>
          <div className="text-sm text-slate-500">Use this channel</div>
          <div className="mt-4 grid gap-2">
            {segments.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3">
                <div style={{ width: 12, height: 12, background: s.color, borderRadius: 4 }} />
                <div className="text-sm text-slate-700 flex-1">{s.label}</div>
                <div className="text-sm font-semibold text-slate-700">{s.pct ? Math.round(s.pct * 100) + '%' : '0%'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
