import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event('cartUpdated'))
  }, [items])

  const addItem = (producto, talle, cantidad = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i._id === producto._id && i.talle === talle)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + cantidad }
        return copy
      }
      return [...prev, {
        _id: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagenes?.[0] || '/placeholder.jpg',
        talle,
        cantidad,
      }]
    })
  }

  const updateCantidad = (_id, talle, cantidad) => {
    setItems(prev => prev
      .map(i => (i._id === _id && i.talle === talle ? { ...i, cantidad: Math.max(1, cantidad) } : i)))
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
