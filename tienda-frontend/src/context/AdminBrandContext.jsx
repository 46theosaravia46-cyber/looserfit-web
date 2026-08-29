/**
 * AdminBrandContext.jsx — Contexto de marca activa en el panel de administración.
 * Permite que el admin gestione Looser Fit y Looser Sport por separado.
 * Persiste la selección en localStorage para recordarla entre sesiones.
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'
import { BRAND_SLUGS, DEFAULT_BRAND_SLUG } from '../config/brandConfig'

const STORAGE_KEY = 'admin_brand'

const AdminBrandContext = createContext(null)

export function AdminBrandProvider({ children }) {
  const [activeBrand, setActiveBrand] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_BRAND_SLUG
  )

  const switchBrand = (slug) => {
    if (!Object.values(BRAND_SLUGS).includes(slug)) return
    setActiveBrand(slug)
    localStorage.setItem(STORAGE_KEY, slug)
  }

  return (
    <AdminBrandContext.Provider value={{ activeBrand, switchBrand }}>
      {children}
    </AdminBrandContext.Provider>
  )
}

export function useAdminBrand() {
  const ctx = useContext(AdminBrandContext)
  if (!ctx) throw new Error('useAdminBrand debe usarse dentro de AdminBrandProvider')
  return ctx
}
