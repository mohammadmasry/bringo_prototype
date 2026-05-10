import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { getSession } from '../lib/session'
import { getActiveOrder, setActiveOrder, addToHistory } from '../lib/orderStore'

type Status = 'heading_to_pickup' | 'picked_up' | 'delivered'

const tr = {
  de: {
    heading_to_pickup: 'Zur Abholung unterwegs',
    heading_to_pickupSub: 'Begib dich zum Abholort.',
    picked_up: 'Artikel abgeholt',
    picked_upSub: 'Jetzt weiter zum Zielort.',
    delivered: 'Geliefert!',
    deliveredSub: 'Auftrag erfolgreich abgeschlossen.',
    pickup: 'Abholung', dropoff: 'Zielort',
    item: 'Artikel', earnings: 'Verdienst',
    markPickedUp: 'Abgeholt',
    markDelivered: 'Zugestellt',
    backToOrders: 'Zurück zu den Aufträgen',
    cancelOrder: 'Auftrag abbrechen',
    orderRef: 'Auftrag',
    small: 'Klein', medium: 'Mittel', large: 'Groß',
  },
  en: {
    heading_to_pickup: 'Heading to pickup',
    heading_to_pickupSub: 'Make your way to the pickup location.',
    picked_up: 'Item picked up',
    picked_upSub: 'Now heading to the dropoff.',
    delivered: 'Delivered!',
    deliveredSub: 'Order successfully completed.',
    pickup: 'Pickup', dropoff: 'Dropoff',
    item: 'Item', earnings: 'Earnings',
    markPickedUp: 'Mark as picked up',
    markDelivered: 'Mark as delivered',
    backToOrders: 'Back to orders',
    cancelOrder: 'Cancel order',
    orderRef: 'Order',
    small: 'Small', medium: 'Medium', large: 'Large',
  },
}

const SIZE_COLORS: Record<'S' | 'M' | 'L', { bg: string; text: string }> = {
  S: { bg: '#f0fdf4', text: '#16a34a' },
  M: { bg: '#eff6ff', text: '#2563eb' },
  L: { bg: '#fef3c7', text: '#d97706' },
}

interface Order {
  id: string
  pickup: string
  dropoff: string
  item?: string
  description?: string
  size: 'S' | 'M' | 'L'
  price: number
}

export default function CourierActiveOrderPage() {
  const [status, setStatus] = useState<Status>('heading_to_pickup')
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]
  const { firstName = 'there' } = (location.state as { firstName?: string } | null) ?? getSession()
  const order = (location.state as { order?: Order } | null)?.order

  useEffect(() => {
    if (!order) navigate('/home/courier', { replace: true })
  }, [order, navigate])

  if (!order) return null

  const itemLabel = order.item ?? order.description ?? '—'
  const sc = SIZE_COLORS[order.size] ?? SIZE_COLORS.M
  const sizeLabel = order.size === 'S' ? t.small : order.size === 'M' ? t.medium : t.large

  const handlePickedUp = () => {
    const stored = getActiveOrder()
    if (stored?.id === order.id) setActiveOrder({ ...stored, status: 'picked_up' })
    setStatus('picked_up')
  }

  const handleDelivered = () => {
    const stored = getActiveOrder()
    if (stored?.id === order.id) { addToHistory(stored); setActiveOrder(null) }
    setStatus('delivered')
  }

  const handleCancel = () => {
    const stored = getActiveOrder()
    if (stored?.id === order.id) setActiveOrder(null)
    navigate('/home/courier', { state: { firstName } })
  }

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
        <h1 className="text-4xl font-black text-gray-900 mb-2">{t.delivered}</h1>
        <p className="text-gray-400 mb-3 max-w-xs">{t.deliveredSub}</p>
        <p className="text-3xl font-black text-green-600 mb-8">+€{order.price.toFixed(2)}</p>
        <button
          onClick={() => navigate('/home/courier', { state: { firstName } })}
          className="px-8 py-4 rounded-xl font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
        >
          {t.backToOrders}
        </button>
      </div>
    )
  }

  const statusLabel = status === 'heading_to_pickup' ? t.heading_to_pickup : t.picked_up
  const statusSub = status === 'heading_to_pickup' ? t.heading_to_pickupSub : t.picked_upSub

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: '#f0fdf4', color: '#15803d' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs font-semibold">{statusLabel}</span>
            </div>
            <span className="text-xs text-gray-400">{t.orderRef} #{order.id}</span>
          </div>
          <p className="text-sm text-gray-400">{statusSub}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex gap-3 mb-5">
            <div className="flex flex-col items-center pt-0.5 shrink-0">
              <div className="relative" style={{ width: 12, height: 12 }}>
                {status === 'heading_to_pickup' && (
                  <div className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
                )}
                <div
                  className="relative w-3 h-3 rounded-full"
                  style={{ background: status === 'picked_up' ? '#9ca3af' : '#16a34a' }}
                />
              </div>
              <div className="relative my-1.5" style={{ width: 2, minHeight: 40, flex: 1 }}>
                <div className="absolute inset-0" style={{ borderLeft: '2px dashed #e5e7eb' }} />
                <div
                  className="absolute rounded-full bg-green-400"
                  style={{
                    width: 8, height: 8,
                    left: '50%', transform: 'translateX(-50%)',
                    animation: 'routeTravel 2.6s ease-in-out infinite',
                    boxShadow: '0 0 8px rgba(74,222,128,0.9)',
                  }}
                />
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

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{t.item}</p>
              <p className="text-sm font-medium text-gray-900">{itemLabel}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                {sizeLabel}
              </span>
              <span className="text-lg font-black text-green-600">€{order.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {status === 'heading_to_pickup' && (
            <>
              <button
                onClick={handlePickedUp}
                className="w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
              >
                {t.markPickedUp}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button onClick={handleCancel} className="w-full py-3.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors">
                {t.cancelOrder}
              </button>
            </>
          )}
          {status === 'picked_up' && (
            <button
              onClick={handleDelivered}
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
