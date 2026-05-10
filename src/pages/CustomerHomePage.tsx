import { useLocation, useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'

const tr = {
  de: {
    greet: (name: string) => {
      const h = new Date().getHours()
      return `${h < 12 ? 'Guten Morgen' : h < 18 ? 'Guten Tag' : 'Guten Abend'}, ${name} 👋`
    },
    title: 'Was brauchst du?',
    ctaTitle: 'Lieferung erstellen',
    ctaSub: 'Ein verifizierter Student holt es ab und bringt es zu dir.',
    areaLabel: 'Gebiet', deliveryLabel: 'Ø Lieferzeit',
    ordersTitle: 'Deine Aufträge',
    emptyTitle: 'Noch keine Aufträge', emptySub: 'Deine Lieferungen werden hier angezeigt',
  },
  en: {
    greet: (name: string) => {
      const h = new Date().getHours()
      return `Good ${h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}, ${name} 👋`
    },
    title: 'What do you need?',
    ctaTitle: 'Create a delivery',
    ctaSub: 'A verified student picks it up and brings it to you.',
    areaLabel: 'Area', deliveryLabel: 'Avg. delivery',
    ordersTitle: 'Your orders',
    emptyTitle: 'No orders yet', emptySub: 'Your deliveries will appear here',
  },
}

export default function CustomerHomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { firstName = 'there' } = (location.state as { firstName?: string } | null) ?? {}
  const { lang, setLang } = useLang()
  const t = tr[lang]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
              {firstName[0]?.toUpperCase()}
            </div>
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <p className="text-sm text-gray-400 font-medium">{t.greet(firstName)}</p>
          <h1 className="text-2xl font-black text-gray-900">{t.title}</h1>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 max-w-lg mx-auto w-full">
        {/* Main CTA */}
        <button onClick={() => navigate('/create-delivery', { state: { firstName } })}
          className="w-full text-left rounded-2xl p-6 mb-4 group transition-all duration-200 hover:shadow-lg active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 50%, #16a34a 100%)' }}>
          <div className="flex items-start justify-between mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-white/50 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{t.ctaTitle}</h2>
          <p className="text-white/60 text-sm">{t.ctaSub}</p>
        </button>

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

        {/* Orders section */}
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
      </div>

    </div>
  )
}
