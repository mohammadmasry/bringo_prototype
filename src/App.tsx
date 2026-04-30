import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RolePickerPage from './pages/RolePickerPage'
import OnboardingPage from './pages/OnboardingPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/welcome" element={<RolePickerPage />} />
      <Route path="/onboarding/:role" element={<OnboardingPage />} />
    </Routes>
  )
}
