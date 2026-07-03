import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface Coords { lat: number; lon: number }

interface RouteInfo { km: number; etaMin: number }

interface Props {
  pickupCoords: Coords | null
  dropoffCoords: Coords | null
  activePin: 'pickup' | 'dropoff'
  onMapClick: (lat: number, lon: number, address: string, hasHouseNum: boolean, postcode?: string) => void
  pickupAddress?: string
  dropoffAddress?: string
  lang: 'de' | 'en'
}

function pinIcon(color: string, letter: string) {
  return L.divIcon({
    className: '',
    html: `
      <div class="map-pin" style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 10px rgba(0,0,0,0.22))">
        <div style="
          width:34px;height:34px;border-radius:50% 50% 50% 0;
          background:${color};border:3px solid white;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
        ">
          <span style="transform:rotate(45deg);font-size:13px;font-weight:900;color:white;line-height:1">${letter}</span>
        </div>
        <div style="width:5px;height:5px;border-radius:50%;background:${color};margin-top:-2px;opacity:0.5"></div>
      </div>
    `,
    iconSize: [34, 44],
    iconAnchor: [17, 44],
  })
}

function haversineKm(a: Coords, b: Coords) {
  const R = 6371
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLon = (b.lon - a.lon) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(x))
}

export default function DeliveryMap({
  pickupCoords, dropoffCoords, activePin, onMapClick,
  pickupAddress, dropoffAddress, lang,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const dropoffMarkerRef = useRef<L.Marker | null>(null)
  const routeLayerRef = useRef<L.Polyline | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const onMapClickRef = useRef(onMapClick)
  useEffect(() => { onMapClickRef.current = onMapClick }, [onMapClick])

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [48.4358, 12.9445],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://carto.com">CARTO</a> · © <a href="https://openstreetmap.org">OSM</a>')
      .addTo(map)

    map.on('click', async (e) => {
      const { lat, lng } = e.latlng
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': lang } }
        )
        const d = await res.json()
        const houseNum = d.address?.house_number
        const road = d.address?.road
        const parts = [road, houseNum, d.address?.city ?? d.address?.town ?? d.address?.village]
          .filter(Boolean)
        const addr = parts.length ? parts.join(' ') : d.display_name?.split(',').slice(0, 2).join(',') ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        onMapClickRef.current(lat, lng, addr, !!houseNum, d.address?.postcode)
      } catch {
        onMapClick(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, false)
      }
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Pickup marker
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    pickupMarkerRef.current?.remove()
    pickupMarkerRef.current = null
    if (!pickupCoords) return
    const m = L.marker([pickupCoords.lat, pickupCoords.lon], { icon: pinIcon('#16a34a', 'A') }).addTo(map)
    pickupMarkerRef.current = m
    if (activePin === 'pickup' && !dropoffCoords) {
      map.flyTo([pickupCoords.lat, pickupCoords.lon], 15, { duration: 0.7 })
    }
  }, [pickupCoords])

  // Dropoff marker
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    dropoffMarkerRef.current?.remove()
    dropoffMarkerRef.current = null
    if (!dropoffCoords) return
    const m = L.marker([dropoffCoords.lat, dropoffCoords.lon], { icon: pinIcon('#1d4ed8', 'B') }).addTo(map)
    dropoffMarkerRef.current = m
  }, [dropoffCoords])

  // Route
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    routeLayerRef.current?.remove()
    routeLayerRef.current = null
    setRouteInfo(null)

    if (!pickupCoords || !dropoffCoords) return

    const bounds = L.latLngBounds(
      [pickupCoords.lat, pickupCoords.lon],
      [dropoffCoords.lat, dropoffCoords.lon]
    )
    map.fitBounds(bounds, { padding: [72, 72], maxZoom: 16, animate: true, duration: 0.8 })

    const fallbackKm = haversineKm(pickupCoords, dropoffCoords)
    setRouteInfo({ km: fallbackKm, etaMin: Math.round((fallbackKm / 15) * 60) })

    // Dashed fallback line
    const dash = L.polyline(
      [[pickupCoords.lat, pickupCoords.lon], [dropoffCoords.lat, dropoffCoords.lon]],
      { color: '#16a34a', weight: 3, dashArray: '6 5', opacity: 0.6 }
    ).addTo(map)
    routeLayerRef.current = dash

    // Real OSRM route
    const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropoffCoords.lon},${dropoffCoords.lat}?overview=full&geometries=geojson`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!mapRef.current || !data.routes?.[0]) return
        dash.remove()

        const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
          ([lon, lat]: [number, number]) => [lat, lon]
        )
        const realKm = data.routes[0].distance / 1000
        const realEta = Math.round(data.routes[0].duration / 60)
        setRouteInfo({ km: realKm, etaMin: realEta })

        const line = L.polyline(coords, {
          color: '#16a34a',
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round',
        }).addTo(mapRef.current)

        routeLayerRef.current = line

        // Animate stroke-dashoffset
        setTimeout(() => {
          const el = line.getElement() as SVGPathElement | null
          if (el) {
            const len = el.getTotalLength()
            el.style.strokeDasharray = `${len}`
            el.style.strokeDashoffset = `${len}`
            el.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)'
            requestAnimationFrame(() => requestAnimationFrame(() => {
              el.style.strokeDashoffset = '0'
            }))
          }
        }, 60)
      })
      .catch(() => {})
  }, [pickupCoords, dropoffCoords])

  const t = {
    de: { km: 'km', min: 'Min', hint: 'Auf Karte tippen zum Festlegen', route: 'Route', from: 'Von', to: 'Nach', courier: 'Kurier~' },
    en: { km: 'km', min: 'min', hint: 'Tap map to drop pin', route: 'Route', from: 'From', to: 'To', courier: 'Courier~' },
  }[lang]

  return (
    <div className="flex flex-col h-full">
      <div ref={containerRef} className="flex-1 relative" style={{ minHeight: 240 }}>
        {/* Hint overlay */}
        {!pickupCoords && !dropoffCoords && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-2 shadow-sm border border-gray-100 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="text-xs font-semibold text-gray-500">{t.hint}</span>
            </div>
          </div>
        )}
      </div>

      {/* Route info card — appears when both pins are set */}
      {pickupCoords && dropoffCoords && routeInfo && (
        <div
          className="animate-fade-in-up bg-white border-t border-gray-100 px-5 py-4 shrink-0"
          style={{ boxShadow: '0 -6px 24px rgba(0,0,0,0.06)' }}
        >
          {/* A → B row */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">
                {pickupAddress?.split(',')[0] ?? t.from}
              </span>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <div className="w-6 h-px bg-gray-200" />
              <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end">
              <span className="text-xs font-medium text-gray-600 truncate">
                {dropoffAddress?.split(',')[0] ?? t.to}
              </span>
              <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">~{routeInfo.km.toFixed(1)} {t.km}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">~{routeInfo.etaMin} {t.min}</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">{t.courier}</span>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
