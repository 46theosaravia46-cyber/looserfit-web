import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderByToken } from '../../services/api'
import './TrackingPedido.css'

export default function TrackingPedido() {
  const { token } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOrderByToken(token)
      .then(setOrder)
      .catch(err => {
        console.error(err)
        setError('No pudimos encontrar el pedido. Verificá el link de tu email.')
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="tracking-page container">
      <div className="tracking-loading">Buscando pedido...</div>
    </div>
  )

  if (error || !order) return (
    <div className="tracking-page container">
      <div className="tracking-error">
        <h2>Ups!</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-filled">Volver al inicio</Link>
      </div>
    </div>
  )

  const steps = ['Pendiente', 'Pagado', 'Empaquetado', 'Enviado', 'Entregado']
  const currentStepIndex = steps.indexOf(order.estado)

  return (
    <div className="tracking-page">
      <div className="container">
        <div className="tracking-header">
          <h1>Seguimiento de Pedido</h1>
          <p className="order-number">Orden {order.orderNumber}</p>
        </div>

        <div className="tracking-card">
          <div className="order-stepper">
            {steps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex
              const isCancelled = order.estado === 'Cancelado'

              return (
                <div key={step} className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isCancelled ? 'cancelled' : ''}`}>
                  <div className="step-bullet">
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="step-label">{step}</div>
                  {index < steps.length - 1 && <div className="step-line" />}
                </div>
              )
            })}
          </div>

          <div className="order-details-grid">
            <div className="details-section">
              <h3>Estado Actual</h3>
              <p className={`status-badge status-${order.estado.toLowerCase()}`}>
                {order.estado}
              </p>
              {order.trackingNumber && (
                <div className="tracking-code-box">
                  <p>Código de seguimiento (Correo Argentino):</p>
                  <strong>{order.trackingNumber}</strong>
                  <a 
                    href={`https://www.correoargentino.com.ar/seguimiento-de-envios?codigoSeguimiento=${order.trackingNumber}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-track-external"
                  >
                    Rastrear en Correo Argentino
                  </a>
                </div>
              )}
            </div>

            <div className="details-section">
              <h3>Datos de Envío</h3>
              <p><strong>Para:</strong> {order.datosEnvio.nombreCompleto}</p>
              <p><strong>Tipo:</strong> {order.tipoEnvio === 'sucursal' ? 'Retiro en Sucursal' : 'Envío a domicilio'}</p>
              <p><strong>Localidad:</strong> {order.datosEnvio.provincia}, {order.datosEnvio.localidad}</p>
              {order.tipoEnvio === 'sucursal' ? (
                <p><strong>Sucursal:</strong> {order.datosEnvio.direccionSucursal}</p>
              ) : (
                <p><strong>Dirección:</strong> {order.datosEnvio.calleNumero} {order.datosEnvio.pisoDepto}</p>
              )}
            </div>
          </div>

          <div className="order-items-summary">
            <h3>Productos</h3>
            {order.productos.map((p, i) => (
              <div key={i} className="tracking-item">
                <img src={p.imagen} alt={p.nombre} />
                <div className="item-info">
                  <p className="item-name">{p.nombre}</p>
                  <p className="item-meta">Talle {p.talle} — x{p.cantidad}</p>
                </div>
                <div className="item-price">
                  ${(p.precio * p.cantidad).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
            <div className="order-total-row">
              <div className="total-label">Total pagado</div>
              <div className="total-value">${order.total.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
        
        <div className="tracking-footer">
          <p>¿Tenés alguna duda? Contactanos por Instagram <a href="https://instagram.com/looser.fit" target="_blank" rel="noreferrer">@looser.fit</a></p>
        </div>
      </div>
    </div>
  )
}
