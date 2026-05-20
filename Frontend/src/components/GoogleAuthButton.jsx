import { useRef, useLayoutEffect, useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'

/**
 * Custom-styled Google sign-in button.
 *
 * Architecture: our beautiful visible button sits underneath (pointer-events:none),
 * the real GoogleLogin iframe sits above it as an invisible overlay (opacity:0).
 * Real user clicks land on the actual iframe — no .click() hacks.
 *
 * Click detection: We listen to `pointerdown` at the document capture phase.
 * Cross-origin iframes DO NOT bubble events to their parent, BUT the browser
 * fires pointerdown on the document (capture phase) with e.target = the iframe
 * element in the parent document. containerRef.contains(e.target) catches this,
 * letting us call onButtonClick() immediately when the user presses down.
 *
 * Props:
 *   onSuccess({ credential })  – Google ID Token JWT (exactly what verifyIdToken expects)
 *   onError()                  – called on failure / dismissal
 *   onButtonClick()            – called IMMEDIATELY when user presses the button
 *   label                      – visible button text
 *   disabled                   – disables interaction
 */
function GoogleAuthButton({
  onSuccess,
  onError,
  onButtonClick,
  label = 'Continue with Google',
  disabled = false,
}) {
  const containerRef = useRef(null)
  const [btnWidth, setBtnWidth] = useState(400)
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Keep iframe width synced to container width
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const sync = () => setBtnWidth(el.offsetWidth || 400)
    sync()
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(sync)
      ro.observe(el)
      return () => ro.disconnect()
    }
  }, [])

  // Detect click via document-level capture — fires before the cross-origin
  // iframe handles it, with e.target = the iframe element in our document.
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (disabled) return
      if (containerRef.current && containerRef.current.contains(e.target)) {
        setIsPressed(true)
        if (onButtonClick) {
          onButtonClick()
        }
      }
    }

    const handlePointerUp = () => {
      setIsPressed(false)
    }

    // capture: true — fires before the event reaches the iframe
    document.addEventListener('pointerdown', handlePointerDown, { capture: true })
    document.addEventListener('pointerup', handlePointerUp, { capture: true })
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      document.removeEventListener('pointerup', handlePointerUp, { capture: true })
    }
  }, [disabled, onButtonClick])

  return (
    <div
      ref={containerRef}
      onPointerEnter={() => !disabled && setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      style={{
        position: 'relative',
        width: '100%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'block',
        transition: 'transform 100ms cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 100ms ease',
        transform: isPressed 
          ? 'scale(0.96)' 
          : isHovered 
            ? 'scale(1.015)' 
            : 'scale(1)',
        filter: isPressed ? 'brightness(0.95)' : 'none',
      }}
    >
      {/* ── Layer 1 (bottom): beautiful visible button ────────────────────
          pointer-events:none — clicks fall through to the Google iframe   */}
      <div
        className="google-custom-btn"
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          opacity: disabled ? 0.55 : 1,
          userSelect: 'none',
        }}
      >
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
      </div>

      {/* ── Layer 2 (top): Google's real iframe — invisible but clickable ──
          opacity:0  → invisible, but pointer-events remain active.
          Unmounted when disabled so clicks are fully blocked.             */}
      {!disabled && (
        <div
          aria-label="Continue with Google"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            opacity: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            width={btnWidth}
            size="large"
            shape="rectangular"
            text="continue_with"
            logo_alignment="left"
          />
        </div>
      )}
    </div>
  )
}

export default GoogleAuthButton
