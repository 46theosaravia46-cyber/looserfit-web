import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getProductos, eliminarProducto, togglePublicadoProducto } from '../../services/api'
import './Admin.css'

export default function AdminProductos() {
  const [productos,    setProductos]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [busqueda,     setBusqueda]     = useState('')
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [openMenu,     setOpenMenu]     = useState(null) // _id del producto con menu abierto
  const [openBulkMenu, setOpenBulkMenu] = useState(false)

  useEffect(() => {
    getProductos()
      .then(data => { setProductos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = () => { setOpenMenu(null); setOpenBulkMenu(false) }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  /* ── Selección ── */
  const toggleSelect = (id) => {
    setSeleccionados(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (seleccionados.size === filtrados.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(filtrados.map(p => p._id)))
    }
  }

  const publicarSeleccionados = async () => {
    if (seleccionados.size === 0) return
    const ids = [...seleccionados]
    for (const id of ids) {
      try {
        const p = productos.find(x => x._id === id)
        if(p && !p.publicado) {
          const data = await togglePublicadoProducto(id)
          setProductos(prev => prev.map(prod => (prod._id === id ? data.producto : prod)))
        }
      } catch { /* ignore */ }
    }
    setSeleccionados(new Set())
    setOpenBulkMenu(false)
  }

  const ocultarSeleccionados = async () => {
    if (seleccionados.size === 0) return
    const ids = [...seleccionados]
    for (const id of ids) {
      try {
        const p = productos.find(x => x._id === id)
        if(p && p.publicado) {
          const data = await togglePublicadoProducto(id)
          setProductos(prev => prev.map(prod => (prod._id === id ? data.producto : prod)))
        }
      } catch { /* ignore */ }
    }
    setSeleccionados(new Set())
    setOpenBulkMenu(false)
  }

  const eliminarSeleccionados = async () => {
    if (seleccionados.size === 0) return
    const ok = window.confirm(`¿Eliminar los ${seleccionados.size} productos seleccionados? Esta acción no se puede deshacer.`)
    if (!ok) return
    const ids = [...seleccionados]
    for (const id of ids) {
      try {
        await eliminarProducto(id)
        setProductos(prev => prev.filter(p => p._id !== id))
      } catch { /* ignore */ }
    }
    setSeleccionados(new Set())
    setOpenBulkMenu(false)
  }

  /* ── Acciones individuales ── */
  const handleEliminar = async (id, nombre) => {
    const ok = window.confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`)
    if (!ok) return
    try {
      await eliminarProducto(id)
      setProductos(prev => prev.filter(p => p._id !== id))
      setSeleccionados(prev => { const n = new Set(prev); n.delete(id); return n })
    } catch {
      alert('No se pudo eliminar el producto')
    }
  }

  const handleToggle = async (id) => {
    try {
      const data = await togglePublicadoProducto(id)
      setProductos(prev => prev.map(p => (p._id === id ? data.producto : p)))
    } catch {
      alert('No se pudo actualizar la visibilidad')
    }
  }

  const todosSeleccionados = filtrados.length > 0 && seleccionados.size === filtrados.length

  return (
    <div className="admin-productos">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Productos</h2>
          <p className="admin-page-sub">
            Administrá tu catálogo, inventario y variantes.
          </p>
        </div>
        <Link to="/admin/productos/nuevo" className="admin-btn-primary">
          + Agregar Producto
        </Link>
      </div>

      {/* Buscador + acciones en lote */}
      <div className="admin-search-wrap">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="admin-search"
        />
        {seleccionados.size > 0 && (
          <div className="table-actions-menu" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="admin-btn-primary admin-btn-sm"
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              onClick={() => setOpenBulkMenu(!openBulkMenu)}
            >
              Acciones ({seleccionados.size}) <span>⋮</span>
            </button>
            {openBulkMenu && (
              <div className="table-dropdown" style={{top: 'calc(100% + 4px)', right: 'auto', left: 0}}>
                <button
                  type="button"
                  className="table-dropdown__item"
                  onClick={publicarSeleccionados}
                >
                  🌐 Publicar
                </button>
                <button
                  type="button"
                  className="table-dropdown__item"
                  onClick={ocultarSeleccionados}
                >
                  🔒 Ocultar
                </button>
                <button
                  type="button"
                  className="table-dropdown__item table-dropdown__item--danger"
                  onClick={eliminarSeleccionados}
                >
                  🗑️ Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={todosSeleccionados}
                  onChange={selectAll}
                  title="Seleccionar todos"
                />
              </th>
              <th>Producto</th>
              <th>Estado</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length: 4}).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="skeleton" style={{height: 24, borderRadius: 2}} />
                    </td>
                  </tr>
                ))
              : filtrados.map(p => (
                  <tr key={p._id} className={seleccionados.has(p._id) ? 'row-selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="admin-checkbox"
                        checked={seleccionados.has(p._id)}
                        onChange={() => toggleSelect(p._id)}
                      />
                    </td>
                    <td className="table-product">
                      {p.imagenes?.[0] && (
                        <img src={p.imagenes[0]} alt={p.nombre} className="table-thumb" />
                      )}
                      <div>
                        <span className="table-nombre">{p.nombre}</span>
                        <span className="table-id">{p._id}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${p.publicado ? 'status-badge--ok' : 'status-badge--off'}`}>
                        {p.publicado ? 'Activo' : 'Oculto'}
                      </span>
                    </td>
                    <td className="table-mono">
                      {p.stock === 0
                        ? <span className="table-sin-stock">Sin stock</span>
                        : `${p.stock} en stock`
                      }
                    </td>
                    <td className="table-mono">{p.categoria?.name || p.categoria || 'Sin cat.'}</td>
                    <td className="table-mono">${p.precio?.toLocaleString('es-AR')}</td>
                    <td>
                      {/* ⋯ dropdown */}
                      <div className="table-actions-menu" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          className="table-menu-btn"
                          onClick={() => setOpenMenu(openMenu === p._id ? null : p._id)}
                          aria-label="Acciones"
                        >
                          ⋯
                        </button>
                        {openMenu === p._id && (
                          <div className="table-dropdown">
                            <Link
                              to={`/admin/productos/editar/${p._id}`}
                              className="table-dropdown__item"
                              onClick={() => setOpenMenu(null)}
                            >
                              ✏️ Editar
                            </Link>
                            <Link
                              to={`/producto/${p._id}`}
                              target="_blank"
                              className="table-dropdown__item"
                              onClick={() => setOpenMenu(null)}
                            >
                              👁️ Ver
                            </Link>
                            <button
                              type="button"
                              className="table-dropdown__item"
                              onClick={() => { handleToggle(p._id); setOpenMenu(null) }}
                            >
                              {p.publicado ? '🔒 Ocultar' : '🌐 Publicar'}
                            </button>
                            <button
                              type="button"
                              className="table-dropdown__item table-dropdown__item--danger"
                              onClick={() => { handleEliminar(p._id, p.nombre); setOpenMenu(null) }}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!loading && filtrados.length === 0 && (
          <p className="admin-empty">No se encontraron productos.</p>
        )}
      </div>
    </div>
  )
}