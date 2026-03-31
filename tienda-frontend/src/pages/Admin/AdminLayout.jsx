import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AdminLayout.css'

export default function AdminLayout() {
  useEffect(() => {
    document.title = 'Panel Admin - Looserfit'
    return () => { document.title = 'looserfit' }
  }, [])
  const { user, login, logout, loading } = useAuth()
  const [usuario,     setUsuario]     = useState('')
  const [contrasena,  setContrasena]  = useState('')
  const [error,       setError]       = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const userData = await login(usuario, contrasena)
      if (!userData.isAdmin) {
        logout()
        setError('No tenés permisos de administrador.')
      } else {
        setError('')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/admin')
  }

  if (loading) return <div className="admin-loading">Cargando...</div>

  // ── LOGIN ──
  if (!user || !user.isAdmin) {
    return (
      <div className="admin-login">
        <div className="admin-login__box">
          <div className="admin-login__logo">
            <img src="/logo3.0.png" alt="Looserfit" />
          </div>
          <h2 className="admin-login__title">Panel Admin</h2>
          <p style={{background: 'red', color: 'white', padding: '5px', textAlign: 'center', fontWeight: 'bold'}}>LOOSERFIT V1.0.4 - SOPORTE</p>
          <p className="admin-login__sub">Ingresá a tu panel de control</p>

          <form onSubmit={handleLogin} className="admin-login__form">
            <div className="admin-field">
              <label>Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                placeholder="looser.fit"
                autoComplete="username"
              />
            </div>
            <div className="admin-field">
              <label>Contraseña</label>
              <input
                type="password"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="admin-login__error">{error}</p>}
            <button type="submit" className="admin-login__btn">
              Entrar al Panel
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── PANEL ──
  return (
    <div className="admin-wrapper">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <img src="/logo3.0.png" alt="Looserfit" className="admin-sidebar__logo" />
          <span className="admin-sidebar__tag">Admin</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }>
            <IconGrid /> Panel
          </NavLink>
          <NavLink to="/admin/productos" className={({isActive}) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }>
            <IconBox /> Productos
          </NavLink>
          <NavLink to="/admin/home" className={({isActive}) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }>
            <IconHome /> Home
          </NavLink>
          <NavLink to="/admin/pedidos" className={({isActive}) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }>
            <IconOrders /> Pedidos
          </NavLink>
          <NavLink to="/admin/newsletter" className={({isActive}) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }>
            <IconMail /> Noticias
          </NavLink>
        </nav>

        <div className="admin-sidebar__bottom">
          <Link to="/" className="admin-sidebar__back">
            ← Volver a la tienda
          </Link>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
          <p style={{fontSize:'0.6rem', color:'var(--gray-3)', marginTop:'1rem', textAlign:'center', opacity: 0.6}}>v1.0.4 - Live</p>
        </div>
      </aside>

      {/* Contenido */}
      <div className="admin-content">
        <div className="admin-topbar">
          <span className="admin-topbar__title">Hola, Looser Fit 👑</span>
          <div className="admin-topbar__avatar">
            <img src="/logo3.0.png" alt="LF" />
          </div>
        </div>
        <div className="admin-body">
          <Outlet />
        </div>
      </div>

    </div>
  )
}

// Íconos SVG inline
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )
}

function IconOrders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3h6" />
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M8 10h8M8 14h8" />
    </svg>
  )
}

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}