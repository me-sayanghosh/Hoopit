import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser, getCachedCurrentUser } from '../api/user.api.js'
import { getToken } from '../utils/axiosInstance.js'

/**
 * Route guard for authenticated pages.
 *
 * Behaviour:
 *   1. Quick gate — if there is NO token AND NO cached user, redirect
 *      to /login immediately (zero network requests).
 *   2. Otherwise show a spinner while we verify with the backend via
 *      GET /api/auth/me.
 *   3. If the backend returns a valid user → render children.
 *   4. If the backend returns 401 → the axios interceptor already
 *      clears the token + cache and does `window.location.replace('/login')`,
 *      but we also handle it here defensively.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    // Fast path: no token and no cached user → definitely not logged in
    const token = getToken()
    const cached = getCachedCurrentUser()

    if (!token && !cached) {
      setStatus('unauthenticated')
      return
    }

    // Verify with the backend
    let mounted = true
    getCurrentUser()
      .then(() => {
        if (mounted) setStatus('authenticated')
      })
      .catch(() => {
        // The axios 401 interceptor already handles redirect + cleanup,
        // but if for any reason we get here, mark unauthenticated.
        if (mounted) setStatus('unauthenticated')
      })

    return () => { mounted = false }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm font-semibold text-slate-400 tracking-wide">Loading…</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}
