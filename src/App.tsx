import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import { getSession } from './lib/session'
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

function AnimatedRoutes() {
  const location = useLocation()

  return (
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
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    const { mode } = getSession()
    document.documentElement.style.fontSize = mode === 'easy' ? '115%' : '100%'
  }, [])

  return <AnimatedRoutes />
}
