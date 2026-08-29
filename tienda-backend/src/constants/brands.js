/**
 * brands.js — Constantes del sistema multi-marca (backend).
 * Centraliza todos los valores de marca para que no haya hardcoding
 * de strings 'fit' o 'sport' en ninguna otra parte del código.
 * NUNCA usar los strings de marca directamente: importar siempre desde acá.
 */

const BRAND_SYSTEM = {
  // Marca que se asume si la petición no especifica ninguna
  FALLBACK_SLUG: 'fit',

  // Slugs oficiales de cada marca
  PRIMARY_BRAND_SLUG: 'fit',
  SECONDARY_BRAND_SLUG: 'sport',

  // Nombre del query param que el frontend envía para identificar la marca
  // Ej: GET /api/products?brand=sport
  QUERY_PARAM: 'brand',

  // Estados válidos de una marca
  ALLOWED_STATUS: ['active', 'inactive', 'maintenance'],
};

module.exports = { BRAND_SYSTEM };
