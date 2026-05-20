import { useEffect, useState } from 'react'

/**
 * Full-screen animated overlay shown after a successful login or register.
 *
 * Props:
 *   visible  – boolean, mounts/unmounts the overlay
 *   label    – short message shown under the spinner  (default: "Taking you in…")
 */
function AuthSuccessOverlay({ visible, label = 'Taking you in…' }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      // Tiny delay so the overlay fades in after the React paint
      const t = requestAnimationFrame(() => setShow(true))
      return () => cancelAnimationFrame(t)
    } else {
      setShow(false)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease',
        gap: 20,
      }}
      aria-live="polite"
      aria-label="Redirecting…"
    >
      {/* Animated ring */}
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        {/* Outer pulsing ring */}
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.12)',
          animation: 'authPulse 1.4s ease-out infinite',
        }} />
        {/* Spinner track */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          style={{ position: 'absolute', inset: 0, animation: 'authSpin 0.9s linear infinite' }}
        >
          <circle
            cx="36"
            cy="36"
            r="28"
            stroke="#e5e7eb"
            strokeWidth="5"
          />
          <circle
            cx="36"
            cy="36"
            r="28"
            stroke="url(#authGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="56 120"
          />
          <defs>
            <linearGradient id="authGrad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2fa8ff" />
              <stop offset="1" stopColor="#0b64e6" />
            </linearGradient>
          </defs>
        </svg>
        {/* Checkmark in centre */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
            style={{ animation: 'authCheckPop 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.15s both' }}
          >
            <polyline
              points="5,13 11,19 21,7"
              stroke="url(#authCheckGrad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="authCheckGrad" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2fa8ff" />
                <stop offset="1" stopColor="#0b64e6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Label */}
      <p style={{
        margin: 0,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: '0.95rem',
        fontWeight: 500,
        color: '#374151',
        letterSpacing: '-0.01em',
        animation: 'authFadeUp 0.4s ease 0.1s both',
      }}>
        {label}
      </p>

      {/* Dot trail */}
      <div style={{ display: 'flex', gap: 6, animation: 'authFadeUp 0.4s ease 0.2s both' }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#2fa8ff,#0b64e6)',
              animation: `authDotBounce 0.9s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Keyframe injector */}
      <style>{`
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes authPulse {
          0%   { transform: scale(0.9); opacity: 0.7; }
          70%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes authCheckPop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes authFadeUp {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes authDotBounce {
          0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1;   }
        }
      `}</style>
    </div>
  )
}

export default AuthSuccessOverlay
