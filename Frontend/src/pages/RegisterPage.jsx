import AuthLayout from '../components/AuthLayout.jsx'
import RegisterFrom from '../components/RegisterFrom.jsx'

function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Start organizing like a professional today."
    >
      <RegisterFrom />
    </AuthLayout>
  )
}

export default RegisterPage