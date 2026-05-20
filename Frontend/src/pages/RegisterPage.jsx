import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import RegisterFrom from '../components/RegisterFrom.jsx'
import { googleLoginUser, registerUser } from '../api/user.api.js'
import { Link, useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'

function RegisterPage() {
  const navigate = useNavigate()
  const [showCredentials, setShowCredentials] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

  const handleGoogleSuccess = async ({ credential }) => {
    setLoading(true)
    setError('')

    try {
      await googleLoginUser(credential)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.message || 'Unable to continue with Google right now.')
    } finally {
      setLoading(false)
    }
  }

  if (showCredentials) {
    return (
      <AuthLayout>
        <RegisterFrom
          onSubmit={registerUser}
          onGoogleSubmit={googleLoginUser}
          onSuccess={() => navigate('/dashboard')}
          onBack={() => setShowCredentials(false)}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout compact>
      <div className="auth-choice">
        <div className="auth-heading">
          <h2>Create your account</h2>
          <p>Choose how you want to start.</p>
        </div>

        <button
          type="button"
          className="auth-button auth-choice-button"
          onClick={() => setShowCredentials(true)}
          disabled={loading}
        >
          Register with credentials
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        {googleClientId ? (
          <div className="google-auth-button">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign up failed. Please try again.')}
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              logo_alignment="left"
            />
          </div>
        ) : (
          <p className="auth-message is-error">Google sign up is not configured yet.</p>
        )}

        {error ? <p className="auth-message is-error">{error}</p> : null}

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Login instead
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
