/**
 * brandRoutes.js — Rutas públicas para consultar marcas.
 * GET /api/brands          → lista todas las marcas habilitadas
 * GET /api/brands/resolve  → resuelve una marca por slug (?slug=fit)
 */

const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');

// GET /api/brands — lista todas las marcas ordenadas por `order`
router.get('/', async (req, res) => {
    try {
        const brands = await Brand.find({ enabled: true }).sort({ order: 1 });
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener marcas', detail: error.message });
    }
});

// GET /api/brands/resolve?slug=fit — devuelve una marca completa por slug
// Usado por el BrandProvider del frontend para cargar tema, seo y settings
router.get('/resolve', async (req, res) => {
    try {
        const { slug } = req.query;
        if (!slug) {
            return res.status(400).json({ error: 'El parámetro ?slug= es requerido' });
        }

        const brand = await Brand.findOne({ slug: String(slug).toLowerCase().trim() });

        if (!brand) {
            return res.status(404).json({ error: `Marca '${slug}' no encontrada` });
        }

        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: 'Error al resolver marca', detail: error.message });
    }
});

module.exports = router;
