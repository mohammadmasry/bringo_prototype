import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { getSession } from '../lib/session'
import { getActiveOrder, setActiveOrder, addToHistory, type StoredOrder } from '../lib/orderStore'
import { api } from '../lib/api'

const MOCK_COURIER = { name: 'Jonas M.', rating: 4.9, phone: '+49 151 234 56789', eta: '~12 min' }

const tr = {
  de: {
    searching: 'Kurier wird gesucht…',
    searchingSub: 'Verifizierte Studierende in Ihrer Nähe werden benachrichtigt.',
    found: 'Kurier gefunden!',
    foundSub: 'Ihr Kurier ist unterwegs zur Abholung.',
    heading_to_pickup: 'Kurier auf dem Weg',
    heading_to_pickupSub: 'Ihr Kurier fährt zum Abholort.',
    picked_up: 'Abgeholt!',
    picked_upSub: 'Ihr Kurier hat das Paket und ist auf dem Weg zu Ihnen.',
    delivered: 'Geliefert!',
    deliveredSub: 'Ihr Paket wurde erfolgreich zugestellt. Vielen Dank, dass Sie Bringo nutzen!',
    eta: 'Geschätzte Ankunft',
    pickup: 'Abholung', dropoff: 'Zielort',
    cancelOrder: 'Auftrag stornieren',
    backHome: 'Zurück zur Startseite',
    orderRef: 'Auftrag',
    waitingForCourier: 'Warten auf Kurier…',
    feedbackTitle: 'Wie war Ihre Erfahrung?',
    feedbackSub: 'Helfen Sie uns, Bringo zu verbessern.',
    starsLabel: ['Sehr schlecht', 'Schlecht', 'Ok', 'Gut', 'Sehr gut'],
    likedLabel: 'Was hat Ihnen gefallen?',
    likedPh: 'z.B. schnelle Lieferung, freundlicher Kurier…',
    improveLabel: 'Was kann verbessert werden?',
    improvePh: 'z.B. Preis, Kommunikation, App-Design…',
    emailLabel: 'E-Mail für Rückmeldung',
    emailPh: 'optional',
    sendFeedback: 'Feedback absenden',
    skipFeedback: 'Überspringen',
    sending: 'Wird gesendet…',
    thanksFeedback: 'Danke für Ihr Feedback! 🎉',
    thanksFeedbackSub: 'Das hilft uns, Bringo besser zu machen.',
  },
  en: {
    searching: 'Finding your courier…',
    searchingSub: 'Verified students nearby are being notified.',
    found: 'Courier found!',
    foundSub: 'Your courier is heading to pick up your item.',
    heading_to_pickup: 'Courier on the way',
    heading_to_pickupSub: 'Your courier is heading to the pickup location.',
    picked_up: 'Picked up!',
    picked_upSub: 'Your courier has your item and is on the way to you.',
    delivered: 'Delivered!',
    deliveredSub: 'Your item was successfully delivered. Thanks for using Bringo!',
    eta: 'ETA',
    pickup: 'Pickup', dropoff: 'Dropoff',
    cancelOrder: 'Cancel order',
    backHome: 'Back to home',
    orderRef: 'Order',
    waitingForCourier: 'Waiting for courier…',
    feedbackTitle: 'How was your experience?',
    feedbackSub: 'Help us improve Bringo.',
    starsLabel: ['Very bad', 'Bad', 'Ok', 'Good', 'Very good'],
    likedLabel: 'What did you like?',
    likedPh: 'e.g. fast delivery, friendly courier…',
    improveLabel: 'What could be improved?',
    improvePh: 'e.g. price, communication, app design…',
    emailLabel: 'Email for follow-up',
    emailPh: 'optional',
    sendFeedback: 'Send feedback',
    skipFeedback: 'Skip',
    sending: 'Sending…',
    thanksFeedback: 'Thanks for your feedback! 🎉',
    thanksFeedbackSub: 'This helps us make Bringo better.',
  },
}

type Status = StoredOrder['status']

export default function CustomerActiveOrderPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]
  const { firstName = '' } = (location.state as { firstName?: string } | null) ?? getSession()

  const [order, setOrder] = useState<StoredOrder | null>(() => getActiveOrder())
  const [status, setStatus] = useState<Status>(() => getActiveOrder()?.status ?? 'searching')

  // feedback state
  const [fbStars, setFbStars] = useState(0)
  const [fbHovered, setFbHovered] = useState(0)
  const [fbLiked, setFbLiked] = useState('')
  const [fbImprove, setFbImprove] = useState('')
  const [fbEmail, setFbEmail] = useState('')
  const [fbLoading, setFbLoading] = useState(false)
  const [fbDone, setFbDone] = useState(false)

  const submitFeedback = async () => {
    if (fbLoading) return
    setFbLoading(true)
    try {
      await api.feedback.submit({ stars: fbStars || 5, liked: fbLiked, improve: fbImprove, email: fbEmail, page: 'post-delivery' })
    } catch { /* fire-and-forget */ }
    setFbDone(true)
    setFbLoading(false)
  }

  // Redirect if no order exists
  useEffect(() => {
    if (!getActiveOrder()) navigate('/home/customer', { replace: true, state: { firstName } })
  }, [firstName, navigate])

  // Auto-progress searching → found after 2.5 s and write to store
  useEffect(() => {
    if (status !== 'searching') return
    const id = setTimeout(() => {
      const current = getActiveOrder()
      if (!current) return
      const updated = { ...current, status: 'found' as const }
      setActiveOrder(updated)
      setOrder(updated)
      setStatus('found')
    }, 2500)
    return () => clearTimeout(id)
  }, [status])

  // Poll orderStore for courier-driven status updates
  useEffect(() => {
    if (status === 'delivered') return
    const tick = () => {
      const current = getActiveOrder()
      if (!current) { navigate('/home/customer', { replace: true, state: { firstName } }); return }
      if (current.status !== status) { setOrder(current); setStatus(current.status) }
    }
    const id = setInterval(tick, 1500)
    return () => clearInterval(id)
  }, [status, navigate, firstName])

  // Two-tab sync via storage event (courier on another tab)
  useEffect(() => {
    const handler = () => {
      const current = getActiveOrder()
      if (!current) { navigate('/home/customer', { replace: true, state: { firstName } }); return }
      setOrder(current)
      setStatus(current.status)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [navigate, firstName])

  // When delivered, add to history and clear active order
  useEffect(() => {
    if (status !== 'delivered' || !order) return
    addToHistory(order)
    setActiveOrder(null)
  }, [status, order])

  if (!order) return null

  if (status === 'delivered') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #16a34a, #4ade80)' }} />

        <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-10 pt-8">
          {/* Delivery confirmed header */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
            >
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{t.delivered}</h1>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">{t.deliveredSub}</p>
          </div>

          {/* Feedback card */}
          <div className="rounded-2xl border border-gray-100 p-6 mb-5" style={{ background: '#fafafa' }}>
            {!fbDone ? (
              <>
                <h2 className="text-lg font-black text-gray-900 mb-1">{t.feedbackTitle}</h2>
                <p className="text-gray-400 text-sm mb-5">{t.feedbackSub}</p>

                {/* Stars */}
                <div className="flex gap-2 justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setFbStars(n)}
                      onMouseEnter={() => setFbHovered(n)}
                      onMouseLeave={() => setFbHovered(0)}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      <span style={{ color: n <= (fbHovered || fbStars) ? '#facc15' : '#e5e7eb' }}>★</span>
                    </button>
                  ))}
                </div>
                {fbStars > 0 && (
                  <p className="text-center text-xs font-semibold text-green-600 mb-5">
                    {t.starsLabel[fbStars - 1]}
                  </p>
                )}
                {fbStars === 0 && <div className="mb-5" />}

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.likedLabel}</label>
                    <textarea
                      value={fbLiked}
                      onChange={(e) => setFbLiked(e.target.value)}
                      placeholder={t.likedPh}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white resize-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.improveLabel}</label>
                    <textarea
                      value={fbImprove}
                      onChange={(e) => setFbImprove(e.target.value)}
                      placeholder={t.improvePh}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white resize-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t.emailLabel}</label>
                    <input
                      type="email"
                      value={fbEmail}
                      onChange={(e) => setFbEmail(e.target.value)}
                      placeholder={t.emailPh}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-gray-900 placeholder-gray-300 text-sm bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={submitFeedback}
                    disabled={fbStars === 0 || fbLoading}
                    className="flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    style={{
                      background: fbStars > 0 && !fbLoading ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
                      color: fbStars > 0 && !fbLoading ? 'white' : '#9ca3af',
                      boxShadow: fbStars > 0 && !fbLoading ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
                    }}
                  >
                    {fbLoading ? t.sending : t.sendFeedback}
                  </button>
                  <button
                    onClick={() => setFbDone(true)}
                    className="px-5 py-3.5 rounded-xl font-semibold text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {t.skipFeedback}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{t.thanksFeedback}</h3>
                <p className="text-gray-400 text-sm">{t.thanksFeedbackSub}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/home/customer', { state: { firstName } })}
            className="w-full py-4 rounded-xl font-semibold text-base text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}
          >
            {t.backHome}
          </button>
        </div>
      </div>
    )
  }

  const statusMeta: Record<Exclude<Status, 'delivered'>, { label: string; sub: string; bg: string; color: string }> = {
    searching:        { label: t.searching,        sub: t.searchingSub,        bg: '#fef9c3', color: '#854d0e' },
    found:            { label: t.found,            sub: t.foundSub,            bg: '#f0fdf4', color: '#15803d' },
    heading_to_pickup:{ label: t.heading_to_pickup, sub: t.heading_to_pickupSub, bg: '#f0fdf4', color: '#15803d' },
    picked_up:        { label: t.picked_up,        sub: t.picked_upSub,        bg: '#dbeafe', color: '#1d4ed8' },
  }
  const meta = statusMeta[status as Exclude<Status, 'delivered'>]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-5">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ background: meta.bg, color: meta.color }}
            >
              {status === 'searching' ? (
                <div className="w-3 h-3 rounded-full border-2 border-yellow-600 border-t-transparent animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current pulse-dot" />
              )}
              <span className="text-xs font-semibold">{meta.label}</span>
            </div>
            <span className="text-xs text-gray-400">{t.orderRef} #{order.id}</span>
          </div>
          <p className="text-sm text-gray-400">{meta.sub}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-lg mx-auto w-full">
        {/* Route card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-0.5 shrink-0">
              <div className="relative" style={{ width: 12, height: 12 }}>
                {(status === 'found' || status === 'heading_to_pickup') && (
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

        {/* Courier card — shown once courier is found */}
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

        {/* Cancel — only while still searching */}
        {status === 'searching' && (
          <button
            onClick={() => { setActiveOrder(null); navigate('/home/customer', { state: { firstName } }) }}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            {t.cancelOrder}
          </button>
        )}
      </div>
    </div>
  )
}
