import './App.css'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import TryNowPage from './pages/TryNowPage.jsx'
import CustomersPage from './pages/CustomersPage.jsx'
import FoldersPage from './pages/FoldersPage.jsx'
import CreateFolderPage from './pages/CreateFolderPage.jsx'
import CreateShortUrlPage from './pages/CreateShortUrlPage.jsx'
import ArchivePage from './pages/ArchivePage.jsx'
import TagsPage from './pages/TagsPage.jsx'
import DraftsPage from './pages/DraftsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public routes ─────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/try-now" element={<TryNowPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── Protected routes (require valid session) ──────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateShortUrlPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/analytics/:shortUrl" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/archived" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
        <Route path="/drafts" element={<ProtectedRoute><DraftsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/tags" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
        <Route path="/tags/:tag" element={<ProtectedRoute><TagsPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/folders" element={<ProtectedRoute><FoldersPage /></ProtectedRoute>} />
        <Route path="/folders/new" element={<ProtectedRoute><CreateFolderPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

