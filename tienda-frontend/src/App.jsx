import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home/Home'
import Tienda from './pages/Tienda/Tienda'
import Producto from './pages/Producto/Producto'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProductos from './pages/Admin/AdminProductos'
import AdminNuevoProducto from './pages/Admin/AdminNuevoProducto'
import AdminPedidos from './pages/Admin/AdminPedidos'
import AdminPedido from './pages/Admin/AdminPedido'
import AdminHome from './pages/Admin/AdminHome'
import AdminNewsletter from './pages/Admin/AdminNewsletter'
import Carrito from './pages/Carrito/Carrito'
import AuthModal from './components/AuthModal/AuthModal'
import { getHomeContent } from './services/api'
import Checkout from './pages/Checkout/Checkout'
import PedidoExito from './pages/PedidoExito/PedidoExito'
import NotFound from './pages/NotFound/NotFound'

function ComingSoonScreen({ launchDate, message, subtitle, onAuthClick }) {
  const [, setTick] = useState(0)
  const currentTimeRef = useRef(0)

  useEffect(() => {
    currentTimeRef.current = Date.now()
    const interval = setInterval(() => {
      currentTimeRef.current = Date.now()
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // eslint-disable-next-line react-hooks/purity
  const currentTime = currentTimeRef.current || Date.now()
  const remaining = Math.max(new Date(launchDate).getTime() - currentTime, 0)
  const days = Math.floor(remaining / 86400000)
  const hours = Math.floor((remaining % 86400000) / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  const formatted = `${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.72)',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '980px',
        display: 'grid',
        gap: '2rem',
        gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 1fr)',
        alignItems: 'center',
        pointerEvents: 'all'
      }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 4.5rem)', margin: '0 0 1rem', lineHeight: 1.05 }}>{message || ''}</h1>
          {subtitle && <p style={{ fontSize: '1rem', color: '#d3d3d3', marginBottom: '1.8rem' }}>{subtitle}</p>}
          <p style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>{formatted}</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '18px',
          padding: '1.5rem',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem' }}>Aviso por email</h2>
            <p style={{ margin: 0, color: '#ddd', lineHeight: 1.7 }}>
              Iniciá sesión o registrate para recibir un aviso automático por Gmail cuando la web vuelva.
            </p>
          </div>
          <button
            type="button"
            onClick={onAuthClick}
            style={{
              marginTop: '1.5rem',
              background: '#ffffff',
              color: '#111',
              border: 'none',
              borderRadius: '999px',
              padding: '0.85rem 1.2rem',
              cursor: 'pointer',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            Recibir aviso por Gmail
          </button>
        </div>
      </div>
    </div>
  )
}

function PublicGate({ children, homeLoading, comingSoon, onAuthClick }) {
  if (homeLoading) return children
  const active = Boolean(comingSoon?.enabled && comingSoon?.launchDate && new Date(comingSoon.launchDate) > new Date())
  
  // Si está en modo lanzamiento, mostrar solo Home con overlay bloqueador
  if (active) {
    return (
      <>
        <Navbar />
        <main style={{ pointerEvents: 'none' }}>
          <Home />
        </main>
        <ComingSoonScreen
          launchDate={comingSoon.launchDate}
          message={comingSoon.message}
          subtitle={comingSoon.subtitle}
          onAuthClick={onAuthClick}
        />
      </>
    )
  }
  
  return children
}

function App() {
  const [homeContent, setHomeContent] = useState(null)
  const [homeLoading, setHomeLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    getHomeContent()
      .then(data => setHomeContent(data))
      .catch(() => setHomeContent(null))
      .finally(() => setHomeLoading(false))
  }, [])

  const comingSoon = homeContent?.comingSoon
  const isLaunchActive = Boolean(comingSoon?.enabled && comingSoon?.launchDate && new Date(comingSoon.launchDate) > new Date())

  // Bloquear scroll cuando está en modo lanzamiento
  useEffect(() => {
    if (isLaunchActive) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isLaunchActive])

  // Verificar cada segundo si el lanzamiento terminó
  useEffect(() => {
    if (!isLaunchActive) return

    const interval = setInterval(() => {
      const launchDate = new Date(comingSoon?.launchDate).getTime()
      if (launchDate <= Date.now()) {
        // El lanzamiento terminó, recargar contenido
        getHomeContent()
          .then(data => setHomeContent(data))
          .catch(() => setHomeContent(null))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isLaunchActive, comingSoon?.launchDate])

  const publicGateProps = {
    homeLoading,
    comingSoon,
    onAuthClick: () => setAuthOpen(true)
  }

  return (
    <BrowserRouter>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />} 
      <Routes>

        {/* ── Rutas públicas (con Navbar y Footer) ── */}
        <Route path="/" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><Home /></main>
            <Footer />
          </PublicGate>
        }/>
        <Route path="/tienda" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><Tienda /></main>
            <Footer />
          </PublicGate>
        }/>
        <Route path="/producto/:id" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><Producto /></main>
            <Footer />
          </PublicGate>
        }/>
        <Route path="/carrito" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><Carrito /></main>
            <Footer />
          </PublicGate>
        }/>
        <Route path="/checkout" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><Checkout /></main>
            <Footer />
          </PublicGate>
        }/>
        <Route path="/pedido-exito" element={
          <PublicGate {...publicGateProps}>
            <Navbar />
            <main><PedidoExito /></main>
            <Footer />
          </PublicGate>
        }/>

        {/* ── Rutas admin (sin Navbar/Footer públicos) ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index          element={<AdminDashboard />} />
          <Route path="productos"       element={<AdminProductos />} />
          <Route path="productos/nuevo" element={<AdminNuevoProducto />} />
          <Route path="productos/editar/:id" element={<AdminNuevoProducto />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="pedidos" element={<AdminPedidos />} />
          <Route path="pedidos/:id" element={<AdminPedido />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
        </Route>

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App