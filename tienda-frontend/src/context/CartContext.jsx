import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProductoById } from '../services/api'

const STORAGE_KEY = 'looserfit_cart'
const CartContext = createContext(null)

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart())
  const syncedRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cartUpdated'))
  }, [items])

  // Sync prices from backend on mount to catch precioOferta changes
  const syncPrices = useCallback(async () => {
    if (items.length === 0) return
    try {
      const updates = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProductoById(item._id)
            const precioActual = (product.precioOferta && product.precioOferta > 0)
              ? product.precioOferta
              : product.precio
            return { ...item, precio: precioActual }
          } catch {
            return item // keep existing if product fetch fails
          }
        })
      )
      // Only update if any price actually changed
      const hasChanges = updates.some((u, i) => u.precio !== items[i].precio)
      if (hasChanges) setItems(updates)
    } catch {
      // Fail silently — prices will be recalculated server-side anyway
    }
  }, [items])

  useEffect(() => {
    if (!syncedRef.current && items.length > 0) {
      syncedRef.current = true
      syncPrices()
    }
  }, [syncPrices])

  const addItem = (producto, talle, cantidad = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i._id === producto._id && i.talle === talle)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + cantidad }
        return copy
      }
      const tieneOferta = producto.precioOferta && producto.precioOferta > 0
      const precioUnitario = tieneOferta ? producto.precioOferta : producto.precio
      return [...prev, {
        _id: producto._id,
        nombre: producto.nombre,
        precio: precioUnitario,
        imagen: producto.imagenes?.[0] || '/placeholder.jpg',
        talle,
        cantidad,
      }]
    })
  }

  const updateCantidad = (_id, talle, cantidad, precio) => {
    setItems(prev => prev
      .map(i => (i._id === _id && i.talle === talle
        ? { ...i, cantidad: Math.max(1, cantidad), ...(precio != null && { precio }) }
        : i)))
  }

  const removeItem = (_id, talle) => {
    setItems(prev => prev.filter(i => !(i._id === _id && i.talle === talle)))
  }

  const clearCart = () => setItems([])

  const values = useMemo(() => {
    const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0)
    const subtotal = items.reduce((sum, i) => sum + (Number(i.precio) || 0) * i.cantidad, 0)
    return { items, totalItems, subtotal, addItem, updateCantidad, removeItem, clearCart }
  }, [items])

  return (
    <CartContext.Provider value={values}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
