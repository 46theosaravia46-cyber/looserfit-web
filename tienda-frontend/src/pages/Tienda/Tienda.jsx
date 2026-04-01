import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard/ProductCard'
import { getProductos, getCategories } from '../../services/api'
import './Tienda.css'

const TALLES     = ['S', 'M', 'L', 'XL', 'XXL']
const TALLAS_POR_CATEGORIA = {
  Abrigos: ['S', 'M', 'L', 'XL', 'XXL'],
  Remeras: ['S', 'M', 'L', 'XL', 'XXL'],
  Pantalones: ['S', 'M', 'L', 'XL', 'XXL'],
  Calzado: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  Accesorios: []
}
const ORDEN_OPS  = [
  { label: 'Más nuevos',    value: 'nuevo' },
  { label: 'Menor precio',  value: 'asc'   },
  { label: 'Mayor precio',  value: 'desc'  },
]

export default function Tienda() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [catActiva,  setCatActiva]  = useState(searchParams.get('categoria') || '')
  const [talleActivo,setTalleActivo]= useState('')
  const [orden,      setOrden]      = useState('nuevo')
  const q = searchParams.get('q') || ''

  // Cargar categorías desde el backend
  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(err => console.error('Error cargando categorías:', err))
  }, [])

  const getStoredTallesMap = () => {
    try {
      return JSON.parse(localStorage.getItem('lf_talles_map')) || {}
    } catch {
      return {}
    }
  }

  const getTallesForCategoria = (categoriaName) => {
    if (!categoriaName) return []
    const lowerCat = categoriaName.toLowerCase()
    const stored = getStoredTallesMap()
    const storedKey = Object.keys(stored).find(key => 
      key.toLowerCase() === lowerCat || 
      key.toLowerCase().includes(lowerCat) || 
      lowerCat.includes(key.toLowerCase())
    )
    if (storedKey) {
      return stored[storedKey] || []
    }
    const defaultKey = Object.keys(TALLAS_POR_CATEGORIA).find(key => key.toLowerCase() === lowerCat)
    return defaultKey ? TALLAS_POR_CATEGORIA[defaultKey] : []
  }

  // Encontrar el nombre de la categoría activa para los talles
  const activeCategoryObj = categorias.find(c => c._id === catActiva || c.name.toLowerCase() === catActiva.toLowerCase())
  const tallesPorCategoria = getTallesForCategoria(activeCategoryObj?.name)

  useEffect(() => {
    setLoading(true)
    const filtros = { soloPublicados: true }
    if (catActiva) filtros.categoria = catActiva
    if (q) filtros.q = q

    getProductos(filtros)
      .then(data => {
        setProductos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error cargando productos:', err)
        setError(true)
        setLoading(false)
      })
  }, [catActiva, q])

  // Filtrar por talle y stock en el frontend (búsqueda ya viene del backend)
  const filtrados = productos.filter(p => {
    if ((p.stock || 0) <= 0) return false
    if (!talleActivo) return true
    return p.talles?.includes(talleActivo)
  })

  // Ordenar
  const ordenados = [...filtrados].sort((a, b) => {
    if (orden === 'asc')  return a.precio - b.precio
    if (orden === 'desc') return b.precio - a.precio
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const handleCategoria = (catId, catName) => {
    const nueva = catId === catActiva ? '' : catId
    setCatActiva(nueva)
    setTalleActivo('')
    if (nueva) {
      const newParams = { categoria: catName.toLowerCase() }
      if (q) newParams.q = q
      setSearchParams(newParams)
    } else {
      const newParams = {}
      if (q) newParams.q = q
      setSearchParams(newParams)
    }
  }

  return (
    <div className="tienda-page">
      <div className="container">

        {/* Header */}
        <div className="tienda-header">
          <h1 className="tienda-title">Tienda</h1>
          <p className="tienda-count">
            {loading ? '...' : `${ordenados.length} productos`}
          </p>
        </div>

        <div className="tienda-layout">

          {/* Sidebar filtros */}
          <aside className="tienda-sidebar">
            <div className="filter-group">
              <h4 className="filter-group__title">Categorías</h4>
              <ul className="filter-list">
                {categorias.map(cat => (
                  <li key={cat._id}>
                    <button
                      className={`filter-btn ${catActiva === cat._id || catActiva.toLowerCase() === cat.name.toLowerCase() ? 'filter-btn--active' : ''}`}
                      onClick={() => handleCategoria(cat._id, cat.name)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {catActiva && tallesPorCategoria.length > 0 && (
              <div className="filter-group">
                <h4 className="filter-group__title">Talle</h4>
                <div className="talle-grid">
                  {tallesPorCategoria.map(t => (
                    <button
                      key={t}
                      className={`talle-btn ${talleActivo === t ? 'talle-btn--active' : ''}`}
                      onClick={() => setTalleActivo(talleActivo === t ? '' : t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(catActiva || talleActivo || q) && (
              <button
                className="filter-reset"
                onClick={() => {
                  setCatActiva('')
                  setTalleActivo('')
                  setSearchParams({})
                }}
              >
                ✕ Limpiar filtros
              </button>
            )}
          </aside>

          {/* Grid productos */}
          <div className="tienda-main">
            {q && (
              <div className="search-results-info">
                Buscando: "<strong>{q}</strong>"
              </div>
            )}

            <div className="tienda-toolbar">
              <span className="tienda-toolbar__label">Ordenar por:</span>
              {ORDEN_OPS.map(op => (
                <button
                  key={op.value}
                  className={`orden-btn ${orden === op.value ? 'orden-btn--active' : ''}`}
                  onClick={() => setOrden(op.value)}
                >
                  {op.label}
                </button>
              ))}
            </div>


            <div className="tienda-grid">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <ProductCard key={i} loading />
                  ))
                : ordenados.length === 0
                  ? (
                    <div className="tienda-empty">
                      <p>No hay productos con estos filtros.</p>
                      <button
                        className="btn"
                        onClick={() => {
                          setCatActiva('')
                          setTalleActivo('')
                          setSearchParams({})
                        }}
                      >
                        Ver todo
                      </button>
                    </div>
                  )
                  : ordenados.map(p => (
                      <ProductCard key={p._id} producto={p} />
                    ))
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}