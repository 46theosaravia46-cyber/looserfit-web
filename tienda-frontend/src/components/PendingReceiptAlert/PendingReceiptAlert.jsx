import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMisPedidos } from '../../services/api'
import './PendingReceiptAlert.css'

export default function PendingReceiptAlert() {
  const { user } = useAuth()
  const [pendingOrders, setPendingOrders] = useState([])
  const location = useLocation()

  useEffect(() => {
    if (!user) return

    const checkPending = async () => {
      try {
        const orders = await getMisPedidos()
        // Filtrar pedidos que están "Pendiente" y NO tienen comprobante
        const missing = orders.filter(o => o.estado === 'Pendiente' && !o.comprobante)
        setPendingOrders(missing)
      } catch (err) {
        console.error('Error checking pending orders:', err)
      }
    }

    checkPending()
    
    // Volver a chequear si cambia la ruta (por si acaba de subir uno)
    // o cada 30 segundos
    const interval = setInterval(checkPending, 30000)
    return () => clearInterval(interval)
  }, [user, location.pathname])

  if (!user || pendingOrders.length === 0) return null

  // Si ya estamos en una página de "mis pedidos" o subiendo uno, tal vez no queremos molestar tanto
  // Pero el usuario pidió "Alerta obligatoria"
  
  return (
    <div className="pending-alert">
      <div className="container pending-alert__content">
        <p>
          ⚠️ Tenés <strong>{pendingOrders.length}</strong> {pendingOrders.length === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de comprobante.
        </p>
        <Link to="/mis-pedidos" className="pending-alert__link">
          Subir comprobante ahora →
        </Link>
      </div>
    </div>
  )
}
