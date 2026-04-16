import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { siteConfig } from '../../config/siteConfig'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  const { user, login, register, logout } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState('login') // 'login' | 'register' | 'recover'
  const [form, setForm] = useState({ email: '', password: '', nombre: '', confirm: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setMsg(''); setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden.')
    
    try {
      await register({ nombre: form.nombre, email: form.email, password: form.password })
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRecover = (e) => {
    e.preventDefault()
    setMsg(`Te enviamos un correo a ${form.email} con los pasos para recuperar tu contraseña.`)
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal__header">
          <img src={siteConfig.assets.logo} alt={siteConfig.name} className="auth-modal__logo" />
          <button className="auth-modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* ── LOGUEADO ── */}
        {user ? (
          <div className="auth-form" style={{ textAlign: 'center', padding: '1rem 0' }}>
            <h3 className="auth-recover__title">¡Hola, {user.nombre}!</h3>
            <p className="auth-recover__desc">Ya iniciaste sesión en {siteConfig.name}.</p>
            
            {user.isAdmin && (
              <button 
                className="auth-btn" 
                style={{ background: '#7b1fa2', marginBottom: '1rem' }}
                onClick={() => { navigate('/admin'); onClose(); }}
              >
                Panel de Admin
              </button>
            )}

            <button 
              className="auth-btn" 
              style={{ background: '#c0392b' }}
              onClick={() => { logout(); onClose(); }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            {view !== 'recover' && (
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${view === 'login' ? 'auth-tab--active' : ''}`}
                  onClick={() => { setView('login'); setMsg(''); setError('') }}
                >
                  Iniciar sesión
                </button>
                <button
                  className={`auth-tab ${view === 'register' ? 'auth-tab--active' : ''}`}
                  onClick={() => { setView('register'); setMsg(''); setError('') }}
                >
                  Crear cuenta
                </button>
              </div>
            )}

            {/* ── LOGIN ── */}
            {view === 'login' && (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-btn">Entrar</button>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => { setView('recover'); setMsg(''); setError('') }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>
            )}

            {/* ── REGISTRO ── */}
            {view === 'register' && (
              <form className="auth-form" onSubmit={handleRegister}>
                <div className="auth-field">
                  <label>Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="auth-field">
                  <label>Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirm"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={handleChange}
                    required
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                <button type="submit" className="auth-btn">Crear cuenta</button>
                <p className="auth-legal">
                  Al registrarte, aceptás nuestros términos y condiciones y el envío 
                  de novedades y promociones de {siteConfig.name}.
                </p>
              </form>
            )}

            {/* ── RECUPERAR ── */}
            {view === 'recover' && (
              <form className="auth-form" onSubmit={handleRecover}>
                <h3 className="auth-recover__title">Recuperar contraseña</h3>
                <p className="auth-recover__desc">
                  Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
                </p>
                <div className="auth-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                {error && <p className="auth-error">{error}</p>}
                {msg   && <p className="auth-msg">{msg}</p>}
                <button type="submit" className="auth-btn">Enviar correo</button>
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => { setView('login'); setMsg(''); setError('') }}
                >
                  ← Volver al inicio de sesión
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
