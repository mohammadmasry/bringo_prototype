import { useNavigate, useParams } from 'react-router-dom'
import BringoLogo from '../components/BringoLogo'

export default function OnboardingPage() {
  const { role } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const isCourier = role === 'courier'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#f8fafc' }}>
      <div className="mb-8">
        <BringoLogo />
      </div>
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{
          background: isCourier
            ? 'linear-gradient(135deg, #16a34a, #14532d)'
            : 'linear-gradient(135deg, #334155, #0f172a)',
        }}
      >
        {isCourier ? (
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="white">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        ) : (
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
        )}
      </div>

      <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">
        {isCourier ? 'Student Courier' : 'Customer'} Onboarding
      </h1>
      <p className="text-gray-400 text-center mb-2">
        {isCourier
          ? 'Next: your name, date of birth, and university email.'
          : 'Next: just your first name and you\'re good to go.'}
      </p>
      <p className="text-sm text-gray-300 mb-10 text-center">
        This step is coming in the next iteration.
      </p>

      <button
        onClick={() => navigate('/welcome')}
        className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
      >
        ← Back to role selection
      </button>
    </div>
  )
}
