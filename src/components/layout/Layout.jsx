import { Link, useLocation } from 'react-router-dom'
import { Home, Dumbbell, BookOpen, History, Camera, ListChecks } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { to: '/',          icon: Home,       label: 'Inicio'    },
  { to: '/rutina',    icon: Dumbbell,   label: 'Rutina'    },
  { to: '/sesion',    icon: BookOpen,   label: 'Sesión'    },
  { to: '/historial', icon: History,    label: 'Historial' },
  { to: '/progreso',  icon: Camera,     label: 'Progreso'  },
  { to: '/catalogo',  icon: ListChecks, label: 'Catálogo'  },
]

export default function Layout({ children }) {
  const location = useLocation()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">💪 GymTracker</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`sidebar-item ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer"><ThemeToggle /></div>
      </aside>

      <div className="shell-body">
        <header className="topbar">
          <span className="topbar-logo">💪 GymTracker</span>
          <ThemeToggle />
        </header>
        <main className="main-content">{children}</main>
        <nav className="bottom-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`nav-item ${location.pathname === to ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
