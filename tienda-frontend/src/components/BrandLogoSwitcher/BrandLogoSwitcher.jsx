import { Link } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { getBrandConfig } from '../../config/siteConfig';
import './BrandLogoSwitcher.css';

export default function BrandLogoSwitcher() {
  const { brand } = useBrand();

  const currentSlug = brand?.slug || 'fit';
  const otherSlug = currentSlug === 'fit' ? 'sport' : 'fit';
  
  const currentConfig = getBrandConfig(currentSlug);
  const otherConfig = getBrandConfig(otherSlug);

  return (
    <div className="brand-logo-switcher">
      
      {/* LOGO INACTIVO (Fondo / Sombra) */}
      <Link
        to={otherSlug === 'fit' ? '/' : '/sport'}
        aria-label={`Cambiar a ${otherConfig.name}`}
        className="brand-logo-back"
      >
        <img
          src={otherConfig.assets.logo}
          alt={otherConfig.name}
          className={`brand-img ${otherSlug === 'sport' ? 'brand-img--sport' : ''}`}
        />
      </Link>

      {/* LOGO ACTIVO (Frente) */}
      <Link
        to={currentSlug === 'fit' ? '/' : '/sport'}
        aria-label={`Ir al inicio de ${currentConfig.name}`}
        className="brand-logo-front"
      >
        <img
          src={currentConfig.assets.logo}
          alt={currentConfig.name}
          className={`brand-img ${currentSlug === 'sport' ? 'brand-img--sport' : ''}`}
        />
      </Link>
    </div>
  );
}
