import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProductos } from '../../services/api'
import './Admin.css'

export default function AdminDashboard() {
  const [productos, setProductos] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    getProductos()
      .then(data => { setProductos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0)
  const sinStock   = productos.filter(p => p.stock === 0).length
  const publicados = productos.filter(p => p.publicado).length

  const stats = [
    { label: 'Productos totales', value: loading ? '...' : productos.length },
    { label: 'Publicados',        value: loading ? '...' : publicados },
    { label: 'Sin stock',         value: loading ? '...' : sinStock },
    { label: 'Unidades totales',  value: loading ? '...' : totalStock },
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Panel</h2>
        <Link to="/admin/productos/nuevo" className="admin-btn-primary">
          + Agregar Producto
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Últimos productos */}
      <div className="admin-section">
        <h3 className="admin-section__title">Últimos productos cargados</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({length: 3}).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5}>
                        <div className="skeleton" style={{height: 24, borderRadius: 2}} />
                      </td>
                    </tr>
                  ))
                : productos.slice(0, 5).map(p => (
                    <tr key={p._id}>
                      <td className="table-product">
                        {p.imagenes?.[0] && (
                          <img src={p.imagenes[0]} alt={p.nombre} className="table-thumb" />
                        )}
                        <span>{p.nombre}</span>
                      </td>
                      <td className="table-mono">${p.precio?.toLocaleString('es-AR')}</td>
                      <td className="table-mono">{p.stock}</td>
                      <td>
                        <span className={`status-badge ${p.publicado ? 'status-badge--ok' : 'status-badge--off'}`}>
                          {p.publicado ? 'Activo' : 'Oculto'}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/admin/productos/editar/${p._id}`}
                          className="table-link"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <Link to="/admin/productos" className="admin-ver-todos">
          Ver todos los productos →
        </Link>
      </div>
    </div>
  )
}