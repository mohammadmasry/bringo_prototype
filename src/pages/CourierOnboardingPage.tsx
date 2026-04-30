import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'

// ── helpers ──────────────────────────────────────────────────────────────────

function isAdult(dob: string): boolean {
  if (!dob) return false
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 18
}

// accepts @tu-*.de, @uni-*.de, @fh-*.de, @hs-*.de, @haw-*.de, @th-*.de
// also subdomains like stud.th-deg.de, student.uni-*.de, mail.fh-*.de
function isUniEmail(email: string): boolean {
  return /^[^\s@]+@([\w-]+\.)?(uni|tu|fh|hs|haw|th)-[\w-]+\.de$/i.test(email)
}

const maxDob = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().split('T')[0]
})()

// ── translations ──────────────────────────────────────────────────────────────

const tr = {
  de: {
    back: 'Zurück',
    stepOf: (n: number) => `Schritt ${n} von 3`,
    s1Title: 'Dein Name',
    s1Sub: 'Muss mit deiner Immatrikulationsbescheinigung übereinstimmen.',
    firstName: 'Vorname', lastName: 'Nachname',
    firstPh: 'Anna', lastPh: 'Müller',
    s2Title: 'Geburtsdatum',
    s2Sub: 'Kuriere müssen mindestens 18 Jahre alt sein (Jugendarbeitsschutzgesetz).',
    dobLabel: 'Geburtsdatum',
    ageOk: 'Altersvoraussetzung erfüllt',
    ageFail: 'Muss mindestens 18 Jahre alt sein',
    s3Title: 'Uni-E-Mail',
    s3Sub: 'Muss eine offizielle Hochschul-E-Mail-Adresse sein.',
    emailLabel: 'E-Mail-Adresse',
    emailPh: 'anna@stud.th-deg.de',
    emailOk: 'Gültige Hochschul-Domain',
    emailFail: '@tu-*.de · @uni-*.de · @fh-*.de · @th-*.de',
    emailHint: 'z.B. @tu-berlin.de · @uni-muenchen.de · @stud.th-deg.de',
    continue: 'Weiter', submit: 'Absenden',
    pendingBadge: 'Verifizierung ausstehend',
    s4Title: 'Du bist dabei!',
    s4Sub: 'Wir prüfen deinen Antrag — meistens innerhalb von 24 Stunden.',
    s4Note: 'Du kannst Aufträge durchstöbern, aber erst nach der Freischaltung annehmen.',
    s4Btn: 'Aufträge ansehen',
  },
  en: {
    back: 'Back',
    stepOf: (n: number) => `Step ${n} of 3`,
    s1Title: 'Your name',
    s1Sub: 'Must match your enrollment certificate exactly.',
    firstName: 'First name', lastName: 'Last name',
    firstPh: 'Anna', lastPh: 'Müller',
    s2Title: 'Date of birth',
    s2Sub: 'Couriers must be 18 or older (Jugendarbeitsschutzgesetz).',
    dobLabel: 'Date of birth',
    ageOk: 'Age requirement met',
    ageFail: 'Must be 18 or older',
    s3Title: 'University email',
    s3Sub: 'Must be an official university address.',
    emailLabel: 'Email address',
    emailPh: 'anna@stud.th-deg.de',
    emailOk: 'Valid university domain',
    emailFail: 'Use @tu-*.de · @uni-*.de · @fh-*.de · @th-*.de',
    emailHint: 'e.g. @tu-berlin.de · @uni-muenchen.de · @stud.th-deg.de',
    continue: 'Continue', submit: 'Submit',
    pendingBadge: 'Verification pending',
    s4Title: "You're in!",
    s4Sub: "We'll review your application — usually within 24 hours.",
    s4Note: "Browse available orders in the meantime. You'll need approval before accepting.",
    s4Btn: 'Browse orders',
  },
}

// ── sub-components ────────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-500"
          style={{ background: i < step ? '#16a34a' : '#e5e7eb' }} />
      ))}
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, max, min, autoComplete }: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  placeholder?: string; max?: string; min?: string; autoComplete?: string
}) {
  return (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} max={max} min={min} autoComplete={autoComplete}
        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-green-600 outline-none text-gray-900 placeholder-gray-300 text-base font-medium bg-white transition-colors" />
    </div>
  )
}

function Hint({ ok, okText, failText }: { ok: boolean; okText: string; failText: string }) {
  return (
    <p className="text-xs mt-2 font-medium flex items-center gap-1.5"
      style={{ color: ok ? '#16a34a' : '#ef4444' }}>
      {ok
        ? <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      }
      {ok ? okText : failText}
    </p>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0">
      <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </button>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function CourierOnboardingPage() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const t = tr[lang]

  const canContinue =
    step === 1 ? firstName.trim().length >= 2 && lastName.trim().length >= 2
    : step === 2 ? isAdult(dob)
    : isUniEmail(email)

  const goNext = () => { if (step < 3) setStep((s) => s + 1); else setStep(4) }
  const goBack = () => { if (step > 1) setStep((s) => s - 1); else navigate(-1) }

  // ── success ──
  if (step === 4) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t.pendingBadge}</span>
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3">{t.s4Title}</h1>
        <p className="text-gray-400 leading-relaxed mb-2 max-w-xs">{t.s4Sub}</p>
        <p className="text-gray-300 text-sm leading-relaxed mb-10 max-w-xs">{t.s4Note}</p>
        <button onClick={() => navigate('/home/courier', { state: { firstName } })}
          className="px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 group transition-all"
          style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 4px 16px rgba(22,163,74,0.35)' }}>
          {t.s4Btn}
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 pt-7 pb-4">
        <BackBtn onClick={goBack} />
        <div className="flex-1" />
        <BringoLogo />
        <div className="flex-1" />
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <div className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-10">
        <StepBar step={step} />

        {step === 1 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(1)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s1Title}</h1>
            <p className="text-gray-400 text-sm mb-8">{t.s1Sub}</p>
            <div className="flex gap-3">
              <Field label={t.firstName} value={firstName} onChange={setFirstName} placeholder={t.firstPh} autoComplete="given-name" />
              <Field label={t.lastName} value={lastName} onChange={setLastName} placeholder={t.lastPh} autoComplete="family-name" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(2)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s2Title}</h1>
            <p className="text-gray-400 text-sm mb-8">{t.s2Sub}</p>
            <Field label={t.dobLabel} type="date" value={dob} onChange={setDob} max={maxDob} min="1940-01-01" />
            {dob && <Hint ok={isAdult(dob)} okText={t.ageOk} failText={t.ageFail} />}
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">{t.stepOf(3)}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s3Title}</h1>
            <p className="text-gray-400 text-sm mb-8">{t.s3Sub}</p>
            <Field label={t.emailLabel} type="email" value={email} onChange={setEmail} placeholder={t.emailPh} autoComplete="email" />
            {email && <Hint ok={isUniEmail(email)} okText={t.emailOk} failText={t.emailFail} />}
            <p className="text-xs text-gray-300 mt-3">{t.emailHint}</p>
          </div>
        )}

        <div className="mt-auto pt-8">
          <button onClick={goNext} disabled={!canContinue}
            className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200"
            style={{
              background: canContinue ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#f3f4f6',
              color: canContinue ? 'white' : '#9ca3af',
              boxShadow: canContinue ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
            }}>
            {step === 3 ? t.submit : t.continue}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
