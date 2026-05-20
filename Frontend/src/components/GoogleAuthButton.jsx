import { useEffect, useRef } from 'react'

/**
 * Custom-styled Google sign-in button backed by Google Identity Services.
 *
 * Uses window.google.accounts.id.renderButton internally so it receives a proper
 * Google ID Token (credential JWT) — exactly what the backend's verifyIdToken() expects.
 *
 * Works in Safari because GIS uses FedCM / redirect internally, bypassing
 * the popup-blocker and ITP (Intelligent Tracking Prevention) restrictions.
 *
 * Props:
 *   onSuccess({ credential })  – called with { credential: <ID_TOKEN_JWT> }
 *   onError(error)             – called on failure
 *   label                      – button text  (default: "Continue with Google")
 *   disabled                   – disables the button
 *   clientId                   – Google OAuth client ID (from env)
 */
function GoogleAuthButton({
  onSuccess,
  onError,
  label = 'Continue with Google',
  disabled = false,
  clientId,
}) {
  // Hidden div where GIS renders its invisible iframe button
  const hiddenRef = useRef(null)
  // Visible custom button ref so we can forward clicks
  const btnRef = useRef(null)

  useEffect(() => {
    if (!clientId || !hiddenRef.current) return

    // Wait for the GIS script to be ready (it is loaded by GoogleOAuthProvider)
    const tryInit = () => {
      if (!window.google?.accounts?.id) return false

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            // credential is the Google ID Token JWT — exactly what the backend expects
            if (onSuccess) onSuccess({ credential: response.credential })
          } else {
            if (onError) onError(response)
          }
        },
        // use_fedcm_for_prompt makes it work in Safari (avoids third-party cookie issues)
        use_fedcm_for_prompt: true,
      })

      // Render an invisible GIS button inside hiddenRef — we intercept its click
      window.google.accounts.id.renderButton(hiddenRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        // The iframe must be wide enough to be clickable
        width: 400,
      })

      return true
    }

    if (!tryInit()) {
      // GIS script may still be loading; poll briefly
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (tryInit() || attempts > 20) clearInterval(interval)
      }, 150)
      return () => clearInterval(interval)
    }
  }, [clientId, onSuccess, onError])

  // Forward our custom button's click to the hidden GIS iframe button
  const handleClick = () => {
    if (disabled) return
    const gisBtn = hiddenRef.current?.querySelector('div[role="button"]') ||
                   hiddenRef.current?.querySelector('iframe')
    if (gisBtn) {
      gisBtn.click()
    } else {
      // Fallback: trigger One Tap prompt (also Safari-safe)
      window.google?.accounts?.id?.prompt()
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Hidden GIS button — positioned off-screen, not visible but functional */}
      <div
        ref={hiddenRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: -1,
        }}
      />

      {/* Our fully custom visible button */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="google-custom-btn"
        aria-label="Continue with Google"
      >
        {/* Official Google colour logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="20"
          height="20"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>

        <span style={{ flex: 1, textAlign: 'center' }}>{label}</span>
      </button>
    </div>
  )
}

export default GoogleAuthButton
