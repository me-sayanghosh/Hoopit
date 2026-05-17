import { useEffect, useMemo } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const deviceColors = {
  Desktop: '#2563eb',
  Mobile: '#0f766e',
  Tablet: '#f59e0b',
  Other: '#7c3aed',
}

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) {
      return
    }

    const bounds = latLngBounds(points.map((point) => [point.latitude, point.longitude]))
    map.fitBounds(bounds.pad(0.2), { animate: false })
  }, [map, points])

  return null
}

export default function GeoMapView({ points = [] }) {
  const validPoints = useMemo(() => points.filter((point) => typeof point.latitude === 'number' && typeof point.longitude === 'number'), [points])
  const center = validPoints.length
    ? [validPoints[0].latitude, validPoints[0].longitude]
    : [20, 0]

  const maxClicksAtLocation = Math.max(...validPoints.map((point) => point.clicks || 1), 1)

  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Live click map</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Exact click locations</h3>
        </div>
        <p className="text-sm text-slate-500">
          {validPoints.length ? `${validPoints.length} recorded click locations` : 'No coordinates available yet'}
        </p>
      </div>

      {validPoints.length ? (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <MapContainer
              center={center}
              zoom={2}
              scrollWheelZoom
              className="h-[420px] w-full"
              worldCopyJump
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={validPoints} />
              {validPoints.map((point, index) => {
                const weight = (point.clicks || 1) / maxClicksAtLocation
                const radius = 5 + weight * 11
                const color = deviceColors[point.device] || '#38bdf8'

                return (
                  <CircleMarker
                    key={`${point.latitude}-${point.longitude}-${index}`}
                    center={[point.latitude, point.longitude]}
                    radius={radius}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.45,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="grid gap-1 text-sm">
                        <div className="font-semibold text-slate-900">{point.city || 'Unknown city'}</div>
                        <div className="text-slate-600">{point.region || 'Unknown region'}, {point.country || 'Unknown country'}</div>
                        <div className="text-slate-600">{point.device || 'Unknown device'}</div>
                        <div className="text-slate-500">{new Date(point.clickedAt).toLocaleString()}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>

          <div className="grid gap-3">
            {validPoints.slice(0, 8).map((point, index) => (
              <div key={`${point.latitude}-${point.longitude}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {point.city || 'Unknown city'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {point.device || 'Device'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {point.region || 'Unknown region'}, {point.country || 'Unknown country'}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {point.latitude.toFixed(3)}, {point.longitude.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          No coordinate data is available yet for the map.
        </div>
      )}
    </div>
  )
}