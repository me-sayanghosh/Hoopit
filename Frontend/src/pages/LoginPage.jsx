import AuthLayout from '../components/AuthLayout.jsx'
import LoginFrom from '../components/LoginFrom.jsx'

function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your account."
    >
      <LoginFrom />
    </AuthLayout>
  )
}

export default LoginPage