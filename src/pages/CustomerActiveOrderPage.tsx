import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'

type Status = 'searching' | 'found' | 'picked_up' | 'delivered'

const MOCK_COURIER = { name: 'Jonas M.', rating: 4.9, phone: '+49 151 234 56789', eta: '~12 min' }

const tr = {
  de: {
    searching: 'Kurier wird gesucht…',
    searchingSub: 'Verifizierte Studierende in deiner Nähe werden benachrichtigt.',
    found: 'Kurier gefunden!',
    foundSub: 'Dein Kurier ist unterwegs zur Abholung.',
    picked_up: 'Abgeholt!',
    picked_upSub: 'Dein Kurier hat dein Paket und ist auf dem Weg.',
    delivered: 'Geliefert!',
    deliveredSub: 'Dein Paket wurde erfolgreich zugestellt. Danke, dass du Bringo nutzt!',
    eta: 'Geschätzte Ankunft',
    pickup: 'Abholung', dropoff: 'Zielort',
    markPickedUp: 'Abholung bestätigen',
    markDelivered: 'Zustellung bestätigen',
    cancelOrder: 'Auftrag stornieren',
    backHome: 'Zurück zur Startseite',
    orderRef: 'Auftrag',
  },
  en: {
    searching: 'Finding your courier…',
    searchingSub: 'Verified students nearby are being notified.',
    found: 'Courier found!',
    foundSub: 'Your courier is heading to pick up your item.',
    picked_up: 'Picked up!',
    picked_upSub: 'Your courier has your item and is on the way.',
    delivered: 'Delivered!',
    deliveredSub: 'Your item was successfully delivered. Thanks for using Bringo!',
    eta: 'ETA',
    pickup: 'Pickup', dropoff: 'Dropoff',
    markPickedUp: 'Confirm pickup',
    markDelivered: 'Confirm delivery',
    cancelOrder: 'Cancel order',
    backHome: 'Back to home',
    orderRef: 'Order',
  },
}

interface Order {
  id: string
  pickup: string
  dropoff: string
  description: string
  size: 'S' | 'M' | 'L'
  price: number
}

export default function CustomerActiveOrderPage() {
  const [status, setStatus] = useState<Status>('searching')
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]
  const state = (location.state as { firstName?: string; order?: Order } | null) ?? {}
  const { firstName = '', order } = state

  useEffect(() => {
    if (!order) navigate('/home/customer')
  }, [order, navigate])

  useEffect(() => {
    if (status !== 'searching') return
    const id = setTimeout(() => setStatus('found'), 2500)
    return () => clearTimeout(id)
  }, [status])

  if (!order) return null

  if (status === 'delivered') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
        >
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3">{t.delivered}</h1>
        <p className="text-gray-400 mb-8 max-w-xs leading-relaxed">{t.deliveredSub}</p>
        <button
          onClick={() => navigate('/home/customer', { state: { firstName } })}
          className="px-8 py-4 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
        >
          {t.backHome}
        </button>
      </div>
    )
  }

  const statusColor =
    status === 'searching'
      ? { bg: '#fef9c3', text: '#854d0e' }
      : status === 'found'
      ? { bg: '#f0fdf4', text: '#15803d' }
      : { bg: '#dbeafe', text: '#1d4ed8' }

  const statusLabel =
    status === 'searching' ? t.searching : status === 'found' ? t.found : t.picked_up
  const statusSub =
    status === 'searching' ? t.searchingSub : status === 'found' ? t.foundSub : t.picked_upSub

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: statusColor.bg, color: statusColor.text }}
            >
              {status === 'searching' ? (
                <div className="w-3 h-3 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current pulse-dot" />
              )}
              <span className="text-xs font-semibold">{statusLabel}</span>
            </div>
            <span className="text-xs text-gray-400">{t.orderRef} #{order.id}</span>
          </div>
          <p className="text-sm text-gray-400">{statusSub}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-lg mx-auto w-full">
        {/* Route card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-0.5 shrink-0">
              <div className="relative" style={{ width: 12, height: 12 }}>
                {status === 'found' && (
                  <div className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
                )}
                <div
                  className="relative w-3 h-3 rounded-full"
                  style={{ background: status === 'picked_up' ? '#9ca3af' : '#16a34a' }}
                />
              </div>
              <div className="relative my-1.5" style={{ width: 2, minHeight: 40, flex: 1 }}>
                <div className="absolute inset-0" style={{ borderLeft: '2px dashed #e5e7eb' }} />
                {status !== 'searching' && (
                  <div
                    className="absolute rounded-full bg-green-400"
                    style={{
                      width: 8, height: 8,
                      left: '50%', transform: 'translateX(-50%)',
                      animation: 'routeTravel 2.6s ease-in-out infinite',
                      boxShadow: '0 0 8px rgba(74,222,128,0.9)',
                    }}
                  />
                )}
              </div>
              <div className="w-3 h-3 rounded-full bg-gray-400 shrink-0" />
            </div>
            <div className="flex flex-col justify-between flex-1 py-0.5 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.pickup}</p>
                <p className="text-sm font-medium text-gray-900">{order.pickup}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.dropoff}</p>
                <p className="text-sm font-medium text-gray-900">{order.dropoff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courier card */}
        {status !== 'searching' && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
              >
                J
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{MOCK_COURIER.name}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-semibold">{MOCK_COURIER.rating}</span>
                  <span className="text-gray-300 mx-1">·</span>
                  <span className="text-sm text-gray-400">{t.eta}: {MOCK_COURIER.eta}</span>
                </div>
              </div>
              <a
                href={`tel:${MOCK_COURIER.phone}`}
                className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center hover:bg-green-100 transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {status === 'found' && (
            <>
              <button
                onClick={() => setStatus('picked_up')}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
              >
                {t.markPickedUp}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/home/customer', { state: { firstName } })}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                {t.cancelOrder}
              </button>
            </>
          )}
          {status === 'picked_up' && (
            <button
              onClick={() => setStatus('delivered')}
              className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
            >
              {t.markDelivered}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
