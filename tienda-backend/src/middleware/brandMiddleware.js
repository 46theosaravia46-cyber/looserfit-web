/**
 * brandMiddleware.js — Middleware de resolución de marca.
 * Se ejecuta en todas las rutas públicas del API.
 *
 * Lógica:
 * 1. Lee el query param `?brand=` (slug de la marca).
 * 2. Si no viene → fallback a 'fit' + log de warning.
 * 3. Busca el documento Brand por slug.
 *    - Si no existe → 404
 *    - Si está deshabilitada → 422
 *    - Si está en mantenimiento → 503
 * 4. Inyecta `req.brand` (documento completo) y `req.brandId` (ObjectId).
 */

const Brand = require('../models/Brand');
const { BRAND_SYSTEM } = require('../constants/brands');

const detectBrand = async (req, res, next) => {
    try {
        // Leer el slug de la marca desde el query param
        let slug = req.query[BRAND_SYSTEM.QUERY_PARAM];

        // Fallback: si no viene brand, asumimos 'fit'
        if (!slug) {
            process.emitWarning(
                `[detectBrand] Petición sin ?brand= en ${req.method} ${req.originalUrl}. Usando fallback: '${BRAND_SYSTEM.FALLBACK_SLUG}'`,
                { code: 'BRAND_MISSING' }
            );
            slug = BRAND_SYSTEM.FALLBACK_SLUG;
        }

        // Sanitizar el slug (solo letras y guiones)
        slug = String(slug).toLowerCase().trim().replace(/[^a-z-]/g, '');

        // Buscar la marca en la base de datos
        const brand = await Brand.findOne({ slug });

        // Validaciones
        if (!brand) {
            return res.status(404).json({ error: `Marca '${slug}' no encontrada` });
        }

        if (!brand.enabled) {
            return res.status(422).json({ error: `La marca '${slug}' está deshabilitada` });
        }

        if (brand.settings?.maintenanceMode) {
            return res.status(503).json({ error: `La marca '${slug}' está en mantenimiento. Intentá más tarde.` });
        }

        // Inyectar en el request para uso downstream
        req.brand = brand;
        req.brandId = brand._id;

        next();
    } catch (error) {
        console.error('[detectBrand] Error inesperado:', error.message);
        res.status(500).json({ error: 'Error interno al resolver la marca' });
    }
};

module.exports = { detectBrand };
