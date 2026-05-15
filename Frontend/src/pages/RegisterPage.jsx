import AuthLayout from '../components/AuthLayout.jsx'
import RegisterFrom from '../components/RegisterFrom.jsx'
import { registerUser } from '../api/user.api.js'

function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Start organizing like a professional today."
    >
      <RegisterFrom onSubmit={registerUser} />
    </AuthLayout>
  )
}

export default RegisterPage