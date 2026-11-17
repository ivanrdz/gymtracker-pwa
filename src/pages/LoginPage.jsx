import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Dumbbell, LogIn, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useApp()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await signIn(email, password)
    setLoading(false)
    if (err) setError('Credenciales incorrectas. Verifica tu email y contraseña.')
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">
          <Dumbbell size={40} />
        </div>
        <h1 className="login-title">GymTracker Pro</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="login-pwd-wrap">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className="login-pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <><LogIn size={18} /> Entrar</>
            )}
          </button>
        </form>

        <p className="login-note">
          ¿No tienes cuenta? Pide a tu coach que te registre.
        </p>
      </div>
    </div>
  )
}
