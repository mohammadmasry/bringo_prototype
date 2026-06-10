import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { setSession } from '../lib/session'

const tr = {
  de: {
    back: 'Zurück',
    badge: 'Für Kuriere',
    title: 'Kurier-Zugang',
    sub: 'Geben Sie Ihren persönlichen Bringo-Code ein, um Bestellungen zu sehen und anzunehmen.',
    codeLabel: 'Ihr Kurier-Code',
    codePh: 'z.B. BRINGO-2024-XYZ',
    submit: 'Einloggen',
    noCode: 'Noch keinen Code?',
    apply: 'Jetzt bewerben',
    howTitle: 'So funktioniert es',
    steps: [
      { icon: '📋', title: 'Bestellung wählen', desc: 'Sehen Sie alle offenen Aufträge in Ihrer Nähe.' },
      { icon: '🚴', title: 'Liefern', desc: 'Holen Sie die Bestellung ab und bringen Sie sie zum Kunden.' },
      { icon: '💶', title: 'Verdienen', desc: 'Erhalten Sie Ihre Vergütung direkt nach der Lieferung.' },
    ],
  },
  en: {
    back: 'Back',
    badge: 'For couriers',
    title: 'Courier access',
    sub: 'Enter your personal Bringo code to see and accept delivery orders.',
    codeLabel: 'Your courier code',
    codePh: 'e.g. BRINGO-2024-XYZ',
    submit: 'Log in',
    noCode: "Don't have a code yet?",
    apply: 'Apply now',
    howTitle: 'How it works',
    steps: [
      { icon: '📋', title: 'Pick an order', desc: 'See all open orders near you.' },
      { icon: '🚴', title: 'Deliver', desc: 'Pick up the order and bring it to the customer.' },
      { icon: '💶', title: 'Earn', desc: 'Receive your payment right after delivery.' },
    ],
  },
}

export default function CourierLoginPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = tr[lang]

  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const isValid = code.trim().length >= 3

  const handleLogin = () => {
    if (!isValid) return
    // Mock: any code works — in production validate against DB
    setSession({ role: 'courier', mode: 'standard', firstName: code.trim() })
    navigate('/home/courier', { state: { firstName: code.trim() } })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-gray-100">
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">bringo</span>
        </div>
        <LangToggle />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-10 pt-8">

        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-6 self-start">
          <span className="text-sm">🚴</span>
          <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">{t.badge}</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{t.sub}</p>

        {/* Code input */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t.codeLabel}</label>
          <input
            type="text"
            value={code}
            autoFocus
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder={t.codePh}
            className="w-full px-4 py-4 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-mono font-semibold bg-white transition-colors tracking-wider"
            style={{ borderColor: code.length > 0 ? '#16a34a' : '#e5e7eb', boxShadow: code.length > 0 ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none' }}
          />
          {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
        </div>

        <button
          onClick={handleLogin}
          disabled={!isValid}
          className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 group transition-all duration-200 mb-6"
          style={{
            background: isValid ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
            color: isValid ? 'white' : '#9ca3af',
            boxShadow: isValid ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
          }}
        >
          {t.submit}
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        <p className="text-center text-sm text-gray-500 mb-10">
          {t.noCode}{' '}
          <button onClick={() => navigate('/partner')}
            className="font-semibold text-green-700 hover:text-green-800 underline underline-offset-2 transition-colors">
            {t.apply}
          </button>
        </p>

        {/* How it works */}
        <div className="border-t border-gray-100 pt-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t.howTitle}</p>
          <div className="space-y-4">
            {t.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">{step.icon}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{step.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
