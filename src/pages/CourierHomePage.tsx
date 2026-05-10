import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { getSession, clearSession } from '../lib/session'
import { getActiveOrder, setActiveOrder, type StoredOrder } from '../lib/orderStore'

interface MockOrder {
  id: string; pickup: string; dropoff: string
  item: string; size: 'S' | 'M' | 'L'; price: number; distance: number; minsAgo: number
}

const MOCK_ORDERS: MockOrder[] = [
  { id: '1', pickup: 'CAMPUS Pfarrkirchen, Petersbogen 1', dropoff: 'Stadtplatz 12, 84347 Pfarrkirchen', item: 'Textbooks', size: 'M', price: 4.50, distance: 1.2, minsAgo: 3 },
  { id: '2', pickup: 'Edeka, Griesbacher Str. 3, Pfarrkirchen', dropoff: 'Ludwigstraße 8, 84347 Pfarrkirchen', item: 'Grocery bag', size: 'M', price: 5.50, distance: 2.1, minsAgo: 7 },
  { id: '3', pickup: 'Bahnhof Pfarrkirchen, Bahnhofstr. 1', dropoff: 'Ringstraße 44, 84347 Pfarrkirchen', item: 'Documents envelope', size: 'S', price: 3.20, distance: 0.8, minsAgo: 12 },
  { id: '4', pickup: 'Rewe, Münchener Str. 8, Pfarrkirchen', dropoff: 'Kirchgasse 5, 84347 Pfarrkirchen', item: 'Medium box', size: 'M', price: 6.00, distance: 1.8, minsAgo: 19 },
]

const SIZE_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: '#f0fdf4', text: '#16a34a' },
  M: { bg: '#eff6ff', text: '#2563eb' },
  L: { bg: '#fef3c7', text: '#d97706' },
}

const tr = {
  de: {
    banner: 'Verifizierung läuft — du kannst stöbern, aber noch keine Aufträge annehmen',
    greet: (name: string) => {
      const h = new Date().getHours()
      return `${h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'}, ${name} 👋`
    },
    title: 'Aufträge in der Nähe', available: 'verfügbar',
    allSizes: 'Alle Größen', accept: 'Annehmen',
    footer: 'Aufträge im Umkreis von 5 km · Aktualisierung alle 30 s',
    minsAgo: (n: number) => `vor ${n} Min.`,
    newOrder: 'Neue Bestellung!', newOrderSub: 'Ein Kunde wartet auf eine Lieferung.',
    switchRole: 'Rolle wechseln', logout: 'Abmelden',
  },
  en: {
    banner: 'Verification in progress — you can browse but not accept orders yet',
    greet: (name: string) => {
      const h = new Date().getHours()
      return `Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}, ${name} 👋`
    },
    title: 'Orders nearby', available: 'available',
    allSizes: 'All sizes', accept: 'Accept',
    footer: 'Showing orders within 5 km · Updates every 30 s',
    minsAgo: (n: number) => `${n} min ago`,
    newOrder: 'New order!', newOrderSub: 'A customer is waiting for a delivery.',
    switchRole: 'Switch role', logout: 'Log out',
  },
}

function MockOrderCard({ order, onAccept, acceptLabel, minsAgoLabel }: {
  order: MockOrder; onAccept: (order: MockOrder) => void; acceptLabel: string; minsAgoLabel: string
}) {
  const size = SIZE_COLORS[order.size]
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: size.bg, color: size.text }}>{order.size}</span>
          <span className="text-sm font-medium text-gray-700">{order.item}</span>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900">€{order.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{order.distance} km</p>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center pt-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="w-px flex-1 my-1 border-l border-dashed border-gray-300" style={{ minHeight: 20 }} />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
        </div>
        <div className="flex flex-col justify-between flex-1 gap-2">
          <p className="text-sm text-gray-700 leading-tight">{order.pickup}</p>
          <p className="text-sm text-gray-400 leading-tight">{order.dropoff}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">{minsAgoLabel}</span>
        <button
          onClick={() => onAccept(order)}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
        >
          {acceptLabel}
        </button>
      </div>
    </div>
  )
}

function CustomerOrderCard({ order, onAccept, acceptLabel }: {
  order: StoredOrder; onAccept: (order: StoredOrder) => void; acceptLabel: string
}) {
  const size = SIZE_COLORS[order.size]
  return (
    <div
      className="rounded-2xl p-5 border-2 border-green-200 shadow-sm mb-4"
      style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Live</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: size.bg, color: size.text }}>{order.size}</span>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center pt-0.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <div className="w-px flex-1 my-1 border-l border-dashed border-green-300" style={{ minHeight: 20 }} />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
        </div>
        <div className="flex flex-col justify-between flex-1 gap-2">
          <p className="text-sm text-gray-700 leading-tight font-medium">{order.pickup}</p>
          <p className="text-sm text-gray-400 leading-tight">{order.dropoff}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-gray-900">€{order.price.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{order.description}</p>
        </div>
      </div>
      <button
        onClick={() => onAccept(order)}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
      >
        {acceptLabel}
      </button>
    </div>
  )
}

export default function CourierHomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { firstName = 'there' } = (location.state as { firstName?: string } | null) ?? getSession()
  const [filter, setFilter] = useState<'All' | 'S' | 'M' | 'L'>('All')
  const [showMenu, setShowMenu] = useState(false)
  const { lang } = useLang()
  const t = tr[lang]

  const [customerOrder, setCustomerOrder] = useState<StoredOrder | null>(() => {
    const o = getActiveOrder()
    return o && (o.status === 'searching' || o.status === 'found') ? o : null
  })

  useEffect(() => {
    const tick = () => {
      const o = getActiveOrder()
      setCustomerOrder(o && (o.status === 'searching' || o.status === 'found') ? o : null)
    }
    const id = setInterval(tick, 2000)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  const filtered = MOCK_ORDERS.filter((o) => filter === 'All' || o.size === filter)

  const handleAcceptMock = (order: MockOrder) => {
    navigate('/active-delivery', { state: { firstName, order } })
  }

  const handleAcceptCustomerOrder = (order: StoredOrder) => {
    setActiveOrder({ ...order, status: 'heading_to_pickup' })
    navigate('/active-delivery', {
      state: { firstName, order: { ...order, item: order.description } },
    })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
              >
                {firstName[0]?.toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute left-0 top-11 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-36 animate-fade-in-up">
                  <button onClick={() => navigate('/welcome')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {t.switchRole}
                  </button>
                  <button onClick={() => { clearSession(); navigate('/') }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
            <LangToggle />
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-5">
            <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-xs font-semibold text-amber-700">{t.banner}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">{t.greet(firstName)}</p>
              <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-green-600">{MOCK_ORDERS.length + (customerOrder ? 1 : 0)}</p>
              <p className="text-xs text-gray-400">{t.available}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-lg mx-auto flex gap-2">
          {(['All', 'S', 'M', 'L'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150"
              style={{ background: filter === f ? '#16a34a' : '#f3f4f6', color: filter === f ? 'white' : '#6b7280' }}>
              {f === 'All' ? t.allSizes : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-lg mx-auto w-full">
        {/* Customer's live order — always shown first */}
        {customerOrder && (filter === 'All' || filter === customerOrder.size) && (
          <CustomerOrderCard order={customerOrder} onAccept={handleAcceptCustomerOrder} acceptLabel={t.accept} />
        )}

        <div className="space-y-3">
          {filtered.map((order) => (
            <MockOrderCard key={order.id} order={order} onAccept={handleAcceptMock} acceptLabel={t.accept} minsAgoLabel={t.minsAgo(order.minsAgo)} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-300 mt-8">{t.footer}</p>
      </div>

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>
  )
}
