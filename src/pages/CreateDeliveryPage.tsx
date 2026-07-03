import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import ComingSoonSheet from '../components/ComingSoonSheet'
import { calculatePrice, getTimeSlots, getSlotById, type ItemRange, type TimeSlot } from '../lib/pricing'
import DeliveryMap, { type Coords } from '../components/DeliveryMap'

const PICKUP_PRESETS = [
  { label: 'CAMPUS Pfarrkirchen, Petersbogen 1', lat: 48.4352, lon: 12.9512 },
  { label: 'Bahnhof Pfarrkirchen, Bahnhofstr. 1', lat: 48.4381, lon: 12.9438 },
  { label: 'Edeka, Griesbacher Str. 3', lat: 48.4393, lon: 12.9519 },
  { label: 'Stadtplatz 1, 84347 Pfarrkirchen', lat: 48.4369, lon: 12.9480 },
]

const DROPOFF_PRESETS = [
  { label: 'Stadtplatz 12, 84347 Pfarrkirchen', lat: 48.4371, lon: 12.9487, postcode: '84347' },
  { label: 'Ludwigstraße 8, 84347 Pfarrkirchen', lat: 48.4358, lon: 12.9466, postcode: '84347' },
  { label: 'Ringstraße 44, 84347 Pfarrkirchen', lat: 48.4336, lon: 12.9503, postcode: '84347' },
  { label: 'Kirchgasse 5, 84347 Pfarrkirchen', lat: 48.4364, lon: 12.9473, postcode: '84347' },
]

// 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
const DELIVERY_ZONES = [
  { name: 'Pfarrkirchen',             zips: ['84347'],          days: [0,1,2,3,4,5,6] },
  { name: 'Bad Birnbach',             zips: ['84364'],          days: [1,3,6] },
  { name: 'Eggenfelden / Postmünster', zips: ['84307','84389'], days: [2,4,0] },
]

const CITY_ZONE_KEYWORDS: { words: string[]; zip: string }[] = [
  { words: ['bad birnbach', 'birnbach'],              zip: '84364' },
  { words: ['eggenfelden'],                           zip: '84307' },
  { words: ['postmünster', 'postmuenster'],           zip: '84389' },
  { words: ['pfarrkirchen'],                          zip: '84347' },
]

function detectPostcode(address: string): string | null {
  const lower = address.toLowerCase()
  const explicit = address.match(/\b(\d{5})\b/)
  if (explicit) return explicit[1]
  return CITY_ZONE_KEYWORDS.find(e => e.words.some(w => lower.includes(w)))?.zip ?? null
}

function getAllowedDays(postcode: string | null): number[] | null {
  if (!postcode) return null
  return DELIVERY_ZONES.find(z => z.zips.includes(postcode))?.days ?? null
}

function getZoneName(postcode: string | null): string | null {
  if (!postcode) return null
  return DELIVERY_ZONES.find(z => z.zips.includes(postcode))?.name ?? null
}


const tr = {
  de: {
    // step 0
    typeTitle: 'Was möchten Sie?', typeSub: 'Wählen Sie die Art Ihres Auftrags.',
    shoppingTitle: 'Einkaufen & Liefern', shoppingDesc: 'Kurier kauft für Sie ein und liefert es zu Ihnen',
    deliveryTitle: 'Nur Liefern', deliveryDesc: 'Kurier holt Ihr Paket ab und bringt es ans Ziel',
    shoppingFrom: 'ab €5.00', deliveryFrom: 'ab €5.00',
    // steps 1–2 (address labels adapt per type)
    s1TitleShopping: 'Laden / Abholort', s1SubShopping: 'Bei welchem Geschäft soll eingekauft werden?',
    s1TitleDelivery: 'Abholung', s1SubDelivery: 'Wo soll Ihr Paket abgeholt werden?',
    s2Title: 'Zielort', s2Sub: 'Wohin soll geliefert werden?',
    // step 3 shopping
    s3TitleShopping: 'Einkaufsauftrag', s3SubShopping: 'Was und wo soll für Sie eingekauft werden?',
    shoppingListLabel: 'Einkaufszettel', shoppingListPh: 'z.B. Milch 1L, Brot (Vollkorn), 6 Eier…',
    storesLabel: 'Anzahl der Läden', store1: 'Laden', store2: 'Läden', store3: 'Läden',
    itemsLabel: 'Anzahl der Artikel', itemsFew: 'wenige', itemsMed: 'mittel', itemsMany: 'viele',
    // step 3 delivery
    s3TitleDelivery: 'Was wird geliefert?', s3SubDelivery: 'Beschreiben Sie Ihr Paket für den Kurier.',
    itemDescLabel: 'Was liefern wir?', itemDescPh: 'z.B. "Laptop in Tasche", "Dokumente"',
    fragilLabel: 'Zerbrechlich?', fragilYes: 'Ja, vorsichtig', fragilNo: 'Nein',
    sizeLabel: 'Paketgröße',
    sSmallTitle: 'Klein', sSmallSub: 'Umschlag, Dokumente',
    sMediumTitle: 'Mittel', sMediumSub: 'Bücher, Tragetasche',
    sLargeTitle: 'Groß', sLargeSub: 'Karton, mehrere Teile',
    // step 4
    s4Title: 'Wann?', s4Sub: 'Soll die Lieferung jetzt oder später erfolgen?',
    // step 5
    s5Title: 'Bestellung prüfen', s5Sub: 'Alles korrekt?',
    orderTypeBadgeShopping: 'Einkauf', orderTypeBadgeDelivery: 'Lieferung',
    pickupLabel: 'Abholadresse', dropoffLabel: 'Lieferadresse',
    orChoose: 'oder schnell wählen:',
    searchPh: 'Adresse eingeben…',
    noteLabel: 'Nachricht an den Kurier', notePh: 'z.B. "3. OG, Klingel Schmidt"',
    optional: 'optional',
    houseNumLabel: 'Hausnummer', houseNumPh: 'z.B. 12a',
    stepOf: (n: number) => `Schritt ${n} von 5`,
    continue: 'Weiter', back: 'Zurück',
    pickup: 'Abholung', dropoff: 'Zielort',
    smallLabel: 'Klein', mediumLabel: 'Mittel', largeLabel: 'Groß',
    nowTitle: 'Jetzt', nowSub: 'Kurier wird sofort gesucht',
    laterTitle: 'Später', laterSub: 'Lieferung für später einplanen',
    dateLabel: 'Datum', timeLabel: 'Uhrzeit',
    when: 'Wann', asap: 'Sofort', express: 'Express',
    expressLabel: 'Express', expressSub: '~30 Min.', expressNote: '+€10,00 Expressaufschlag',
    slotToday: 'Heute', slotTomorrow: 'Morgen',
    slotSelect: 'Zeitfenster wählen',
    slotNoSlots: 'Heute keine Slots mehr verfügbar — bitte Morgen wählen.',
    priceBase: 'Grundpreis', priceDist: 'Entfernung', pricePeak: 'Stoßzeit', priceDiscount: 'Rabatt',
    priceExpress: 'Expressaufschlag', priceTotal: 'Gesamt',
    priceStores: 'Läden', priceItems: 'Artikel',
  },
  en: {
    // step 0
    typeTitle: 'What would you like?', typeSub: 'Choose the type of order.',
    shoppingTitle: 'Shopping + Delivery', shoppingDesc: 'Courier shops for you and delivers to your door',
    deliveryTitle: 'Delivery only', deliveryDesc: 'Courier picks up your package and delivers it',
    shoppingFrom: 'from €5.00', deliveryFrom: 'from €5.00',
    // steps 1–2
    s1TitleShopping: 'Store / Pickup', s1SubShopping: 'Which store should the courier go to?',
    s1TitleDelivery: 'Pickup', s1SubDelivery: 'Where should your item be picked up from?',
    s2Title: 'Dropoff', s2Sub: 'Where should it be delivered?',
    // step 3 shopping
    s3TitleShopping: 'Shopping order', s3SubShopping: 'What should be bought and where?',
    shoppingListLabel: 'Shopping list', shoppingListPh: 'e.g. Milk 1L, Bread, 6 Eggs…',
    storesLabel: 'Number of stores', store1: 'store', store2: 'stores', store3: 'stores',
    itemsLabel: 'Number of items', itemsFew: 'few', itemsMed: 'moderate', itemsMany: 'many',
    // step 3 delivery
    s3TitleDelivery: 'What are we delivering?', s3SubDelivery: 'Describe your package for the courier.',
    itemDescLabel: 'What are we delivering?', itemDescPh: 'e.g. "Laptop in a bag", "Documents"',
    fragilLabel: 'Fragile?', fragilYes: 'Yes, handle with care', fragilNo: 'No',
    sizeLabel: 'Package size',
    sSmallTitle: 'Small', sSmallSub: 'Envelope, documents',
    sMediumTitle: 'Medium', sMediumSub: 'Books, bag',
    sLargeTitle: 'Large', sLargeSub: 'Box, multiple items',
    // step 4
    s4Title: 'When?', s4Sub: 'Should delivery happen now or later?',
    // step 5
    s5Title: 'Review order', s5Sub: 'Everything look right?',
    orderTypeBadgeShopping: 'Shopping', orderTypeBadgeDelivery: 'Delivery',
    pickupLabel: 'Pickup address', dropoffLabel: 'Delivery address',
    orChoose: 'or choose quickly:',
    searchPh: 'Enter address…',
    noteLabel: 'Message for courier', notePh: 'e.g. "3rd floor, ring Schmidt"',
    optional: 'optional',
    houseNumLabel: 'House number', houseNumPh: 'e.g. 12a',
    stepOf: (n: number) => `Step ${n} of 5`,
    continue: 'Continue', back: 'Back',
    pickup: 'Pickup', dropoff: 'Dropoff',
    smallLabel: 'Small', mediumLabel: 'Medium', largeLabel: 'Large',
    nowTitle: 'Now', nowSub: 'Courier found immediately',
    laterTitle: 'Later', laterSub: 'Schedule delivery for later',
    dateLabel: 'Date', timeLabel: 'Time',
    when: 'When', asap: 'ASAP', express: 'Express',
    expressLabel: 'Express', expressSub: '~30 min', expressNote: '+€10.00 express fee',
    slotToday: 'Today', slotTomorrow: 'Tomorrow',
    slotSelect: 'Choose time slot',
    slotNoSlots: 'No more slots available today — please choose Tomorrow.',
    priceBase: 'Base price', priceDist: 'Distance', pricePeak: 'Peak hour', priceDiscount: 'Discount',
    priceExpress: 'Express fee', priceTotal: 'Total',
    priceStores: 'Stores', priceItems: 'Items',
  },
}

const SIZE_COLORS: Record<'S' | 'M' | 'L', { bg: string; text: string }> = {
  S: { bg: '#f0fdf4', text: '#16a34a' },
  M: { bg: '#eff6ff', text: '#2563eb' },
  L: { bg: '#fef3c7', text: '#d97706' },
}

interface NomResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  // Photon feature properties
  _photon?: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    postcode?: string
    country?: string
  }
}

function formatNom(r: NomResult): string {
  const p = r._photon
  if (p) {
    const street = p.street && p.housenumber ? `${p.street} ${p.housenumber}` : (p.street ?? '')
    const namePart = p.name && p.name !== street ? p.name : null
    const parts = [namePart, street || null, p.city, p.postcode].filter(Boolean)
    return parts.length ? parts.join(', ') : r.display_name
  }
  return r.display_name
}

const PHOTON_GENERAL_TYPES = new Set(['city', 'district', 'county', 'state', 'country', 'locality', 'municipality'])

function photonToNomResult(f: { geometry: { coordinates: [number, number] }; properties: Record<string, string> }): NomResult | null {
  const p = f.properties
  if (PHOTON_GENERAL_TYPES.has(p.type)) return null
  const [lon, lat] = f.geometry.coordinates
  const street = p.street && p.housenumber ? `${p.street} ${p.housenumber}` : (p.street ?? p.name ?? '')
  const display = [street, p.city, p.postcode].filter(Boolean).join(', ')
  return {
    place_id: Math.random() * 1e9,
    display_name: display || p.name || '',
    lat: String(lat),
    lon: String(lon),
    _photon: { name: p.name, street: p.street, housenumber: p.housenumber, city: p.city, postcode: p.postcode },
  }
}

// Defined OUTSIDE CreateDeliveryPage to prevent remount-on-every-render focus loss
interface AddressFieldProps {
  id: string
  value: string
  onChange: (v: string) => void
  onFocus: () => void
  onBlur: () => void
  placeholder: string
  label: string
  suggestions: NomResult[]
  onSelect: (label: string, coords: Coords, hasHouseNum?: boolean, postcode?: string) => void
  presets: { label: string; lat: number; lon: number; postcode?: string }[]
  coordsSet: boolean
  orChoose: string
}

function AddressField({
  id, value, onChange, onFocus, onBlur, placeholder, label,
  suggestions, onSelect, presets, coordsSet, orChoose,
}: AddressFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={id}>{label}</label>
      <div className="relative">
        <div className="relative">
          <input
            id={id}
            type="text"
            value={value}
            autoComplete="off"
            onChange={e => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={() => setTimeout(onBlur, 160)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
            style={{ borderColor: value.length > 0 ? (coordsSet ? '#16a34a' : '#f59e0b') : '#e5e7eb' }}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          {coordsSet && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center pointer-events-none">
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-[2000] left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {suggestions.map(r => (
              <button
                key={r.place_id}
                onMouseDown={() => onSelect(formatNom(r), { lat: parseFloat(r.lat), lon: parseFloat(r.lon) }, !!r._photon?.housenumber, r._photon?.postcode)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-green-50 transition-colors flex items-start gap-3 border-b border-gray-50 last:border-0"
              >
                <svg className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-gray-700 leading-tight">{formatNom(r)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3 mb-2">{orChoose}</p>
      <div className="space-y-1.5">
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => onSelect(p.label, { lat: p.lat, lon: p.lon }, true, p.postcode)}
            className="w-full text-left px-3.5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2.5"
            style={{
              borderColor: value === p.label ? '#16a34a' : '#f3f4f6',
              background: value === p.label ? '#f0fdf4' : '#f9fafb',
              color: value === p.label ? '#15803d' : '#374151',
            }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              style={{ color: value === p.label ? '#16a34a' : '#9ca3af' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CreateDeliveryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]

  const state = (location.state as {
    prefill?: { pickup: string; dropoff: string; description: string; size: 'S' | 'M' | 'L' }
    orderType?: 'shopping' | 'delivery'
    fromAI?: boolean
  } | null)
  const prefill = state?.prefill
  const incomingOrderType = state?.orderType ?? null

  const [orderType, setOrderType] = useState<'shopping' | 'delivery' | null>(
    prefill ? 'delivery' : incomingOrderType
  )
  const [itemDesc, setItemDesc] = useState(prefill?.description ?? '')
  const [shoppingList, setShoppingList] = useState('')
  const [isFragile, setIsFragile] = useState(false)
  // Skip step 0 if type was already chosen on the previous screen
  const [step, setStep] = useState(prefill ? 5 : (incomingOrderType ? 1 : 0))
  const [pickup, setPickup] = useState(prefill?.pickup ?? '')
  const [dropoff, setDropoff] = useState(prefill?.dropoff ?? '')
  const [pickupCoords, setPickupCoords] = useState<Coords | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<Coords | null>(null)
  const [size, setSize] = useState<'S' | 'M' | 'L'>(prefill?.size ?? 'M')
  const [stores, setStores] = useState<1 | 2 | 3>(1)
  const [itemRange, setItemRange] = useState<ItemRange>('1-5')
  const [note, setNote] = useState('')
  const [scheduleType, setScheduleType] = useState<'now' | 'later' | 'express'>('later')
  const [calendarDay, setCalendarDay] = useState<string>(() => new Date().toISOString().split('T')[0])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    (state as { slotId?: string } | null)?.slotId ?? null
  )
  const [pickupHouseNum, setPickupHouseNum] = useState('')
  const [dropoffHouseNum, setDropoffHouseNum] = useState('')
  const [pickupHasHouseNum, setPickupHasHouseNum] = useState(false)
  const [dropoffHasHouseNum, setDropoffHasHouseNum] = useState(false)
  const [dropoffPostcode, setDropoffPostcode] = useState<string | null>(null)
  const [pickupSugs, setPickupSugs] = useState<NomResult[]>([])
  const [dropoffSugs, setDropoffSugs] = useState<NomResult[]>([])
  const [pickupFocused, setPickupFocused] = useState(false)
  const [dropoffFocused, setDropoffFocused] = useState(false)
  const pickupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropoffTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (pickupTimer.current) clearTimeout(pickupTimer.current)
    if (pickup.length < 2 || pickupCoords) { setPickupSugs([]); return }
    pickupTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(pickup)}&limit=6&bbox=12.6,48.2,13.2,48.6&lang=${lang}`,
        )
        const data = await r.json()
        setPickupSugs((data.features ?? []).map(photonToNomResult).filter((x: NomResult | null): x is NomResult => x !== null))
      } catch { setPickupSugs([]) }
    }, 300)
  }, [pickup])

  useEffect(() => {
    if (dropoffTimer.current) clearTimeout(dropoffTimer.current)
    if (dropoff.length < 2 || dropoffCoords) { setDropoffSugs([]); return }
    dropoffTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(dropoff)}&limit=6&bbox=12.6,48.2,13.2,48.6&lang=${lang}`,
        )
        const data = await r.json()
        setDropoffSugs((data.features ?? []).map(photonToNomResult).filter((x: NomResult | null): x is NomResult => x !== null))
      } catch { setDropoffSugs([]) }
    }, 300)
  }, [dropoff])

  const selectPickup = (label: string, coords: Coords, hasHouseNum = false) => {
    setPickup(label); setPickupCoords(coords); setPickupSugs([])
    setPickupHasHouseNum(hasHouseNum); setPickupHouseNum('')
  }
  const selectDropoff = (label: string, coords: Coords, hasHouseNum = false, postcode?: string) => {
    setDropoff(label); setDropoffCoords(coords); setDropoffSugs([])
    setDropoffHasHouseNum(hasHouseNum); setDropoffHouseNum('')
    setDropoffPostcode(postcode ?? null)
  }
  const handleMapClick = (lat: number, lon: number, address: string, hasHouseNum: boolean, postcode?: string) => {
    if (step === 1) selectPickup(address, { lat, lon }, hasHouseNum)
    else if (step === 2) selectDropoff(address, { lat, lon }, hasHouseNum, postcode)
  }

  const canContinue =
    step === 0 ? orderType !== null
    : step === 1 ? (pickupCoords ? (pickupHasHouseNum || pickupHouseNum.trim().length > 0) : pickup.trim().length > 2)
    : step === 2 ? (dropoffCoords ? (dropoffHasHouseNum || dropoffHouseNum.trim().length > 0) : dropoff.trim().length > 2)
    : step === 3 ? (orderType === 'shopping' ? shoppingList.trim().length > 2 : true)
    : step === 4 ? scheduleType === 'express' || selectedSlotId !== null
    : step === 5 ? pickup.trim().length > 0 && dropoff.trim().length > 0
    : true

  const goNext = () => { if (step < 5) setStep(s => s + 1); else setStep(6) }
  const goBack = () => {
    if (state?.fromAI && step === 1) { navigate('/easy-order'); return }
    if (step > 0) setStep(s => s - 1); else navigate('/')
  }

  if (step === 6) {
    return <ComingSoonSheet onBack={() => setStep(5)} showFeedback feedbackPage="create-delivery" />
  }

  const stepBar = (
    <div className="flex gap-1.5 mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5}>
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{ background: i < step ? '#16a34a' : '#e5e7eb' }} />
      ))}
    </div>
  )

  const continueBtn = (
    <div className="mt-auto pt-6">
      <button
        onClick={goNext}
        disabled={!canContinue}
        className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
        style={{
          background: canContinue ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#f3f4f6',
          color: canContinue ? 'white' : '#9ca3af',
          boxShadow: canContinue ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
        }}
      >
        {t.continue}
        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )

  const navbar = (
    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 bg-white z-10 shrink-0">
      <button onClick={goBack} aria-label={t.back}
        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
        <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <div className="flex-1" />
      <BringoLogo />
      <div className="flex-1" />
      <LangToggle />
    </div>
  )

  // Step 0 — order type selection
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {navbar}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-md animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2 text-center">{t.typeSub}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-8 text-center">{t.typeTitle}</h1>

            <div className="space-y-3">
              {([
                {
                  type: 'shopping' as const,
                  emoji: '🛒',
                  title: t.shoppingTitle,
                  desc: t.shoppingDesc,
                  from: t.shoppingFrom,
                  color: '#15803d',
                  bg: '#f0fdf4',
                  border: '#bbf7d0',
                },
                {
                  type: 'delivery' as const,
                  emoji: '📦',
                  title: t.deliveryTitle,
                  desc: t.deliveryDesc,
                  from: t.deliveryFrom,
                  color: '#2563eb',
                  bg: '#eff6ff',
                  border: '#bfdbfe',
                },
              ]).map(opt => {
                const selected = orderType === opt.type
                return (
                  <button
                    key={opt.type}
                    onClick={() => { setOrderType(opt.type); setTimeout(goNext, 160) }}
                    className="w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4"
                    style={{
                      borderColor: selected ? opt.color : '#e5e7eb',
                      background: selected ? opt.bg : 'white',
                      boxShadow: selected ? `0 0 0 3px ${opt.border}` : 'none',
                    }}
                  >
                    <span className="text-3xl shrink-0 mt-0.5">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-base mb-0.5">{opt.title}</p>
                      <p className="text-sm text-gray-400 leading-snug">{opt.desc}</p>
                    </div>
                    <span className="text-xs font-semibold shrink-0 mt-1" style={{ color: opt.color }}>{opt.from}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Steps 1 & 2 — split layout with map
  if (step === 1 || step === 2) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {navbar}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: 0 }}>
          <div className="lg:w-[420px] lg:shrink-0 flex flex-col px-5 pt-6 pb-5 overflow-y-auto lg:border-r lg:border-gray-100">
            {stepBar}
            <div className="animate-fade-in-up flex-1 flex flex-col">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(step)}</p>
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                {step === 1
                  ? (orderType === 'shopping' ? t.s1TitleShopping : t.s1TitleDelivery)
                  : t.s2Title}
              </h1>
              <p className="text-gray-400 text-sm mb-5">
                {step === 1
                  ? (orderType === 'shopping' ? t.s1SubShopping : t.s1SubDelivery)
                  : t.s2Sub}
              </p>

              {step === 1 && (
                <>
                  <AddressField
                    id="pickup-input"
                    value={pickup}
                    onChange={v => { setPickup(v); if (pickupCoords) setPickupCoords(null) }}
                    onFocus={() => setPickupFocused(true)}
                    onBlur={() => setPickupFocused(false)}
                    placeholder={t.searchPh}
                    label={t.pickupLabel}
                    suggestions={pickupFocused ? pickupSugs : []}
                    onSelect={selectPickup}
                    presets={PICKUP_PRESETS}
                    coordsSet={!!pickupCoords}
                    orChoose={t.orChoose}
                  />
                  {pickupCoords && !pickupHasHouseNum && (
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5" htmlFor="pickup-housenum">
                        {t.houseNumLabel} <span className="font-normal text-red-400">*</span>
                      </label>
                      <input
                        id="pickup-housenum"
                        type="text"
                        value={pickupHouseNum}
                        onChange={e => setPickupHouseNum(e.target.value)}
                        placeholder={t.houseNumPh}
                        className="w-full px-4 py-3 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors"
                        style={{ borderColor: pickupHouseNum ? '#16a34a' : '#f59e0b' }}
                      />
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <AddressField
                    id="dropoff-input"
                    value={dropoff}
                    onChange={v => { setDropoff(v); if (dropoffCoords) setDropoffCoords(null) }}
                    onFocus={() => setDropoffFocused(true)}
                    onBlur={() => setDropoffFocused(false)}
                    placeholder={t.searchPh}
                    label={t.dropoffLabel}
                    suggestions={dropoffFocused ? dropoffSugs : []}
                    onSelect={selectDropoff}
                    presets={DROPOFF_PRESETS}
                    coordsSet={!!dropoffCoords}
                    orChoose={t.orChoose}
                  />
                  {dropoffCoords && !dropoffHasHouseNum && (
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5" htmlFor="dropoff-housenum">
                        {t.houseNumLabel} <span className="font-normal text-red-400">*</span>
                      </label>
                      <input
                        id="dropoff-housenum"
                        type="text"
                        value={dropoffHouseNum}
                        onChange={e => setDropoffHouseNum(e.target.value)}
                        placeholder={t.houseNumPh}
                        className="w-full px-4 py-3 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors"
                        style={{ borderColor: dropoffHouseNum ? '#16a34a' : '#f59e0b' }}
                      />
                    </div>
                  )}
                </>
              )}

              {continueBtn}
            </div>
          </div>

          <div className="flex-1 relative" style={{ minHeight: '45vh' }}>
            <DeliveryMap
              pickupCoords={pickupCoords}
              dropoffCoords={step === 2 ? dropoffCoords : null}
              activePin={step === 1 ? 'pickup' : 'dropoff'}
              onMapClick={handleMapClick}
              pickupAddress={pickup}
              dropoffAddress={dropoff}
              lang={lang}
            />
          </div>
        </div>
      </div>
    )
  }

  // Steps 3–5 — single column
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {navbar}
      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-10 pt-8">
        {stepBar}

        {step === 3 && orderType === 'shopping' && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(3)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s3TitleShopping}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s3SubShopping}</p>

            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="shopping-list">
              {t.shoppingListLabel}
            </label>
            <textarea id="shopping-list" value={shoppingList} onChange={e => setShoppingList(e.target.value)}
              placeholder={t.shoppingListPh} rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors resize-none mb-5"
              style={{ borderColor: shoppingList.trim().length > 2 ? '#16a34a' : '#e5e7eb' }} />

            <p className="text-sm font-semibold text-gray-700 mb-3">{t.storesLabel}</p>
            <div className="flex gap-2 mb-5">
              {([1, 2, 3] as const).map(n => (
                <button key={n} onClick={() => setStores(n)}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{ borderColor: stores === n ? '#16a34a' : '#e5e7eb', background: stores === n ? '#f0fdf4' : 'white', color: stores === n ? '#15803d' : '#374151' }}>
                  {n === 3 ? '3+' : n}
                  <span className="block text-xs font-normal mt-0.5" style={{ color: stores === n ? '#16a34a' : '#9ca3af' }}>
                    {n === 1 ? t.store1 : n === 2 ? t.store2 : t.store3}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-3">{t.itemsLabel}</p>
            <div className="flex gap-2 mb-5">
              {(['1-5', '6-15', '16+'] as const).map(range => (
                <button key={range} onClick={() => setItemRange(range)}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all"
                  style={{ borderColor: itemRange === range ? '#16a34a' : '#e5e7eb', background: itemRange === range ? '#f0fdf4' : 'white', color: itemRange === range ? '#15803d' : '#374151' }}>
                  {range}
                  <span className="block text-xs font-normal mt-0.5" style={{ color: itemRange === range ? '#16a34a' : '#9ca3af' }}>
                    {range === '1-5' ? t.itemsFew : range === '6-15' ? t.itemsMed : t.itemsMany}
                  </span>
                </button>
              ))}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="courier-note">
              {t.noteLabel} <span className="font-normal text-gray-400">({t.optional})</span>
            </label>
            <textarea id="courier-note" value={note} onChange={e => setNote(e.target.value)}
              placeholder={t.notePh} rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors resize-none" />
          </div>
        )}

        {step === 3 && orderType === 'delivery' && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(3)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s3TitleDelivery}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s3SubDelivery}</p>

            <p className="text-sm font-semibold text-gray-700 mb-3">{t.sizeLabel}</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(['S', 'M', 'L'] as const).map(s => {
                const selected = size === s
                return (
                  <button key={s} onClick={() => setSize(s)}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{ borderColor: selected ? '#16a34a' : '#e5e7eb', background: selected ? '#f0fdf4' : 'white' }}>
                    <p className="text-2xl mb-1">{s === 'S' ? '📄' : s === 'M' ? '📦' : '🗃️'}</p>
                    <p className="text-sm font-bold" style={{ color: selected ? '#15803d' : '#111827' }}>
                      {s === 'S' ? t.sSmallTitle : s === 'M' ? t.sMediumTitle : t.sLargeTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                      {s === 'S' ? t.sSmallSub : s === 'M' ? t.sMediumSub : t.sLargeSub}
                    </p>
                  </button>
                )
              })}
            </div>

            <p className="text-sm font-semibold text-gray-700 mb-3">{t.fragilLabel}</p>
            <div className="flex gap-2 mb-5">
              {([true, false] as const).map(val => (
                <button key={String(val)} onClick={() => setIsFragile(val)}
                  className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={{
                    borderColor: isFragile === val ? (val ? '#f59e0b' : '#16a34a') : '#e5e7eb',
                    background: isFragile === val ? (val ? '#fffbeb' : '#f0fdf4') : 'white',
                    color: isFragile === val ? (val ? '#d97706' : '#15803d') : '#374151',
                  }}>
                  {val ? `⚠️ ${t.fragilYes}` : `✓ ${t.fragilNo}`}
                </button>
              ))}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="item-desc">
              {t.itemDescLabel} <span className="font-normal text-gray-400">({t.optional})</span>
            </label>
            <textarea id="item-desc" value={itemDesc} onChange={e => setItemDesc(e.target.value)}
              placeholder={t.itemDescPh} rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors resize-none mb-5"
              style={{ borderColor: itemDesc.trim().length > 2 ? '#16a34a' : '#e5e7eb' }} />

            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="courier-note">
              {t.noteLabel} <span className="font-normal text-gray-400">({t.optional})</span>
            </label>
            <textarea id="courier-note" value={note} onChange={e => setNote(e.target.value)}
              placeholder={t.notePh} rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors resize-none" />
          </div>
        )}

        {step === 4 && (() => {
          const effectivePostcode = dropoffPostcode ?? detectPostcode(dropoff)
          const allowedDays = getAllowedDays(effectivePostcode)
          const zoneName = getZoneName(effectivePostcode)
          const dayOptions = [
            { key: 'express', label: t.expressLabel, sub: t.expressSub, iso: null },
            ...Array.from({ length: 7 }, (_, i) => {
              const d = new Date(Date.now() + i * 86400000)
              const iso = d.toISOString().split('T')[0]
              if (allowedDays && !allowedDays.includes(d.getDay())) return null
              const label = i === 0
                ? t.slotToday
                : i === 1
                ? t.slotTomorrow
                : d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'short' })
              const sub = d.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' })
              return { key: iso, label, sub, iso }
            }).filter((d): d is NonNullable<typeof d> => d !== null),
          ]
          const slots = scheduleType !== 'express' ? getTimeSlots(calendarDay) : []

          return (
            <div className="animate-fade-in-up">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(4)}</p>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s4Title}</h1>
              <p className="text-gray-400 text-sm mb-5">{t.s4Sub}</p>
              {zoneName && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <p className="text-xs font-semibold text-blue-600">{zoneName}</p>
                </div>
              )}

              {/* Horizontal day picker */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
                {dayOptions.map(day => {
                  const isExpress = day.key === 'express'
                  const sel = isExpress ? scheduleType === 'express' : calendarDay === day.key && scheduleType !== 'express'
                  return (
                    <button key={day.key}
                      onClick={() => {
                        if (isExpress) {
                          setScheduleType('express')
                          setCalendarDay('express')
                          setSelectedSlotId(null)
                        } else {
                          setCalendarDay(day.key)
                          setScheduleType('later')
                          setSelectedSlotId(null)
                        }
                      }}
                      className="shrink-0 flex flex-col items-center px-3.5 py-3 rounded-2xl border-2 transition-all min-w-[68px]"
                      style={{
                        borderColor: sel ? '#16a34a' : '#e5e7eb',
                        background: sel && isExpress
                          ? 'linear-gradient(135deg, #92400e, #d97706)'
                          : sel ? '#f0fdf4' : 'white',
                      }}>
                      {isExpress ? (
                        <>
                          <svg viewBox="0 0 20 20" fill={sel ? '#fde68a' : '#d97706'} width="16" height="16" className="mb-1">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-xs font-black" style={{ color: sel ? '#fde68a' : '#92400e' }}>
                            {day.label}
                          </span>
                          <span className="text-xs font-medium mt-0.5" style={{ color: sel ? 'rgba(255,255,255,0.65)' : '#9ca3af' }}>
                            {day.sub}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-semibold mb-0.5" style={{ color: sel ? '#15803d' : '#6b7280' }}>
                            {day.label}
                          </span>
                          <span className="text-base font-black" style={{ color: sel ? '#15803d' : '#111827' }}>
                            {new Date(day.iso + 'T12:00:00').getDate()}
                          </span>
                          <span className="text-xs" style={{ color: sel ? '#16a34a' : '#9ca3af' }}>
                            {new Date(day.iso + 'T12:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { month: 'short' })}
                          </span>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Express note */}
              {scheduleType === 'express' && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <svg viewBox="0 0 20 20" fill="#d97706" width="14" height="14" className="shrink-0">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                  </svg>
                  <p className="text-xs font-semibold" style={{ color: '#92400e' }}>{t.expressNote}</p>
                </div>
              )}

              {/* Slot grid */}
              {scheduleType !== 'express' && (
                <div className="mt-5 space-y-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">{t.slotSelect}</p>
                  {slots.length === 0
                    ? <p className="text-sm text-gray-400 italic">{t.slotNoSlots}</p>
                    : slots.map((slot: TimeSlot) => {
                        const sel = selectedSlotId === slot.id
                        return (
                          <button key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all"
                            style={{
                              borderColor: sel ? '#16a34a' : '#e5e7eb',
                              background: sel ? '#f0fdf4' : 'white',
                            }}>
                            <span className="text-sm font-bold tabular-nums" style={{ color: sel ? '#15803d' : '#111827' }}>
                              {slot.label}
                            </span>
                            {slot.tag === 'surcharge' && (
                              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                                <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
                                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                                </svg>
                                {slot.tagLabel}
                              </span>
                            )}
                            {slot.tag === 'discount' && (
                              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                <svg viewBox="0 0 20 20" fill="currentColor" width="11" height="11">
                                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 10l1.293-1.293zM11 6a1 1 0 011 1v6a1 1 0 11-2 0V7a1 1 0 011-1zm2.293 7.293a1 1 0 001.414-1.414L13.414 10l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3z" clipRule="evenodd"/>
                                </svg>
                                {slot.tagLabel}
                              </span>
                            )}
                            {slot.tag === 'normal' && sel && (
                              <svg viewBox="0 0 20 20" fill="#16a34a" width="18" height="18">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </button>
                        )
                      })
                  }
                </div>
              )}
            </div>
          )
        })()}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(5)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s5Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s5Sub}</p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-4">
              <div className="flex gap-3 mb-5">
                <div className="flex flex-col items-center pt-0.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-px flex-1 my-1.5 border-l-2 border-dashed border-gray-300" style={{ minHeight: 28 }} />
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                </div>
                <div className="flex flex-col justify-between flex-1 gap-3">
                  {([
                    { label: t.pickup, value: pickup + (pickupHouseNum ? `, ${pickupHouseNum}` : ''), setter: (v: string) => { setPickup(v); setPickupCoords(null); setPickupHouseNum('') }, id: 'review-pickup' },
                    { label: t.dropoff, value: dropoff + (dropoffHouseNum ? `, ${dropoffHouseNum}` : ''), setter: (v: string) => { setDropoff(v); setDropoffCoords(null); setDropoffHouseNum('') }, id: 'review-dropoff' },
                  ] as const).map(field => (
                    <div key={field.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{field.label}</p>
                        <button
                          onClick={() => document.getElementById(field.id)?.focus()}
                          className="text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors"
                          style={{ background: '#f0fdf4', color: '#15803d' }}>
                          {lang === 'de' ? 'Ändern' : 'Edit'}
                        </button>
                      </div>
                      <input
                        id={field.id}
                        value={field.value}
                        onChange={e => field.setter(e.target.value)}
                        className="w-full text-sm font-medium text-gray-900 bg-transparent border-b-2 outline-none py-0.5 transition-colors"
                        style={{ borderColor: field.value ? '#16a34a' : '#f59e0b' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="flex-1">{note && <p className="text-sm text-gray-500">{note}</p>}</div>
                <span className="text-sm font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: SIZE_COLORS[size].bg, color: SIZE_COLORS[size].text }}>
                  {size === 'S' ? t.smallLabel : size === 'M' ? t.mediumLabel : t.largeLabel}
                </span>
              </div>
            </div>
            {(() => {
              const selectedSlot = selectedSlotId ? getSlotById(selectedSlotId) : undefined
              const fullPickup = pickup + (pickupHouseNum ? `, ${pickupHouseNum}` : '')
              const fullDropoff = dropoff + (dropoffHouseNum ? `, ${dropoffHouseNum}` : '')
              const p = calculatePrice(
                fullPickup, fullDropoff, size,
                scheduleType === 'express' ? 'express' : scheduleType,
                '',
                orderType === 'shopping' ? stores : 1,
                orderType === 'shopping' ? itemRange : '1-5',
                scheduleType === 'express' ? null : (selectedSlot?.priceMod ?? null),
              )
              const todayIso = new Date().toISOString().split('T')[0]
              const tomorrowIso = new Date(Date.now() + 86400000).toISOString().split('T')[0]
              const whenLabel = scheduleType === 'express'
                ? `${t.expressLabel} · ${t.expressSub}`
                : (() => {
                    const slot = selectedSlot
                    const dayLabel = calendarDay === todayIso
                      ? t.slotToday
                      : calendarDay === tomorrowIso
                      ? t.slotTomorrow
                      : calendarDay !== 'express'
                      ? new Date(calendarDay + 'T12:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                      : ''
                    return slot ? `${dayLabel} · ${slot.label}` : '—'
                  })()
              return (
                <div className="bg-white rounded-2xl border border-green-100 mb-3 overflow-hidden"
                  style={{ boxShadow: '0 0 0 2px rgba(22,163,74,0.1)' }}>
                  <div className="px-5 py-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t.priceBase} ({size === 'S' ? t.smallLabel : size === 'M' ? t.mediumLabel : t.largeLabel})</span>
                      <span>€{p.base.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t.priceDist} (~{p.estimatedKm} km)</span>
                      <span>+ €{p.distanceSurcharge.toFixed(2)}</span>
                    </div>
                    {p.storesSurcharge > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t.priceStores} ({stores === 3 ? '3+' : stores})</span>
                        <span>+ €{p.storesSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {p.itemsSurcharge > 0 && (
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{t.priceItems} ({itemRange})</span>
                        <span>+ €{p.itemsSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {p.expressSurcharge > 0 && (
                      <div className="flex justify-between text-sm font-semibold" style={{ color: '#d97706' }}>
                        <span className="flex items-center gap-1">
                          <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                          </svg>
                          {t.priceExpress}
                        </span>
                        <span>+ €{p.expressSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {p.peakSurcharge > 0 && (
                      <div className="flex justify-between text-sm text-amber-600">
                        <span>{t.pricePeak}</span>
                        <span>+ €{p.peakSurcharge.toFixed(2)}</span>
                      </div>
                    )}
                    {p.peakSurcharge < 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>{t.priceDiscount}</span>
                        <span>− €{Math.abs(p.peakSurcharge).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">{t.priceTotal}</span>
                      <span className="text-3xl font-black text-gray-900">€{p.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <svg viewBox="0 0 20 20" fill={scheduleType === 'express' ? '#d97706' : '#6b7280'} width="16" height="16" className="shrink-0">
                      {scheduleType === 'express'
                        ? <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                        : <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      }
                    </svg>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{t.when}:</p>
                    <p className="text-sm font-bold text-gray-900 flex-1">{whenLabel}</p>
                    <button
                      onClick={() => setStep(4)}
                      className="text-xs font-semibold px-2 py-0.5 rounded-lg transition-colors shrink-0"
                      style={{ background: '#f0fdf4', color: '#15803d' }}>
                      {lang === 'de' ? 'Ändern' : 'Edit'}
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {continueBtn}
      </div>
    </div>
  )
}
