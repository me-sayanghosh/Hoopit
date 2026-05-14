import { useState } from 'react'
import { Link } from 'react-router-dom'
import { loginUser } from '../api/user.api.js'

function LoginFrom() {
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

		try {
			await loginUser(email, password)
			setMessage('You are signed in.')
			setPassword('')
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

			<label className="field">
				<span>Password</span>
				<input
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					placeholder="Enter your password"
					autoComplete="current-password"
					required
				/>
			</label>

			<div className="auth-row">
				<label className="auth-check">
					<input type="checkbox" defaultChecked />
					<span>Keep me signed in</span>
				</label>
				<button type="button" className="auth-link">
					Forgot password?
				</button>
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
