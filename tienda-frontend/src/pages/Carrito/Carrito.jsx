import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { getProductoById } from '../../services/api'
import './Carrito.css'

export default function Carrito() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, subtotal, updateCantidad, removeItem } = useCart()
  const [stocks, setStocks] = useState({})

  useEffect(() => {
    // Cargar stock actual de los productos en el carrito
    items.forEach(item => {
      getProductoById(item._id)
        .then(data => {
          setStocks(prev => ({ ...prev, [item._id]: data.stock }))
        })
        .catch(console.error)
    })
  }, [items])

  const hasNoStock = items.some(item => (stocks[item._id] ?? 1) <= 0)

  return (
    <div className="carrito-page">
      <div className="container">
        <div className="carrito-header">
          <h1>Carrito</h1>
          <p>{items.length} productos</p>
        </div>

        {items.length === 0 ? (
          <div className="carrito-empty">
            <p>Tu carrito esta vacio.</p>
            <Link to="/tienda" className="btn">Ir a la tienda</Link>
          </div>
        ) : (
          <div className="carrito-layout">
            <div className="carrito-list">
              {items.map(item => (
                <article key={`${item._id}-${item.talle}`} className={`carrito-item ${stocks[item._id] === 0 ? 'carrito-item--no-stock' : ''}`}>
                  <img src={item.imagen} alt={item.nombre} className="carrito-item__img" />
                  <div className="carrito-item__info">
                    <h3>{item.nombre}</h3>
                    <p>Talle: {item.talle}</p>
                    <p>${Number(item.precio).toLocaleString('es-AR')}</p>
                    {stocks[item._id] === 0 && <p className="stock-error">⚠️ Sin stock disponible</p>}
                    {stocks[item._id] > 0 && stocks[item._id] < item.cantidad && (
                      <p className="stock-error">⚠️ Solo quedan {stocks[item._id]} unidades</p>
                    )}
                  </div>
                  <div className="carrito-item__actions">
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      onChange={e => updateCantidad(item._id, item.talle, Number(e.target.value))}
                    />
                    <button onClick={() => removeItem(item._id, item.talle)}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="carrito-resumen">
              <h2>Resumen</h2>
              <div>
                <span>Subtotal</span>
                <strong>${subtotal.toLocaleString('es-AR')}</strong>
              </div>
              <button 
                className="btn btn-filled carrito-resumen__cta" 
                onClick={() => {
                  if (!user && !localStorage.getItem('looserfit_user')) {
                    navigate('/', { state: { openAuth: true } })
                  } else {
                    navigate('/checkout')
                  }
                }}
                disabled={hasNoStock}
              >
                {hasNoStock ? 'Sin stock' : 'Finalizar compra'}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
