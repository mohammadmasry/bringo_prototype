import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import ChatWidget from '../components/ChatWidget'
import { useLang } from '../hooks/useLang'
import { getSession, setSession, clearSession, getToken } from '../lib/session'
import { getActiveOrder, getOrderHistory, type StoredOrder } from '../lib/orderStore'
import { api } from '../lib/api'

const tr = {
  de: {
    greet: (name: string) => {
      const h = new Date().getHours()
      return `${h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'}, ${name} 👋`
    },
    title: 'Was brauchen Sie?',
    easyTitle: '„Was möchten Sie gebracht bekommen?"',
    easySub: 'Beschreiben Sie es einfach - unser Assistent erledigt den Rest.',
    manualTitle: 'Lieferung schrittweise manuell erstellen',
    switchToEasy: 'Großschrift aktivieren',
    switchToStandard: 'Zurück zu Standard',
    ctaTitle: 'Lieferung erstellen',
    ctaSub: 'Ein verifizierter Student holt es ab und bringt es zu Ihnen.',
    areaLabel: 'Gebiet', deliveryLabel: 'Ø Lieferzeit',
    ordersTitle: 'Ihre Aufträge',
    emptyTitle: 'Noch keine Aufträge', emptySub: 'Ihre Lieferungen werden hier angezeigt',
    activeOrderTitle: 'Aktive Lieferung', trackBtn: 'Verfolgen',
    historyTitle: 'Abgeschlossene Aufträge',
    switchRole: 'Rolle wechseln', logout: 'Abmelden',
    pickup: 'Abholung', delivered: 'Zugestellt',
    small: 'Klein', medium: 'Mittel', large: 'Groß',
  },
  en: {
    greet: (name: string) => {
      const h = new Date().getHours()
      return `Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}, ${name} 👋`
    },
    title: 'What do you need?',
    easyTitle: '"What would you like brought to you?"',
    easySub: 'Describe it in your own words - our assistant takes care of the rest.',
    manualTitle: 'Create order step by step',
    switchToEasy: 'Enable Large Print',
    switchToStandard: 'Back to Standard',
    ctaTitle: 'Create a delivery',
    ctaSub: 'A verified student picks it up and brings it to you.',
    areaLabel: 'Area', deliveryLabel: 'Avg. delivery',
    ordersTitle: 'Your orders',
    emptyTitle: 'No orders yet', emptySub: 'Your deliveries will appear here',
    activeOrderTitle: 'Active delivery', trackBtn: 'Track',
    historyTitle: 'Completed orders',
    switchRole: 'Switch role', logout: 'Log out',
    pickup: 'Pickup', delivered: 'Delivered',
    small: 'Small', medium: 'Medium', large: 'Large',
  },
}

const SIZE_COLORS: Record<'S' | 'M' | 'L', { bg: string; text: string }> = {
  S: { bg: '#f0fdf4', text: '#16a34a' },
  M: { bg: '#eff6ff', text: '#2563eb' },
  L: { bg: '#fef3c7', text: '#d97706' },
}

function HistoryCard({ order, t }: { order: StoredOrder; t: typeof tr['en'] }) {
  const sc = SIZE_COLORS[order.size]
  const sizeLabel = order.size === 'S' ? t.small : order.size === 'M' ? t.medium : t.large
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text }}>{sizeLabel}</span>
          <span className="text-sm font-medium text-gray-700">{order.description}</span>
        </div>
        <span className="text-sm font-black text-gray-900">€{order.price.toFixed(2)}</span>
      </div>
      <p className="text-xs text-gray-400 truncate">{order.pickup} → {order.dropoff}</p>
      <div className="flex items-center gap-1 mt-2">
        <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs font-semibold text-green-600">{t.delivered}</span>
      </div>
    </div>
  )
}

export default function CustomerHomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = getSession()
  const { firstName = 'there' } = (location.state as { firstName?: string } | null) ?? session
  const [mode, setMode] = useState<'standard' | 'easy'>(session.mode ?? 'standard')
  const isEasyMode = mode === 'easy'

  useEffect(() => {
    document.documentElement.style.fontSize = mode === 'easy' ? '115%' : '100%'
  }, [mode])

  const toggleMode = () => {
    const next = mode === 'easy' ? 'standard' : 'easy'
    setSession({ mode: next })
    setMode(next)
    setShowMenu(false)
  }
  const { lang } = useLang()
  const t = tr[lang]
  const [showMenu, setShowMenu] = useState(false)
  const [activeOrder, setActiveOrderState] = useState<StoredOrder | null>(() => getActiveOrder())
  const [history, setHistory] = useState<StoredOrder[]>(() => getOrderHistory())

  useEffect(() => {
    const tick = () => setActiveOrderState(getActiveOrder())
    const id = setInterval(tick, 2000)
    window.addEventListener('storage', tick)
    return () => { clearInterval(id); window.removeEventListener('storage', tick) }
  }, [])

  // Load real order history from backend if logged in
  useEffect(() => {
    if (!getToken()) return
    api.orders.getHistory().then((orders) => {
      setHistory(orders as StoredOrder[])
    }).catch(() => {
      setHistory(getOrderHistory())
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            {/* Avatar + dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
              >
                {firstName[0]?.toUpperCase()}
              </button>
              {showMenu && (
                <div className="absolute left-0 top-12 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-44 animate-fade-in-up">
                  <button
                    onClick={toggleMode}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>{isEasyMode ? '⚙️' : '✨'}</span>
                    {isEasyMode ? t.switchToStandard : t.switchToEasy}
                  </button>
                  <div className="h-px bg-gray-100 mx-2" />
                  <button
                    onClick={() => navigate('/welcome')}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {t.switchRole}
                  </button>
                  <button
                    onClick={() => { clearSession(); navigate('/') }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
            <LangToggle />
          </div>
          <p className="text-sm text-gray-400 font-medium">{t.greet(firstName)}</p>
          <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">
        {/* Active order banner */}
        {activeOrder && activeOrder.status !== 'delivered' ? (
          <div
            className="w-full text-left rounded-2xl p-5 mb-4 border-2 border-green-200"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t.activeOrderTitle}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{activeOrder.description}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{activeOrder.pickup}</p>
              </div>
              <button
                onClick={() => navigate('/active-order', { state: { firstName } })}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white shrink-0 ml-3"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
              >
                {t.trackBtn}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            {/* Primary CTA — always the big green card */}
            <button
              onClick={() => navigate('/easy-order', { state: { firstName } })}
              className="w-full text-left rounded-2xl p-6 group transition-all duration-200 hover:shadow-lg active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #16a34a 100%)' }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{t.easyTitle}</h2>
              <p className="text-white/60 text-sm">{t.easySub}</p>
            </button>

            {/* Divider */}
            <p className="text-center text-xs text-gray-400 font-medium">
              {lang === 'de' ? 'oder' : 'or'}
            </p>

            {/* Manual option — always shown as full card */}
            <button
              onClick={() => navigate('/create-delivery', { state: { firstName } })}
              className="w-full text-left rounded-2xl px-5 py-4 bg-white border border-gray-200 flex items-center justify-between group hover:border-gray-300 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-700">{t.manualTitle}</span>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.areaLabel}</p>
            <p className="text-sm font-bold text-gray-900">Pfarrkirchen</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.deliveryLabel}</p>
            <p className="text-sm font-bold text-gray-900">~25 min</p>
          </div>
        </div>

        {/* Order history */}
        {history.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">{t.historyTitle}</h2>
            <div className="space-y-2">
              {history.slice(0, 3).map((o) => <HistoryCard key={o.id} order={o} t={t} />)}
            </div>
          </div>
        )}

        {history.length === 0 && !activeOrder && (
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-3">{t.ordersTitle}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-400">{t.emptyTitle}</p>
              <p className="text-xs text-gray-300 mt-1">{t.emptySub}</p>
            </div>
          </div>
        )}
      </div>

      {/* Close menu on outside click */}
      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
      )}

      <ChatWidget firstName={firstName} />
    </div>
  )
}
