import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import OtpPage from './pages/OtpPage'
import RolePickerPage from './pages/RolePickerPage'
import CourierOnboardingPage from './pages/CourierOnboardingPage'
import CustomerOnboardingPage from './pages/CustomerOnboardingPage'
import CourierHomePage from './pages/CourierHomePage'
import CustomerHomePage from './pages/CustomerHomePage'
import CreateDeliveryPage from './pages/CreateDeliveryPage'
import CustomerActiveOrderPage from './pages/CustomerActiveOrderPage'
import CourierActiveOrderPage from './pages/CourierActiveOrderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/otp" element={<OtpPage />} />
      <Route path="/welcome" element={<RolePickerPage />} />
      <Route path="/onboarding/courier" element={<CourierOnboardingPage />} />
      <Route path="/onboarding/customer" element={<CustomerOnboardingPage />} />
      <Route path="/home/courier" element={<CourierHomePage />} />
      <Route path="/home/customer" element={<CustomerHomePage />} />
      <Route path="/create-delivery" element={<CreateDeliveryPage />} />
      <Route path="/active-order" element={<CustomerActiveOrderPage />} />
      <Route path="/active-delivery" element={<CourierActiveOrderPage />} />
    </Routes>
  )
}
