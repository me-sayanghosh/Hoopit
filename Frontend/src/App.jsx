import './App.css'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import TryNowPage from './pages/TryNowPage.jsx'
import CustomUrlPage from './pages/CustomUrlPage.jsx'
import MyCreationsPage from './pages/MyCreationsPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import FoldersPage from './pages/FoldersPage.jsx'
import CreateShortUrlPage from './pages/CreateShortUrlPage.jsx'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/try-now" element={<TryNowPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<CreateShortUrlPage />} />
        <Route path="/custom-url" element={<CustomUrlPage />} />
        <Route path="/creations" element={<MyCreationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/folders" element={<FoldersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App