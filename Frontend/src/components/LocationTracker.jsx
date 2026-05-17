import { useEffect, useState } from 'react'
import { trackUserLocation, createLocationBanner } from '../utils/locationTracker.js'
import { captureVisitorId } from '../utils/redirectTracker.js'

export default function LocationTracker({ shortUrl = null }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const requestLocationPermission = async () => {
      // Capture visitor ID from redirect
      const visitorId = captureVisitorId()
      
      const urlParams = new URLSearchParams(window.location.search)
      const redirectedShortUrl = shortUrl || urlParams.get('from') || null

      if (!redirectedShortUrl || shown) {
        return
      }

      if (!navigator.geolocation) {
        console.log('Geolocation not available in browser')
        return
      }

      const banner = createLocationBanner(
        async () => {
          console.log('User allowed location tracking for', redirectedShortUrl)
          const result = await trackUserLocation(redirectedShortUrl, visitorId)
          if (result) {
            console.log('Location successfully tracked')
          } else {
            console.warn('Location tracking encountered an error')
          }
        },
        () => {
          console.log('User declined location sharing')
        }
      )

      document.body.appendChild(banner)
      setShown(true)
    }

    // Small delay to ensure page is ready
    const timer = setTimeout(requestLocationPermission, 1000)

    return () => clearTimeout(timer)
  }, [shortUrl, shown])

  return null
}
