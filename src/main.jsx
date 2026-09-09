import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import RoutinePage from './pages/RoutinePage'
import SessionPage from './pages/SessionPage'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import CatalogPage from './pages/CatalogPage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/rutina"    element={<RoutinePage />} />
            <Route path="/sesion"    element={<SessionPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/progreso"  element={<ProgressPage />} />
            <Route path="/catalogo"  element={<CatalogPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
)
