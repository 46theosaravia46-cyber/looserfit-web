import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPedidos } from '../../services/api'
import './Admin.css'

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPedidos()
      .then(data => { setPedidos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredPedidos = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return pedidos

    return pedidos.filter(p => {
      const orderNumber = p.orderNumber?.toLowerCase() || ''
      const id = p._id?.toLowerCase() || ''
      const cliente = p.datosEnvio?.nombreCompleto?.toLowerCase() || ''
      return orderNumber.includes(term) || id.includes(term) || cliente.includes(term)
    })
  }, [pedidos, search])

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Pedidos</h2>
      </div>

      <div className="admin-page-header" style={{ marginBottom: '1rem', gap: '0.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <label htmlFor="search-pedidos" style={{ fontWeight: 600 }}>Buscar:</label>
        <input
          id="search-pedidos"
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Número de orden, ID o cliente"
          style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #ccc', minWidth: '240px' }}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>ID</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Cargando...</td></tr>
            ) : filteredPedidos.length === 0 ? (
              <tr><td colSpan={7}>No se encontraron pedidos para la búsqueda.</td></tr>
            ) : filteredPedidos.map(p => (
              <tr key={p._id}>
                <td className="table-id">{p.orderNumber || '-'}</td>
                <td className="table-id">{p._id}</td>
                <td>{p.datosEnvio?.nombreCompleto || p.usuario?.nombre || '-'}</td>
                <td className="table-mono">${Number(p.total || 0).toLocaleString('es-AR')}</td>
                <td>{p.estado || '-'}</td>
                <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                <td><Link className="table-link" to={`/admin/pedidos/${p._id}`}>Ver</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
