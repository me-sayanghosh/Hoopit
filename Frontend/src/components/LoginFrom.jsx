import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthPasswordField from './AuthPasswordField.jsx'

function LoginFrom({ onSubmit, onSuccess }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()
		setLoading(true)
		setError('')
		setMessage('')

		const emailRegex = /^\S+@\S+\.\S+$/;
		if (!emailRegex.test(email)) {
			setError('Please enter a valid email address.')
			setLoading(false)
			return
		}

		try {
			await onSubmit(email, password)
			setPassword('')
			setMessage('You are signed in.')
			if (onSuccess) {
				onSuccess()
			}
		} catch (err) {
			setError(err?.message || 'Unable to sign in right now.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form className="auth-form" onSubmit={handleSubmit}>
			<div className="auth-heading">
				<h2>Welcome back</h2>
				<p>Use your email and password to continue.</p>
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

			<AuthPasswordField
				label="Password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				placeholder="Enter your password"
				autoComplete="current-password"
			/>

			<div className="auth-row">
				<label className="auth-check">
					<input type="checkbox" defaultChecked />
					<span>Keep me signed in</span>
				</label>
				<Link to="/forgot-password" className="auth-link">
					Forgot password?
				</Link>
			</div>

			<button type="submit" className="auth-button" disabled={loading}>
				{loading ? 'Signing in...' : 'Login'}
			</button>

			{message ? <p className="auth-message is-success">{message}</p> : null}
			{error ? <p className="auth-message is-error">{error}</p> : null}

			<p className="auth-switch">
				New here?{' '}
				<Link to="/register" className="auth-link">
					Create an account
				</Link>
			</p>
		</form>
	)
}

export default LoginFrom
