import { Sun, Moon } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useApp()
  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
