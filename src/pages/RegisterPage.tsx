import { useNavigate } from 'react-router-dom'
import ComingSoonSheet from '../components/ComingSoonSheet'

export default function RegisterPage() {
  const navigate = useNavigate()
  return <ComingSoonSheet onBack={() => navigate('/')} />
}
