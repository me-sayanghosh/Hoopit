import AuthLayout from '../components/AuthLayout.jsx'
import RegisterFrom from '../components/RegisterFrom.jsx'
import { registerUser } from '../api/user.api.js'

function RegisterPage() {
  return (
    <AuthLayout
      
    >
      <RegisterFrom onSubmit={registerUser} />
    </AuthLayout>
  )
}

export default RegisterPage