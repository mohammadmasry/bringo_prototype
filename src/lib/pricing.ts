export interface PriceBreakdown {
  base: number
  distanceSurcharge: number
  peakSurcharge: number
  storesSurcharge: number
  itemsSurcharge: number
  expressSurcharge: number
  total: number
  estimatedKm: number
  isPeak: boolean
  isExpress: boolean
}

export const EXPRESS_SURCHARGE = 10.00

export type ItemRange = '1-5' | '6-15' | '16+'

export interface TimeSlot {
  id: string
  start: number       // 24h hour
  end: number
  label: string       // "14:00 – 16:00"
  priceMod: number    // fraction: -0.10 = −10%, +0.15 = +15%
  tag: 'discount' | 'surcharge' | 'normal'
  tagLabel: string    // "−10 %", "+15 %", ""
}

const BASE_SLOTS: TimeSlot[] = [
  { id: 's0810', start: 8,  end: 10, label: '08:00 – 10:00', priceMod: 0,     tag: 'normal',    tagLabel: '' },
  { id: 's1012', start: 10, end: 12, label: '10:00 – 12:00', priceMod: 0,     tag: 'normal',    tagLabel: '' },
  { id: 's1214', start: 12, end: 14, label: '12:00 – 14:00', priceMod: 0,     tag: 'normal',    tagLabel: '' },
  { id: 's1416', start: 14, end: 16, label: '14:00 – 16:00', priceMod: -0.10, tag: 'discount',  tagLabel: '−10 %' },
  { id: 's1618', start: 16, end: 18, label: '16:00 – 18:00', priceMod: -0.05, tag: 'discount',  tagLabel: '−5 %' },
  { id: 's1820', start: 18, end: 20, label: '18:00 – 20:00', priceMod: 0,     tag: 'normal',    tagLabel: '' },
  { id: 's2022', start: 20, end: 22, label: '20:00 – 22:00', priceMod: 0.15,  tag: 'surcharge', tagLabel: '+15 %' },
]

export function getTimeSlots(dateIso: string): TimeSlot[] {
  const todayIso = new Date().toISOString().split('T')[0]
  if (dateIso === todayIso) {
    const nowHour = new Date().getHours()
    return BASE_SLOTS.filter(s => s.start > nowHour)
  }
  return BASE_SLOTS
}

export function getSlotById(id: string): TimeSlot | undefined {
  return BASE_SLOTS.find(s => s.id === id)
}

const BASE_PRICES: Record<'S' | 'M' | 'L', number> = { S: 5.00, M: 6.00, L: 7.50 }

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

function isPeakHour(hour: number): boolean {
  return (hour >= 12 && hour < 14) || (hour >= 17 && hour < 20)
}

const STORES_SURCHARGE: Record<1 | 2 | 3, number> = { 1: 0, 2: 2.00, 3: 4.00 }
const ITEMS_SURCHARGE: Record<ItemRange, number> = { '1-5': 0, '6-15': 1.00, '16+': 2.50 }

export function calculatePrice(
  pickup: string,
  dropoff: string,
  size: 'S' | 'M' | 'L',
  scheduleType: 'now' | 'later' | 'express',
  scheduleTime: string,
  stores: 1 | 2 | 3 = 1,
  itemRange: ItemRange = '1-5',
  slotPriceMod: number | null = null,
): PriceBreakdown {
  const km = estimateKm(pickup, dropoff)
  const base = BASE_PRICES[size]
  const distSurcharge = distanceSurcharge(km)
  const storesSurcharge = STORES_SURCHARGE[stores]
  const itemsSurcharge = ITEMS_SURCHARGE[itemRange]
  const isExpress = scheduleType === 'express'
  const expressSurcharge = isExpress ? EXPRESS_SURCHARGE : 0

  let peakSurcharge: number
  let isPeak: boolean

  if (isExpress) {
    peakSurcharge = 0
    isPeak = false
  } else if (slotPriceMod !== null) {
    peakSurcharge = Math.round(base * slotPriceMod * 100) / 100
    isPeak = slotPriceMod > 0
  } else {
    const hour = scheduleType === 'later' && scheduleTime
      ? parseInt(scheduleTime.split(':')[0], 10)
      : new Date().getHours()
    isPeak = isPeakHour(hour)
    peakSurcharge = isPeak ? 0.50 : 0
  }

  return {
    base,
    distanceSurcharge: distSurcharge,
    storesSurcharge,
    itemsSurcharge,
    peakSurcharge,
    expressSurcharge,
    total: Math.round((base + distSurcharge + storesSurcharge + itemsSurcharge + peakSurcharge + expressSurcharge) * 100) / 100,
    estimatedKm: Math.round(km * 10) / 10,
    isPeak,
    isExpress,
  }
}
