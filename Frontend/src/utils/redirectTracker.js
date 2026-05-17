/**
 * Redirect Tracking Utility
 * Call this on your landing page to capture visitor ID from the redirect
 */

export const captureVisitorId = () => {
  // Try to get visitor ID from URL parameter (if passed by redirect service)
  const urlParams = new URLSearchParams(window.location.search)
  const visitorIdFromUrl = urlParams.get('visitor_id')

  if (visitorIdFromUrl) {
    // Store in both localStorage and sessionStorage
    localStorage.setItem('hoopit_visitor_id', visitorIdFromUrl)
    sessionStorage.setItem('hoopit_visitor_id', visitorIdFromUrl)
    console.log('Captured visitor ID from URL:', visitorIdFromUrl)
    return visitorIdFromUrl
  }

  // Try to generate and store a temporary visitor ID
  // This will be used if the server-side visitor cookie isn't accessible
  const existingId = localStorage.getItem('hoopit_visitor_id') || sessionStorage.getItem('hoopit_visitor_id')

  if (existingId) {
    return existingId
  }

  // Generate a random UUID-like string if no ID exists
  const tempId = 'visitor_' + Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem('hoopit_visitor_id', tempId)
  console.log('Generated temporary visitor ID:', tempId)

  return tempId
}

/**
 * Create a redirect wrapper that passes visitor ID to landing page
 * Use this if you control the redirect endpoint
 */
export const buildRedirectUrl = (baseUrl, visitorId) => {
  const url = new URL(baseUrl)
  url.searchParams.set('visitor_id', visitorId)
  return url.toString()
}
