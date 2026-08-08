import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrand } from '../../context/BrandContext';
import { getBrandConfig } from '../../config/siteConfig';

export default function BrandLogoSwitcher() {
  const { brand } = useBrand();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // current slug: brand?.slug
  const currentSlug = brand?.slug || 'fit';
  const otherSlug = currentSlug === 'fit' ? 'sport' : 'fit';
  
  const currentConfig = getBrandConfig(currentSlug);
  const otherConfig = getBrandConfig(otherSlug);

  return (
    <button
      type="button"
      onClick={() => navigate(otherSlug === 'fit' ? '/' : '/sport')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Cambiar a ${otherConfig.name}`}
      style={{
        position: 'relative',
        width: '96px', /* un poco mas de espacio para que quepan las dos caras */
        height: '96px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
    >
      {/* Logo de fondo (Sport) — offset en diagonal, translúcido, nunca clickeable */}
      <img
        src={otherConfig.assets.logo}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '64px',
          height: '64px',
          opacity: 0.35,
          transform: 'translateX(25%) translateY(-15%) rotate(8deg)',
          pointerEvents: 'none',
          userSelect: 'none',
          objectFit: 'contain',
          zIndex: 0
        }}
      />

      {/* Logo activo (Fit), adelante, con hover + animación de swap */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlug}
          src={currentConfig.assets.logo}
          alt={currentConfig.name}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: hovered ? 1.08 : 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
          }}
        />
      </AnimatePresence>
    </button>
  );
}
