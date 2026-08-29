/**
 * brandConfig.js — Configuración de marcas para el frontend.
 * Centraliza los slugs, rutas base y configuración estática de cada marca.
 * Nunca hardcodear 'fit' o 'sport' en los componentes: importar siempre desde acá.
 */

// Slugs oficiales de cada marca (deben coincidir con los slugs en la DB)
export const BRAND_SLUGS = {
  FIT: 'fit',
  SPORT: 'sport',
};

// Marca por defecto (fallback si no se detecta ninguna por URL)
export const DEFAULT_BRAND_SLUG = BRAND_SLUGS.FIT;

// Rutas base de cada marca en el frontend
export const BRAND_BASE_PATHS = {
  [BRAND_SLUGS.FIT]: '/',
  [BRAND_SLUGS.SPORT]: '/sport',
};

// Nombres públicos de cada marca (para mostrar en UI)
export const BRAND_NAMES = {
  [BRAND_SLUGS.FIT]: 'Looser Fit',
  [BRAND_SLUGS.SPORT]: 'Looser Sport',
};

// Claves de localStorage por marca (para carritos separados)
export const CART_STORAGE_KEYS = {
  [BRAND_SLUGS.FIT]: 'looserfit_cart_fit',
  [BRAND_SLUGS.SPORT]: 'looserfit_cart_sport',
};

// Lista de todas las marcas activas (para el selector de marca en navbar/admin)
export const ALL_BRANDS = [
  { slug: BRAND_SLUGS.FIT, name: BRAND_NAMES[BRAND_SLUGS.FIT], basePath: BRAND_BASE_PATHS[BRAND_SLUGS.FIT] },
  { slug: BRAND_SLUGS.SPORT, name: BRAND_NAMES[BRAND_SLUGS.SPORT], basePath: BRAND_BASE_PATHS[BRAND_SLUGS.SPORT] },
];
