import { useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'

const tr = {
  de: {
    badge: 'Jetzt verfügbar in Pfarrkirchen',
    h1: 'Lokale Lieferungen',
    h2: 'von verifizierten',
    h3: 'Studierenden.',
    sub: 'Schnell, sicher und günstig — getragen von Ihrer Uni-Community.',
    f1: '~2 Minuten', f1sub: 'Reaktionszeit',
    f2: 'Anonym', f2sub: 'Keine persönlichen Daten',
    f3: 'Von Studierenden', f3sub: 'Verifiziert & vertrauenswürdig',
    cta: 'Direkt zur Bestellung',
    ctaSub: 'Lebensmittel, Essen, Pakete & mehr',
    partner: 'Für Geschäftspartner',
    partnerSub: 'Restaurant, Supermarkt, Café',
    courier: 'Als Kurier arbeiten',
    courierSub: 'Geld verdienen als Student',
    survey: 'Zur Umfrage',
    surveySub: 'Helfen Sie uns, den Service zu verbessern',
    footer: '© 2026 Bringo · Pfarrkirchen',
    activeDelivery: 'Aktive Lieferung',
  },
  en: {
    badge: 'Now available in Pfarrkirchen',
    h1: 'Local deliveries',
    h2: 'by verified',
    h3: 'students.',
    sub: 'Fast, safe and affordable — powered by your university community.',
    f1: '~2 Minutes', f1sub: 'Response time',
    f2: 'Anonymous', f2sub: 'No personal data required',
    f3: 'By students', f3sub: 'Verified & trustworthy',
    cta: 'Go to order',
    ctaSub: 'Groceries, food, packages & more',
    partner: 'For business partners',
    partnerSub: 'Restaurant, supermarket, café',
    courier: 'Work as a courier',
    courierSub: 'Earn money as a student',
    survey: 'Take the survey',
    surveySub: 'Help us improve the service',
    footer: '© 2026 Bringo · Pfarrkirchen',
    activeDelivery: 'Active Delivery',
  },
}

function MockOrderCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl p-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-300 pulse-dot inline-block" />
        <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="flex flex-col items-center pt-0.5 shrink-0">
          <div className="relative" style={{ width: 12, height: 12 }}>
            <div className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
            <div className="relative w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="relative my-1.5" style={{ width: 2, minHeight: 30, flex: 1 }}>
            <div className="absolute inset-0" style={{ borderLeft: '2px dashed rgba(255,255,255,0.2)' }} />
            <div className="absolute rounded-full bg-green-400" style={{
              width: 8, height: 8, left: '50%', transform: 'translateX(-50%)',
              animation: 'routeTravel 2.6s ease-in-out infinite',
              boxShadow: '0 0 8px rgba(74,222,128,0.9)',
            }} />
          </div>
          <div className="w-3 h-3 rounded-full bg-white/40 shrink-0" />
        </div>
        <div className="flex flex-col justify-between flex-1 py-0.5 gap-2">
          <span className="text-white/80 text-sm leading-tight">CAMPUS Pfarrkirchen, Petersbogen 1</span>
          <span className="text-white/60 text-sm leading-tight">Stadtplatz 12, 84347 Pfarrkirchen</span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="text-white/60 text-xs font-semibold">4.9</span>
        </div>
        <span className="text-white/50 text-xs">Jonas M. · 3 min</span>
        <span className="text-green-300 text-xs font-bold">€3.80</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = tr[lang]

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (desktop only) ── */}
      <div
        className="hidden md:flex md:w-[46%] lg:w-[50%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0d3d1e 0%, #14532d 30%, #166534 65%, #16a34a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">bringo</span>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            {t.h1}<br />{t.h2}<br />
            <span className="text-green-300">{t.h3}</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">{t.sub}</p>
          <MockOrderCard label={t.activeDelivery} />
        </div>

        {/* Partner + Courier links */}
        <div className="relative z-10 flex flex-col gap-2">
          <button onClick={() => navigate('/partner')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm group w-fit">
            <span>🏪</span>
            <span className="font-medium group-hover:underline underline-offset-2">{t.partner}</span>
          </button>
          <button onClick={() => navigate('/courier-login')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm group w-fit">
            <span>🚴</span>
            <span className="font-medium group-hover:underline underline-offset-2">{t.courier}</span>
          </button>
          <p className="text-white/20 text-xs mt-1">{t.footer}</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white min-h-screen">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">bringo</span>
          </div>
          <div className="hidden md:block" />
          <LangToggle />
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-10 lg:px-16 py-10">
          <div className="w-full max-w-[400px]">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">{t.badge}</span>
            </div>

            {/* Headline (mobile only) */}
            <h1 className="md:hidden font-black mb-5 text-gray-900">
              <span className="block text-5xl leading-none">{t.h1}</span>
              <span className="block text-5xl leading-none">{t.h2}</span>
              <span className="block text-5xl leading-none text-green-600 pb-1">{t.h3}</span>
            </h1>

            {/* Feature badges */}
            <div className="grid grid-cols-3 gap-2 mb-7">
              {[
                { emoji: '⚡', label: t.f1, sub: t.f1sub },
                { emoji: '🔒', label: t.f2, sub: t.f2sub },
                { emoji: '🎓', label: t.f3, sub: t.f3sub },
              ].map(({ emoji, label, sub }) => (
                <div key={label} className="rounded-2xl border border-gray-100 p-3 text-center"
                  style={{ background: '#f8fafc' }}>
                  <div className="text-xl mb-1">{emoji}</div>
                  <p className="text-xs font-bold text-gray-900 leading-tight">{label}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => navigate('/create-delivery')}
              className="w-full py-4 rounded-2xl font-bold text-base text-white flex items-center justify-between px-5 mb-3 group transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
              }}
            >
              <div className="text-left">
                <p className="font-black text-lg leading-tight">{t.cta}</p>
                <p className="text-green-200 text-xs font-medium">{t.ctaSub}</p>
              </div>
              <svg className="w-6 h-6 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {/* Survey button */}
            <button
              onClick={() => navigate('/survey')}
              className="w-full mt-3 py-3 rounded-2xl border border-dashed border-gray-300 hover:border-green-400 text-gray-500 hover:text-green-700 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>📋</span>
              <span>{t.survey}</span>
              <span className="text-xs text-gray-400">— {t.surveySub}</span>
            </button>

          </div>
        </div>

        {/* Mobile-only: partner + courier links at bottom */}
        <div className="md:hidden flex items-center justify-center gap-6 px-6 pb-6 pt-2">
          <button onClick={() => navigate('/partner')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-700 transition-colors text-sm">
            <span>🏪</span><span className="font-medium">{t.partner}</span>
          </button>
          <span className="text-gray-200">·</span>
          <button onClick={() => navigate('/courier-login')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-green-700 transition-colors text-sm">
            <span>🚴</span><span className="font-medium">{t.courier}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
