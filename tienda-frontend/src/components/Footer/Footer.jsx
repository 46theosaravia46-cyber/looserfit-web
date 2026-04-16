import { useState } from 'react'
import { Link } from 'react-router-dom'
import { siteConfig } from '../../config/siteConfig'
import './Footer.css'

const INFOS = {
  'como-comprar': {
    title: 'Cómo comprar',
    text: 'Elegí el producto, seleccioná talle, agregalo al carrito y finalizá la compra colocando datos correspondientes.',
  },
  'envios': {
    title: 'Envíos',
    text: 'Enviamos a todo el país por Correo Argentino. Podés retirar en sucursal o recibir en domicilio. Las dimensiones y costos se coordinan al momento de la compra.',
  },
  'cambios': {
    title: 'Cambios y devoluciones',
    text: 'ANTES DE REALIZAR LA COMPRA, CHEQUEA DETALLADAMENTE LAS MEDIDAS, FOTOS Y ESTADO DE LA PRENDA!!! RECORDÁ QUE NO HAY CAMBIOS NI DEVOLUCIONES <3',
  },
}

export default function Footer() {
  const [infoOpen, setInfoOpen] = useState(null)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">

          <div className="footer__brand">
            <div className="footer__logo-wrap">
              <img src={siteConfig.assets.logo} alt={siteConfig.name} className="footer__logo" />
            </div>
            <p className="footer__location">{siteConfig.contact.address}</p>
          </div>

          <div className="footer__nav">
            <h4 className="footer__nav-title">Tienda</h4>
            <ul>
              <li><Link to="/tienda">Todos los productos</Link></li>
              <li><Link to="/tienda?categoria=abrigos">Abrigos</Link></li>
              <li><Link to="/tienda?categoria=remeras">Remeras</Link></li>
              <li><Link to="/tienda?categoria=pantalones">Pantalones</Link></li>
              <li><Link to="/tienda?categoria=accesorios">Accesorios</Link></li>
            </ul>
          </div>

          <div className="footer__nav">
            <h4 className="footer__nav-title">Info</h4>
            <ul>
              <li><button type="button" className="footer__info-btn" onClick={() => setInfoOpen('como-comprar')}>Cómo comprar</button></li>
              <li><button type="button" className="footer__info-btn" onClick={() => setInfoOpen('envios')}>Envíos</button></li>
              <li><button type="button" className="footer__info-btn" onClick={() => setInfoOpen('cambios')}>Cambios y devoluciones</button></li>
            </ul>
          </div>

          <div className="footer__nav">
            <h4 className="footer__nav-title">Soporte</h4>
            <p className="footer__soporte">
              En caso de cualquier inconveniente, contactame al{' '}
              <a
                href={`https://www.instagram.com/${siteConfig.socials.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="footer__dm-link"
              >
                dm
              </a>
            </p>
          </div>

          <div className="footer__social">
            <h4 className="footer__nav-title">Seguinos</h4>
            <div className="footer__social-links">
              <a href={`https://www.instagram.com/${siteConfig.socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>

        </div>

        <div className="footer-content">
          <p>© {new Date().getFullYear()} {siteConfig.name} — Todos los derechos reservados</p>
          <p className="credit">
            Creado por{' '}
            <a href="https://instagram.com/saravia.devv" target="_blank" rel="noreferrer" className="credit__link">
              Theo Saravia <span className="credit__icon">↗</span>
            </a>
          </p>
          <Link to="/admin" className="footer__admin-link" style={{ display: 'inline-block', marginTop: '10px' }}>Panel Admin</Link>
        </div>
      </div>

      {infoOpen && (
        <div className="footer-modal-overlay" onClick={() => setInfoOpen(null)}>
          <div className="footer-modal" onClick={e => e.stopPropagation()}>
            <h4>{INFOS[infoOpen].title}</h4>
            <p>{INFOS[infoOpen].text}</p>
            <button type="button" className="btn" onClick={() => setInfoOpen(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </footer>
  )
}
}
