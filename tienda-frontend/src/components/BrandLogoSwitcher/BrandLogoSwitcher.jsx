import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBrand } from '../../context/BrandContext';
import { getBrandConfig } from '../../config/siteConfig';

export default function BrandLogoSwitcher() {
  const { brand } = useBrand();
  // Solo necesitamos trackear si el usuario está haciendo hover sobre el logo de fondo
  const [hoverBack, setHoverBack] = useState(false);

  const currentSlug = brand?.slug || 'fit';
  const otherSlug = currentSlug === 'fit' ? 'sport' : 'fit';
  
  const currentConfig = getBrandConfig(currentSlug);
  const otherConfig = getBrandConfig(otherSlug);

  return (
    <div style={{ 
      position: 'relative', 
      width: '120px', 
      height: '70px', 
      display: 'flex', 
      alignItems: 'center' 
    }}>
      
      {/* LOGO INACTIVO (Fondo / Sombra) */}
      <Link
        to={otherSlug === 'fit' ? '/' : '/sport'}
        onMouseEnter={() => setHoverBack(true)}
        onMouseLeave={() => setHoverBack(false)}
        aria-label={`Cambiar a ${otherConfig.name}`}
        style={{
          position: 'absolute',
          left: '35px', /* Desplazado a la derecha por defecto */
          width: '64px',
          height: '64px',
          opacity: hoverBack ? 1 : 0.35,
          zIndex: hoverBack ? 20 : 0,
          /* Animación: De estar chico y a la derecha, pasa a ser grande y al centro */
          transform: hoverBack 
            ? 'translateX(-15px) scale(1.1) rotate(0deg)' 
            : 'translateX(15px) scale(0.65) rotate(15deg)',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'block'
        }}
      >
        <img
          src={otherConfig.assets.logo}
          alt={otherConfig.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Link>

      {/* LOGO ACTIVO (Frente) */}
      <Link
        to={currentSlug === 'fit' ? '/' : '/sport'}
        aria-label={`Ir al inicio de ${currentConfig.name}`}
        style={{
          position: 'absolute',
          left: '10px', /* Posición principal (izquierda/centro) */
          width: '64px',
          height: '64px',
          zIndex: hoverBack ? 0 : 10,
          /* Animación: Si hoverean el de atrás, este se achica, pierde opacidad y rota a la izquierda */
          opacity: hoverBack ? 0.35 : 1,
          transform: hoverBack 
            ? 'translateX(-15px) scale(0.65) rotate(-15deg)' 
            : 'translateX(0px) scale(1) rotate(0deg)',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
          display: 'block'
        }}
      >
        <img
          src={currentConfig.assets.logo}
          alt={currentConfig.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
          }}
        />
      </Link>
    </div>
  );
}
