# Hoopit

Hoopit is a full-stack URL shortener with authentication, folder organization, and analytics for clicks, devices, browsers, referrers, and geolocation. It combines a Node.js + Express backend with a React + Vite frontend to help users create short links and understand who is clicking them, where they are coming from, and what devices they use.

## Highlights

- Shorten long URLs into clean, shareable links
- Add optional custom aliases and organize links into folders
- Track clicks with device, browser, country, city, referrer, and timestamp data
- View analytics in a dashboard with charts and map-based location visualization
- Support user accounts with JWT authentication
- Capture location data from IP lookup and browser geolocation when available

## Tech Stack

| Layer | Tools |
| --- | --- |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, cookie-parser |
| Analytics | geoip-lite, UAParser, Leaflet, react-leaflet |
| Frontend | React 19, Vite, React Router, Axios |
| Styling | CSS, Tailwind CSS |

## Project Structure

```text
Hoopit/
├── Backend/
│   ├── app.js
│   └── src/
│       ├── config/
│       ├── controller/
│       ├── dao/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
└── Frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── pages/
    │   ├── routings/
    │   └── utils/
    └── public/
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Hoopit
```

### 2. Configure the backend

Install dependencies:

```bash
cd Backend
npm install
```

Create a `.env` file with your backend environment variables. Typical values include:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Configure the frontend

Install dependencies:

```bash
cd ../Frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

## Available Scripts

### Backend

- `npm start` - start the server with Node.js
- `npm run dev` - start the server with nodemon
- `npm test` - placeholder test script

### Frontend

- `npm run dev` - start the Vite development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Core Features

### URL Management
- Create short URLs from long links
- Use optional custom aliases
- Organize links into folders
- Manage active and archived links

### Analytics
- Total click counts
- Traffic by country, city, device, and browser
- Recent click history
- Interactive location map
- Growth trends and summary charts

### Location Tracking
- IP-based geolocation using edge headers or geoip-lite
- Optional browser geolocation capture for higher precision
- Visitor ID tracking to match location updates with click events

### Authentication
- User registration and login
- Protected dashboard routes
- Cookie-based session handling with JWT

## API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`

### Short URLs
- `POST /api/create`
- `GET /r/:shortCode`
- `GET /api/user/all-urls`
- `GET /api/user/analytics/:shortUrl`
- `POST /api/create/track-location`
- `PUT /api/:id`
- `DELETE /api/:id`

### Folders
- `POST /api/folder`
- `GET /api/folder`
- `PUT /api/folder/:id`
- `DELETE /api/folder/:id`

## Screenshot

Add your product screenshot here to make the GitHub landing page stronger:

```md
![Hoopit dashboard](./path-to-your-image.png)
```

## Deployment Notes

- Use HTTPS in production so browser geolocation works correctly
- Set the backend environment variables before deploying
- Ensure the frontend API base URL points to the deployed backend
- Verify MongoDB access and CORS settings in production

## Contributing

If you want to improve Hoopit, keep changes focused and consistent with the existing backend controller/DAO/service structure and the frontend component layout.

## License

No license has been specified yet.
