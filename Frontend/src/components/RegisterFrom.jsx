import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../api/user.api.js'

function RegisterFrom() {
	const [name, setName] = useState('')
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
			await registerUser(name, email, password)
			setMessage('Account created successfully.')
			setName('')
			setEmail('')
			setPassword('')
		} catch (err) {
			setError(err?.message || 'Unable to create your account right now.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form className="auth-form" onSubmit={handleSubmit}>
			<div className="auth-heading">
				<h2>Create your account</h2>
				<p>Set up access in a few quick steps.</p>
			</div>

			<label className="field">
				<span>Full name</span>
				<input
					type="text"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Your name"
					autoComplete="name"
					required
				/>
			</label>

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
					placeholder="Create a password"
					autoComplete="new-password"
					required
				/>
			</label>

			<p className="auth-note">Use at least one clear, memorable password you can keep secure.</p>

			<button type="submit" className="auth-button" disabled={loading}>
				{loading ? 'Creating account...' : 'Register'}
			</button>

			{message ? <p className="auth-message is-success">{message}</p> : null}
			{error ? <p className="auth-message is-error">{error}</p> : null}

			<p className="auth-switch">
				Already have an account?{' '}
				<Link to="/login" className="auth-link">
					Login instead
				</Link>
			</p>
		</form>
	)
}

export default RegisterFrom
