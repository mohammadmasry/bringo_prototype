import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'

type Role = 'courier' | 'customer'

interface RoleCardProps {
  role: Role
  selected: boolean
  onClick: () => void
  title: string
  description: string
  badge: string
  features: string[]
  gradient: string
  glowColor: string
  icon: React.ReactNode
}

function RoleCard({
  selected,
  onClick,
  title,
  description,
  badge,
  features,
  gradient,
  glowColor,
  icon,
}: RoleCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300"
      style={{
        background: gradient,
        transform: selected ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: selected
          ? `0 24px 60px ${glowColor}`
          : '0 4px 24px rgba(0,0,0,0.12)',
        outline: selected ? '2px solid rgba(255,255,255,0.25)' : 'none',
        outlineOffset: '3px',
      }}
    >
      {/* Decorative blob top-right */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-56 h-56 rounded-full opacity-[0.15]"
        style={{ background: 'white', transform: 'translate(35%, -35%)' }}
      />
      {/* Decorative blob bottom-left */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-[0.08]"
        style={{ background: 'white', transform: 'translate(-35%, 35%)' }}
      />

      <div className="relative z-10 p-8 flex flex-col h-full">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5 transition-colors group-hover:bg-white/25">
          {icon}
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-4 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-75" />
          <span className="text-xs font-semibold text-white/90">{badge}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-6">{description}</p>

        {/* Features */}
        <div className="space-y-2.5 mb-8">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-white/60 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-white/80 font-medium">{f}</span>
            </div>
          ))}
        </div>

        {/* Select row */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-white/50">
            {selected ? 'Selected ✓' : 'Select'}
          </span>
          <div
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
            style={{
              background: selected ? 'rgba(255,255,255,0.9)' : 'transparent',
              borderColor: selected ? 'white' : 'rgba(255,255,255,0.35)',
            }}
          >
            {selected && (
              <svg
                className="w-3.5 h-3.5 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RolePickerPage() {
  const [selected, setSelected] = useState<Role | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const phone = (location.state as { phone?: string } | null)?.phone ?? '+49 ···'

  const maskedPhone = phone.replace(/(\+49 \d{3})\d+(\d{3})/, '$1 ···$2')

  const handleContinue = () => {
    if (selected) navigate(`/onboarding/${selected}`, { state: { phone } })
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8fafc' }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100/80">
        <BringoLogo />
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
        >
          Use a different number
        </button>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-3xl">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 mb-6 shadow-sm">
              <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-semibold text-gray-600 tracking-wide">
                {maskedPhone}
              </span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-3">
              How do you want to
              <br />
              <span className="gradient-text">use Bringo?</span>
            </h1>
            <p className="text-gray-400 text-base">
              Choose your role — you can always add the other one later.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <RoleCard
              role="courier"
              selected={selected === 'courier'}
              onClick={() => setSelected('courier')}
              title="Student Courier"
              description="Accept nearby delivery requests and earn money on your own schedule. Perfect alongside your studies."
              badge="Up to €603 / month"
              features={['Flexible hours — your schedule', 'Minijob-friendly earnings', 'Verified student community']}
              gradient="linear-gradient(145deg, #14532d 0%, #166534 45%, #16a34a 100%)"
              glowColor="rgba(22,163,74,0.3)"
              icon={
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              }
            />

            <RoleCard
              role="customer"
              selected={selected === 'customer'}
              onClick={() => setSelected('customer')}
              title="Customer"
              description="Post a delivery request — a nearby verified student picks it up and delivers it straight to you."
              badge="Fast &amp; affordable"
              features={['Live map tracking', 'Verified, trusted couriers', 'Direct phone contact']}
              gradient="linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
              glowColor="rgba(15,23,42,0.35)"
              icon={
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              }
            />
          </div>

          {/* Continue button — appears on selection */}
          {selected && (
            <div className="flex justify-center animate-fade-in-up">
              <button
                onClick={handleContinue}
                className="px-10 py-4 rounded-xl font-semibold text-white flex items-center gap-2.5 group transition-all duration-200"
                style={{
                  background:
                    selected === 'courier'
                      ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                      : 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
                  boxShadow:
                    selected === 'courier'
                      ? '0 6px 24px rgba(22,163,74,0.4)'
                      : '0 6px 24px rgba(15,23,42,0.4)',
                }}
              >
                Continue as {selected === 'courier' ? 'Student Courier' : 'Customer'}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
