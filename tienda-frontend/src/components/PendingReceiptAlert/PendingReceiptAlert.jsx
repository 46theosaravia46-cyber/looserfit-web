import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getMisPedidos, getPedidos } from '../../services/api'
import './PendingReceiptAlert.css'

export default function PendingReceiptAlert() {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [guestOrderId, setGuestOrderId] = useState(null)
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const checkPending = async () => {
      try {
        let orders = []
        if (user) {
          if (isAdmin) {
             orders = await getPedidos()
          } else {
             orders = await getMisPedidos()
          }
        } else {
          // Si no hay user, buscamos token de invitado
          const guestToken = localStorage.getItem('looserfit_guest_token')
          if (guestToken) {
            const { getOrderByToken } = await import('../../services/api')
            const guestOrder = await getOrderByToken(guestToken)
            if (guestOrder) orders = [guestOrder]
          }
        }
        
        // Filtrar pedidos que están "Pendiente" y NO tienen comprobante
        const missing = orders.filter(o => o.estado === 'Pendiente' && !o.comprobante)
        setPendingCount(missing.length)
        if (!user && missing.length > 0) {
           // Si es invitado, necesitamos el ID para el link
           setGuestOrderId(missing[0]._id)
        }
      } catch (err) {
        console.error('Error checking pending orders:', err)
      }
    }

    checkPending()
    
    const interval = setInterval(checkPending, 30000)
    return () => clearInterval(interval)
  }, [user, location.pathname, isAdmin])

  useEffect(() => {
    if (pendingCount > 0) {
      document.body.classList.add('has-pending-alert')
    } else {
      document.body.classList.remove('has-pending-alert')
    }
  }, [pendingCount])

  if (pendingCount === 0) return null

  return (
    <div className="pending-alert">
      <div className="container pending-alert__content">
        <p>
          ⚠️ {isAdmin 
            ? `Hay ${pendingCount} ${pendingCount === 1 ? 'pedido' : 'pedidos'} sin comprobante.` 
            : `Tenés ${pendingCount} ${pendingCount === 1 ? 'pedido pendiente' : 'pedidos pendientes'} de comprobante.`}
        </p>
        <Link 
          to={isAdmin ? "/admin/pedidos" : (user ? "/mis-pedidos" : `/pedido-exito?orderId=${guestOrderId}`)} 
          className="pending-alert__link"
        >
          {isAdmin ? "Ver pedidos →" : "Subir comprobante ahora →"}
        </Link>
      </div>
    </div>
  )
}
