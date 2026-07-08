export const DELIVERY_ZONES = [
  { name: 'Pfarrkirchen',              zips: ['84347'],          days: [0,1,2,3,4,5,6] },
  { name: 'Bad Birnbach',              zips: ['84364'],          days: [1,3,6] },
  { name: 'Eggenfelden / Postmünster', zips: ['84307','84389'], days: [2,4,0] },
]

const CITY_ZONE_KEYWORDS: { words: string[]; zip: string }[] = [
  { words: ['bad birnbach', 'birnbach'],            zip: '84364' },
  { words: ['eggenfelden'],                         zip: '84307' },
  { words: ['postmünster', 'postmuenster'],         zip: '84389' },
  { words: ['pfarrkirchen'],                        zip: '84347' },
]

export function detectPostcode(address: string): string | null {
  const lower = address.toLowerCase()
  const explicit = address.match(/\b(\d{5})\b/)
  if (explicit) return explicit[1]
  return CITY_ZONE_KEYWORDS.find(e => e.words.some(w => lower.includes(w)))?.zip ?? null
}

export function getAllowedDays(postcode: string | null): number[] | null {
  if (!postcode) return null
  return DELIVERY_ZONES.find(z => z.zips.includes(postcode))?.days ?? null
}

export function getZoneName(postcode: string | null): string | null {
  if (!postcode) return null
  return DELIVERY_ZONES.find(z => z.zips.includes(postcode))?.name ?? null
}
