import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import LoginPage from './pages/LoginPage'
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
        <Route path="/" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/otp" element={<PageTransition><OtpPage /></PageTransition>} />
        <Route path="/welcome" element={<PageTransition><RolePickerPage /></PageTransition>} />
        <Route path="/onboarding/courier" element={<PageTransition><CourierOnboardingPage /></PageTransition>} />
        <Route path="/onboarding/customer" element={<PageTransition><CustomerOnboardingPage /></PageTransition>} />
        <Route path="/home/courier" element={<PageTransition><CourierHomePage /></PageTransition>} />
        <Route path="/home/customer" element={<PageTransition><CustomerHomePage /></PageTransition>} />
        <Route path="/create-delivery" element={<PageTransition><CreateDeliveryPage /></PageTransition>} />
        <Route path="/active-order" element={<PageTransition><CustomerActiveOrderPage /></PageTransition>} />
        <Route path="/active-delivery" element={<PageTransition><CourierActiveOrderPage /></PageTransition>} />
        <Route path="/easy-order" element={<PageTransition><EasyOrderPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return <AnimatedRoutes />
}
