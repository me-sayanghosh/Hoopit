import AuthLayout from '../components/AuthLayout.jsx'
import LoginFrom from '../components/LoginFrom.jsx'
import { googleLoginUser, loginUser } from '../api/user.api.js'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()

  return (
    <AuthLayout>
      <LoginFrom
        onSubmit={loginUser}
        onGoogleSubmit={googleLoginUser}
        onSuccess={() => navigate('/dashboard')}
      />
    </AuthLayout>
  )
}

export default LoginPage
