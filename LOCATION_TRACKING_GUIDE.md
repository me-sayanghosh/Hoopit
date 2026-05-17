# Location Tracking Setup Guide

## Overview
The analytics system now supports precise location tracking through browser geolocation API. Users can opt-in to share their location when clicking tracked links.

## How It Works

1. **Server-side Geolocation (Fallback)**
   - Every click is tracked using IP-based geolocation (geoip-lite)
   - Location: country, region, city
   - Latitude/Longitude: extracted from IP database

2. **Client-side Geolocation (Opt-in)**
   - When a user clicks a short link, they see a banner asking for location permission
   - If allowed, precise coordinates are captured using browser's Geolocation API
   - Coordinates are sent to the analytics backend and stored with the click event

## Integration Steps

### 1. Add LocationTracker to Your Landing Pages

For pages that users are redirected to from short links:

```jsx
import LocationTracker from '@/components/LocationTracker'

export default function MyLandingPage() {
  return (
    <div>
      <LocationTracker shortUrl="myshorturl" />
      {/* Your page content */}
    </div>
  )
}
```

### 2. Pass Short URL Parameter

If you want automatic detection, the system checks for:
- `shortUrl` prop
- `from` query parameter: `?from=myshorturl`

Example redirect URL:
```
https://yourlanding.com/page?from=shorturl
```

### 3. Manual Location Tracking

For custom implementations, use the utility directly:

```javascript
import { trackUserLocation } from '@/utils/locationTracker'

// Track location for a specific short URL
await trackUserLocation('shorturl', visitorId)

// Or show banner manually
import { createLocationBanner } from '@/utils/locationTracker'

const banner = createLocationBanner(
  () => {
    // User allowed - location will be tracked
    trackUserLocation('shorturl')
  },
  () => {
    // User declined
    console.log('User declined location')
  }
)
document.body.appendChild(banner)
```

## Privacy & Permissions

- Users must explicitly grant permission to share location
- The system respects browser geolocation permissions
- No data is collected without user consent
- Server-side geolocation works as fallback without user permission

## Data Stored

Each click event now includes:

```json
{
  "clickedAt": "2024-01-15T10:30:00Z",
  "city": "New York",
  "region": "NY",
  "country": "United States",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "device": "Desktop",
  "browser": "Chrome"
}
```

## Troubleshooting

**Map shows "No coordinates available yet"**
- Make sure users have granted location permission
- Check browser console for geolocation errors
- Verify the short URL parameter is passed correctly

**Coordinates not updating in analytics**
- Allow a few seconds for the location request to complete
- Check if HTTPS is enabled (required for geolocation)
- Verify the tracking endpoint is accessible: `/api/create/track-location`

## API Endpoints

### Track Location (POST)
```
POST /api/create/track-location

Body:
{
  "shortUrl": "abc123",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "visitorId": "uuid-here" (optional)
}

Response:
{
  "success": true
}
```

### Get Analytics (GET)
```
GET /api/create/analytics
Authorization: Bearer token

Response includes:
{
  "clickMapPoints": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "city": "New York",
      "region": "NY",
      "country": "United States",
      "device": "Desktop",
      "clickedAt": "2024-01-15T10:30:00Z"
    }
  ],
  ...other analytics
}
```

## Next Steps

- Users should see a location banner appear 1.5 seconds after landing
- When they allow location access, coordinates are captured and sent to the server
- The analytics map will update with precise click locations in real-time
