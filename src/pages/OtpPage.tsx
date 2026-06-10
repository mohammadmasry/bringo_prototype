import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { auth } from '../lib/firebase'
import BringoLogo from '../components/BringoLogo'
import { useLang } from '../hooks/useLang'
import { setActiveOrder, type StoredOrder } from '../lib/orderStore'
import { setSession } from '../lib/session'

const tr = {
  de: {
    title: 'Code eingeben',
    subtitle: (p: string) => `Wir haben einen 6-stelligen Code an ${p} gesendet.`,
    verify: 'Bestätigen',
    resend: 'Code erneut senden',
    resendIn: (s: number) => `Erneut senden in ${s}s`,
    back: 'Zurück',
    errCode: 'Falscher Code. Bitte erneut versuchen.',
    errSend: 'Fehler beim Senden. Bitte erneut versuchen.',
    sending: 'Code wird gesendet…',
  },
  en: {
    title: 'Enter the code',
    subtitle: (p: string) => `We sent a 6-digit code to ${p}.`,
    verify: 'Verify',
    resend: 'Resend code',
    resendIn: (s: number) => `Resend in ${s}s`,
    back: 'Back',
    errCode: 'Invalid code. Please try again.',
    errSend: 'Failed to send code. Please try again.',
    sending: 'Sending code…',
  },
}

// ── OTP 6-box input ──────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))
  const activeIdx = Math.min(value.length, 5)

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    if (!digit) return
    const next = (value + '      ').slice(0, 6).split('')
    next[i] = digit
    onChange(next.join('').trimEnd())
    if (i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const arr = value.split('')
        arr[i] = ''
        onChange(arr.join('').trimEnd())
      } else if (i > 0) {
        const arr = (value + '      ').slice(0, 6).split('')
        arr[i - 1] = ''
        onChange(arr.join('').trimEnd())
        refs.current[i - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      onChange(pasted)
      refs.current[Math.min(pasted.length, 5)]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = i < value.length
        const active = i === activeIdx
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl outline-none transition-all duration-150 disabled:opacity-40"
            style={{
              border: '2px solid',
              borderColor: active ? '#16a34a' : filled ? '#bbf7d0' : '#e5e7eb',
              background: filled ? '#f0fdf4' : '#fafafa',
              color: '#111827',
              boxShadow: active ? '0 0 0 4px rgba(22,163,74,0.1)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

const isMock = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'your_api_key_here'

// ── Page ─────────────────────────────────────────────────────────────────────
export default function OtpPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(true)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const state = (location.state as { phone?: string; redirect?: string; firstName?: string; order?: StoredOrder; mode?: 'login' | 'register' } | null) ?? {}
  const phone = state.phone ?? ''
  const redirect = state.redirect
  const pendingOrder = state.order
  const pendingFirstName = state.firstName ?? ''
  const authMode = state.mode
  const t = tr[lang]

  // redirect if no phone
  useEffect(() => {
    if (!phone) navigate('/')
  }, [phone, navigate])

  // countdown
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  // send OTP on mount
  useEffect(() => {
    if (!phone) return
    sendOtp()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendOtp = async () => {
    setSending(true)
    setError('')
    if (isMock) {
      await new Promise((r) => setTimeout(r, 1200))
      setSending(false)
      return
    }
    try {
      if (!auth) { setError(t.errSend); setSending(false); return }
      const container = document.getElementById('recaptcha-container')
      if (container) container.innerHTML = ''
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
      const result = await signInWithPhoneNumber(auth, phone.replace(/\s/g, ''), verifier)
      setConfirmation(result)
    } catch (e) {
      console.error(e)
      setError(t.errSend)
    }
    setSending(false)
  }

  const handleVerify = async () => {
    if (code.length !== 6 || loading) return

    const completeAuth = () => {
      if (redirect && pendingOrder) {
        if (authMode === 'register') {
          navigate(redirect, { state: { pendingOrder, phone } })
        } else {
          setActiveOrder(pendingOrder)
          setSession({ role: 'customer', mode: 'standard', firstName: pendingFirstName })
          navigate(redirect, { state: { firstName: pendingFirstName } })
        }
      } else {
        navigate('/welcome', { state: { phone, lang } })
      }
    }

    if (isMock) {
      completeAuth()
      return
    }
    if (!confirmation) return
    setLoading(true)
    setError('')
    try {
      await confirmation.confirm(code)
      completeAuth()
    } catch {
      setError(t.errCode)
      setCode('')
    }
    setLoading(false)
  }

  const handleResend = () => {
    setCode('')
    setError('')
    setCountdown(60)
    sendOtp()
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-7">
        <BringoLogo />
        <button
          onClick={() => navigate('/', { state: { lang } })}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t.back}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
          >
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">{t.subtitle(phone)}</p>
          {isMock && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-700">
                {lang === 'de' ? 'Demo-Modus — beliebiger 6-stelliger Code' : 'Demo mode — any 6-digit code works'}
              </span>
            </div>
          )}

          {sending ? (
            <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
              <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
              <span className="text-sm">{t.sending}</span>
            </div>
          ) : (
            <>
              <OtpBoxes
                value={code}
                onChange={(v) => { setCode(v); setError('') }}
                disabled={loading}
              />

              {error && (
                <p className="text-red-500 text-sm mt-4 animate-fade-in-up">{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={code.length !== 6 || loading}
                className="w-full py-4 rounded-xl font-semibold text-base mt-6 flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background:
                    code.length === 6
                      ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      : '#f3f4f6',
                  color: code.length === 6 ? 'white' : '#9ca3af',
                  boxShadow: code.length === 6 ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
                }}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  t.verify
                )}
              </button>

              <button
                onClick={countdown === 0 ? handleResend : undefined}
                disabled={countdown > 0}
                className="mt-4 text-sm font-medium transition-colors"
                style={{ color: countdown > 0 ? '#9ca3af' : '#16a34a' }}
              >
                {countdown > 0 ? t.resendIn(countdown) : t.resend}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
