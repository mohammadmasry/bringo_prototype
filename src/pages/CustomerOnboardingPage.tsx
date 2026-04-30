import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'

const tr = {
  de: {
    back: 'Zurück',
    title: 'Wie heißt du?',
    sub: 'Nur dein Vorname reicht, um loszulegen.',
    label: 'Vorname',
    placeholder: 'Anna',
    btn: 'Los geht\'s',
  },
  en: {
    back: 'Back',
    title: 'What should we call you?',
    sub: 'Just your first name is enough to get started.',
    label: 'First name',
    placeholder: 'Anna',
    btn: "Let's go",
  },
}

export default function CustomerOnboardingPage() {
  const [firstName, setFirstName] = useState('')
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const t = tr[lang]

  const isValid = firstName.trim().length >= 2

  const handleContinue = () => {
    if (isValid) navigate('/home/customer', { state: { firstName: firstName.trim() } })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-4">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex-1" />
        <BringoLogo />
        <div className="flex-1" />
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
        <div className="w-full max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
            style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>

          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">{t.title}</h1>
          <p className="text-gray-400 mb-8">{t.sub}</p>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t.label}</label>
            <input type="text" value={firstName} autoFocus
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
              placeholder={t.placeholder}
              autoComplete="given-name"
              className="w-full px-4 py-4 rounded-xl border-2 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors"
              style={{
                borderColor: firstName.length > 0 ? '#16a34a' : '#e5e7eb',
                boxShadow: firstName.length > 0 ? '0 0 0 4px rgba(22,163,74,0.08)' : 'none',
              }} />
          </div>

          <button onClick={handleContinue} disabled={!isValid}
            className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
            style={{
              background: isValid ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              color: isValid ? 'white' : '#9ca3af',
              boxShadow: isValid ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
            }}>
            {t.btn}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
