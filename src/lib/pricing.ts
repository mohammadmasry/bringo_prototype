export interface PriceBreakdown {
  base: number
  distanceSurcharge: number
  peakSurcharge: number
  total: number
  estimatedKm: number
  isPeak: boolean
}

const BASE_PRICES: Record<'S' | 'M' | 'L', number> = { S: 2.50, M: 3.50, L: 4.50 }

// Approximate GPS coords for preset Pfarrkirchen addresses
const COORDS: Record<string, [number, number]> = {
  'CAMPUS Pfarrkirchen, Petersbogen 1':    [48.4247, 12.9398],
  'Bahnhof Pfarrkirchen, Bahnhofstr. 1':   [48.4320, 12.9307],
  'Edeka, Griesbacher Str. 3':             [48.4298, 12.9345],
  'Stadtplatz 1, 84347 Pfarrkirchen':      [48.4307, 12.9378],
  'Stadtplatz 12, 84347 Pfarrkirchen':     [48.4307, 12.9380],
  'Ludwigstraße 8, 84347 Pfarrkirchen':    [48.4315, 12.9365],
  'Ringstraße 44, 84347 Pfarrkirchen':     [48.4290, 12.9340],
  'Kirchgasse 5, 84347 Pfarrkirchen':      [48.4312, 12.9371],
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// For custom addresses not in the lookup: derive a consistent pseudo-distance from the string
function pseudoKm(a: string, b: string): number {
  const str = a + b
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffff
  return 0.5 + (hash % 35) / 10 // 0.5–4.0 km
}

export function estimateKm(pickup: string, dropoff: string): number {
  const c1 = COORDS[pickup]
  const c2 = COORDS[dropoff]
  if (c1 && c2) return haversineKm(c1[0], c1[1], c2[0], c2[1])
  return pseudoKm(pickup, dropoff)
}

function distanceSurcharge(km: number): number {
  if (km < 1) return 0
  if (km < 2) return 0.50
  if (km < 3) return 1.00
  if (km < 5) return 1.50
  return 2.00
}

// Peak: 12:00-14:00 and 17:00-20:00
function isPeakHour(hour: number): boolean {
  return (hour >= 12 && hour < 14) || (hour >= 17 && hour < 20)
}

export function calculatePrice(
  pickup: string,
  dropoff: string,
  size: 'S' | 'M' | 'L',
  scheduleType: 'now' | 'later',
  scheduleTime: string,
): PriceBreakdown {
  const km = estimateKm(pickup, dropoff)
  const base = BASE_PRICES[size]
  const distSurcharge = distanceSurcharge(km)

  const hour = scheduleType === 'later' && scheduleTime
    ? parseInt(scheduleTime.split(':')[0], 10)
    : new Date().getHours()

  const peak = isPeakHour(hour)
  const peakSurcharge = peak ? 0.50 : 0

  return {
    base,
    distanceSurcharge: distSurcharge,
    peakSurcharge,
    total: Math.round((base + distSurcharge + peakSurcharge) * 100) / 100,
    estimatedKm: Math.round(km * 10) / 10,
    isPeak: peak,
  }
}
