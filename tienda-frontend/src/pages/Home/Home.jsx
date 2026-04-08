import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Ticker from '../../components/Ticker/Ticker'
import ProductCard from '../../components/ProductCard/ProductCard'
import { getProductos, getHomeContent, getCategories } from '../../services/api'
import './Home.css'

// Mapeo de imágenes para las categorías dinámicas
const CATEGORY_IMAGES = {
  'calzado':    { img: '/cat-calzado.jpg',    img2: '/cat-calzado.jpg' },
  'abrigos':    { img: '/cat-abrigos.jpg',    img2: '/cat-abrigos.jpg' },
  'pantalones': { img: '/cat-pantalones.jpg', img2: '/cat-pantalones.jpg' },
  'remeras':    { img: '/cat-remeras.jpg',    img2: '/cat-remeras.jpg' },
  'accesorios': { img: '/cat-accesorios.jpg', img2: '/cat-accesorios.jpg' },
}
const DEFAULT_IMAGE = { img: '/cat-remeras.jpg', img2: '/cat-remeras.jpg' }

const getCatImg = (name) => {
  const n = name.toLowerCase()
  if (n.includes('calzado') || n.includes('footwear')) return CATEGORY_IMAGES.calzado
  if (n.includes('abrigos') || n.includes('outerwear')) return CATEGORY_IMAGES.abrigos
  if (n.includes('pantalones') || n.includes('bottoms')) return CATEGORY_IMAGES.pantalones
  if (n.includes('remeras') || n.includes('tops')) return CATEGORY_IMAGES.remeras
  if (n.includes('accesorios') || n.includes('accessories')) return CATEGORY_IMAGES.accesorios
  return DEFAULT_IMAGE
}

const COMMUNITY_FALLBACK = [
  { src: '/cat-remeras.jpg',    titulo: '',  descripcion: '' },
  { src: '/cat-abrigos.jpg',    titulo: '',  descripcion: '' },
  { src: '/cat-pantalones.jpg', titulo: '',  descripcion: '' },
  { src: '/cat-calzado.jpg',    titulo: '',  descripcion: '' },
]

export default function Home() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [heroImages, setHeroImages] = useState([])
  const [familyImages, setFamilyImages] = useState([])
  const [heroLoaded, setHeroLoaded] = useState([false, false, false])

  const handleHeroLoad = (index) => {
    setHeroLoaded(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })
  }

  useEffect(() => {
    // Cargar productos (solo nuevos drops)
    getProductos({ soloPublicados: true, esNuevoDrop: true })
      .then(data => {
        setProductos(data.slice(0, 4))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    // Cargar categorías
    getCategories()
      .then(setCategorias)
      .catch(err => console.error('Error cargando categorías:', err))
  }, [])

  useEffect(() => {
    getHomeContent()
      .then(data => {
        if (Array.isArray(data.heroImages)) {
          setHeroImages(data.heroImages)
        }
        if (Array.isArray(data.familyImages) && data.familyImages.length > 0) {
// ...
          // Soporte para formato antiguo (string[]) y nuevo ({src,titulo,descripcion}[])
          const normalized = data.familyImages.map(item =>
            typeof item === 'string'
              ? { src: item, titulo: '', descripcion: '' }
              : item
          )
          setFamilyImages(normalized)
        }
      })
      .catch(() => {})
  }, [])

  // Observer para el centro
  useEffect(() => {
    if (familyImages.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-center')
        } else {
          entry.target.classList.remove('is-center')
        }
      })
    }, {
      root: null,
      rootMargin: '0px -47.5% 0px -47.5%', // Even narrower (5% center) for strict single-item focus
      threshold: 0
    })

    const items = document.querySelectorAll('.family-item')
    items.forEach(i => observer.observe(i))
    return () => observer.disconnect()
  }, [familyImages])

  // Repetir el array para scroll infinito (3 copias son suficientes para cubrir el ancho)
  const carouselArray = Array(3).fill(familyImages).flat()

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div 
          className="hero__grid" 
          style={{ '--hero-cols': heroImages.length || 1 }}
        >
          {heroImages.map((img, i) => (
            <div key={i} className="hero__col">
              <img 
                src={img} 
                alt={`Hero ${i}`} 
                className={`hero__img ${heroLoaded[i] ? 'is-loaded' : ''}`}
                onLoad={() => handleHeroLoad(i)}
              />
              <div className="hero__content">
                <Link 
                  to="/tienda?esNuevoDrop=true" 
                  className="hero__btn"
                >
                  VER COLECCIÓN
                </Link>
              </div>
            </div>
          ))}
          {heroImages.length === 0 && (
            <div className="hero__col">
              <img src="https://via.placeholder.com/1920x1080?text=Looserfit+Vibe" alt="Placeholder" />
              <div className="hero__content">
                <Link to="/tienda" className="hero__btn">VER TIENDA</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── STOCK COMPLETO ── */}
      <section className="section" id="nuevos">
        <div className="container">
          <div className="section-title">
            <span>STOCK COMPLETO</span>
            <Link to="/tienda">Ver todo</Link>
          </div>

          <div className="product-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCard key={i} loading />
                ))
              : productos.map(p => (
                  <ProductCard key={p._id} producto={p} />
                ))
            }
          </div>
        </div>
      </section>
      {/* ── CATEGORÍAS ── */}
      <section className="section home__cat-section">
        <div className="container">
          <div className="section-title">
            <span>Categorías</span>
          </div>
          <div className="cat-grid">
            {categorias.map(cat => {
              const images = getCatImg(cat.name)
              // Mostrar solo la parte en español si hay "/"
              const label = cat.name.includes('/') ? cat.name.split('/')[1].trim() : cat.name
              
              return (
                <Link
                  key={cat._id}
                  to={`/tienda?categoria=${cat._id}`}
                  className="cat-card"
                >
                  <div className="cat-card__img-wrap">
                    <img src={images.img}  alt={cat.name} className="cat-img-1" />
                    <img src={images.img2} alt={cat.name} className="cat-img-2" />
                  </div>
                  <span className="cat-card__label">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── LOOSER'S FAMILY ── */}
      <section className="family-section">
        <div className="family-section__header container">
          <div>
            <h2>Looser's Family</h2>
            <p>Nuestros favoritos del mes.</p>
          </div>
          <a
            href="https://www.instagram.com/looser.fit?igsh=MTFkdXJwNTUxazl3bw=="
            target="_blank"
            rel="noreferrer"
            className="family-section__ig"
          >
            <img src="/logo3.0.png" alt="Looserfit" />
          </a>
        </div>
        <div className="family-carousel-wrap">
          <div className="family-carousel">
            {carouselArray.map((item, i) => (
              <div key={`${item.src}-${i}`} className="family-item">
                <img src={item.src} alt={item.titulo || `Community ${i + 1}`} />
                <div className="family-item__overlay">
                  {item.titulo ? (
                    <p className="family-item__title">{item.titulo}</p>
                  ) : (
                    <p className="family-item__title">-</p>
                  )}
                  {item.descripcion && (
                    <p className="family-item__desc">{item.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="container family-pitch">
          <div className="family-pitch__box">
            <h3>¿Queres formar parte? ➕</h3>
            <p>Solo 10 clientes entran cada mes a Looser Family. ¿Querés ser uno?</p>
            <ul>
              <li>Sacate una foto usando tu prenda comprada en nuestra pagina (Evaluamos fondo, outfit y Distinción)</li>
              <li>Enviame tu foto por DM a @Looser.fit.</li>
            </ul>
            <p className="family-pitch__footer">Los elegidos serán exhibidos en esta sección junto a sus @ de Instagram. Mucha suerte {'<3'}</p>
          </div>
        </div>
      </section>

    </div>
  )
}