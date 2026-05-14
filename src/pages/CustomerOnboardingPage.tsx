import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { setSession } from '../lib/session'

type Mode = 'standard' | 'easy'

const tr = {
  de: {
    back: 'Zurück',
    // Step 1
    s1Title: 'Wie heißt du?',
    s1Sub: 'Nur dein Vorname reicht, um loszulegen.',
    label: 'Vorname',
    placeholder: 'Anna',
    continue: 'Weiter',
    // Step 2
    s2Title: 'Wie möchtest du bestellen?',
    s2Sub: 'Du kannst das jederzeit in den Einstellungen ändern.',
    standardTitle: 'Standard',
    standardDesc: 'Schritt-für-Schritt Formular mit voller Kontrolle.',
    easyTitle: 'Einfacher Modus',
    easyDesc: 'Beschreibe einfach, was du brauchst — unser Assistent erledigt den Rest.',
    standardTag: 'Für alle',
    easyTag: 'Empfohlen für ältere Nutzer',
    getStarted: 'Los geht\'s',
  },
  en: {
    back: 'Back',
    // Step 1
    s1Title: 'What should we call you?',
    s1Sub: 'Just your first name is enough to get started.',
    label: 'First name',
    placeholder: 'Anna',
    continue: 'Continue',
    // Step 2
    s2Title: 'How do you prefer to order?',
    s2Sub: 'You can always change this later in settings.',
    standardTitle: 'Standard',
    standardDesc: 'Step-by-step form with full control over your order.',
    easyTitle: 'Easy Mode',
    easyDesc: "Just describe what you need — our AI assistant handles the rest.",
    standardTag: 'For everyone',
    easyTag: 'Recommended for seniors',
    getStarted: "Let's go",
  },
}

function StandardPreview() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="px-3 py-2 border-b border-white/10">
        <div className="w-16 h-1.5 rounded-full bg-white/30 mb-1" />
        <div className="w-24 h-2.5 rounded-full bg-white/50" />
      </div>
      <div className="p-3 space-y-2">
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="w-20 h-1.5 rounded-full bg-white/40 mb-2" />
          <div className="w-full h-2 rounded-full bg-white/25" />
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-16 h-1.5 rounded-full bg-white/30 mb-2" />
          <div className="w-full h-2 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  )
}

function EasyPreview() {
  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20 mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="px-3 pt-3 pb-2">
        <div className="w-28 h-3.5 rounded-full bg-white/60 mb-1.5" />
        <div className="w-36 h-3 rounded-full bg-white/40 mb-3" />
        <div className="w-full rounded-lg py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="w-full h-2.5 rounded-full bg-white/40 mb-1.5" />
          <div className="w-3/4 h-2.5 rounded-full bg-white/25" />
        </div>
        <div className="mt-2 w-full h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="w-16 h-2 rounded-full bg-white/60" />
        </div>
      </div>
    </div>
  )
}

export default function CustomerOnboardingPage() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [mode, setMode] = useState<Mode>('standard')
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = tr[lang]

  const handleStep1 = () => {
    if (firstName.trim().length >= 2) setStep(2)
  }

  const handleFinish = () => {
    const name = firstName.trim()
    setSession({ firstName: name, role: 'customer', mode })
    navigate('/home/customer', { state: { firstName: name } })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-4">
        <button
          onClick={() => step === 1 ? navigate('/welcome') : setStep(1)}
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

      {/* Step bar */}
      <div className="flex gap-1.5 px-6 pb-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ background: i < step ? '#16a34a' : '#e5e7eb' }} />
        ))}
      </div>

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-8">
          <div className="w-full max-w-sm">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
              style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>

            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">{t.s1Title}</h1>
            <p className="text-gray-400 mb-8">{t.s1Sub}</p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t.label}</label>
              <input
                type="text" value={firstName} autoFocus
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStep1()}
                placeholder={t.placeholder}
                autoComplete="given-name"
                className="w-full px-4 py-4 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
                style={{
                  borderColor: firstName.length > 0 ? '#16a34a' : '#e5e7eb',
                  boxShadow: firstName.length > 0 ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none',
                }}
              />
            </div>

            <button
              onClick={handleStep1}
              disabled={firstName.trim().length < 2}
              className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
              style={{
                background: firstName.trim().length >= 2 ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
                color: firstName.trim().length >= 2 ? 'white' : '#9ca3af',
                boxShadow: firstName.trim().length >= 2 ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
              }}
            >
              {t.continue}
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Mode picker ── */}
      {step === 2 && (
        <div className="flex-1 flex flex-col px-6 pt-6 pb-10 max-w-lg mx-auto w-full">
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s2Title}</h1>
          <p className="text-gray-400 text-sm mb-8">{t.s2Sub}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Standard card */}
            <button
              onClick={() => setMode('standard')}
              className="relative rounded-2xl p-5 text-left transition-all duration-200 flex flex-col"
              style={{
                background: mode === 'standard'
                  ? 'linear-gradient(145deg, #0f172a, #1e293b, #334155)'
                  : '#f8fafc',
                boxShadow: mode === 'standard' ? '0 12px 32px rgba(15,23,42,0.25)' : 'none',
                border: mode === 'standard' ? 'none' : '2px solid #e5e7eb',
                transform: mode === 'standard' ? 'translateY(-3px)' : 'none',
              }}
            >
              <StandardPreview />
              <p className={`text-base font-bold mb-1 ${mode === 'standard' ? 'text-white' : 'text-gray-900'}`}>
                {t.standardTitle}
              </p>
              <p className={`text-xs leading-relaxed ${mode === 'standard' ? 'text-white/60' : 'text-gray-400'}`}>
                {t.standardDesc}
              </p>
              {mode === 'standard' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>

            {/* Easy card */}
            <button
              onClick={() => setMode('easy')}
              className="relative rounded-2xl p-5 text-left transition-all duration-200 flex flex-col"
              style={{
                background: mode === 'easy'
                  ? 'linear-gradient(145deg, #14532d, #166534, #16a34a)'
                  : '#f8fafc',
                boxShadow: mode === 'easy' ? '0 12px 32px rgba(22,163,74,0.3)' : 'none',
                border: mode === 'easy' ? 'none' : '2px solid #e5e7eb',
                transform: mode === 'easy' ? 'translateY(-3px)' : 'none',
              }}
            >
              <EasyPreview />
              <p className={`text-base font-bold mb-1 ${mode === 'easy' ? 'text-white' : 'text-gray-900'}`}>
                {t.easyTitle}
              </p>
              <p className={`text-xs leading-relaxed ${mode === 'easy' ? 'text-white/60' : 'text-gray-400'}`}>
                {t.easyDesc}
              </p>
              {mode === 'easy' && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2 group transition-all duration-200 mt-auto"
            style={{
              background: mode === 'easy'
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : 'linear-gradient(135deg, #334155, #0f172a)',
              boxShadow: mode === 'easy'
                ? '0 4px 16px rgba(22,163,74,0.35)'
                : '0 4px 16px rgba(15,23,42,0.3)',
            }}
          >
            {t.getStarted}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
