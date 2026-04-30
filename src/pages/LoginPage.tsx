import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'

function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  // Strip country code if user typed/pasted it (+4915... or 4915... or 015...)
  if (digits.startsWith('49')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  digits = digits.slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()

  const digits = phone.replace(/\s/g, '')
  const isValid = digits.length >= 9

  const handleContinue = () => {
    if (isValid) navigate('/welcome', { state: { phone: `+49 ${phone}` } })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden relative">
      {/* Background glows */}
      <div
        className="pointer-events-none fixed top-0 right-0"
        style={{
          width: 720,
          height: 720,
          background: 'radial-gradient(circle, rgba(187,247,208,0.5) 0%, transparent 65%)',
          transform: 'translate(35%, -35%)',
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0"
        style={{
          width: 480,
          height: 480,
          background: 'radial-gradient(circle, rgba(220,252,231,0.35) 0%, transparent 65%)',
          transform: 'translate(-35%, 35%)',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center px-8 py-6">
        <BringoLogo />
      </nav>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <div className="w-full max-w-[420px]">

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
            <span className="text-xs font-semibold text-green-700 tracking-wide uppercase">
              Now live in Germany
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-black leading-none mb-4">
            <span className="block text-[52px] text-gray-900">Login</span>
            <span className="block text-[52px] gradient-text">or join.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            Local deliveries by verified students.
          </p>

          {/* Phone input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              German phone number
            </label>
            <div
              className="flex items-stretch rounded-xl overflow-hidden transition-all duration-200"
              style={{
                border: '2px solid',
                borderColor: phone.length > 0 ? '#16a34a' : '#e5e7eb',
                boxShadow:
                  phone.length > 0
                    ? '0 0 0 4px rgba(22,163,74,0.08)'
                    : 'none',
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

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 group transition-all duration-200 mb-5"
            style={{
              background: isValid
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : '#f3f4f6',
              color: isValid ? 'white' : '#9ca3af',
              boxShadow: isValid
                ? '0 4px 16px rgba(22,163,74,0.35)'
                : 'none',
            }}
          >
            Continue
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center py-5">
        <p className="text-xs text-gray-300">© 2026 Bringo · Made for students, by students</p>
      </div>
    </div>
  )
}
