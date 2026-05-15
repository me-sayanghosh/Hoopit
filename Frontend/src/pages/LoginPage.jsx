import AuthLayout from '../components/AuthLayout.jsx'
import LoginFrom from '../components/LoginFrom.jsx'
import { loginUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your account."
    >
      <LoginFrom onSubmit={loginUser} onSuccess={() => navigate('/dashboard')} />
    </AuthLayout>
  )
}

export default LoginPage