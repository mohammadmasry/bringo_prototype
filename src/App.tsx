import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { getSession } from './lib/session'
import { getTextSize, applyTextSize } from './lib/textSize'
import TextSizeToggle from './components/TextSizeToggle'
import LoginPage from './pages/LoginPage'
import CourierLoginPage from './pages/CourierLoginPage'
import PartnerPage from './pages/PartnerPage'
import RegisterPage from './pages/RegisterPage'
import OtpPage from './pages/OtpPage'
import RolePickerPage from './pages/RolePickerPage'
import CourierOnboardingPage from './pages/CourierOnboardingPage'
import CustomerOnboardingPage from './pages/CustomerOnboardingPage'
import CourierHomePage from './pages/CourierHomePage'
import CustomerHomePage from './pages/CustomerHomePage'
import CreateDeliveryPage from './pages/CreateDeliveryPage'
import EasyOrderPage from './pages/EasyOrderPage'
import CustomerActiveOrderPage from './pages/CustomerActiveOrderPage'
import CourierActiveOrderPage from './pages/CourierActiveOrderPage'
import PrototypeDashboard from './pages/PrototypeDashboard'
import ProfitLossCalculator from './pages/ProfitLossCalculator.tsx'

const LAST_PATH_KEY = 'bringo-last-path'
const NO_RESTORE = new Set(['/', '/otp', '/register'])

function RouteMemory() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem(LAST_PATH_KEY)
    if (saved && !NO_RESTORE.has(saved) && location.pathname === '/') {
      navigate(saved, { replace: true })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LAST_PATH_KEY, location.pathname)
  }, [location.pathname])

  return null
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
    <RouteMemory />
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public landing ── */}
        <Route path="/" element={<PageTransition><LoginPage /></PageTransition>} />

        {/* ── Courier ── */}
        <Route path="/courier-login" element={<PageTransition><CourierLoginPage /></PageTransition>} />
        <Route path="/home/courier" element={<PageTransition><CourierHomePage /></PageTransition>} />
        <Route path="/onboarding/courier" element={<PageTransition><CourierOnboardingPage /></PageTransition>} />
        <Route path="/active-delivery" element={<PageTransition><CourierActiveOrderPage /></PageTransition>} />

        {/* ── Business partner ── */}
        <Route path="/partner" element={<PageTransition><PartnerPage /></PageTransition>} />

        {/* ── Customer ── */}
        <Route path="/create-delivery" element={<PageTransition><CreateDeliveryPage /></PageTransition>} />
        <Route path="/easy-order" element={<PageTransition><EasyOrderPage /></PageTransition>} />
        <Route path="/active-order" element={<PageTransition><CustomerActiveOrderPage /></PageTransition>} />
        <Route path="/home/customer" element={<PageTransition><CustomerHomePage /></PageTransition>} />
        <Route path="/onboarding/customer" element={<PageTransition><CustomerOnboardingPage /></PageTransition>} />

        {/* ── Auth (kept for internal/legacy flows) ── */}
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/otp" element={<PageTransition><OtpPage /></PageTransition>} />
        <Route path="/welcome" element={<PageTransition><RolePickerPage /></PageTransition>} />

        {/* ── Presentation ── */}
        <Route path="/prototype" element={<PrototypeDashboard />} />
        <Route path="/calculator" element={<ProfitLossCalculator />} />
      </Routes>
    </AnimatePresence>
    </>
  )
}

export default function App() {
  useEffect(() => {
    applyTextSize(getTextSize())
    const { mode } = getSession()
    if (mode === 'easy') document.documentElement.style.fontSize = '115%'
  }, [])

  return (
    <>
      <AnimatedRoutes />
      <TextSizeToggle />
    </>
  )
}
