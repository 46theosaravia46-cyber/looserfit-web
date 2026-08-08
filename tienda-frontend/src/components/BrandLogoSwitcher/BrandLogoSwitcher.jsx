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
        width: '52px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0
      }}
    >
      {/* Logo de fondo (la otra marca, como sombra) */}
      <img
        src={otherConfig.assets.logo}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.2,
          filter: 'grayscale(100%)',
          transform: 'scale(0.95)',
          pointerEvents: 'none',
          userSelect: 'none',
          objectFit: 'contain'
        }}
      />

      {/* Logo activo, adelante, con animación de entrada/salida y hover */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlug}
          src={currentConfig.assets.logo}
          alt={currentConfig.name}
          initial={{ opacity: 0, scale: 0.85, rotateY: 90 }}
          animate={{ opacity: 1, scale: hovered ? 1.08 : 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.85, rotateY: -90 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.25))'
          }}
        />
      </AnimatePresence>
    </button>
  );
}
