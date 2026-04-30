import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Lang = 'de' | 'en'

const translations = {
  de: {
    badge: 'Jetzt verfügbar in Deutschland',
    h1: 'Anmelden',
    h2: 'oder beitreten.',
    subtitle: 'Lokale Lieferungen von verifizierten Studierenden.',
    phoneLabel: 'Deutsche Handynummer',
    continue: 'Weiter',
    leftH1a: 'Lokale Lieferungen',
    leftH1b: 'von verifizierten',
    leftH1c: 'Studierenden.',
    leftSub: 'Schnell, vertrauenswürdig, günstig — getragen von deiner Uni-Community.',
    activeDelivery: 'Aktive Lieferung',
    f1: 'Nur verifizierte Studierende',
    f2: 'Live-GPS-Tracking',
    f3: 'Direkter Kontakt zum Kurier',
    footer: '© 2026 Bringo · Deutschland',
  },
  en: {
    badge: 'Now live in Germany',
    h1: 'Login',
    h2: 'or join.',
    subtitle: 'Local deliveries by verified students.',
    phoneLabel: 'German phone number',
    continue: 'Continue',
    leftH1a: 'Local deliveries',
    leftH1b: 'by verified',
    leftH1c: 'students.',
    leftSub: 'Fast, trusted, affordable — powered by your university community.',
    activeDelivery: 'Active Delivery',
    f1: 'Verified university students only',
    f2: 'Live GPS tracking',
    f3: 'Direct courier contact',
    footer: '© 2026 Bringo · Germany',
  },
}

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('49')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-1">
      {(['de', 'en'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200"
          style={{
            background: lang === l ? 'white' : 'transparent',
            color: lang === l ? '#111827' : '#9ca3af',
            boxShadow: lang === l ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          <span>{l === 'de' ? '🇩🇪' : '🇬🇧'}</span>
          <span className="uppercase">{l}</span>
        </button>
      ))}
    </div>
  )
}

function MockOrderCard({ activeLabel }: { activeLabel: string }) {
  return (
    <div
      className="rounded-2xl p-5 border border-white/10"
      style={{ background: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-300 pulse-dot inline-block" />
        <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">
          {activeLabel}
        </span>
      </div>

      {/* Route visualization */}
      <div className="flex gap-3 mb-4">
        {/* Left: dots + animated line */}
        <div className="flex flex-col items-center pt-0.5 shrink-0">
          {/* Pickup — pulsing ring */}
          <div className="relative" style={{ width: 12, height: 12 }}>
            <div className="absolute inset-0 rounded-full bg-green-400/40 animate-ping" />
            <div className="relative w-3 h-3 rounded-full bg-green-400" />
          </div>

          {/* Line + moving courier dot */}
          <div className="relative my-1.5" style={{ width: 2, minHeight: 30, flex: 1 }}>
            <div
              className="absolute inset-0"
              style={{ borderLeft: '2px dashed rgba(255,255,255,0.2)' }}
            />
            <div
              className="absolute rounded-full bg-green-400"
              style={{
                width: 8,
                height: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'routeTravel 2.6s ease-in-out infinite',
                boxShadow: '0 0 8px rgba(74,222,128,0.9), 0 0 3px rgba(74,222,128,0.6)',
              }}
            />
          </div>

          {/* Dropoff dot */}
          <div className="w-3 h-3 rounded-full bg-white/40 shrink-0" />
        </div>

        {/* Right: addresses */}
        <div className="flex flex-col justify-between flex-1 py-0.5 gap-2">
          <span className="text-white/80 text-sm leading-tight">
            CAMPUS Pfarrkirchen, Petersbogen 1
          </span>
          <span className="text-white/60 text-sm leading-tight">
            Stadtplatz 12, 84347 Pfarrkirchen
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span className="text-white/60 text-xs font-semibold">4.9</span>
        </div>
        <span className="text-white/50 text-xs">Jonas M. · 3 min away</span>
        <span className="text-green-300 text-xs font-bold">€3.80</span>
      </div>
    </div>
  )
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-white/10"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-white/80 text-sm font-medium">{text}</span>
    </div>
  )
}

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('de')
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  const tr = translations[lang]
  const digits = phone.replace(/\s/g, '')
  const isValid = digits.length >= 9

  const handleContinue = () => {
    if (isValid) navigate('/welcome', { state: { phone: `+49 ${phone}`, lang } })
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div
        className="hidden md:flex md:w-[48%] lg:w-[52%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden"
        style={{
          background:
            'linear-gradient(150deg, #0d3d1e 0%, #14532d 30%, #166534 65%, #16a34a 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">bringo</span>
        </div>

        {/* Center */}
        <div className="relative z-10 space-y-7">
          <div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
              {tr.leftH1a}
              <br />
              {tr.leftH1b}
              <br />
              <span className="text-green-300">{tr.leftH1c}</span>
            </h2>
            <p className="text-white/45 text-sm leading-relaxed">{tr.leftSub}</p>
          </div>

          <MockOrderCard activeLabel={tr.activeDelivery} />

          <div className="space-y-2">
            <FeaturePill
              text={tr.f1}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              }
            />
            <FeaturePill
              text={tr.f2}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              }
            />
            <FeaturePill
              text={tr.f3}
              icon={
                <svg className="w-4 h-4 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              }
            />
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">{tr.footer}</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white min-h-screen relative">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 md:px-8 md:pt-7">
          {/* Mobile-only logo */}
          <div className="md:hidden flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a, #14532d)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.686 2 6 4.686 6 8c0 1.77.734 3.37 1.91 4.51L5 22h14l-2.91-9.49A5.99 5.99 0 0 0 18 8c0-3.314-2.686-6-6-6zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">bringo</span>
          </div>
          {/* Spacer on desktop so toggle goes to the right */}
          <div className="hidden md:block" />
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16 py-10">
          <div className="w-full max-w-[400px]">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
              <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">
                {tr.badge}
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-black mb-5">
              <span className="block text-6xl lg:text-[72px] text-gray-900 leading-none">
                {tr.h1}
              </span>
              <span className="block text-6xl lg:text-[72px] gradient-text leading-none pb-2">
                {tr.h2}
              </span>
            </h1>
            <p className="text-gray-400 text-xl leading-relaxed mb-10">{tr.subtitle}</p>

            {/* Phone input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {tr.phoneLabel}
              </label>
              <div
                className="flex items-stretch rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: '2px solid',
                  borderColor: phone.length > 0 ? '#16a34a' : '#e5e7eb',
                  boxShadow:
                    phone.length > 0 ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none',
                }}
              >
                <div className="flex items-center gap-2 px-4 py-4 bg-gray-50 border-r-2 border-gray-200 shrink-0">
                  <span className="text-lg">🇩🇪</span>
                  <span className="text-sm font-bold text-gray-600">+49</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  placeholder="151 234 56789"
                  className="flex-1 px-4 py-4 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Continue */}
            <button
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200 mb-5"
              style={{
                background: isValid
                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                  : '#f3f4f6',
                color: isValid ? 'white' : '#9ca3af',
                boxShadow: isValid ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
              }}
            >
              {tr.continue}
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

            {/* Terms */}
            <p className="text-center text-xs text-gray-400 leading-relaxed">
              {lang === 'de' ? (
                <>
                  Mit dem Fortfahren stimmst du unseren{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Nutzungsbedingungen
                  </a>{' '}
                  und{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Datenschutzrichtlinien
                  </a>{' '}
                  zu.
                </>
              ) : (
                <>
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                    Privacy Policy
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
