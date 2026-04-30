import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RolePickerPage from './pages/RolePickerPage'
import CourierOnboardingPage from './pages/CourierOnboardingPage'
import CustomerOnboardingPage from './pages/CustomerOnboardingPage'
import CourierHomePage from './pages/CourierHomePage'
import CustomerHomePage from './pages/CustomerHomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/welcome" element={<RolePickerPage />} />
      <Route path="/onboarding/courier" element={<CourierOnboardingPage />} />
      <Route path="/onboarding/customer" element={<CustomerOnboardingPage />} />
      <Route path="/home/courier" element={<CourierHomePage />} />
      <Route path="/home/customer" element={<CustomerHomePage />} />
    </Routes>
  )
}
