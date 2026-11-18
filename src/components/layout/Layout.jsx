import { Link, useLocation, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Home, Dumbbell, BookOpen, History, Camera, ListChecks, Download, Share2, LogOut } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/',          icon: Home,       label: 'Inicio'    },
  { to: '/rutina',    icon: Dumbbell,   label: 'Rutina'    },
  { to: '/sesion',    icon: BookOpen,   label: 'Sesión'    },
  { to: '/historial', icon: History,    label: 'Historial' },
  { to: '/progreso',  icon: Camera,     label: 'Progreso'  },
  { to: '/catalogo',  icon: ListChecks, label: 'Catálogo'  },
  { to: '/compartir', icon: Share2,     label: 'Compartir' },
]

export default function Layout() {
  const location = useLocation()
  const { signOut, user, toast } = useApp()
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstallPrompt(null))
    return () => { window.removeEventListener('beforeinstallprompt', handler) }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/images/logo-menu.png" alt="GymTracker" className="sidebar-logo-img" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`sidebar-item ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <span className="sidebar-email" title={user.email}>{user.email}</span>
              <button className="sidebar-logout" onClick={signOut} title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            </div>
          )}
          {installPrompt && (
            <button className="install-btn" onClick={handleInstall} title="Instalar app">
              <Download size={16} />
              <span>Instalar App</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </aside>

      <div className="shell-body">
        <header className="topbar">
          <img src="/images/logo-menu.png" alt="GymTracker" className="topbar-logo-img" />
          <div className="topbar-actions">
            {installPrompt && (
              <button className="install-btn-top" onClick={handleInstall} title="Instalar app">
                <Download size={16} />
                <span>Instalar</span>
              </button>
            )}
            <ThemeToggle />
            {user && (
              <button className="topbar-logout" onClick={signOut} title="Cerrar sesión">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
        <nav className="bottom-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`nav-item ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* App-level toast — position:fixed, puede vivir dentro del root */}
      {toast && (
        <div className={`app-toast app-toast--${toast.type}`}>
          {toast.type === 'error' ? '⚠️' : '✅'} {toast.message}
        </div>
      )}
    </div>
  )
}
