import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPedidos, eliminarPedido, eliminarPedidosBulk } from '../../services/api'
import './Admin.css'

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  const fetchPedidos = () => {
    setLoading(true)
    getPedidos()
      .then(data => { 
        console.log('API RESPONSE (pedidos):', data);
        if (!Array.isArray(data)) {
          console.warn('La API no devolvió un array:', data);
        }
        setPedidos(data); 
        setLoading(false);
      })
      .catch((err) => { 
        console.error('Error fetching pedidos:', err);
        setLoading(false);
        alert('Error al cargar pedidos: ' + err.message);
      })
  }

  useEffect(() => {
    fetchPedidos()
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

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPedidos.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPedidos.map(p => p._id))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este pedido?')) return
    try {
      await eliminarPedido(id)
      setPedidos(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`¿Seguro que querés eliminar ${selectedIds.length} pedidos?`)) return
    try {
      await eliminarPedidosBulk(selectedIds)
      setPedidos(prev => prev.filter(p => !selectedIds.includes(p._id)))
      setSelectedIds([])
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Pedidos</h2>
        {selectedIds.length > 0 && (
          <button className="admin-btn admin-btn--danger" onClick={handleBulkDelete}>
            Eliminar seleccionados ({selectedIds.length})
          </button>
        )}
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
              <th>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredPedidos.length}
                  onChange={toggleSelectAll}
                />
              </th>
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
              <tr><td colSpan={8}>Cargando...</td></tr>
            ) : filteredPedidos.length === 0 ? (
              <tr><td colSpan={8}>No se encontraron pedidos para la búsqueda.</td></tr>
            ) : filteredPedidos.map(p => (
              <tr key={p._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(p._id)}
                    onChange={() => toggleSelect(p._id)}
                  />
                </td>
                <td className="table-id">{p.orderNumber || '-'}</td>
                <td className="table-id">{p._id}</td>
                <td>{p.datosEnvio?.nombreCompleto || p.usuario?.nombre || '-'}</td>
                <td className="table-mono">${Number(p.total || 0).toLocaleString('es-AR')}</td>
                <td>{p.estado || '-'}</td>
                <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '-'}</td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <Link className="table-link" to={`/admin/pedidos/${p._id}`}>Ver</Link>
                  <button className="table-link-danger" onClick={() => handleDelete(p._id)}>Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
