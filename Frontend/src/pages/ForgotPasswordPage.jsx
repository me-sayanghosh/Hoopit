import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout.jsx'
import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from '../api/user.api.js'

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const emailRegex = /^\S+@\S+\.\S+$/

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const clearAlerts = () => {
    setMessage('')
    setError('')
  }

  const handleRequestCode = async (event) => {
    event.preventDefault()
    clearAlerts()

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const response = await requestPasswordReset(email)
      setMessage(response?.code ? `${response.message} Code: ${response.code}` : response?.message || 'Check your email for the verification code.')
      setStep('code')
    } catch (err) {
      setError(err?.message || 'Unable to send a reset code right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (event) => {
    event.preventDefault()
    clearAlerts()

    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6 digit verification code.')
      return
    }

    setLoading(true)
    try {
      const response = await verifyPasswordResetCode(email, code)
      setMessage(response?.message || 'Code verified. Create your new password.')
      setStep('password')
    } catch (err) {
      setError(err?.message || 'Unable to verify that code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    clearAlerts()

    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number and special character.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await resetPassword(email, code, password)
      setMessage(response?.message || 'Password reset successfully.')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => navigate('/login'), 900)
    } catch (err) {
      setError(err?.message || 'Unable to reset your password right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset password" description="Use your email verification code to set a new password.">
      <div className="auth-form">
        <div className="auth-steps" aria-label="Password reset progress">
          <span className={step === 'email' ? 'is-active' : ''}>Email</span>
          <span className={step === 'code' ? 'is-active' : ''}>Code</span>
          <span className={step === 'password' ? 'is-active' : ''}>Password</span>
        </div>

        {step === 'email' ? (
          <form className="auth-form" onSubmit={handleRequestCode}>
            <div className="auth-heading">
              <h2>Find your account</h2>
              <p>Enter the email linked to Hoopit and we will send a 6 digit code.</p>
            </div>

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          </form>
        ) : null}

        {step === 'code' ? (
          <form className="auth-form" onSubmit={handleVerifyCode}>
            <div className="auth-heading">
              <h2>Enter verification code</h2>
              <p>Use the code sent to {email}.</p>
            </div>

            <label className="field">
              <span>Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                autoComplete="one-time-code"
                className="auth-code-input"
                required
              />
            </label>

            <div className="auth-row">
              <button type="button" className="auth-link" onClick={handleRequestCode} disabled={loading}>
                Resend code
              </button>
              <button type="button" className="auth-link" onClick={() => setStep('email')}>
                Change email
              </button>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
          </form>
        ) : null}

        {step === 'password' ? (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="auth-heading">
              <h2>Create new password</h2>
              <p>Choose a strong password you have not used here before.</p>
            </div>

            <label className="field">
              <span>New password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </label>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        ) : null}

        {message ? <p className="auth-message is-success">{message}</p> : null}
        {error ? <p className="auth-message is-error">{error}</p> : null}

        <p className="auth-switch">
          Remembered it?{' '}
          <Link to="/login" className="auth-link">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
