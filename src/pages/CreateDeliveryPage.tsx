import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { setActiveOrder } from '../lib/orderStore'
import { setSession } from '../lib/session'
import { api } from '../lib/api'
import ComingSoonSheet from '../components/ComingSoonSheet'

const PICKUP_PRESETS = [
  'CAMPUS Pfarrkirchen, Petersbogen 1',
  'Bahnhof Pfarrkirchen, Bahnhofstr. 1',
  'Edeka, Griesbacher Str. 3',
  'Stadtplatz 1, 84347 Pfarrkirchen',
]

const DROPOFF_PRESETS = [
  'Stadtplatz 12, 84347 Pfarrkirchen',
  'Ludwigstraße 8, 84347 Pfarrkirchen',
  'Ringstraße 44, 84347 Pfarrkirchen',
  'Kirchgasse 5, 84347 Pfarrkirchen',
]

const PRICES: Record<'S' | 'M' | 'L', number> = { S: 3.20, M: 4.50, L: 5.80 }

const tr = {
  de: {
    s1Title: 'Abholung', s1Sub: 'Wo soll Ihr Artikel abgeholt werden?',
    s2Title: 'Zielort', s2Sub: 'Wohin soll Ihr Artikel geliefert werden?',
    s3Title: 'Was wird geliefert?', s3Sub: 'Beschreiben Sie Ihren Artikel für den Kurier.',
    s4Title: 'Bestellung prüfen', s4Sub: 'Alles korrekt?',
    s5Title: 'Bestellung abschließen', s5Sub: 'Wie möchten Sie fortfahren?',
    pickupLabel: 'Abholadresse', dropoffLabel: 'Lieferadresse',
    orChoose: 'oder schnell wählen:',
    noteLabel: 'Nachricht an den Kurier', notePh: 'z.B. "3. OG, Klingel Schmidt"',
    optional: 'optional',
    sizeLabel: 'Paketgröße',
    sSmallTitle: 'Klein', sSmallSub: 'Umschlag, Dokumente',
    sMediumTitle: 'Mittel', sMediumSub: 'Bücher, Tragetasche',
    sLargeTitle: 'Groß', sLargeSub: 'Karton, mehrere Teile',
    stepOf: (n: number) => `Schritt ${n} von 5`,
    continue: 'Weiter', sendCode: 'Code senden',
    back: 'Zurück',
    pickup: 'Abholung', dropoff: 'Zielort',
    item: 'Artikel', size: 'Größe', price: 'Preis', estimated: 'Schätzung',
    smallLabel: 'Klein', mediumLabel: 'Mittel', largeLabel: 'Groß',
    loginBtn: 'Anmelden', loginSub: 'Ich habe bereits ein Konto',
    registerBtn: 'Registrierung', registerSub: 'Neu bei Bringo',
    emailLabel: 'E-Mail', emailPh: 'name@beispiel.de',
    usernameLabel: 'E-Mail oder Benutzername', usernamePh: 'name@beispiel.de',
    passwordLabel: 'Passwort', passwordPh: '••••••••',
    firstNameLabel: 'Vorname', firstNamePh: 'Maria',
    lastNameLabel: 'Nachname', lastNamePh: 'Müller',
    confirmPwLabel: 'Passwort bestätigen', confirmPwPh: '••••••••',
    pwMismatch: 'Passwörter stimmen nicht überein.',
    loginSubmit: 'Anmelden',
    registerSubmit: 'Los geht\'s',
  },
  en: {
    s1Title: 'Pickup', s1Sub: 'Where should your item be picked up from?',
    s2Title: 'Dropoff', s2Sub: 'Where should your item be delivered to?',
    s3Title: 'What are you sending?', s3Sub: 'Describe your item for the courier.',
    s4Title: 'Review order', s4Sub: 'Everything look right?',
    s5Title: 'Complete your order', s5Sub: 'How would you like to continue?',
    pickupLabel: 'Pickup address', dropoffLabel: 'Delivery address',
    orChoose: 'or choose quickly:',
    noteLabel: 'Message for courier', notePh: 'e.g. "3rd floor, ring Schmidt"',
    optional: 'optional',
    sizeLabel: 'Package size',
    sSmallTitle: 'Small', sSmallSub: 'Envelope, documents',
    sMediumTitle: 'Medium', sMediumSub: 'Books, bag',
    sLargeTitle: 'Large', sLargeSub: 'Box, multiple items',
    stepOf: (n: number) => `Step ${n} of 5`,
    continue: 'Continue',
    back: 'Back',
    pickup: 'Pickup', dropoff: 'Dropoff',
    item: 'Item', size: 'Size', price: 'Price', estimated: 'Estimated',
    smallLabel: 'Small', mediumLabel: 'Medium', largeLabel: 'Large',
    loginBtn: 'Login', loginSub: 'I already have an account',
    registerBtn: 'Register', registerSub: 'New to Bringo',
    emailLabel: 'Email', emailPh: 'name@example.com',
    usernameLabel: 'Email or username', usernamePh: 'name@example.com',
    passwordLabel: 'Password', passwordPh: '••••••••',
    firstNameLabel: 'First name', firstNamePh: 'Maria',
    lastNameLabel: 'Last name', lastNamePh: 'Smith',
    confirmPwLabel: 'Confirm password', confirmPwPh: '••••••••',
    pwMismatch: 'Passwords do not match.',
    loginSubmit: 'Log in',
    registerSubmit: "Let's go",
  },
}

const SIZE_COLORS: Record<'S' | 'M' | 'L', { bg: string; text: string }> = {
  S: { bg: '#f0fdf4', text: '#16a34a' },
  M: { bg: '#eff6ff', text: '#2563eb' },
  L: { bg: '#fef3c7', text: '#d97706' },
}

export default function CreateDeliveryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]
  const state = (location.state as { prefill?: { pickup: string; dropoff: string; description: string; size: 'S' | 'M' | 'L' }; conversationId?: string } | null)
  const prefill = state?.prefill
  const conversationId = state?.conversationId ?? null

  const [step, setStep] = useState(prefill ? 4 : 1)
  const [pickup, setPickup] = useState(prefill?.pickup ?? '')
  const [dropoff, setDropoff] = useState(prefill?.dropoff ?? '')
  const [description] = useState(prefill?.description ?? '')
  const [size, setSize] = useState<'S' | 'M' | 'L'>(prefill?.size ?? 'M')
  const [note, setNote] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null)
  // login form
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  // register form
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  const loginValid = loginUsername.trim().length > 0 && loginPassword.length > 0
  const registerValid =
    regFirstName.trim().length >= 2 &&
    regLastName.trim().length >= 1 &&
    regEmail.includes('@') &&
    regPassword.length >= 6 &&
    regPassword === regConfirm

  const canContinue =
    step === 1 ? pickup.trim().length >= 5
    : step === 2 ? dropoff.trim().length >= 5
    : step === 3 ? true
    : step === 5 ? (authMode === 'login' ? loginValid : authMode === 'register' ? registerValid : false)
    : true

  const placeOrder = (firstName: string) => {
    const orderId = Math.random().toString(36).slice(2, 8).toUpperCase()
    const order = { id: orderId, pickup, dropoff, description, size, note, price: PRICES[size], status: 'searching' as const }
    setActiveOrder(order)
    setSession({ role: 'customer', mode: 'standard', firstName })
    // Fire-and-forget: persist order to backend without blocking navigation
    api.orders.create({ pickup, dropoff, description, size, price: PRICES[size], note, conversationId: conversationId ?? undefined }).catch(console.error)
    navigate('/active-order', { state: { firstName } })
  }

  const goNext = () => {
    if (step < 4) {
      setStep((s) => s + 1)
    } else if (step === 4) {
      setStep(5)
    } else if (authMode === 'login') {
      placeOrder('')
    } else {
      placeOrder(regFirstName.trim())
    }
  }

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1)
    else navigate('/')
  }

  if (step === 5) {
    return <ComingSoonSheet onBack={() => setStep(4)} showFeedback feedbackPage="create-delivery" />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-6 pt-7 pb-4 border-b border-gray-100">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1" />
        <BringoLogo />
        <div className="flex-1" />
        <LangToggle />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-10 pt-8">
        {/* Step bar */}
        <div className="flex gap-1.5 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{ background: i < step ? '#16a34a' : '#e5e7eb' }}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(1)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s1Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s1Sub}</p>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.pickupLabel}</label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="CAMPUS Pfarrkirchen…"
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors mb-4"
              style={{ borderColor: pickup.length > 0 ? '#16a34a' : '#e5e7eb' }}
            />
            <p className="text-xs text-gray-400 mb-3">{t.orChoose}</p>
            <div className="space-y-2">
              {PICKUP_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPickup(p)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: pickup === p ? '#16a34a' : '#f3f4f6',
                    background: pickup === p ? '#f0fdf4' : '#f9fafb',
                    color: pickup === p ? '#15803d' : '#374151',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(2)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s2Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s2Sub}</p>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.dropoffLabel}</label>
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Stadtplatz 12…"
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors mb-4"
              style={{ borderColor: dropoff.length > 0 ? '#16a34a' : '#e5e7eb' }}
            />
            <p className="text-xs text-gray-400 mb-3">{t.orChoose}</p>
            <div className="space-y-2">
              {DROPOFF_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDropoff(p)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: dropoff === p ? '#16a34a' : '#f3f4f6',
                    background: dropoff === p ? '#f0fdf4' : '#f9fafb',
                    color: dropoff === p ? '#15803d' : '#374151',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(3)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s3Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s3Sub}</p>

            <p className="text-sm font-semibold text-gray-700 mb-3">{t.sizeLabel}</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {(['S', 'M', 'L'] as const).map((s) => {
                const selected = size === s
                const title = s === 'S' ? t.sSmallTitle : s === 'M' ? t.sMediumTitle : t.sLargeTitle
                const sub = s === 'S' ? t.sSmallSub : s === 'M' ? t.sMediumSub : t.sLargeSub
                const emoji = s === 'S' ? '📄' : s === 'M' ? '📦' : '🗃️'
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className="p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: selected ? '#16a34a' : '#e5e7eb',
                      background: selected ? '#f0fdf4' : 'white',
                    }}
                  >
                    <p className="text-2xl mb-1">{emoji}</p>
                    <p className="text-sm font-bold" style={{ color: selected ? '#15803d' : '#111827' }}>{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>
                  </button>
                )
              })}
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {t.noteLabel} <span className="font-normal text-gray-400">({t.optional})</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.notePh}
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-600 outline-none text-gray-900 placeholder-gray-300 text-sm font-medium bg-white transition-colors resize-none"
            />
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(4)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s4Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s4Sub}</p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-4">
              <div className="flex gap-3 mb-5">
                <div className="flex flex-col items-center pt-0.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div
                    className="w-px flex-1 my-1.5 border-l-2 border-dashed border-gray-300"
                    style={{ minHeight: 28 }}
                  />
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                </div>
                <div className="flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.pickup}</p>
                    <p className="text-sm font-medium text-gray-900">{pickup}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{t.dropoff}</p>
                    <p className="text-sm font-medium text-gray-900">{dropoff}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="flex-1">
                  {note ? <p className="text-sm text-gray-500">{note}</p> : null}
                </div>
                <span
                  className="text-sm font-bold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: SIZE_COLORS[size].bg, color: SIZE_COLORS[size].text }}
                >
                  {size === 'S' ? t.smallLabel : size === 'M' ? t.mediumLabel : t.largeLabel}
                </span>
              </div>
            </div>

            <div
              className="flex items-center justify-between bg-white rounded-2xl p-5 border border-green-100"
              style={{ boxShadow: '0 0 0 2px rgba(22,163,74,0.1)' }}
            >
              <div>
                <p className="text-sm font-semibold text-gray-700">{t.price}</p>
                <p className="text-xs text-gray-400">{t.estimated}</p>
              </div>
              <p className="text-3xl font-black text-gray-900">€{PRICES[size].toFixed(2)}</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(5)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s5Title}</h1>
            <p className="text-gray-400 text-sm mb-6">{t.s5Sub}</p>

            <div className="flex flex-col gap-3 mb-6">
              {(['login', 'register'] as const).map((mode) => {
                const selected = authMode === mode
                const label = mode === 'login' ? t.loginBtn : t.registerBtn
                const sub = mode === 'login' ? t.loginSub : t.registerSub
                const icon = mode === 'login'
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                return (
                  <button
                    key={mode}
                    onClick={() => setAuthMode(mode)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200"
                    style={{
                      borderColor: selected ? '#16a34a' : '#e5e7eb',
                      background: selected ? '#f0fdf4' : 'white',
                      boxShadow: selected ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: selected ? '#dcfce7' : '#f3f4f6' }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
                        style={{ color: selected ? '#16a34a' : '#6b7280' }}>
                        {icon}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base" style={{ color: selected ? '#15803d' : '#111827' }}>{label}</p>
                      <p className="text-sm text-gray-400">{sub}</p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{ borderColor: selected ? '#16a34a' : '#d1d5db', background: selected ? '#16a34a' : 'white' }}
                    >
                      {selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {authMode === 'login' && (
              <div className="animate-fade-in-up space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.usernameLabel}</label>
                  <input
                    type="email"
                    value={loginUsername}
                    autoFocus
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder={t.usernamePh}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                    style={{ borderColor: loginUsername.length > 0 ? '#16a34a' : '#e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.passwordLabel}</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.passwordPh}
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                    style={{ borderColor: loginPassword.length > 0 ? '#16a34a' : '#e5e7eb' }}
                  />
                </div>
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
                  style={{
                    background: canContinue ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
                    color: canContinue ? 'white' : '#9ca3af',
                    boxShadow: canContinue ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
                  }}
                >
                  {t.loginSubmit}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}

            {authMode === 'register' && (
              <div className="animate-fade-in-up space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.firstNameLabel}</label>
                    <input
                      type="text"
                      value={regFirstName}
                      autoFocus
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder={t.firstNamePh}
                      autoComplete="given-name"
                      className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                      style={{ borderColor: regFirstName.length > 0 ? '#16a34a' : '#e5e7eb' }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t.lastNameLabel}</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder={t.lastNamePh}
                      autoComplete="family-name"
                      className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                      style={{ borderColor: regLastName.length > 0 ? '#16a34a' : '#e5e7eb' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.emailLabel}</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t.emailPh}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                    style={{ borderColor: regEmail.includes('@') ? '#16a34a' : '#e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.passwordLabel}</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t.passwordPh}
                    autoComplete="new-password"
                    className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                    style={{ borderColor: regPassword.length >= 6 ? '#16a34a' : '#e5e7eb' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.confirmPwLabel}</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder={t.confirmPwPh}
                    autoComplete="new-password"
                    className="w-full px-4 py-3.5 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                    style={{ borderColor: regConfirm.length > 0 && regConfirm === regPassword ? '#16a34a' : '#e5e7eb' }}
                  />
                  {regConfirm.length > 0 && regConfirm !== regPassword && (
                    <p className="text-xs text-red-500 mt-1.5">{t.pwMismatch}</p>
                  )}
                </div>
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
                  style={{
                    background: canContinue ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
                    color: canContinue ? 'white' : '#9ca3af',
                    boxShadow: canContinue ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
                  }}
                >
                  {t.registerSubmit}
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {step !== 5 && (
          <div className="mt-auto pt-8">
            <button
              onClick={goNext}
              disabled={!canContinue}
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
              style={{
                background: canContinue ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
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
        )}
      </div>
    </div>
  )
}
