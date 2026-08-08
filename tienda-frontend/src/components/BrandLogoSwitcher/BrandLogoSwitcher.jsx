import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { getBrandConfig } from '../../config/siteConfig';

export default function BrandLogoSwitcher() {
  const { brand } = useBrand();
  const [hoverFront, setHoverFront] = useState(false);
  const [hoverBack, setHoverBack] = useState(false);

  // current slug: brand?.slug
  const currentSlug = brand?.slug || 'fit';
  const otherSlug = currentSlug === 'fit' ? 'sport' : 'fit';
  
  const currentConfig = getBrandConfig(currentSlug);
  const otherConfig = getBrandConfig(otherSlug);

  return (
    <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Logo de fondo (Sport) — offset en diagonal, con hover y click */}
      <Link
        to={otherSlug === 'fit' ? '/' : '/sport'}
        onMouseEnter={() => setHoverBack(true)}
        onMouseLeave={() => setHoverBack(false)}
        aria-label={`Cambiar a ${otherConfig.name}`}
        style={{
          position: 'absolute',
          width: '64px',
          height: '64px',
          opacity: hoverBack ? 0.9 : 0.35,
          transform: `translateX(25%) translateY(-15%) rotate(8deg) scale(${hoverBack ? 1.1 : 1})`,
          zIndex: hoverBack ? 20 : 0,
          transition: 'all 0.3s ease',
          display: 'block'
        }}
      >
        <img
          src={otherConfig.assets.logo}
          alt={otherConfig.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </Link>

      {/* Logo activo (Fit), adelante, con hover y click al inicio */}
      <Link
        to={currentSlug === 'fit' ? '/' : '/sport'}
        onMouseEnter={() => setHoverFront(true)}
        onMouseLeave={() => setHoverFront(false)}
        aria-label={`Ir al inicio de ${currentConfig.name}`}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '64px',
          height: '64px',
          display: 'block'
        }}
      >
        <motion.img
          key={currentSlug}
          src={currentConfig.assets.logo}
          alt={currentConfig.name}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: hoverFront ? 1.08 : 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
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
