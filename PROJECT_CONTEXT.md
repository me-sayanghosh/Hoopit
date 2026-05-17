# Hoopit - URL Shortener with Advanced Analytics

## Project Overview

Hoopit is a full-stack URL shortening service with real-time analytics, device tracking, and geolocation mapping capabilities. It allows users to create short URLs, track clicks in detail, and visualize analytics on an interactive dashboard.

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Geolocation**: geoip-lite (IP-based), Browser Geolocation API
- **Device Detection**: UAParser
- **Authentication**: JWT-based middleware
- **Architecture**: DAO/Service/Controller pattern

### Frontend
- **Framework**: React 19.2.5
- **Router**: React Router 7.15.1
- **Build Tool**: Vite
- **Maps**: Leaflet + react-leaflet 4.2.4
- **HTTP Client**: Axios
- **Styling**: CSS

---

## Project Structure

```
Hoopit/
├── Backend/
│   ├── app.js                          # Express server entry point
│   ├── package.json                    # Dependencies
│   └── src/
│       ├── config/
│       │   ├── config.js               # Environment variables
│       │   └── mongo.config.js         # MongoDB connection
│       ├── controller/
│       │   ├── auth.controller.js      # Authentication handlers
│       │   ├── folder.controller.js    # Folder management
│       │   └── shortUrl.controller.js  # Short URL & click tracking
│       ├── dao/
│       │   ├── folder.js               # Folder data access
│       │   ├── shortUrl.js             # Short URL & geolocation data access
│       │   └── user.dao.js             # User data access
│       ├── middleware/
│       │   └── auth.middleware.js      # JWT authentication
│       ├── models/
│       │   ├── folder.model.js         # Folder schema
│       │   ├── shorturl.model.js       # Short URL schema with click events
│       │   └── user.model.js           # User schema
│       ├── routes/
│       │   ├── auth.route.js           # Auth endpoints
│       │   ├── folder.route.js         # Folder endpoints
│       │   └── shortUrl.route.js       # Short URL endpoints
│       ├── services/
│       │   ├── auth.service.js         # Auth business logic
│       │   └── shortUrl.service.js     # Analytics aggregation
│       └── utils/
│           ├── attachUser.js           # User attachment middleware
│           ├── errorHandler.js         # Global error handling
│           ├── helper.js               # Utility functions
│           └── httpError.js            # Custom error class
│
└── Frontend/
    ├── index.html                       # HTML entry
    ├── package.json                     # Dependencies
    ├── vite.config.js                  # Vite configuration
    ├── eslint.config.js                # ESLint rules
    ├── public/                          # Static assets
    └── src/
        ├── App.jsx                      # Root component
        ├── App.css                      # App styles
        ├── main.jsx                     # React entry point
        ├── index.css                    # Global styles
        ├── api/
        │   ├── shortUrlapi.js           # Short URL API calls
        │   └── user.api.js              # User API calls
        ├── components/
        │   ├── AppShell.jsx             # Layout wrapper
        │   ├── AuthLayout.jsx           # Auth page layout
        │   ├── ChannelGauge.jsx         # Analytics gauge chart
        │   ├── CreateLinkForm.jsx       # URL shortening form
        │   ├── GrowthBarChart.jsx       # Traffic growth chart
        │   ├── GeoMapView.jsx           # Leaflet map for click locations
        │   ├── LocationTracker.jsx      # Geolocation permission banner
        │   ├── LoginForm.jsx            # Login form
        │   ├── RegisterForm.jsx         # Registration form
        │   └── UrlForm.jsx              # URL editing form
        ├── pages/
        │   ├── AnalyticsPage.jsx        # Main dashboard
        │   ├── CreateShortUrlPage.jsx   # Create URL page
        │   ├── CustomersPage.jsx        # Customer analytics
        │   ├── CustomUrlPage.jsx        # Custom URL settings
        │   ├── DashboardPage.jsx        # Dashboard overview
        │   ├── FoldersPage.jsx          # Folder management
        │   ├── HomePage.jsx             # Home page
        │   ├── LoginPage.jsx            # Login page
        │   ├── MyCreationsPage.jsx      # User's short URLs
        │   ├── RegisterPage.jsx         # Registration page
        │   └── TryNowPage.jsx           # Demo page
        ├── routings/                    # Route definitions
        ├── utils/
        │   ├── axiosInstance.js         # Axios configuration
        │   ├── locationTracker.js       # Browser geolocation wrapper
        │   └── redirectTracker.js       # Visitor ID management
        └── styles/                      # Component styles
```

---

## Core Features

### 1. URL Shortening
- Create short, memorable URLs from long ones
- Optional custom short codes
- Organize URLs into folders
- Track click count and analytics

### 2. Click Tracking
Every click records:
- **IP Address**: For geolocation lookup
- **Device Type**: Desktop, Mobile, Tablet, or Other
- **Browser**: Browser name and version
- **Referrer**: Where the click came from
- **Timestamp**: When the click occurred
- **Location**: Country, Region, City, Latitude, Longitude
- **Visitor ID**: Unique identifier for the visitor

### 3. Analytics Dashboard
Real-time visualization of:
- **Traffic by Country**: Top countries with click counts
- **Traffic by City**: City-level breakdown with region fallback
- **Traffic by Device**: Device type distribution (progress bars)
- **Traffic by Browser**: Browser usage statistics
- **Interactive Map**: Leaflet map showing exact click locations with markers
- **Click Timeline**: Recent clicks with metadata
- **Growth Charts**: Traffic trends over time

### 4. Geolocation Mapping
- **Interactive Map**: Leaflet-based map with OpenStreetMap tiles
- **Click Markers**: Circle markers sized by click volume
- **Device Color-Coding**: Different colors for desktop/mobile/tablet
- **Popup Details**: Click location details on marker hover
- **Sidebar List**: Top 8 click locations with precise coordinates

### 5. User Accounts
- Registration and login
- JWT-based authentication
- User dashboard
- Personal URL management
- Analytics access

### 6. Folder Organization
- Create folders for organizing URLs
- Move URLs between folders
- Folder-level analytics
- Bulk operations

---

## Database Schema

### Short URL Model
```javascript
{
  shortCode: String,              // e.g., "abc123"
  originalUrl: String,            // Full URL
  userId: ObjectId,               // Owner
  folderId: ObjectId,             // Optional folder
  customAlias: String,            // Optional custom name
  createdAt: Date,
  expiresAt: Date,                // Optional expiration
  isActive: Boolean,
  
  clickEvents: [                  // Array of all clicks
    {
      clickedAt: Date,
      visitorId: String,          // Unique visitor ID
      ip: String,                 // IP address
      country: String,            // Country code
      region: String,             // Region/state
      city: String,               // City name
      latitude: Number,           // GPS latitude
      longitude: Number,          // GPS longitude
      referrer: String,           // HTTP referrer
      device: String,             // Device type
      browser: String             // Browser info
    }
  ]
}
```

### User Model
```javascript
{
  email: String,
  password: String,               // Hashed
  firstName: String,
  lastName: String,
  createdAt: Date,
  subscription: String,           // Free/Premium
  usageStats: {
    totalUrls: Number,
    totalClicks: Number,
    monthlyClicks: Number
  }
}
```

### Folder Model
```javascript
{
  name: String,
  userId: ObjectId,
  description: String,
  createdAt: Date,
  color: String                   // Optional color tag
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Short URLs
- `POST /api/create` - Create short URL
- `GET /r/:shortCode` - Redirect to original URL (records click)
- `GET /api/user/all-urls` - Get user's short URLs
- `GET /api/user/analytics/:shortUrl` - Get detailed analytics
- `POST /api/create/track-location` - Update click with geolocation
- `PUT /api/:id` - Update short URL
- `DELETE /api/:id` - Delete short URL

### Folders
- `POST /api/folder` - Create folder
- `GET /api/folder` - Get user's folders
- `PUT /api/folder/:id` - Update folder
- `DELETE /api/folder/:id` - Delete folder

### Analytics
- `GET /api/user/analytics/:shortUrl` - Get full analytics object

**Analytics Response Structure:**
```javascript
{
  shortUrl: String,
  originalUrl: String,
  totalClicks: Number,
  trafficByCountry: [
    { country: String, label: String, clicks: Number }
  ],
  trafficByCity: [
    { city: String, region: String, country: String, clicks: Number }
  ],
  trafficByDevice: [
    { device: String, clicks: Number, percentage: Number }
  ],
  trafficByBrowser: [
    { browser: String, clicks: Number }
  ],
  clickMapPoints: [              // For map visualization
    {
      shortUrl: String,
      city: String,
      region: String,
      country: String,
      latitude: Number,
      longitude: Number,
      device: String,
      clickedAt: Date
    }
  ],
  recentClicks: [
    { clickedAt: Date, device: String, country: String, city: String }
  ]
}
```

---

## Geolocation Tracking System

### Overview
The system captures user location through two mechanisms:
1. **IP-Based**: Automatic, always available
2. **Browser-Based**: High precision, requires user permission

### How It Works

#### 1. User Clicks Short Link
- User clicks short URL (e.g., `hoopit.com/r/abc123`)
- Backend records IP address
- `recordShortUrlClick()` extracts:
  - IP from request or edge headers
  - Device/browser from User-Agent
  - Referrer from HTTP headers
  - Visitor ID from cookie or generates new one

#### 2. Backend Geolocation Lookup
File: `Backend/src/dao/shortUrl.js` - `getLocation()` function
- Checks for Vercel/Cloudflare edge headers first (most accurate):
  - `x-vercel-ip-latitude` / `x-vercel-ip-longitude`
  - `cf-iplatitude` / `cf-iplongitude`
- Falls back to `geoip-lite.lookup(ip)` for IP geolocation
- Returns: `{country, region, city, latitude, longitude}`

#### 3. User Lands on Page
- LocationTracker component appears after 1 second
- Shows: "📍 Allow us to show you exactly where your users are clicking from"
- Buttons: "Allow" | "Not now"

#### 4. User Grants Permission
- Click "Allow" → Browser permission dialog appears
- User clicks "Allow" on browser dialog
- `navigator.geolocation.getCurrentPosition()` retrieves:
  - Latitude
  - Longitude
  - Accuracy radius

#### 5. Send Coordinates to Backend
File: `Frontend/src/utils/locationTracker.js` - `trackUserLocation()`
```javascript
POST /api/create/track-location
{
  shortUrl: "abc123",
  latitude: 28.7041,
  longitude: 77.1025,
  visitorId: "visitor_abc123xyz",
  timestamp: 1621234567890
}
```

#### 6. Backend Updates Click Record
File: `Backend/src/controller/shortUrl.controller.js` - `recordLocationForClick()`
- Finds the click event by `visitorId` (or uses most recent)
- Updates `latitude` and `longitude` fields
- Returns: `{success: true, updated: true}`

#### 7. Analytics Dashboard Reads Data
File: `Backend/src/services/shortUrl.service.js` - `getUserUrlAnalytics()`
- Aggregates all clicks with valid coordinates
- Creates `clickMapPoints` array for map rendering

#### 8. Map Displays Markers
File: `Frontend/src/components/GeoMapView.jsx`
- Receives `clickMapPoints` array
- Renders Leaflet map with OpenStreetMap tiles
- Adds CircleMarker for each click location
- Marker size = click volume at that location
- Marker color = device type (Desktop/Mobile/Tablet)
- Popup on click shows: city, region, country, device, time

---

## Visitor ID Management

### System Flow
1. **Generation**: If no visitor ID exists, generate random string
2. **Storage**: Save to localStorage with key `_hoopit_visitor_id_`
3. **Retrieval**: `captureVisitorId()` in `redirectTracker.js`
4. **Backend Storage**: Saved with each click in `clickEvents[].visitorId`
5. **Matching**: Used to find correct click for location update

### Implementation
File: `Frontend/src/utils/redirectTracker.js`
```javascript
export function captureVisitorId() {
  // 1. Check URL parameter (?visitor_id=...)
  // 2. Check localStorage
  // 3. Generate temporary ID if needed
  return visitorId
}
```

File: `Frontend/src/components/LocationTracker.jsx`
```javascript
useEffect(() => {
  const visitorId = captureVisitorId()
  // Use for location tracking
}, [])
```

---

## Frontend Components

### GeoMapView.jsx
**Purpose**: Interactive map visualization
**Props**:
- `points`: Array of click locations with coordinates
- `isLoading`: Show loading state

**Features**:
- Leaflet map with OpenStreetMap tiles
- CircleMarker for each click (size = volume)
- Color-coded by device type
- Popup with click details
- FitBounds to auto-fit all markers
- Sidebar list of top 8 locations

### LocationTracker.jsx
**Purpose**: Geolocation permission banner
**Props**:
- `shortUrl`: Short code to track
- (Optional) Reads from URL `?from=shortcode`

**Features**:
- Appears 1 second after page load
- Shows permission request banner
- Calls `trackUserLocation()` on "Allow"
- Uses `captureVisitorId()` for visitor tracking

### AnalyticsPage.jsx
**Purpose**: Main dashboard
**Features**:
- Traffic by country (bar chart)
- Traffic by device (progress bars)
- Traffic by browser
- Traffic by city
- **NEW**: GeoMapView component for visualization
- Recent clicks table
- Growth charts

---

## Key Functions & Files

### Backend - IP Geolocation
**File**: `src/dao/shortUrl.js`
**Function**: `getLocation(req, ip)`
```javascript
// Returns geolocation data from IP
{
  country: String,      // e.g., "IN"
  region: String,       // e.g., "Delhi"
  city: String,         // e.g., "New Delhi"
  latitude: Number,     // e.g., 28.7041
  longitude: Number     // e.g., 77.1025
}
```

### Backend - Analytics Aggregation
**File**: `src/services/shortUrl.service.js`
**Function**: `getUserUrlAnalytics(shortUrl)`
```javascript
// Returns aggregated analytics
{
  trafficByCountry: [...],
  trafficByCity: [...],
  trafficByDevice: [...],
  clickMapPoints: [...]  // Used by map
}
```

### Backend - Location Recording
**File**: `src/controller/shortUrl.controller.js`
**Function**: `recordLocationForClick()`
- Receives browser geolocation coordinates
- Finds correct click event by visitorId
- Updates latitude/longitude fields
- Returns success status

### Frontend - Geolocation Wrapper
**File**: `src/utils/locationTracker.js`
**Function**: `trackUserLocation(shortUrl, visitorId)`
```javascript
// Calls browser geolocation API
// Sends coordinates to backend
// POST /api/create/track-location
```

### Frontend - Visitor ID Capture
**File**: `src/utils/redirectTracker.js`
**Function**: `captureVisitorId()`
```javascript
// Returns visitor ID from:
// 1. URL parameter ?visitor_id=
// 2. localStorage
// 3. Generated temp ID
```

---

## Integration Guide for Landing Pages

### Step 1: Import Components
```javascript
import LocationTracker from '@/components/LocationTracker'
```

### Step 2: Add to Page
```jsx
export default function MyLandingPage() {
  return (
    <>
      <LocationTracker shortUrl="abc123" />
      {/* Rest of page */}
    </>
  )
}
```

### Alternative: Via URL Parameter
```jsx
// User lands on page via short link
// Page URL: https://mysite.com?from=abc123
<LocationTracker /> {/* Reads shortUrl from ?from= param */}
```

### Step 3: Test
1. Open browser DevTools → Console
2. Look for success messages
3. Check "Application" tab for localStorage `_hoopit_visitor_id_`
4. Verify coordinates appear on analytics map

---

## Error Handling

### Common Issues

#### Issue: Location not appearing on map
**Causes**:
- Browser geolocation permission denied
- Coordinates not being sent to backend
- Click event not found by visitorId
- Invalid latitude/longitude values

**Solutions**:
1. Check browser console for errors
2. Verify permission banner appears
3. Check "Application" tab for visitor ID in localStorage
4. Monitor network tab for `/api/create/track-location` POST
5. Check backend logs for matching errors

#### Issue: Wrong visitor identified
**Causes**:
- Visitor ID not captured from localStorage
- Click event array has multiple recent clicks

**Solutions**:
1. Ensure `captureVisitorId()` called on page load
2. Backend uses loop-based matching by visitorId
3. Falls back to most recent click if no match

#### Issue: CORS errors
**Causes**:
- Missing credentials in fetch

**Solutions**:
- Add `credentials: 'include'` to fetch calls
- Ensure cookies are being sent

---

## Performance Optimizations

1. **Click Aggregation**: Group clicks by city/country/device in service layer
2. **Lazy Loading**: Analytics load on demand
3. **Map Clustering**: (Optional) cluster markers when zoomed out
4. **Caching**: Cache analytics data with TTL
5. **Indexing**: Database indexes on country, city, device

---

## Security Considerations

1. **HTTPS Required**: Geolocation API only works over HTTPS
2. **Privacy**: Display privacy policy about location tracking
3. **User Consent**: Location banner requests explicit permission
4. **Data Retention**: Consider deleting old click data periodically
5. **Rate Limiting**: Add rate limits to prevent abuse
6. **IP Masking**: Option to anonymize IPs in analytics

---

## Deployment Checklist

- [ ] HTTPS certificate configured
- [ ] Environment variables set (MongoDB URI, JWT secret, etc.)
- [ ] Database indexes created
- [ ] Privacy policy updated
- [ ] GDPR compliance reviewed
- [ ] Error logging configured
- [ ] Analytics data backup plan
- [ ] Load testing completed
- [ ] Browser geolocation tested in production
- [ ] Map library (Leaflet) hosted/CDN configured

---

## Future Enhancements

1. **Advanced Map Features**:
   - Marker clustering
   - Heatmaps
   - Geographic filters

2. **Device Breakdown**:
   - OS detection (Windows, macOS, iOS, Android)
   - Browser-specific analytics
   - Screen resolution tracking

3. **A/B Testing**:
   - Multiple variants per URL
   - Conversion tracking
   - UTM parameter support

4. **Real-time Dashboard**:
   - WebSocket live updates
   - Live visitor map
   - Alert notifications

5. **Advanced Reports**:
   - Custom date ranges
   - Export to CSV/PDF
   - Scheduled email reports

6. **Team Collaboration**:
   - Shared URLs
   - Team analytics
   - Role-based access

---

## Development Commands

### Backend
```bash
cd Backend
npm install
npm start                    # Start server
npm test                     # Run tests
npm run dev                  # Development with nodemon
```

### Frontend
```bash
cd Frontend
npm install
npm run dev                  # Vite development server
npm run build                # Production build
npm run preview              # Preview build
npm run lint                 # Run ESLint
```

---

## Contact & Support

For issues or questions about the geolocation tracking system:
1. Check browser console for errors
2. Review backend logs
3. Verify MongoDB data with `clickEvents` array
4. Test in HTTPS environment
5. Ensure visitor ID in localStorage

---

**Last Updated**: May 17, 2026  
**Current Version**: With Geolocation Mapping
**Status**: Production Ready
