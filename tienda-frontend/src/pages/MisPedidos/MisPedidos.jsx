import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMisPedidos } from '../../services/api'
import './MisPedidos.css'

export default function MisPedidos() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { state: { openAuth: true } })
      return
    }

    if (user) {
      getMisPedidos()
        .then(data => {
          setPedidos(data)
          setLoading(false)
        })
        .catch(err => {
          setError('No se pudieron cargar tus pedidos.')
          setLoading(false)
          console.error(err)
        })
    }
  }, [user, authLoading, navigate])

  if (authLoading || loading) {
    return (
      <div className="mis-pedidos-page">
        <div className="container">
          <div className="loading-spinner">Cargando tus pedidos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mis-pedidos-page">
      <div className="container">
        <div className="mis-pedidos-header">
          <h1>Mis Pedidos</h1>
          <p>Aquí puedes ver el historial y estado de tus compras.</p>
        </div>

        {error && <p className="error-msg">{error}</p>}

        {!pedidos.length ? (
          <div className="no-pedidos">
            <p>Aún no has realizado ninguna compra.</p>
            <Link to="/tienda" className="btn btn-filled">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="pedidos-list">
            {pedidos.map(p => (
              <div key={p._id} className="pedido-card">
                <div className="pedido-card__header">
                  <div>
                    <span className="order-number">Orden {p.orderNumber || p._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">{new Date(p.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <span className={`status-badge status-${p.estado.toLowerCase()}`}>
                    {p.estado}
                  </span>
                </div>

                <div className="pedido-card__body">
                  <div className="pedido-productos">
                    {p.productos.map((prod, i) => (
                      <div key={i} className="pedido-prod-item">
                        <img src={prod.imagen || '/placeholder.jpg'} alt={prod.nombre} />
                        <div>
                          <p><strong>{prod.nombre}</strong></p>
                          <p>Talle: {prod.talle} | Cant: {prod.cantidad}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pedido-info-pago">
                    <p><strong>Total:</strong> ${p.total.toLocaleString('es-AR')}</p>
                    <p><strong>Método de envío:</strong> {p.tipoEnvio === 'domicilio' ? 'A domicilio' : 'Retiro en sucursal'}</p>
                    {p.trackingNumber && (
                      <div className="tracking-info">
                        <p><strong>Seguimiento:</strong> {p.trackingNumber}</p>
                        <a 
                          href="https://www.correoargentino.com.ar/seguimiento-de-envios" 
                          target="_blank" 
                          rel="noreferrer"
                          className="btn-link"
                        >
                          Rastrear en Correo Argentino
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pedido-card__footer">
                  <Link to={`/pedido-exito?orderId=${p._id}`} className="btn btn-secondary-outline">
                    Ver detalle / Subir comprobante
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
