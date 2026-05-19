import AuthLayout from '../components/AuthLayout.jsx'
import RegisterFrom from '../components/RegisterFrom.jsx'
import { registerUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      
    >
      <RegisterFrom onSubmit={registerUser} onSuccess={() => navigate('/dashboard')} />
    </AuthLayout>
  )
}

export default RegisterPage
