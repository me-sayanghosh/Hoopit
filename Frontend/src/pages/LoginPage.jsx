import AuthLayout from '../components/AuthLayout.jsx'
import LoginFrom from '../components/LoginFrom.jsx'
import { loginUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <LoginFrom onSubmit={loginUser} onSuccess={() => navigate('/dashboard')} />
    </AuthLayout>
  )
}

export default LoginPage