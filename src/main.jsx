import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import RoutinePage from './pages/RoutinePage'
import SessionPage from './pages/SessionPage'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import CatalogPage from './pages/CatalogPage'
import SharePage from './pages/SharePage'
import './index.css'

function AuthGate({ children }) {
  const { user, authLoading } = useApp()
  const location = useLocation()

  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    )
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }
  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/"           element={<HomePage />} />
              <Route path="/rutina"     element={<RoutinePage />} />
              <Route path="/sesion"     element={<SessionPage />} />
              <Route path="/historial"  element={<HistoryPage />} />
              <Route path="/progreso"   element={<ProgressPage />} />
              <Route path="/catalogo"   element={<CatalogPage />} />
              <Route path="/compartir"  element={<SharePage />} />
            </Route>
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
)
