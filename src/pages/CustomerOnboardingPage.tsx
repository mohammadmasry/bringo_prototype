import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BringoLogo from '../components/BringoLogo'
import LangToggle from '../components/LangToggle'
import { useLang } from '../hooks/useLang'
import { setSession } from '../lib/session'
import { setActiveOrder, type StoredOrder } from '../lib/orderStore'

type Mode = 'standard' | 'easy'

const tr = {
  de: {
    back: 'Zurück',
    s1Title: 'Wie heißen Sie?',
    s1Sub: 'Nur Ihr Vorname reicht, um loszulegen.',
    label: 'Vorname',
    placeholder: 'Anna',
    continue: 'Weiter',
    s2Title: 'Wie möchten Sie die App anzeigen?',
    s2Sub: 'Sie können das jederzeit in den Einstellungen ändern.',
    standardTitle: 'Standard',
    standardDesc: 'Normales Layout - für alle Nutzer.',
    easyTitle: 'Großschrift',
    easyDesc: 'Größere Schrift und Bedienelemente - für komfortables Lesen.',
    getStarted: 'Los geht\'s',
  },
  en: {
    back: 'Back',
    s1Title: 'What should we call you?',
    s1Sub: 'Just your first name is enough to get started.',
    label: 'First name',
    placeholder: 'Anna',
    continue: 'Continue',
    s2Title: 'How would you like the app displayed?',
    s2Sub: 'You can always change this later in settings.',
    standardTitle: 'Standard',
    standardDesc: 'Normal layout - for all users.',
    easyTitle: 'Large Print',
    easyDesc: 'Bigger text and buttons - easier to read and tap.',
    getStarted: "Let's go",
  },
}

// ── Previews ────────────────────────────────────────────────────────────────

function StandardPreview({ hovered, selected }: { hovered: boolean; selected: boolean }) {
  const bright = hovered || selected
  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20 mb-4"
      style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="px-3 py-2 border-b border-white/10">
        <motion.div animate={{ width: bright ? '70%' : '40%' }} transition={{ duration: 0.4 }}
          className="h-1.5 rounded-full bg-white/30 mb-1" />
        <div className="w-24 h-2.5 rounded-full bg-white/50" />
      </div>
      <div className="p-3 space-y-2">
        <motion.div animate={{ opacity: bright ? 1 : 0.6 }} transition={{ duration: 0.3 }}
          className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div className="w-20 h-1.5 rounded-full bg-white/40 mb-2" />
          <div className="w-full h-2 rounded-full bg-white/25" />
        </motion.div>
        <motion.div animate={{ opacity: bright ? 0.8 : 0.4 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="w-16 h-1.5 rounded-full bg-white/30 mb-2" />
          <div className="w-full h-2 rounded-full bg-white/15" />
        </motion.div>
      </div>
    </div>
  )
}

function EasyPreview({ hovered, selected }: { hovered: boolean; selected: boolean }) {
  const bright = hovered || selected
  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20 mb-4"
      style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="px-3 pt-3 pb-2">
        <motion.div animate={{ width: bright ? '80%' : '55%' }} transition={{ duration: 0.4 }}
          className="h-3.5 rounded-full bg-white/60 mb-1.5" />
        <motion.div animate={{ width: bright ? '65%' : '45%' }} transition={{ duration: 0.4, delay: 0.05 }}
          className="h-3 rounded-full bg-white/40 mb-3" />
        <div className="w-full rounded-lg py-2.5 px-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <motion.div animate={{ opacity: bright ? 1 : 0.5 }} transition={{ duration: 0.3 }}
            className="w-full h-2.5 rounded-full bg-white/40 mb-1.5" />
          <div className="w-3/4 h-2.5 rounded-full bg-white/25" />
        </div>
        <motion.div animate={{ scale: bright ? 1.02 : 1 }} transition={{ type: 'spring', stiffness: 300 }}
          className="mt-2 w-full h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div className="w-16 h-2 rounded-full bg-white/60" />
        </motion.div>
      </div>
    </div>
  )
}

// ── Mode card ────────────────────────────────────────────────────────────────

function ModeCard({
  selected, onClick,
  gradient, glowColor, borderColor, checkColor,
  preview, title, desc, large,
}: {
  selected: boolean
  onClick: () => void
  gradient: string
  glowColor: string
  borderColor: string
  checkColor: string
  preview: React.ReactNode
  title: string
  desc: string
  large?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl text-left flex flex-col w-full ${large ? 'p-6' : 'p-4'}`}
      style={{
        background: selected ? gradient : hovered ? '#f1f5f9' : '#f8fafc',
        boxShadow: selected
          ? `0 16px 40px ${glowColor}`
          : hovered
            ? `0 8px 28px ${glowColor}, 0 0 0 2px ${borderColor}`
            : '0 1px 3px rgba(0,0,0,0.06)',
        border: selected ? 'none' : `2px solid ${hovered ? borderColor : '#e5e7eb'}`,
        outline: selected ? '2.5px solid rgba(255,255,255,0.25)' : 'none',
        outlineOffset: '3px',
      }}
    >
      {/* Shimmer sweep on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="shimmer"
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: selected
                ? 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)'
                : 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.75) 50%, transparent 70%)',
            }}
            initial={{ x: '-130%' }}
            animate={{ x: '230%' }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {preview}

      <p className={`font-bold mb-1 ${large ? 'text-lg' : 'text-base'} ${selected ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </p>
      <p className={`leading-relaxed ${large ? 'text-sm' : 'text-xs'} ${selected ? 'text-white/60' : 'text-gray-400'}`}>
        {desc}
      </p>

      {/* Animated checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`absolute ${large ? 'top-4 right-4 w-7 h-7' : 'top-3 right-3 w-6 h-6'} rounded-full bg-white flex items-center justify-center shadow-sm`}
          >
            <svg className={`w-3.5 h-3.5 ${checkColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerOnboardingPage() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [mode, setMode] = useState<Mode>('standard')
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const t = tr[lang]
  const locationState = location.state as { pendingOrder?: StoredOrder } | null

  const handleStep1 = () => {
    if (firstName.trim().length >= 2) setStep(2)
  }

  const handleFinish = () => {
    const name = firstName.trim()
    setSession({ firstName: name, role: 'customer', mode })
    if (locationState?.pendingOrder) {
      setActiveOrder(locationState.pendingOrder)
      navigate('/active-order', { state: { firstName: name } })
    } else {
      navigate('/home/customer', { state: { firstName: name } })
    }
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
          <motion.div
            key={i}
            className="flex-1 h-1 rounded-full"
            animate={{ background: i < step ? '#16a34a' : '#e5e7eb' }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      {/* ── Step 1: Name ── */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            className="flex-1 flex flex-col items-center justify-center px-6 -mt-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="w-full max-w-sm">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8"
                style={{ background: 'linear-gradient(135deg, #0f172a, #334155)' }}>
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-3">{t.s1Title}</h1>
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
          </motion.div>
        )}

        {/* ── Step 2: Mode picker ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="flex-1 flex flex-col px-6 pt-6 pb-10 max-w-lg mx-auto w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-3xl font-black text-gray-900 mb-2">{t.s2Title}</h1>
            <p className="text-gray-400 text-sm mb-8">{t.s2Sub}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mb-8">
              <ModeCard
                selected={mode === 'standard'}
                onClick={() => setMode('standard')}
                gradient="linear-gradient(145deg, #0f172a, #1e293b, #334155)"
                glowColor="rgba(15,23,42,0.22)"
                borderColor="#334155"
                checkColor="text-gray-900"
                title={t.standardTitle}
                desc={t.standardDesc}
                preview={<StandardPreview hovered={false} selected={mode === 'standard'} />}
              />
              <ModeCard
                selected={mode === 'easy'}
                onClick={() => setMode('easy')}
                gradient="linear-gradient(145deg, #14532d, #166534, #16a34a)"
                glowColor="rgba(22,163,74,0.22)"
                borderColor="#16a34a"
                checkColor="text-green-700"
                title={t.easyTitle}
                desc={t.easyDesc}
                large
                preview={<EasyPreview hovered={false} selected={mode === 'easy'} />}
              />
            </div>

            <motion.button
              onClick={handleFinish}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-semibold text-base text-white flex items-center justify-center gap-2 group mt-auto"
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
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
