import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Ticker from '../../components/Ticker/Ticker'
import ProductCard from '../../components/ProductCard/ProductCard'
import { getProductos, getHomeContent } from '../../services/api'
import './Home.css'

// Categorías
const CATEGORIAS = [
  { label: 'Calzado',    slug: 'calzado',    img: '/cat-calzado.jpg',    img2: '/cat-calzado.jpg' },
  { label: 'Abrigos',    slug: 'abrigos',    img: '/cat-abrigos.jpg',    img2: '/cat-abrigos.jpg' },
  { label: 'Pantalones', slug: 'pantalones', img: '/cat-pantalones.jpg', img2: '/cat-pantalones.jpg' },
  { label: 'Remeras',    slug: 'remeras',    img: '/cat-remeras.jpg',    img2: '/cat-remeras.jpg' },
  { label: 'Accesorios', slug: 'accesorios', img: '/cat-accesorios.jpg', img2: '/cat-accesorios.jpg' },
]

const COMMUNITY_FALLBACK = [
  { src: '/cat-remeras.jpg',    titulo: '',  descripcion: '' },
  { src: '/cat-abrigos.jpg',    titulo: '',  descripcion: '' },
  { src: '/cat-pantalones.jpg', titulo: '',  descripcion: '' },
  { src: '/cat-calzado.jpg',    titulo: '',  descripcion: '' },
]

export default function Home() {
  const [productos, setProductos] = useState([])
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
    getProductos({ soloPublicados: true })
      .then(data => {
        setProductos(data.slice(0, 4))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    getHomeContent()
      .then(data => {
        if (Array.isArray(data.heroImages) && data.heroImages.length >= 3) {
          setHeroImages(data.heroImages.slice(0, 3))
        }
        if (Array.isArray(data.familyImages) && data.familyImages.length > 0) {
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

  // Repetir el array para scroll infinito largo (10 copias)
  const carouselArray = Array(10).fill(familyImages).flat()

  return (
    <div className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__grid">
          <div className="hero__col">
            {heroImages[0] && (
              <img 
                src={heroImages[0]} 
                alt="Look 1" 
                className={`hero__img ${heroLoaded[0] ? 'is-loaded' : ''}`} 
                onLoad={() => handleHeroLoad(0)}
              />
            )}
          </div>
          <div className="hero__col hero__col--center">
            {heroImages[1] && (
              <img 
                src={heroImages[1]} 
                alt="Look 2" 
                className={`hero__img hero__img--ver-todo ${heroLoaded[1] ? 'is-loaded' : ''}`} 
                onLoad={() => handleHeroLoad(1)}
              />
            )}
            <div className="hero__cta">
              <p className="hero__label">Nueva temporada</p>
              <h1 className="hero__title">Nueva<br />Colección</h1>
              <Link to="/tienda" className="btn btn-filled" style={{ transition: 'all 0.3s' }}>
                Ver Colección →
              </Link>
            </div>
          </div>
          <div className="hero__col">
            {heroImages[2] && (
              <img 
                src={heroImages[2]} 
                alt="Look 3" 
                className={`hero__img ${heroLoaded[2] ? 'is-loaded' : ''}`} 
                onLoad={() => handleHeroLoad(2)}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── NUEVOS INGRESOS ── */}
      <section className="section" id="nuevos">
        <div className="container">
          <div className="section-title">
            <span>Nuevos Ingresos</span>
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
            {CATEGORIAS.map(cat => (
              <Link
                key={cat.slug}
                to={`/tienda?categoria=${cat.slug}`}
                className="cat-card"
              >
                <div className="cat-card__img-wrap">
                  <img src={cat.img}  alt={cat.label} className="cat-img-1" />
                  <img src={cat.img2} alt={cat.label} className="cat-img-2" />
                </div>
                <span className="cat-card__label">{cat.label}</span>
              </Link>
            ))}
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