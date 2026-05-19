import { useState } from 'react'

function EyeIcon({ hidden }) {
	return hidden ? (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M3 3l18 18" />
			<path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" />
			<path d="M9.88 4.24A10.7 10.7 0 0 1 12 4c5.5 0 9 5 9 8a8.6 8.6 0 0 1-1.72 3.9" />
			<path d="M6.61 6.61C4.4 8.08 3 10.28 3 12c0 3 3.5 8 9 8 1.74 0 3.29-.5 4.59-1.27" />
		</svg>
	) : (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	)
}

function AuthPasswordField({ label, value, onChange, placeholder, autoComplete }) {
	const [isVisible, setIsVisible] = useState(false)
	const inputId = `${autoComplete || 'password'}-field`

	return (
		<label className="field" htmlFor={inputId}>
			<span>{label}</span>
			<div className="password-field">
				<input
					id={inputId}
					type={isVisible ? 'text' : 'password'}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					autoComplete={autoComplete}
					required
				/>
				<button
					type="button"
					className="password-toggle"
					onClick={() => setIsVisible((current) => !current)}
					aria-label={isVisible ? 'Hide password' : 'Show password'}
					title={isVisible ? 'Hide password' : 'Show password'}
				>
					<EyeIcon hidden={isVisible} />
				</button>
			</div>
		</label>
	)
}

export default AuthPasswordField
