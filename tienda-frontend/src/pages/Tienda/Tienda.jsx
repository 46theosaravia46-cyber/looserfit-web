import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard/ProductCard'
import { getProductos, getCategories } from '../../services/api'
import { SIZES_BY_CATEGORY } from '../../constants/productConstants'
import './Tienda.css'

const ORDEN_OPS  = [
  { label: 'Más nuevos',    value: 'nuevo' },
  { label: 'Nuevo Drop',    value: 'nuevodrop' },
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
  const [orden,      setOrden]      = useState(() => {
    return searchParams.get('ordenar') || 'nuevo'
  })
  const q = searchParams.get('q') || ''

  // Cargar categorías desde el backend
  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(err => console.error('Error cargando categorías:', err))
  }, [])

  // Mapear nombre de categoría a clave de SIZES_BY_CATEGORY
  const getCatKey = (fullName) => {
    if (!fullName) return ''
    const n = fullName.toLowerCase()
    if (n.includes('pantalones') || n.includes('bottoms')) return 'Pantalones'
    if (n.includes('remeras') || n.includes('tops')) return 'Remeras'
    if (n.includes('abrigos') || n.includes('outerwear')) return 'Abrigos'
    if (n.includes('calzado') || n.includes('footwear')) return 'Calzado'
    if (n.includes('accesorios') || n.includes('accessories')) return 'Accesorios'
    return ''
  }

  // Encontrar el objeto de categoría basado en el ID o nombre de catActiva
  const activeCategoryObj = catActiva ? categorias.find(c => 
    c._id === catActiva || 
    c.name.toLowerCase() === catActiva.toLowerCase() ||
    c.name.toLowerCase().includes(catActiva.toLowerCase())
  ) : null

  const currentSizesKey = getCatKey(activeCategoryObj?.name)
  const tallesPorCategoria = SIZES_BY_CATEGORY[currentSizesKey] || []

  // Efecto para cargar productos cuando cambian los filtros
  useEffect(() => {
    setLoading(true)
    const filtros = { soloPublicados: true }
    if (orden === 'nuevodrop') filtros.esNuevoDrop = true
    
    // Identificar si catActiva ya es un ID
    const isId = /^[0-9a-fA-F]{24}$/.test(catActiva)
    
    // Priorizamos el ID del objeto encontrado, si no el catActiva si parece un ID
    const categoriaId = activeCategoryObj?._id || (isId ? catActiva : null)
    
    if (categoriaId) {
      filtros.categoria = categoriaId
    } else if (catActiva && !activeCategoryObj && categorias.length > 0) {
      // Si hay un filtro por nombre pero no se encontró nada tras cargar categorías,
      // no mandamos filtro de categoría para no traer [] (o mandamos uno que no exista)
      // Pero para ser simples, si hay catActiva pero no ID, no filtramos por categoría aún.
    }

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
  }, [catActiva, q, orden, activeCategoryObj])

  // Filtrar por talle (búsqueda ya viene del backend)
  const filtrados = productos.filter(p => {
    if (!talleActivo) return true
    return p.talles?.includes(talleActivo)
  })

  // Ordenar
  const ordenados = [...filtrados].sort((a, b) => {
    if (orden === 'asc')       return a.precio - b.precio
    if (orden === 'desc')      return b.precio - a.precio
    if (orden === 'nuevodrop') return new Date(b.createdAt) - new Date(a.createdAt)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const handleCategoria = (catId) => {
    const nueva = catId === catActiva ? '' : catId
    setCatActiva(nueva)
    setTalleActivo('')
  }

  // Sincronizar estado con URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (catActiva) params.set('categoria', catActiva)
    if (orden && orden !== 'nuevo') params.set('ordenar', orden)
    if (q) params.set('q', q)
    setSearchParams(params)
  }, [catActiva, orden])


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
                      className={`filter-btn ${catActiva === cat._id ? 'filter-btn--active' : ''}`}
                      onClick={() => handleCategoria(cat._id)}
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

            {(catActiva || talleActivo || q || orden === 'nuevodrop') && (
              <button
                className="filter-reset"
                onClick={() => {
                  setCatActiva('')
                  setTalleActivo('')
                  setOrden('nuevo')
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